// UI controller. The simulation itself is ../core/creatures.js, transcribed
// from the 1996 binary; nothing in this file may change how a generation is
// computed.
//
// Everything visual comes from CSS custom properties, including the colours
// the canvases are painted with, so a skin restyles the simulation as well as
// the chrome. See css/README.md.
'use strict';

var C = window.Creatures;
var $ = function (id) { return document.getElementById(id); };

var app = {
  field: null, model: null, seed: 0,
  running: false, timer: null, delay: 120, disasterTimer: null,
  brush: 0, zoom: 1,
  history: { grass: [], rabbits: [], foxes: [] },
  yscale: 2000,
  show: { grass: true, rabbits: true, foxes: true },
  plot: { grass: true, rabbits: true, foxes: true },
  graphOn: true,
  colours: {},
};

var HISTORY = 260;
// A strip at the bottom of the plot reserved for the axis line, its ticks and
// their labels. The data is drawn above it, never through it.
var AXIS_H = 13;
// Generation ticks land on multiples of 50; MIN_TICK_PX keeps their labels
// from crowding when the plot is narrow.
var TICK_STEPS = [50, 100, 250, 500, 1000, 2500, 5000];
var MIN_TICK_PX = 38;

// The Speed menu's delays, in milliseconds, as the binary sets them
// (mnuFastClick / mnuMediumClick / mnuSlowClick write a 32-bit value into
// DS:031C). The slider spans the same range, so a preset lands exactly on it.
var SPEED_PRESETS = { fast: 0, medium: 500, slow: 1000 };
var SPEED_MAX_MS = 1000;
// How long a temporary disaster lasts. See triggerDisaster().
var DISASTER_MS = 1000;

function delayFromSlider(v) { return (v / 100) * SPEED_MAX_MS; }
function sliderFromDelay(ms) { return Math.round(ms / SPEED_MAX_MS * 100); }

// Tick whichever preset the current delay matches, or none.
function syncSpeedMenu() {
  Object.keys(SPEED_PRESETS).forEach(function (k) {
    var el = document.querySelector('[data-act="' + k + '"]');
    if (el) el.classList.toggle('is-on', app.delay === SPEED_PRESETS[k]);
  });
}

function setDelay(ms) {
  app.delay = ms;
  $('sldSpeed').value = sliderFromDelay(ms);
  syncSpeedMenu();
  if (app.running) setRunning(true);
}

// Which parameter each slider drives. The ceiling comes from the loaded .FLD,
// which stores a max alongside every value — the original's sliders show a
// percentage of that, which is why they read "87%" rather than a rate.
var SLIDERS = {
  sldSun: 'SolarEnergyInput',
  sldGrassD: 'GrassDeathRate',
  sldHunt: 'FoxReproductionRate',
  sldRabD: 'RabbitDeathRate',
  sldFoxD: 'FoxDeathRate',
};

var DEFAULT_MAX = {
  SolarEnergyInput: 0.8, GrassDeathRate: 1, FoxReproductionRate: 1,
  RabbitDeathRate: 0.4, FoxDeathRate: 0.6,
};

function maxOf(param) {
  var m = (app.field && app.field.max) || {};
  return m[param] !== undefined ? m[param] : DEFAULT_MAX[param];
}

// ---- skins -----------------------------------------------------------------

function readColours() {
  var s = getComputedStyle(document.documentElement);
  var pick = function (name, fallback) {
    return (s.getPropertyValue(name) || '').trim() || fallback;
  };
  app.colours = {
    empty: pick('--sim-empty', '#000'),
    grass: pick('--sim-grass', '#00a000'),
    rabbit: pick('--sim-rabbit', '#0000ff'),
    fox: pick('--sim-fox', '#ff0000'),
    diseased: pick('--sim-diseased', pick('--sim-rabbit', '#0000ff')),
    graphBg: pick('--graph-bg', '#fff'),
    graphGrid: pick('--graph-grid', '#e0e0e0'),
    graphGrass: pick('--graph-grass', '#909000'),
    graphRabbit: pick('--graph-rabbit', '#0000c8'),
    graphFox: pick('--graph-fox', '#c80000'),
    graphText: pick('--graph-text', pick('--text', '#000')),
  };
}

