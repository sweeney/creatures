// The UI layer's constants, checked against the artefacts they came from.
//
// core/ is covered by tests that pin its behaviour, but app.js sits outside
// that harness: it is loaded by a browser, so nothing catches a number in it
// that was invented rather than recovered. One was -- a disaster lasted 12
// seconds here against the form's 1 -- and it survived because it carried a
// comment implying it had been read out of the binary.
//
// So these tests re-derive the ground truth every run, from
// original/files/CREATURE.EXE, original/forms/Form1.dfm and
// original/files/STARTUP.INI. Asserting one hard-coded number against another
// would only restate the mistake.
'use strict';

var fs = require('fs');
var path = require('path');
var H = require('../../core/harness.js');
var test = H.test, assert = H.assert;

var ROOT = path.join(__dirname, '..', '..');
var APP = fs.readFileSync(path.join(ROOT, 'web', 'app.js'), 'utf8');
var EXE = fs.readFileSync(path.join(ROOT, 'original', 'files', 'CREATURE.EXE'));
var DFM = fs.readFileSync(path.join(ROOT, 'original', 'forms', 'Form1.dfm'), 'utf8');
var INI = fs.readFileSync(path.join(ROOT, 'original', 'files', 'STARTUP.INI'), 'utf8');

// Pull a top-level `var NAME = <literal>;` out of app.js and evaluate it. The
// file cannot be required -- it expects a browser -- so read it as source.
function constant(name) {
  var re = new RegExp('^var ' + name + ' = ([\\s\\S]*?);$', 'm');
  var m = re.exec(APP);
  if (!m) throw new Error('no constant ' + name + ' in app.js');
  return eval('(' + m[1] + ')');            // our own source, in a test
}

function iniValue(key) {
  var m = new RegExp('^' + key + '=(.+)$', 'm').exec(INI);
  if (!m) throw new Error('no ' + key + ' in STARTUP.INI');
  return parseFloat(m[1]);
}

// Every `object <name>: TTimer ... end` block in the form.
function timerBlock(name) {
  var re = new RegExp('object ' + name + ': TTimer\\r?\\n([\\s\\S]*?)\\r?\\n  end', 'm');
  var m = re.exec(DFM);
  if (!m) throw new Error('no timer ' + name + ' in Form1.dfm');
  return m[1];
}

// ---- the simulation speeds -------------------------------------------

// mnuFastClick, mnuMediumClick and mnuSlowClick each finish by writing a
// 32-bit delay to DS:031C. Two do it as an immediate; Fast zeroes ax first.
function delaysInBinary() {
  var found = {};
  var imm = Buffer.from([0xC7, 0x06, 0x1C, 0x03]);   // mov word [0x031c], imm16
  for (var i = 0; (i = EXE.indexOf(imm, i)) !== -1; i++) {
    found[EXE.readUInt16LE(i + 4)] = true;
  }
  var zero = Buffer.from([0x31, 0xC0, 0xA3, 0x1C, 0x03]); // xor ax,ax; mov [0x031c],ax
  if (EXE.indexOf(zero) !== -1) found[0] = true;
  return Object.keys(found).map(Number).sort(function (a, b) { return a - b; });
}

test('constants: the Speed presets are the delays the binary writes', function () {
  var fromBinary = delaysInBinary();
  assert.deepEqual(fromBinary, [0, 500, 1000],
    'DS:031C is written with exactly these delays');

  var presets = constant('SPEED_PRESETS');
  var ours = Object.keys(presets).map(function (k) { return presets[k]; })
    .sort(function (a, b) { return a - b; });
  assert.deepEqual(ours, fromBinary, 'SPEED_PRESETS must match');
  assert.equal(presets.fast, 0, 'Fast');
  assert.equal(presets.medium, 500, 'Medium');
  assert.equal(presets.slow, 1000, 'Slow');
});

test('constants: the speed slider spans the full range of the presets', function () {
  var presets = constant('SPEED_PRESETS');
  assert.equal(constant('SPEED_MAX_MS'), presets.slow,
    'the slider must reach Slow exactly, or a preset cannot land on it');
});

// Locate a segment in the NE image. Needed to read initialised data, which is
// how the program's own starting delay is recovered.
function segments() {
  var ne = EXE.readUInt32LE(0x3c);
  var count = EXE.readUInt16LE(ne + 0x1c);
  var tableOff = ne + EXE.readUInt16LE(ne + 0x22);
  var shift = EXE.readUInt16LE(ne + 0x32) || 9;
  var out = [];
  for (var i = 0; i < count; i++) {
    var e = tableOff + i * 8;
    out.push({
      fileOff: EXE.readUInt16LE(e) << shift,
      length: EXE.readUInt16LE(e + 2),
      flags: EXE.readUInt16LE(e + 4),
    });
  }
  return out;
}

