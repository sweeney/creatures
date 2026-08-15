#!/usr/bin/env node
// Run the test suites and build a self-contained HTML report of what passed
// and what the tests actually reached.
//
//     node core/report.js [outdir]        core tests + coverage
//     node core/report.js --ui [outdir]   ...and the browser UI audit
//
// Writes <outdir>/index.html and <outdir>/summary.md. Default outdir: report/.
//
// Coverage comes from V8 itself via NODE_V8_COVERAGE -- a Node built-in, so
// there is nothing to install. V8 reports byte ranges with execution counts;
// everything below is the arithmetic that turns those into lines.
'use strict';

var fs = require('fs');
var os = require('os');
var path = require('path');
var { spawnSync } = require('child_process');

var ROOT = path.join(__dirname, '..');
var args = process.argv.slice(2);
var WITH_UI = args.indexOf('--ui') !== -1;
var OUT = path.resolve(args.filter(function (a) { return a !== '--ui'; })[0]
  || path.join(ROOT, 'report'));

// Files worth reporting coverage on: the model, not the tests that drive it.
function isSubject(file) {
  return file === path.join(ROOT, 'core', 'creatures.js');
}

// ---- running the suites --------------------------------------------------

// Both suites use the same harness and report the same shape. Only the core
// run is measured for coverage: the web suite reads app.js as text rather
// than executing it, so V8 has nothing to record.
function runSuite(tmp, label, script, opts) {
  var covDir = path.join(tmp, label + '-v8');
  var resultsFile = path.join(tmp, label + '-results.json');
  var env = Object.assign({}, process.env, { CREATURES_RESULTS: resultsFile });
  if (opts && opts.coverage) env.NODE_V8_COVERAGE = covDir;

  var r = spawnSync(process.execPath, [script], {
    cwd: ROOT, encoding: 'utf8', env: env,
  });
  process.stdout.write(r.stdout || '');
  if (r.stderr) process.stderr.write(r.stderr);
  if (!fs.existsSync(resultsFile)) {
    throw new Error(label + ' tests produced no results file; exit ' + r.status);
  }
  return {
    results: JSON.parse(fs.readFileSync(resultsFile, 'utf8')),
    coverage: opts && opts.coverage ? readCoverage(covDir) : {},
    status: r.status,
  };
}

function runCoreTests(tmp) {
  return runSuite(tmp, 'core', path.join(ROOT, 'core', 'test.js'), { coverage: true });
}

function runWebTests(tmp) {
  return runSuite(tmp, 'web', path.join(ROOT, 'web', 'test.js'), { coverage: false });
}

function runUiCheck(tmp) {
  var resultsFile = path.join(tmp, 'ui.json');
  var shots = path.join(OUT, 'screenshots');
  fs.mkdirSync(shots, { recursive: true });
  var r = spawnSync(process.execPath, [path.join(ROOT, 'web', 'uicheck.js'), shots], {
    cwd: path.join(ROOT, 'web'),
    encoding: 'utf8',
    env: Object.assign({}, process.env, {
      UICHECK_RESULTS: resultsFile,
      UICHECK_HEADLESS: process.env.UICHECK_HEADLESS || '1',
    }),
  });
  process.stdout.write(r.stdout || '');
  if (r.stderr) process.stderr.write(r.stderr);
  if (!fs.existsSync(resultsFile)) {
    console.error('  (ui audit produced no results; exit ' + r.status + ')');
    return null;
  }
  return JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
}

// ---- V8 coverage ---------------------------------------------------------

// V8 drops one JSON file per process. Merge them, keyed by source file.
function readCoverage(dir) {
  var byFile = {};
  if (!fs.existsSync(dir)) return byFile;
  fs.readdirSync(dir).forEach(function (name) {
    if (!/\.json$/.test(name)) return;
    var doc = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
    (doc.result || []).forEach(function (script) {
      if (!script.url || script.url.indexOf('file://') !== 0) return;
      var file = decodeURIComponent(script.url.slice('file://'.length));
      if (!isSubject(file)) return;
      (byFile[file] = byFile[file] || []).push.apply(byFile[file], script.functions);
    });
  });
  return byFile;
}