function setSkin(name) {
  document.documentElement.setAttribute('data-skin', name);
  $('skin').setAttribute('href', 'css/skin-' + name + '.css');
  ['1996', '2026'].forEach(function (k) {
    var el = document.querySelector('[data-act="skin:' + k + '"]');
    if (el) el.classList.toggle('is-on', k === name);
  });
  try { localStorage.setItem('creatures.skin', name); } catch (e) { /* ignore */ }
  // The stylesheet loads asynchronously, so re-read a few times until the new
  // tokens have applied.
  var attempt = 0;
  (function settle() {
    readColours();
    redraw();
    if (++attempt < 8) setTimeout(settle, 40);
  }());
}

// ---- setup -----------------------------------------------------------------

function loadField(name) {
  app.field = C.Field.fromBase64(FIELDS[name]);
  app.model = new C.Model(app.field, new C.Xorshift32(app.seed));
  app.history = { grass: [], rabbits: [], foxes: [] };
  app.yscale = app.field.yscale || 2000;
  markScale();
  sizeCanvas();
  syncSliders();
  record();
  redraw();
}

function sizeCanvas() {
  var c = $('field');
  var zoom = Math.max(1, Math.floor(248 / app.field.size));
  c.width = c.height = app.field.size * zoom;
  app.zoom = zoom;
}

function syncSliders() {
  Object.keys(SLIDERS).forEach(function (id) {
    var p = SLIDERS[id];
    $(id).value = Math.round(app.field.params[p] / maxOf(p) * 100);
  });
  updatePercentages();
}

function updatePercentages() {
  // Stacked as the original has it: the number over the per-cent sign.
  $('pctSun').innerHTML = $('sldSun').value + '<br>%';
  $('pctGrassD').innerHTML = $('sldGrassD').value + '<br>%';
}

function applySliders() {
  Object.keys(SLIDERS).forEach(function (id) {
    app.field.params[SLIDERS[id]] = $(id).value / 100 * maxOf(SLIDERS[id]);
  });
  updatePercentages();
}

// ---- drawing ---------------------------------------------------------------

function cellColour(v) {
  if ((v & C.FOX) && app.show.foxes) return app.colours.fox;
  if ((v & C.DISEASED) && app.show.rabbits) return app.colours.diseased;
  if ((v & C.RABBIT) && app.show.rabbits) return app.colours.rabbit;
  if ((v & C.GRASS) && app.show.grass) return app.colours.grass;
  return null;
}

function redraw() {
  if (!app.field) return;
  var c = $('field'), ctx = c.getContext('2d');
  var n = app.field.size, z = app.zoom, g = app.field.cells;
  ctx.fillStyle = app.colours.empty;
  ctx.fillRect(0, 0, c.width, c.height);
  for (var r = 1; r <= n; r++) {
    var row = r * C.STRIDE;
    for (var x = 1; x <= n; x++) {
      var col = cellColour(g[row + x]);
      if (col) {
        ctx.fillStyle = col;
        ctx.fillRect((x - 1) * z, (r - 1) * z, z, z);
      }
    }
  }
  var k = app.field.counts();
  $('nGrass').textContent = k.grass;
  $('nRabbits').textContent = k.rabbits;
  $('nFoxes').textContent = k.foxes;
  $('nGen').textContent = app.model.generation;
  drawGraph();
}

function record() {
  var k = app.field.counts();
  ['grass', 'rabbits', 'foxes'].forEach(function (key) {
    app.history[key].push(k[key]);
    if (app.history[key].length > HISTORY) app.history[key].shift();
  });
}