function dataSegment() {
  var s = segments().filter(function (x) { return x.flags & 1; });   // bit 0: DATA
  if (s.length !== 1) throw new Error('expected one DATA segment, found ' + s.length);
  return s[0];
}

test('constants: the app starts faster than the original, on purpose', function () {
  var ds = dataSegment();
  // Sanity-check the offset arithmetic before trusting anything read through
  // it: FIELD_SIZE at DS:0226 is known to be 50.
  assert.equal(EXE.readUInt16LE(ds.fileOff + 0x226), 50, 'DS:0226 is FIELD_SIZE');

  // The delay the menu handlers write to. Its initialised value is the speed
  // the program opens at.
  var theirs = EXE.readUInt32LE(ds.fileOff + 0x31c);
  assert.equal(theirs, 0, 'the original opens on Fast, with no preset ticked');

  var ours = constant('DEFAULT_DELAY_MS');
  assert.ok(ours >= 0 && ours <= constant('SPEED_MAX_MS'),
    'the default must sit somewhere the slider can reach');
  assert.ok(ours > theirs,
    'ours is deliberately slower than flat out, which is unwatchable on '
    + 'modern hardware; see the comment on DEFAULT_DELAY_MS');
});

// ---- how long a disaster lasts ---------------------------------------

// The inference this rests on: Delphi omits a property still at its default.
// Assert the convention itself, so the reasoning cannot rot silently.
test('constants: the form omits a property only when it is at its default', function () {
  var t1 = timerBlock('Timer1');
  assert.ok(/Interval = 1$/m.test(t1),
    'Timer1 writes Interval = 1, because 1 is not the default');
  assert.ok(/Enabled = False/.test(t1),
    'Timer1 writes Enabled = False, because True is the default');
});

test('constants: a disaster lasts as long as DisasterTimer says', function () {
  var block = timerBlock('DisasterTimer');
  assert.ok(!/Interval/.test(block),
    'DisasterTimer declares no Interval, so it runs at TTimer\'s default');
  // TTimer.Interval defaults to 1000ms.
  assert.equal(constant('DISASTER_MS'), 1000,
    'a longer shock takes STABLE.FLD to extinction instead of denting it');
});

// ---- the slider ceilings ---------------------------------------------

// Each slider shows a percentage of its parameter's ceiling, so a wrong
// ceiling misreports every value on the panel. The shipped INI is what the
// original reads over its compiled defaults at startup, and therefore what
// the running program uses -- note FoxDeathRateMax, where the two disagree.
test('constants: the slider ceilings are the ones STARTUP.INI ships', function () {
  var KEY = {
    RabbitDeathRate: 'RabbitDeathRateMax',
    FoxDeathRate: 'FoxDeathRateMax',
    FoxReproductionRate: 'FoxReproductionRateMax',
    GrassDeathRate: 'GrassDeathRateMax',
    SolarEnergyInput: 'SolarEnergyRateMax',
  };
  var ours = constant('DEFAULT_MAX');
  Object.keys(KEY).forEach(function (param) {
    assert.equal(ours[param], iniValue(KEY[param]), param + ' ceiling');
  });
  assert.deepEqual(Object.keys(ours).sort(), Object.keys(KEY).sort(),
    'no ceiling without a parameter, and none missing');
});

test('constants: FoxDeathRate is the ceiling the INI and the binary disagree on', function () {
  // Guards the distinction rather than the number: the compiled default is
  // 0.5 and the INI ships 0.6, and the app must follow the INI because the
  // original reads it at startup. If this ever fails, check which source the
  // code is following before changing the expectation.
  assert.equal(iniValue('FoxDeathRateMax'), 0.6, 'the INI ships 0.6');
  assert.equal(constant('DEFAULT_MAX').FoxDeathRate, 0.6, 'the app follows it');
});

// ---- the graph -------------------------------------------------------

test('constants: the y-scale buttons are the form\'s, in the form\'s order', function () {
  var html = fs.readFileSync(path.join(ROOT, 'web', 'index.html'), 'utf8');
  var ours = [];
  var re = /data-scale="(\d+)"/g, m;
  while ((m = re.exec(html))) ours.push(Number(m[1]));

  // The scale buttons are the numeric captions in the form; 0 is the axis
  // label rather than a button.
  var captions = [];
  var cre = /Caption = '(\d+)'/g;
  while ((m = cre.exec(DFM))) {
    var v = Number(m[1]);
    if (v > 0 && captions.indexOf(v) === -1) captions.push(v);
  }
  captions.sort(function (a, b) { return a - b; });

  assert.deepEqual(ours, captions, 'same steps, same order');
});