// Which lines hold code, ignoring blanks and comments. Without this a file of
// well-commented source scores as poorly covered for no reason.
function classifyLines(source) {
  var lines = source.split('\n');
  var kind = [];                 // 'code' | 'skip'
  var inBlock = false;
  lines.forEach(function (raw) {
    var t = raw.trim();
    var isCode = true;
    if (inBlock) {
      isCode = false;
      if (t.indexOf('*/') !== -1) inBlock = false;
    } else if (t === '') {
      isCode = false;
    } else if (t.indexOf('//') === 0) {
      isCode = false;
    } else if (t.indexOf('/*') === 0) {
      isCode = false;
      if (t.indexOf('*/') === -1) inBlock = true;
    } else if (t === '}' || t === '};' || t === '});' || t === ')' || t === '{') {
      // Braces alone are not statements; V8 attributes them unevenly and they
      // only add noise to the count either way.
      isCode = false;
    }
    kind.push(isCode ? 'code' : 'skip');
  });
  return kind;
}

function fileCoverage(file, functions) {
  var source = fs.readFileSync(file, 'utf8');

  // Per-byte execution counts. Ranges nest, so apply widest first and let the
  // narrower ones overwrite: that is what makes an uncovered `else` branch
  // show as zero inside a function that did run.
  var counts = new Array(source.length).fill(0);
  var ranges = [];
  functions.forEach(function (f) {
    (f.ranges || []).forEach(function (r) { ranges.push(r); });
  });
  ranges.sort(function (a, b) {
    return a.startOffset - b.startOffset || b.endOffset - a.endOffset;
  });
  ranges.forEach(function (r) {
    var end = Math.min(r.endOffset, counts.length);
    for (var i = r.startOffset; i < end; i++) counts[i] = r.count;
  });

  var lines = source.split('\n');
  var kind = classifyLines(source);
  var lineInfo = [];
  var offset = 0;
  var covered = 0, total = 0;
  lines.forEach(function (text, i) {
    var hits = 0;
    for (var j = 0; j < text.length; j++) {
      if (!/\s/.test(text[j])) hits = Math.max(hits, counts[offset + j] || 0);
    }
    var isCode = kind[i] === 'code';
    if (isCode) {
      total++;
      if (hits > 0) covered++;
    }
    lineInfo.push({ n: i + 1, text: text, code: isCode, hits: hits });
    offset += text.length + 1;
  });

  // The synthetic whole-file entry is not a function; counting it flatters.
  var fns = functions.filter(function (f) {
    var r = f.ranges && f.ranges[0];
    return r && !(f.functionName === '' && r.startOffset === 0
      && r.endOffset >= source.length - 1);
  });
  var fnsCovered = fns.filter(function (f) { return f.ranges[0].count > 0; });

  return {
    file: path.relative(ROOT, file),
    lines: lineInfo,
    lineTotal: total,
    lineCovered: covered,
    fnTotal: fns.length,
    fnCovered: fnsCovered.length,
    uncoveredFns: fns.filter(function (f) { return f.ranges[0].count === 0; })
      .map(function (f) { return f.functionName || '(anonymous)'; }),
  };
}

// ---- output --------------------------------------------------------------