function sizeGraph() {
  // The backing store follows the rendered size; a fixed width would overflow
  // the flex column and slide under the status panel.
  var c = $('graph');
  var w = Math.max(80, Math.round(c.clientWidth));
  var h = Math.max(40, Math.round(c.clientHeight));
  if (c.width !== w) c.width = w;
  if (c.height !== h) c.height = h;
}

function drawGraph() {
  var c = $('graph'), ctx = c.getContext('2d');
  sizeGraph();
  ctx.fillStyle = app.colours.graphBg;
  ctx.fillRect(0, 0, c.width, c.height);
  if (!app.graphOn) return;

  var plotH = c.height - AXIS_H;

  ctx.strokeStyle = app.colours.graphGrid;
  ctx.lineWidth = 1;
  for (var i = 1; i < 4; i++) {
    var y = Math.round(plotH * i / 4) + 0.5;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke();
  }

  [['grass', app.colours.graphGrass],
   ['rabbits', app.colours.graphRabbit],
   ['foxes', app.colours.graphFox]].forEach(function (pair) {
    if (!app.plot[pair[0]]) return;
    var h = app.history[pair[0]];
    if (h.length < 2) return;
    ctx.strokeStyle = pair[1];
    ctx.beginPath();
    for (var j = 0; j < h.length; j++) {
      var x = j / (HISTORY - 1) * c.width;
      var y2 = plotH - Math.min(1, h[j] / app.yscale) * plotH;
      if (j) ctx.lineTo(x, y2); else ctx.moveTo(x, y2);
    }
    ctx.stroke();
  });

  drawAxes(ctx, c);
}

// The original draws a horizontal axis line across the foot of the plot with
// ticks hanging below it and the generation numbers below those, plus the y
// range at the left: the maximum at the top, zero just above the axis.
function drawAxes(ctx, c) {
  var plotH = c.height - AXIS_H;
  var font = getComputedStyle(document.body).fontFamily || 'sans-serif';
  ctx.fillStyle = app.colours.graphText;
  ctx.strokeStyle = app.colours.graphText;
  ctx.lineWidth = 1;
  ctx.font = '9px ' + font;

  // the y range
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(String(app.yscale), 3, 2);
  ctx.textBaseline = 'bottom';
  ctx.fillText('0', 3, plotH - 1);

  // the axis itself
  var axisY = plotH + 0.5;
  ctx.beginPath();
  ctx.moveTo(0, axisY);
  ctx.lineTo(c.width, axisY);
  ctx.stroke();

  var span = app.history.grass.length;
  if (span < 2) return;
  var last = app.model ? app.model.generation : 0;
  var first = Math.max(0, last - span + 1);

  // Tick on multiples of 50 generations, stepping up the ladder if that would
  // put the labels closer than MIN_TICK_PX apart. Deriving the step from the
  // generation count alone bunched them into the left of the plot early on,
  // when only a few dozen generations have been recorded.
  var pxPerGen = c.width / (HISTORY - 1);
  var step = TICK_STEPS[TICK_STEPS.length - 1];
  TICK_STEPS.some(function (candidate) {
    if (candidate * pxPerGen >= MIN_TICK_PX) { step = candidate; return true; }
    return false;
  });

  // Skip a tick at generation 0: it would sit directly under the y-axis zero
  // and read as a duplicate. The axis line already marks the start.
  var g0 = Math.ceil(first / step) * step;
  if (g0 === 0) g0 = step;

  ctx.textBaseline = 'top';
  for (var g = g0; g <= last; g += step) {
    var x = Math.round(((g - first) / (HISTORY - 1)) * c.width) + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, plotH + 1);
    ctx.lineTo(x, plotH + 4);
    ctx.stroke();
    // keep the label inside the canvas rather than dropping it at the edges
    var label = String(g);
    var w = ctx.measureText(label).width;
    var tx = Math.min(Math.max(x - w / 2, 1), c.width - w - 1);
    ctx.fillText(label, tx, plotH + 4);
  }
}

