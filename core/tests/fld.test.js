// .FLD reading and writing, checked against the six files that shipped with
// the program. A file written by this code is one the 1996 binary will load.
'use strict';

var fs = require('fs');
var path = require('path');
var H = require('../harness.js');
var C = require('../creatures.js');
var test = H.test, assert = H.assert;

var DIR = path.join(__dirname, '..', '..', 'original', 'files');
var NAMES = ['STABLE', 'BIG', 'STARTUP', 'SEX', 'FISSION', 'RADIO'];

function raw(name) {
  return new Uint8Array(fs.readFileSync(path.join(DIR, name + '.FLD')));
}

test('FLD: all six shipped fields load', function () {
  NAMES.forEach(function (n) {
    var f = C.Field.fromFLD(raw(n));
    assert.ok(f.size === 50 || f.size === 80, n + ' has a sensible size');
  });
});

test('FLD: the stored counts match the grid, computed independently', function () {
  // fromFLD throws if they disagree, so this asserts the format end to end.
  NAMES.forEach(function (n) {
    var f = C.Field.fromFLD(raw(n));
    var c = f.counts();
    assert.ok(c.rabbits + c.foxes + c.grass > 0, n + ' is not empty');
  });
});

test('FLD: every shipped field round-trips byte-identically', function () {
  NAMES.forEach(function (n) {
    var original = raw(n);
    var out = C.Field.fromFLD(original).toFLD();
    assert.equal(out.length, original.length, n + ' length');
    for (var i = 0; i < original.length; i++) {
      if (out[i] !== original[i]) {
        throw new Error(n + ' differs at byte ' + i +
          ': expected ' + original[i] + ', got ' + out[i]);
      }
    }
  });
});

test('FLD: STABLE carries the parameters it was saved with', function () {
  var f = C.Field.fromFLD(raw('STABLE'));
  assert.equal(f.size, 50);
  assert.deepEqual(f.counts(), { rabbits: 597, foxes: 133, grass: 1396 });
  assert.equal(f.params.RabbitDeathRate.toFixed(3), '0.084');
  assert.equal(f.params.FoxReproductionRate.toFixed(2), '0.88');
  assert.equal(f.params.DiseasePenalty, 3);
  assert.equal(f.max.SolarEnergyInput, 0.8, 'the slider ceiling comes from the file');
});

test('FLD: the sample fields are single-mechanism experiments', function () {
  var fission = C.Field.fromFLD(raw('FISSION'));
  var sex = C.Field.fromFLD(raw('SEX'));
  var radio = C.Field.fromFLD(raw('RADIO'));

  function nonZero(p) { return p.ReproductiveProb.filter(function (v) { return v > 0; }); }

  assert.equal(nonZero(fission.params).length, 1, 'FISSION: one entry');
  assert.ok(fission.params.ReproductiveProb[8] > 0, 'FISSION: needs 8 free — isolation');
  assert.equal(nonZero(sex.params).length, 1, 'SEX: one entry');
  assert.ok(sex.params.ReproductiveProb[7] > 0, 'SEX: needs 7 free — one neighbour');
  assert.equal(nonZero(radio.params).length, 0, 'RADIO: no reproduction at all');
  assert.equal(radio.params.RabbitDeathRate.toFixed(2), '0.18', 'RADIO: pure decay');
});

test('FLD: a corrupt file is rejected rather than silently accepted', function () {
  assert.throws(function () { C.Field.fromFLD(new Uint8Array(100)); }, 'wrong length');

  var bad = raw('STABLE');
  bad[1] = 'X'.charCodeAt(0);
  assert.throws(function () { C.Field.fromFLD(bad); }, 'bad magic');

  var wrong = raw('STABLE');
  wrong[170] = (wrong[170] + 1) & 0xff;          // corrupt the rabbit count
  assert.throws(function () { C.Field.fromFLD(wrong); }, 'count mismatch');
});

test('FLD: a field built from scratch writes a loadable file', function () {
  var f = new C.Field(50);
  f.set(10, 10, C.RABBIT);
  f.set(11, 11, C.GRASS);
  var reloaded = C.Field.fromFLD(f.toFLD());
  assert.equal(reloaded.size, 50);
  assert.deepEqual(reloaded.counts(), { rabbits: 1, foxes: 0, grass: 1 });
  assert.equal(reloaded.get(10, 10), C.RABBIT);
});
