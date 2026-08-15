// Disasters and AddDiseasedRabbit, per ../../disassembly/README.md.
// The Disasters menu changes parameters; it never touches the field.
'use strict';

var H = require('../harness.js');
var C = require('../creatures.js');
var test = H.test, assert = H.assert, S = H.ScriptedRandom, rn = H.forRandomN;

test('Disasters: there are four, not five', function () {
  assert.deepEqual(Object.keys(C.DISASTERS).sort(),
    ['asteroid', 'disease', 'fire', 'overhunt']);
});

test('Disasters: each changes one parameter to its constant', function () {
  var cases = [
    ['fire', 'GrassDeathRate', 0.79],
    ['disease', 'RabbitDeathRate', 0.5],
    ['overhunt', 'FoxDeathRate', 0.75],
    ['asteroid', 'SolarEnergyInput', 0.175],
  ];
  cases.forEach(function (c) {
    var f = new C.Field(3);
    var m = new C.Model(f, new S([]));
    m.triggerDisaster(c[0]);
    assert.equal(f.params[c[1]], c[2], c[0] + ' sets ' + c[1]);
  });
});

test('Disasters: no disaster touches the field', function () {
  Object.keys(C.DISASTERS).forEach(function (name) {
    var f = new C.Field(5);
    f.set(2, 2, C.RABBIT | C.GRASS);
    f.set(3, 3, C.FOX);
    f.set(4, 4, C.GRASS);
    var before = f.cells.slice();
    new C.Model(f, new S([])).triggerDisaster(name);
    assert.deepEqual(Array.from(f.cells), Array.from(before),
      name + ' must leave every cell alone');
  });
});

test('Disasters: the three temporary ones save and restore', function () {
  ['fire', 'disease', 'overhunt'].forEach(function (name) {
    var d = C.DISASTERS[name];
    var f = new C.Field(3);
    var m = new C.Model(f, new S([]));
    var original = f.params[d.param];
    m.triggerDisaster(name);
    assert.equal(f.params[d.param], d.value, name + ' applied');
    assert.ok(m.expireDisaster(), name + ' had something to restore');
    assert.equal(f.params[d.param], original, name + ' restored');
  });
});

test('Disasters: the asteroid is permanent', function () {
  var f = new C.Field(3);
  var m = new C.Model(f, new S([]));
  m.triggerDisaster('asteroid');
  assert.equal(f.params.SolarEnergyInput, 0.175);
  assert.equal(m.expireDisaster(), false, 'nothing is scheduled to restore it');
  assert.equal(f.params.SolarEnergyInput, 0.175, 'and it stays changed');
});

test('Disasters: an unknown name is an error, not a silent no-op', function () {
  var m = new C.Model(new C.Field(3), new S([]));
  assert.throws(function () { m.triggerDisaster('tornado'); });
});

// ---- AddDiseasedRabbit, 7:2DCD ---------------------------------------

test('AddDiseasedRabbit: on an empty field it seeds one at a random spot', function () {
  var f = new C.Field(5);
  var m = new C.Model(f, new S([rn(2, 5), rn(3, 5)]));   // row 2, col 3
  var i = m.addDiseasedRabbit();
  assert.equal(i, f.idx(2, 3));
  assert.equal(f.get(2, 3), C.DISEASED);
});

test('AddDiseasedRabbit: it clears the RABBIT bit, leaving 8 not 10', function () {
  var f = new C.Field(5);
  f.set(2, 2, C.RABBIT);
  var m = new C.Model(f, new S([rn(1, 1)]));            // the only rabbit
  m.addDiseasedRabbit();
  assert.equal(f.get(2, 2), C.DISEASED,
    'the two read-modify-writes at 7:2E8A drop the rabbit bit');
  assert.equal(f.counts().rabbits, 0,
    'so the seeded creature no longer counts as a rabbit');
});

test('AddDiseasedRabbit: it picks the k-th rabbit in scan order', function () {
  var f = new C.Field(5);
  f.set(1, 1, C.RABBIT);
  f.set(2, 2, C.RABBIT);
  f.set(3, 3, C.RABBIT);
  var m = new C.Model(f, new S([rn(2, 3)]));            // the second one
  var i = m.addDiseasedRabbit();
  assert.equal(i, f.idx(2, 2));
  assert.equal(f.get(1, 1), C.RABBIT, 'first untouched');
  assert.equal(f.get(3, 3), C.RABBIT, 'third untouched');
});

test('AddDiseasedRabbit: a diseased cell still moves and grazes', function () {
  // AnimalPass treats DISEASED alone as a creature (7:21AF), so an 8 is not
  // inert just because it lost its rabbit bit.
  var f = new C.Field(3);
  var m = new C.Model(f, new S([rn(1, 50), rn(1, 8)]));
  m.next.set(m.tmp);
  f.set(2, 2, C.DISEASED);
  m.animalPass();
  assert.equal(m.next[f.idx(1, 2)], C.DISEASED, 'it moved north');
});