// ---- running ---------------------------------------------------------------

function tick() { app.model.step(); record(); redraw(); }

function setRunning(on) {
  app.running = on;
  $('runState').textContent = on ? 'Running' : 'Stopped';
  $('btnStart').disabled = on;
  $('btnStop').disabled = !on;
  $('btnOne').disabled = on;
  clearInterval(app.timer);
  if (on) app.timer = setInterval(tick, app.delay);
}

// ---- notices ---------------------------------------------------------------

var noticeTimer = null;
function notify(msg, sticky) {
  var el = $('notice');
  el.textContent = msg;
  clearTimeout(noticeTimer);
  if (!sticky) noticeTimer = setTimeout(function () { el.textContent = ''; }, 6000);
}

// The original's own hint strings, recovered from CREATURE.EXE.
var BRUSH_HINT = {
  1: 'Click on field to add grass',
  2: 'Click on field to add rabbits',
  4: 'Click on field to add foxes',
};

// ---- actions ---------------------------------------------------------------

function saveFLD() {
  var a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([app.field.toFLD()],
    { type: 'application/octet-stream' }));
  a.download = 'FIELD.FLD';
  a.click();
  URL.revokeObjectURL(a.href);
  notify('Saved a .FLD the 1996 program can load.');
}

function resize(n) {
  setRunning(false);
  var old = app.field;
  var f = new C.Field(n);
  f.params = old.params;
  f.max = old.max;
  var lim = Math.min(n, old.size);
  for (var r = 1; r <= lim; r++) {
    for (var c = 1; c <= lim; c++) {
      f.cells[r * C.STRIDE + c] = old.cells[r * C.STRIDE + c];
    }
  }
  f.setBorders();
  app.field = f;
  app.model = new C.Model(f, new C.Xorshift32(app.seed));
  app.history = { grass: [], rabbits: [], foxes: [] };
  sizeCanvas(); record(); redraw();
}

function triggerDisaster(key) {
  var label = app.model.triggerDisaster(key);
  syncSliders();
  if (C.DISASTERS[key].restores) {
    clearTimeout(app.disasterTimer);
    // DisasterTimerTimer, 1:32EE. The form declares `DisasterTimer: TTimer`
    // with no Interval, and Delphi omits a property at its default -- so this
    // is TTimer's default of 1000ms, not a value worth guessing at. (The same
    // form writes `Enabled = False` precisely because its default is True, and
    // writes `Interval = 1` on the two simulation timers because 1 is not the
    // default. The omission is the evidence.)
    //
    // A shock an order of magnitude longer than this wipes STABLE.FLD out
    // entirely instead of denting it.
    app.disasterTimer = setTimeout(function () {
      if (app.model.expireDisaster()) {
        syncSliders();
        notify('The disaster has passed; the rate is back to normal.');
      }
    }, DISASTER_MS);
    notify(label + ' — temporary.', true);
  } else {
    notify(label + ' — sunlight is permanently changed. Drag it back.', true);
  }
}

function act(name, el) {
  if (name.indexOf('load:') === 0) { setRunning(false); loadField(name.slice(5)); return; }
  if (name.indexOf('disaster:') === 0) { triggerDisaster(name.slice(9)); return; }
  if (name.indexOf('skin:') === 0) { setSkin(name.slice(5)); return; }

  switch (name) {
    case 'save': saveFLD(); break;
    case 'reset': app.model.generation = 0; redraw(); break;
    case 'clear': app.field.clear(); redraw(); break;
    case 'populate':
      for (var r = 1; r <= app.field.size; r++) {
        for (var c = 1; c <= app.field.size; c++) {
          app.field.cells[r * C.STRIDE + c] |= C.GRASS;
        }
      }
      redraw(); break;
    case 'disease':
      app.model.addDiseasedRabbit();
      redraw();
      notify('A diseased rabbit has been added; it will infect its neighbours.');
      break;
    case 'size50': resize(50); break;
    case 'size80': resize(80); break;
    case 'fast': case 'medium': case 'slow':
      setDelay(SPEED_PRESETS[name]);
      break;
    case 'defaults': revertDefaults(); break;
    case 'quit':
      setRunning(false);
      notify('The original had a Quit button here. This is a web page — close the tab.');
      break;
    case 'about': showAbout(true); break;
    case 'about-close': showAbout(false); break;
  }
}