function pct(a, b) { return b === 0 ? 100 : Math.round((a / b) * 1000) / 10; }

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function summaryMarkdown(core, files, ui) {
  var out = [];
  var ok = core.results.failed === 0;
  out.push('## ' + (ok ? '✅' : '❌') + ' Tests — '
    + core.results.passed + ' passed, ' + core.results.failed + ' failed');
  out.push('');
  if (core.results.failed) {
    out.push('| test | error |');
    out.push('|---|---|');
    core.results.tests.filter(function (t) { return !t.ok; }).forEach(function (t) {
      out.push('| `' + t.name + '` | ' + t.error + ' |');
    });
    out.push('');
  }
  out.push('| file | lines | functions |');
  out.push('|---|---|---|');
  files.forEach(function (f) {
    out.push('| `' + f.file + '` | ' + pct(f.lineCovered, f.lineTotal) + '% ('
      + f.lineCovered + '/' + f.lineTotal + ') | '
      + pct(f.fnCovered, f.fnTotal) + '% (' + f.fnCovered + '/' + f.fnTotal + ') |');
  });
  out.push('');
  if (ui) {
    var bad = ui.scenarios.filter(function (s) { return !s.ok; });
    out.push('## ' + (bad.length ? '❌' : '✅') + ' UI audit — '
      + (ui.scenarios.length - bad.length) + '/' + ui.scenarios.length + ' scenarios clean');
    if (bad.length) {
      out.push('');
      out.push('| scenario | finding |');
      out.push('|---|---|');
      bad.forEach(function (s) {
        out.push('| `' + s.name + '` | ' + (s.audit || '').split('\n')[0] + ' |');
      });
    }
    out.push('');
  }
  out.push('Full report in the **test-report** artifact.');
  return out.join('\n') + '\n';
}

function html(core, files, ui, meta) {
  var suites = {};
  core.results.tests.forEach(function (t) {
    (suites[t.suite] = suites[t.suite] || []).push(t);
  });

  function card(label, value, state) {
    return '<div class="card ' + state + '"><span class="card__v">' + value
      + '</span><span class="card__l">' + esc(label) + '</span></div>';
  }

  var lineC = files.reduce(function (a, f) { return a + f.lineCovered; }, 0);
  var lineT = files.reduce(function (a, f) { return a + f.lineTotal; }, 0);
  var fnC = files.reduce(function (a, f) { return a + f.fnCovered; }, 0);
  var fnT = files.reduce(function (a, f) { return a + f.fnTotal; }, 0);
  var failed = core.results.failed;
  var uiBad = ui ? ui.scenarios.filter(function (s) { return !s.ok; }).length : 0;

  var h = [];
  h.push('<!doctype html><html lang="en"><head><meta charset="utf-8">');
  h.push('<meta name="viewport" content="width=device-width,initial-scale=1">');
  h.push('<link rel="icon" href="icon.svg">');
  h.push('<title>Creatures — test report</title><style>');
  h.push(CSS);
  h.push('</style></head><body><div class="wrap">');

  h.push('<header><h1>Creatures — test report</h1><p class="meta">'
    + esc(meta.when) + (meta.commit ? ' · <code>' + esc(meta.commit.slice(0, 8)) + '</code>' : '')
    + (meta.ref ? ' · ' + esc(meta.ref) : '') + '</p></header>');

  h.push('<section class="cards">');
  h.push(card('tests passed', core.results.passed, 'good'));
  h.push(card('tests failed', failed, failed ? 'bad' : 'good'));
  h.push(card('line coverage', pct(lineC, lineT) + '%', lineC === lineT ? 'good' : 'warn'));
  h.push(card('function coverage', pct(fnC, fnT) + '%', fnC === fnT ? 'good' : 'warn'));
  if (ui) h.push(card('ui scenarios clean', (ui.scenarios.length - uiBad) + '/' + ui.scenarios.length, uiBad ? 'bad' : 'good'));
  h.push('</section>');

  // --- tests
  h.push('<section><h2>Tests</h2>');
  Object.keys(suites).sort().forEach(function (s) {
    var rows = suites[s];
    var bad = rows.filter(function (t) { return !t.ok; }).length;
    h.push('<details' + (bad ? ' open' : '') + '><summary><span class="dot '
      + (bad ? 'bad' : 'good') + '"></span>' + esc(s) + ' <span class="count">'
      + (rows.length - bad) + '/' + rows.length + '</span></summary><table>');
    rows.forEach(function (t) {
      h.push('<tr class="' + (t.ok ? '' : 'row-bad') + '"><td class="st">'
        + (t.ok ? 'pass' : 'FAIL') + '</td><td>' + esc(t.name.replace(/^[^:]*:\s*/, ''))
        + (t.error ? '<div class="err">' + esc(t.error) + '</div>' : '')
        + '</td><td class="ms">' + t.ms.toFixed(1) + 'ms</td></tr>');
    });
    h.push('</table></details>');
  });
  h.push('</section>');

  // --- ui
  if (ui) {
    h.push('<section><h2>UI audit</h2><p class="note">Each scenario drives the '
      + 'interface in a real browser, then audits the rendered layout for '
      + 'overflow, overlap, clipped text, unhittable controls and notebook '
      + 'state. Screenshots are in <code>screenshots/</code>.</p><table>');
    ui.scenarios.forEach(function (s) {
      h.push('<tr class="' + (s.ok ? '' : 'row-bad') + '"><td class="st">'
        + (s.ok ? 'clean' : 'ISSUE') + '</td><td>' + esc(s.name)
        + (s.ok ? '' : '<div class="err">' + esc(s.issues.join(' · ') || s.audit) + '</div>')
        + '</td></tr>');
    });
    h.push('</table></section>');
  }

  // --- coverage
  h.push('<section><h2>Coverage</h2>');
  h.push('<p class="note">From V8 directly (<code>NODE_V8_COVERAGE</code>), no '
    + 'instrumentation and no dependencies. Blank lines, comments and bare '
    + 'braces are not counted as code. A line is covered if any of its '
    + 'non-whitespace bytes sit inside a range V8 recorded as executed.</p>');
  files.forEach(function (f) {
    h.push('<h3>' + esc(f.file) + ' <span class="count">'
      + pct(f.lineCovered, f.lineTotal) + '% lines · '
      + pct(f.fnCovered, f.fnTotal) + '% functions</span></h3>');
    if (f.uncoveredFns.length) {
      h.push('<p class="note">Never called: ' + f.uncoveredFns.map(function (n) {
        return '<code>' + esc(n) + '</code>';
      }).join(', ') + '</p>');
    }
    h.push('<div class="src">');
    f.lines.forEach(function (l) {
      var cls = !l.code ? 'x' : (l.hits > 0 ? 'y' : 'n');
      h.push('<div class="ln ' + cls + '"><i>' + l.n + '</i><code>'
        + (esc(l.text) || '&nbsp;') + '</code></div>');
    });
    h.push('</div>');
  });
  h.push('</section>');

  h.push('</div></body></html>');
  return h.join('\n');
}

