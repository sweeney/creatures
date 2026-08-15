// Programmatic control + a layout auditor, so the UI can be driven and checked
// without a mouse.
//
// Inert unless the page is loaded with ?do=... , so it costs the real app
// nothing. Two entry points:
//
//   window.__ui      drive the interface (click, drag sliders, open menus)
//   window.__audit() scan the rendered layout for overflow, overlap, clipping
//
// Drive it from the URL, which is all headless Chrome needs:
//
//   index.html?do=gen:80,tab:graph
//   index.html?do=open:Disasters
//   index.html?do=set:sldSun=100,gen:60
//
// The audit result is written into #auditOut as text, so `--dump-dom` can read
// it back without a devtools connection.

(function () {
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const ui = {
    click(id) {
      const el = typeof id === 'string' ? document.getElementById(id) || document.querySelector(id) : id;
      if (!el) throw new Error('no element: ' + id);
      el.click();
      return el;
    },

    // Set a range input and fire the event the app listens for.
    set(id, value) {
      const el = document.getElementById(id);
      if (!el) throw new Error('no input: ' + id);
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return el;
    },

    check(id, on) {
      const el = document.getElementById(id);
      el.checked = on;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    },

    // Open a top-level menu by its visible name, and leave it open.
    openMenu(name) {
      const menu = [...document.querySelectorAll('.menu')].find(m =>
        m.querySelector('.menu__button').textContent.trim().toLowerCase()
          === name.toLowerCase());
      if (!menu) throw new Error('no menu: ' + name);
      document.querySelectorAll('.menu').forEach(m => m.classList.remove('is-open'));
      menu.classList.add('is-open');
      return menu;
    },

    // Fire a menu item by its data-act, without opening anything.
    menu(actName) {
      const li = document.querySelector(`[data-act="${actName}"]`);
      if (!li) throw new Error('no menu action: ' + actName);
      li.click();
    },

    tab(name) { document.querySelector(`.tab[data-pane="${name}"]`).click(); },

    // Advance the model synchronously -- no timers, so it is deterministic.
    gen(n) { for (let i = 0; i < +n; i++) tick(); },

    paint(brush, x, y) {
      app.brush = +brush;
      const c = document.getElementById('field');
      const r = c.getBoundingClientRect();
      const n = app.field.size;
      c.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true,
        clientX: r.left + (x / n) * r.width,
        clientY: r.top + (y / n) * r.height,
      }));
    },
  };

  // ------------------------------------------------------------- auditor --

  const AREA = el => { const r = el.getBoundingClientRect(); return r.width * r.height; };

  function overlaps(a, b) {
    return !(a.right <= b.left + 0.5 || b.right <= a.left + 0.5 ||
             a.bottom <= b.top + 0.5 || b.bottom <= a.top + 0.5);
  }

  function visible(el) {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  window.__audit = function () {
    const issues = [];
    const win = document.querySelector('.app');
    const wr = win.getBoundingClientRect();

    const describe = el => {
      const id = el.id ? '#' + el.id : '';
      const cls = el.className && typeof el.className === 'string'
        ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
      const txt = (el.textContent || '').trim().slice(0, 24).replace(/\s+/g, ' ');
      return `${el.tagName.toLowerCase()}${id}${cls}${txt ? ` "${txt}"` : ''}`;
    };

    // An open dialog is a window in its own right: it lives outside `.app` and
    // floats over it, so audit it as a second frame rather than skipping it.
    const windows = [win, ...document.querySelectorAll('.modal.is-open .dialog')];
    const scan = sel => windows.flatMap(w => [...w.querySelectorAll(sel)]);

    // 1. anything sticking out of the window frame it belongs to
    for (const w of windows) {
      const frame = w.getBoundingClientRect();
      for (const el of w.querySelectorAll('*')) {
        if (!visible(el)) continue;
        if (el.closest('.menu__list')) continue;        // dropdowns overlay by design
        const r = el.getBoundingClientRect();
        const dx = Math.max(0, r.right - frame.right, frame.left - r.left);
        const dy = Math.max(0, r.bottom - frame.bottom, frame.top - r.top);
        if (dx > 1 || dy > 1) {
          issues.push(`OVERFLOW  ${describe(el)} escapes window by ${Math.round(dx)}x${Math.round(dy)}px`);
        }
      }
    }

    // 2. anything escaping its own parent's content box. This is what catches
    //    a fixed-size canvas overflowing a flex column -- the window-level
    //    check above cannot see it, because it stays inside the window.
    for (const el of scan('canvas, .stat__value, .fieldview, button, input')) {
      if (!visible(el)) continue;
      if (el.closest('.menu__list')) continue;
      const p = el.parentElement;
      if (!p || getComputedStyle(p).overflow !== 'visible') continue;
      const r = el.getBoundingClientRect(), pr = p.getBoundingClientRect();
      const out = Math.max(r.right - pr.right, pr.left - r.left,
                           r.bottom - pr.bottom, pr.top - r.top);
      if (out > 1.5) {
        issues.push(`ESCAPES   ${describe(el)} overflows ${describe(p)} by ${Math.round(out)}px`);
      }
    }

    // 3. clipped text
    for (const el of scan('button, .stat__value, .control__label, .stat__label, legend, .tab, span')) {
      if (!visible(el)) continue;
      if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) {
        issues.push(`CLIPPED   ${describe(el)} text ${el.scrollWidth}px in ${el.clientWidth}px`);
      }
    }

    // 4. overlapping controls -- include panels, not just interactive bits,
    //    so a stray canvas sitting under a fieldset is reported.
    const ctrls = scan(
      'button, input, canvas, .tab, fieldset, .stat__value, .notice').filter(visible);
    for (let i = 0; i < ctrls.length; i++) {
      for (let j = i + 1; j < ctrls.length; j++) {
        const a = ctrls[i], b = ctrls[j];
        if (a.contains(b) || b.contains(a)) continue;
        if (a.closest('.menu__list') || b.closest('.menu__list')) continue;
        // Tabs in a tabstrip deliberately abut and overlap — the original's
        // slanted tabs share an edge. Overlap between them is by design.
        if (a.closest('.tabs') && b.closest('.tabs')) continue;
        // A dialog floats over the app on purpose, so only overlaps between
        // two controls in the same window mean anything.
        if (!!a.closest('.modal') !== !!b.closest('.modal')) continue;
        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        if (overlaps(ra, rb)) {
          issues.push(`OVERLAP   ${describe(a)} <-> ${describe(b)}`);
        }
      }
    }

    // 5. controls too small to hit
    for (const el of ctrls) {
      const r = el.getBoundingClientRect();
      if (r.width < 6 || r.height < 6) {
        issues.push(`TINY      ${describe(el)} is ${Math.round(r.width)}x${Math.round(r.height)}px`);
      }
    }

    // 6. the notebook always has exactly one tab selected and one page showing.
    //    Anything less strands the user on a page with no visible way back.
    const onTabs = [...document.querySelectorAll('.tab.is-active')];
    const onPanes = [...document.querySelectorAll('.pane.is-active')];
    if (onTabs.length !== 1 || onPanes.length !== 1) {
      issues.push(`NOTEBOOK  ${onTabs.length} tab(s) selected, ${onPanes.length} page(s) showing`);
    } else if ('pane-' + onTabs[0].dataset.pane !== onPanes[0].id) {
      issues.push(`NOTEBOOK  tab "${onTabs[0].textContent.trim()}" ` +
        `does not match page #${onPanes[0].id}`);
    }

    // 7. horizontal page scroll
    if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) {
      issues.push(`PAGE      body scrolls horizontally ` +
        `(${document.documentElement.scrollWidth} > ${document.documentElement.clientWidth})`);
    }

    const out = issues.length
      ? `AUDIT ${issues.length} ISSUE(S)\n` + issues.join('\n')
      : 'AUDIT CLEAN';
    let box = document.getElementById('auditOut');
    if (!box) {
      box = document.createElement('pre');
      box.id = 'auditOut';
      box.style.cssText = 'position:absolute;left:-9999px;white-space:pre';
      document.body.appendChild(box);
    }
    box.textContent = out;
    return out;
  };

  // ------------------------------------------------------------- runner ---

  async function runScript(spec) {
    for (const raw of spec.split(',')) {
      const step = raw.trim();
      if (!step) continue;
      // split on the FIRST colon only, so "menu:disaster:fire" works
      const cut = step.indexOf(':');
      const cmd = cut < 0 ? step : step.slice(0, cut);
      const arg = cut < 0 ? undefined : step.slice(cut + 1);
      try {
        switch (cmd) {
          case 'gen': ui.gen(arg || 1); break;
          case 'start': ui.click('btnStart'); break;
          case 'stop': ui.click('btnStop'); break;
          case 'one': ui.click('btnOne'); break;
          case 'tab': ui.tab(arg); break;
          case 'open': ui.openMenu(arg); break;
          case 'menu': ui.menu(arg); break;
          case 'field': ui.menu('load:' + arg); break;
          case 'scale':
            document.querySelector(`[data-scale="${arg}"]`).click(); break;
          case 'set': {
            const [id, v] = arg.split('=');
            ui.set(id, v); break;
          }
          case 'uncheck': ui.check(arg, false); break;
          case 'recheck': ui.check(arg, true); break;
          case 'brush': ui.paint(arg, 25, 25); break;
          case 'skin':
            ui.menu('skin:' + arg);
            await sleep(400);
            break;
          case 'wait': await sleep(+arg || 100); break;
          default: console.warn('unknown step', step);
        }
      } catch (e) {
        console.error('step failed:', step, e.message);
        window.__failures.push('STEP FAILED ' + step + ': ' + e.message);
      }
    }
    window.__auditResult = window.__audit();
    window.__done = true;
  }

  window.__ui = ui;
  window.__failures = [];
  window.__done = false;
  window.__auditResult = null;

  // Run a scenario in an already-loaded page, without navigating. Lets a
  // single browser instance iterate every scenario.
  window.__run = async function (spec) {
    window.__failures = [];
    window.__done = false;
    window.__auditResult = null;
    await runScript(spec);
    return { audit: window.__auditResult, failures: window.__failures };
  };

  document.addEventListener('DOMContentLoaded', () => {
    const spec = new URLSearchParams(location.search).get('do');
    // Let app.js finish its own DOMContentLoaded handler first.
    if (spec !== null) setTimeout(() => runScript(spec), 0);
  });
})();