// The compiled-in defaults, from SetDefaultParameters (7:1376) — not the
// values in STARTUP.INI, which the original reads over the top of them at
// startup. Parameters only: the field and the generation counter are left
// alone, so the same population can be re-run under default settings.
function revertDefaults() {
  var d = C.defaultParams();
  Object.keys(d).forEach(function (k) { app.field.params[k] = d[k]; });
  syncSliders();
  redraw();
  notify('Parameters reverted to the defaults compiled into the program. '
       + 'The field was left unchanged.');
}


// Every pane has a tab, and vice versa. A name with no pane would otherwise
// clear `is-active` from the whole strip and leave the notebook looking stuck
// with no visible way back, so refuse it rather than half-apply it.
function showPane(name) {
  if (!$('pane-' + name)) return;
  document.querySelectorAll('.tab').forEach(function (t) {
    t.classList.toggle('is-active', t.dataset.pane === name);
  });
  document.querySelectorAll('.pane').forEach(function (p) {
    p.classList.toggle('is-active', p.id === 'pane-' + name);
  });
}

function showAbout(on) {
  $('aboutModal').classList.toggle('is-open', on);
  if (on) $('btnAboutOk').focus();
}

function markScale() {
  document.querySelectorAll('[data-scale]').forEach(function (b) {
    b.classList.toggle('is-on', +b.dataset.scale === app.yscale);
  });
}

function paint(e) {
  if (!app.brush) return;
  var c = $('field'), r = c.getBoundingClientRect(), n = app.field.size;
  var x = Math.floor((e.clientX - r.left) / r.width * n) + 1;
  var y = Math.floor((e.clientY - r.top) / r.height * n) + 1;
  for (var dy = -1; dy <= 1; dy++) {
    for (var dx = -1; dx <= 1; dx++) {
      var px = x + dx, py = y + dy;
      if (px < 1 || py < 1 || px > n || py > n) continue;
      var i = py * C.STRIDE + px;
      if (app.brush === C.GRASS) app.field.cells[i] |= C.GRASS;
      else if (app.brush === C.RABBIT) app.field.cells[i] = (app.field.cells[i] & ~C.FOX) | C.RABBIT;
      else if (app.brush === C.FOX) app.field.cells[i] = (app.field.cells[i] & ~C.RABBIT) | C.FOX;
    }
  }
  redraw();
}

// ---- wiring ----------------------------------------------------------------

function buildMenus() {
  var dm = $('disasterMenu');
  Object.keys(C.DISASTERS).forEach(function (key) {
    var li = document.createElement('li');
    li.className = 'menu__item';
    li.dataset.act = 'disaster:' + key;
    li.textContent = C.DISASTERS[key].label;
    dm.appendChild(li);
  });

  // "Load a Field Pattern" lived on the File menu in the original.
  var fm = $('fileMenu');
  Object.keys(FIELDS).reverse().forEach(function (name) {
    var li = document.createElement('li');
    li.className = 'menu__item';
    li.dataset.act = 'load:' + name;
    li.textContent = 'Load ' + name + '.FLD';
    fm.insertBefore(li, fm.firstChild);
  });

  document.querySelectorAll('.menu').forEach(function (menu) {
    menu.querySelector('.menu__button').addEventListener('click', function (e) {
      var open = menu.classList.contains('is-open');
      document.querySelectorAll('.menu').forEach(function (m) { m.classList.remove('is-open'); });
      if (!open) menu.classList.add('is-open');
      e.stopPropagation();
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.menu').forEach(function (m) { m.classList.remove('is-open'); });
  });
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-act]');
    if (el) act(el.dataset.act, el);
  });
}