var CSS = `
:root{--bg:#F5F5F2;--surface:#fff;--rule:#D9DAD4;--text:#1A1C21;--muted:#5F646F;
--good:#2F7D3C;--bad:#B83E33;--warn:#9A6A12;--hit:#E7F3E9;--miss:#FBE9E7;--mono:ui-monospace,Menlo,Consolas,monospace}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0E1117;--surface:#161A22;
--rule:#262B36;--text:#D7DAE1;--muted:#868EA0;--good:#46A356;--bad:#E05B4F;--warn:#E9B44C;
--hit:#14251A;--miss:#2A1614}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);
font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
.wrap{max-width:70rem;margin:0 auto;padding:40px 24px 80px}
h1{font-size:1.6rem;margin:0 0 4px}
h2{font-size:1.15rem;margin:44px 0 14px;padding-bottom:8px;border-bottom:1px solid var(--rule)}
h3{font-size:.95rem;margin:26px 0 8px;font-family:var(--mono);font-weight:600}
.meta{color:var(--muted);font-size:.87rem;margin:0}
code{font-family:var(--mono);font-size:.9em}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-top:26px}
.card{background:var(--surface);border:1px solid var(--rule);border-radius:8px;
padding:16px 18px;display:flex;flex-direction:column;gap:2px}
.card__v{font-size:1.7rem;font-weight:650;font-variant-numeric:tabular-nums;line-height:1.1}
.card__l{font-size:.76rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
.card.good .card__v{color:var(--good)}
.card.bad .card__v{color:var(--bad)}
.card.warn .card__v{color:var(--warn)}
.count{color:var(--muted);font-weight:400;font-size:.85rem}
.note{color:var(--muted);font-size:.87rem;max-width:60ch}
details{background:var(--surface);border:1px solid var(--rule);border-radius:8px;
margin-bottom:8px;overflow:hidden}
summary{cursor:pointer;padding:11px 16px;font-weight:550;display:flex;align-items:center;gap:9px}
.dot{width:8px;height:8px;border-radius:50%;flex:none}
.dot.good{background:var(--good)}
.dot.bad{background:var(--bad)}
table{width:100%;border-collapse:collapse;font-size:.9rem}
td{padding:7px 16px;border-top:1px solid var(--rule);vertical-align:top}
td.st{width:64px;font-family:var(--mono);font-size:.76rem;text-transform:uppercase;
letter-spacing:.05em;color:var(--good)}
tr.row-bad td.st{color:var(--bad)}
td.ms{width:80px;text-align:right;color:var(--muted);font-variant-numeric:tabular-nums}
.err{color:var(--bad);font-family:var(--mono);font-size:.82rem;margin-top:4px;
white-space:pre-wrap;word-break:break-word}
.src{background:var(--surface);border:1px solid var(--rule);border-radius:8px;
overflow-x:auto;font-family:var(--mono);font-size:12.5px;line-height:1.5;padding:6px 0}
.ln{display:flex;gap:14px;white-space:pre;padding:0 14px}
.ln i{color:var(--muted);font-style:normal;text-align:right;min-width:3.2em;
user-select:none;font-variant-numeric:tabular-nums}
.ln.y{background:var(--hit)}
.ln.n{background:var(--miss)}
.ln code{font-size:inherit}
`;

