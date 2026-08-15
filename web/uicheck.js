#!/usr/bin/env node
// Drive the UI in a real browser and audit its layout.
//
//   node uicheck.js [outdir]
//
// Launches ONE real (headed) Chrome and reuses it for every scenario over the
// DevTools protocol. (An earlier version spawned a fresh Chrome per scenario
// and per screenshot -- 46 launches -- which was slow enough to look like a
// hang.)
//
// Headed by default so the run exercises a genuine browser window with real
// compositing, not the headless renderer. Set UICHECK_HEADLESS=1 for CI.
//
// It always uses a throwaway --user-data-dir, so it never attaches to or
// disturbs your everyday Chrome profile, and it only ever kills the process
// handle it spawned.
//
// For each scenario it reloads the page, calls window.__run() from
// testhooks.js to drive the interface, collects window.__audit()'s findings,
// and saves a screenshot. Exits non-zero if any scenario reports a layout
// issue or a failed step.
//
// No dependencies: Node's built-in WebSocket and fetch do all the work.

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// macOS by default; CI and Linux set CHROME. First existing path wins.
const CHROME = process.env.CHROME || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
].find(p => fs.existsSync(p)) || 'google-chrome';
const PORT = 9333;
const HERE = __dirname;
const OUT = process.argv[2] || path.join(os.tmpdir(), 'uicheck');
const URL_BASE = 'file://' + path.join(HERE, 'index.html');

// name -> steps for window.__run() (see testhooks.js)
const SCENARIOS = [
  ['initial', ''],
  ['running', 'gen:120'],
  ['long-run', 'gen:400'],
  ['menu-file', 'open:File'],
  ['menu-options', 'open:Options'],
  ['menu-disasters', 'open:Disasters'],
  ['menu-speed', 'open:Speed'],
  ['speed-slow', 'menu:slow'],
  ['menu-about', 'open:About'],
  ['menu-configure', 'open:Configure'],
  ['tab-field', 'tab:field'],
  ['tab-graph', 'tab:graph'],
  ['about-open', 'menu:about'],
  ['about-closed', 'menu:about,menu:about-close'],
  ['tab-saveprint', 'tab:saveprint'],
  ['disaster-asteroid', 'gen:40,menu:disaster:asteroid'],
  ['scale-100', 'gen:60,scale:100'],
  ['scale-6000', 'gen:60,scale:6000'],
  ['graph-off', 'gen:60,uncheck:graphOn'],
  ['sun-max', 'set:sldSun=100,gen:150'],
  ['sun-min', 'set:sldSun=0,gen:150'],
  ['field-big', 'field:BIG,gen:60'],
  ['field-startup', 'field:STARTUP,gen:40'],
  ['field-stable-load', 'field:STABLE'],
  ['field-sex', 'field:SEX'],
  ['field-fission', 'field:FISSION'],
  ['field-radio', 'field:RADIO'],
  ['size-80', 'menu:size80,gen:40'],
  ['brush-foxes', 'brush:4'],
  ['hide-grass', 'gen:40,uncheck:showGrass'],
  ['disaster-fire', 'gen:60,menu:disaster:fire'],
  ['big-numbers', 'field:BIG,menu:populate,gen:5'],
  ['extinction', 'set:sldRabD=100,gen:120'],
  ['revert-defaults', 'gen:40,set:sldSun=100,menu:defaults'],
  ['skin-1996', 'gen:150'],
  ['skin-2026', 'skin:2026,gen:150'],
];

// UICHECK_ONLY=name1,name2 runs a subset -- handy for smoke-testing the driver
// before committing to the full sweep.
const ONLY = (process.env.UICHECK_ONLY || '').split(',').filter(Boolean);
const HEADLESS = process.env.UICHECK_HEADLESS === '1';
// Leave the browser open at the end (so an external screenshot tool can grab
// the real window).
const KEEP = process.env.UICHECK_KEEP === '1';

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Never let one bad scenario stall the whole sweep.
const withTimeout = (p, ms, label) => Promise.race([
  p,
  new Promise((_, rej) => setTimeout(() => rej(new Error(`timeout: ${label}`)), ms)),
]);

// ------------------------------------------------------------------- CDP ---

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.handlers = new Map();
    ws.addEventListener('message', ev => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      } else if (msg.method && this.handlers.has(msg.method)) {
        this.handlers.get(msg.method).forEach(fn => fn(msg.params));
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, fn) {
    if (!this.handlers.has(method)) this.handlers.set(method, []);
    this.handlers.get(method).push(fn);
  }

  once(method) {
    return new Promise(resolve => {
      const fn = p => {
        const arr = this.handlers.get(method);
        arr.splice(arr.indexOf(fn), 1);
        resolve(p);
      };
      this.on(method, fn);
    });
  }
}