function aboutBlurb() {
  return 'This is <b>Creatures 1.0</b> (Future Skill Software, 1996), rebuilt '
    + 'from the shipped binary. The simulation is transcribed from the machine '
    + 'code rather than inferred from its saved data, so the passes, the '
    + 'probabilities and the quirks are as <code>CREATURE.EXE</code> runs them.'
    + '<br><br>Movement is orthogonal only and happens at most half the time; a '
    + 'rabbit eats the grass beneath it with a 1-in-50 chance; a fox that '
    + 'catches a rabbit breeds into its cell. Disasters change a parameter '
    + 'rather than the field, and three of the four revert on their own.';
}

function init() {
  buildMenus();
  readColours();

  $('btnStart').addEventListener('click', function () { setRunning(true); });
  $('btnStop').addEventListener('click', function () { setRunning(false); });
  $('btnOne').addEventListener('click', tick);
  $('btnQuit').addEventListener('click', function () { act('quit'); });

  Object.keys(SLIDERS).forEach(function (id) {
    $(id).addEventListener('input', applySliders);
  });
  $('sldSpeed').addEventListener('input', function (e) {
    app.delay = delayFromSlider(+e.target.value);
    syncSpeedMenu();          // the menu ticks follow the slider, and clear
    if (app.running) setRunning(true);   // when it sits between presets
  });

  document.querySelectorAll('.brush').forEach(function (b) {
    b.title = BRUSH_HINT[+b.dataset.brush];
    b.addEventListener('click', function () {
      var v = +b.dataset.brush;
      app.brush = app.brush === v ? 0 : v;
      document.querySelectorAll('.brush').forEach(function (o) {
        o.classList.toggle('is-on', +o.dataset.brush === app.brush);
      });
      notify(app.brush ? BRUSH_HINT[app.brush] : '', true);
    });
  });
  $('field').addEventListener('mousedown', paint);
  $('field').addEventListener('mousemove', function (e) { if (e.buttons) paint(e); });

  document.querySelectorAll('[data-scale]').forEach(function (b) {
    b.addEventListener('click', function () {
      app.yscale = +b.dataset.scale;
      markScale();
      drawGraph();
    });
  });
  $('graphOn').addEventListener('change', function (e) { app.graphOn = e.target.checked; drawGraph(); });

  [['showGrass', 'grass'], ['showRabbits', 'rabbits'], ['showFoxes', 'foxes']]
    .forEach(function (p) {
      $(p[0]).addEventListener('change', function (e) { app.show[p[1]] = e.target.checked; redraw(); });
    });
  [['plotGrass', 'grass'], ['plotRabbits', 'rabbits'], ['plotFoxes', 'foxes']]
    .forEach(function (p) {
      $(p[0]).addEventListener('change', function (e) { app.plot[p[1]] = e.target.checked; drawGraph(); });
    });

  document.querySelectorAll('.tab').forEach(function (t) {
    t.addEventListener('click', function () { showPane(t.dataset.pane); });
  });

  window.addEventListener('resize', function () { sizeGraph(); drawGraph(); });

  // Click outside the dialog dismisses it; the dialog itself must not.
  $('aboutModal').addEventListener('click', function (e) {
    if (e.target === this) showAbout(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') showAbout(false);
  });

  $('aboutText').innerHTML = aboutBlurb();
}

function boot() {
  var saved = null;
  try { saved = localStorage.getItem('creatures.skin'); } catch (e) { /* ignore */ }
  if (saved && saved !== '1996') setSkin(saved);
  setDelay(SPEED_PRESETS.medium);   // the original starts on Medium
  loadField('STABLE');
  setRunning(location.hash === '#run');
}

document.addEventListener('DOMContentLoaded', function () { init(); boot(); });