// ---- main ----------------------------------------------------------------

var tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'creatures-report-'));
fs.mkdirSync(OUT, { recursive: true });

console.log('core tests\n');
var core = runCoreTests(tmp);

var files = Object.keys(core.coverage).sort().map(function (f) {
  return fileCoverage(f, core.coverage[f]);
});
if (!files.length) console.error('  (no coverage captured for the model)');

console.log('\nweb tests\n');
var web = runWebTests(tmp);

// One table for both. Each test name carries its own suite prefix, so the
// report groups them without needing to know which runner produced them.
var all = {
  results: {
    passed: core.results.passed + web.results.passed,
    failed: core.results.failed + web.results.failed,
    tests: core.results.tests.concat(web.results.tests),
  },
  status: core.status || web.status,
};

var ui = null;
if (WITH_UI) {
  console.log('\nui audit\n');
  ui = runUiCheck(tmp);
}

var meta = {
  when: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
  commit: process.env.GITHUB_SHA || '',
  ref: process.env.GITHUB_REF_NAME || '',
};

fs.copyFileSync(path.join(ROOT, 'icon.svg'), path.join(OUT, 'icon.svg'));
fs.writeFileSync(path.join(OUT, 'index.html'), html(all, files, ui, meta));
fs.writeFileSync(path.join(OUT, 'summary.md'), summaryMarkdown(all, files, ui));
fs.rmSync(tmp, { recursive: true, force: true });

console.log('\nreport -> ' + path.join(OUT, 'index.html'));
files.forEach(function (f) {
  console.log('  ' + f.file + '  lines ' + pct(f.lineCovered, f.lineTotal)
    + '%  functions ' + pct(f.fnCovered, f.fnTotal) + '%');
});

// Fail the build if anything failed, but only after the report is written.
// A requested UI audit that produced nothing is a failure, not a pass: a
// missing browser must not read as a clean run.
var bad = all.results.failed > 0 || all.status !== 0
  || (WITH_UI && (!ui || !ui.clean));
process.exit(bad ? 1 : 0);