async function waitForChrome() {
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const targets = await r.json();
      const page = targets.find(t => t.type === 'page');
      if (page && page.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch { /* not up yet */ }
    await sleep(100);
  }
  throw new Error('Chrome did not expose a debugging endpoint');
}

// ------------------------------------------------------------------ main ---

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'uicheck-profile-'));

  const args = [
    '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--disable-search-engine-choice-screen', '--hide-scrollbars',
    '--window-size=1000,820', '--window-position=40,40',
    `--user-data-dir=${profile}`, `--remote-debugging-port=${PORT}`,
    'about:blank',
  ];
  if (HEADLESS) args.unshift('--headless=new', '--disable-gpu', '--no-sandbox');
  console.log(`launching ${HEADLESS ? 'headless' : 'real (headed)'} Chrome`
    + ` with a throwaway profile\n`);
  const chrome = spawn(CHROME, args, { stdio: 'ignore' });

  let code = 0;
  try {
    const wsUrl = await waitForChrome();
    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => {
      ws.addEventListener('open', res);
      ws.addEventListener('error', rej);
    });
    const cdp = new CDP(ws);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 980, height: 780, deviceScaleFactor: 2, mobile: false,
    });

    const consoleErrors = [];
    cdp.on('Runtime.exceptionThrown', p =>
      consoleErrors.push(p.exceptionDetails?.exception?.description
        || p.exceptionDetails?.text || 'exception'));

    // A native dialog blocks the JS thread, so Runtime.evaluate would never
    // return. Dismiss any that appear and flag it -- the app should not be
    // using them.
    const dialogs = [];
    cdp.on('Page.javascriptDialogOpening', p => {
      dialogs.push(`${p.type}: ${p.message}`);
      cdp.send('Page.handleJavaScriptDialog', { accept: true }).catch(() => {});
    });

    const rows = [];
    const todo = ONLY.length ? SCENARIOS.filter(s => ONLY.includes(s[0])) : SCENARIOS;
    for (const [name, steps] of todo) {
      consoleErrors.length = 0;
      dialogs.length = 0;
      let audit = '(did not run)', failures = [];
      try {
        const loaded = cdp.once('Page.loadEventFired');
        await cdp.send('Page.navigate', { url: URL_BASE });
        await withTimeout(loaded, 15000, 'page load');

        const { result } = await withTimeout(cdp.send('Runtime.evaluate', {
          expression: `window.__run(${JSON.stringify(steps)})`,
          awaitPromise: true,
          returnByValue: true,
        }), 30000, 'scenario steps');
        ({ audit, failures } = result.value || { audit: '(no result)', failures: [] });

        const shot = await withTimeout(
          cdp.send('Page.captureScreenshot', { format: 'png' }), 15000, 'screenshot');
        fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(shot.data, 'base64'));
      } catch (e) {
        audit = 'DRIVER ERROR ' + e.message;
      }

      const errs = [...consoleErrors, ...dialogs.map(d => 'BLOCKING DIALOG ' + d)];
      const clean = audit === 'AUDIT CLEAN' && failures.length === 0 && errs.length === 0;
      if (!clean) code = 1;
      rows.push({ name, audit, failures, errors: errs });

      // Print as we go: a later hang must not cost us the earlier results.
      console.log(`${clean ? 'ok  ' : 'WARN'}  ${name.padEnd(16)} ${audit.split('\n')[0]}`);
      audit.split('\n').slice(1).forEach(l => console.log('        ' + l));
      failures.forEach(l => console.log('        ' + l));
      errs.forEach(l => console.log('        ' + l.split('\n')[0]));
    }

    console.log(`\n${rows.length} scenarios, shots in ${OUT}`);
    console.log(code === 0 ? 'all clean' : 'issues found');

    // For report.js and CI. Off unless asked for.
    if (process.env.UICHECK_RESULTS) {
      fs.writeFileSync(process.env.UICHECK_RESULTS, JSON.stringify({
        clean: code === 0,
        scenarios: rows.map(r => ({
          name: r.name,
          ok: r.audit === 'AUDIT CLEAN' && !r.failures.length && !r.errors.length,
          audit: r.audit,
          issues: [...r.failures, ...r.errors],
          shot: r.name + '.png',
        })),
      }, null, 1));
    }
  } catch (e) {
    console.error('driver failed:', e.message);
    code = 2;
  } finally {
    if (KEEP) {
      console.log(`\nleaving Chrome open (pid ${chrome.pid}); profile ${profile}`);
      console.log('kill it with:  kill ' + chrome.pid);
      chrome.unref();
    } else {
      chrome.kill('SIGKILL');       // only ever our own spawned handle
      // Chrome may still be flushing its profile; cleanup is best-effort.
      await sleep(300);
      try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5 }); }
      catch { /* temp dir, the OS will reap it */ }
    }
  }
  process.exit(code);
})();
