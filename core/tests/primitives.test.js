// Tests for the primitives, each tied to a routine in ../../disassembly/README.md.
'use strict';

var H = require('../harness.js');
var C = require('../creatures.js');
var test = H.test, assert = H.assert;

// ---- Random_n, 7:1814 -------------------------------------------------

test('primitives: Random_n returns 1..n, never 0 and never n+1', function () {
  var n = 8;
  // Sweep the whole [0,1) input range.
  for (var i = 0; i < 1000; i++) {
    var v = i / 1000;
    var r = C.randomN({ random: function () { return v; } }, n);
    assert.ok(r >= 1, 'randomN gave ' + r + ' for ' + v);
    assert.ok(r <= n, 'randomN gave ' + r + ' for ' + v);
  }
});

test('primitives: Random_n(n) at the extremes is 1 and n', function () {
  assert.equal(C.randomN({ random: function () { return 0; } }, 8), 1);
  assert.equal(C.randomN({ random: function () { return 0.999999; } }, 8), 8);
  assert.equal(C.randomN({ random: function () { return 0; } }, 50), 1);
  assert.equal(C.randomN({ random: function () { return 0.999999; } }, 50), 50);
});

// ---- the border sentinel ---------------------------------------------

test('primitives: BORDER 0xA0 reads as no grass, no rabbit, no fox', function () {
  assert.equal(C.BORDER & C.GRASS, 0, 'border must not read as grass');
  assert.equal(C.BORDER & C.RABBIT, 0, 'border must not read as rabbit');
  assert.equal(C.BORDER & C.FOX, 0, 'border must not read as fox');
});

test('primitives: cells are a bitfield — 3 is rabbit on grass, 5 fox on grass', function () {
  assert.equal(C.RABBIT | C.GRASS, 3);
  assert.equal(C.FOX | C.GRASS, 5);
  assert.equal(C.ANIMAL_MASK, C.RABBIT | C.FOX | C.DISEASED);
});

// ---- SetBorders, 7:2B79 ----------------------------------------------

test('primitives: SetBorders rings the live area and leaves the interior', function () {
  var f = new C.Field(4);
  for (var i = 0; i <= 5; i++) {
    assert.equal(f.get(0, i), C.BORDER, 'top row');
    assert.equal(f.get(5, i), C.BORDER, 'bottom row');
    assert.equal(f.get(i, 0), C.BORDER, 'left column');
    assert.equal(f.get(i, 5), C.BORDER, 'right column');
  }
  for (var r = 1; r <= 4; r++) {
    for (var c = 1; c <= 4; c++) assert.equal(f.get(r, c), C.EMPTY, 'interior');
  }
});

// ---- CountFree, 7:1A41 -----------------------------------------------
// "free" is an EXACT match on EMPTY or GRASS, so anything carrying an animal
// is excluded even though it may also carry grass.

test('CountFree: an isolated cell in open field has 8 free neighbours', function () {
  var f = new C.Field(5);
  var m = new C.Model(f, new H.ScriptedRandom([]));
  assert.equal(m.countFree(f.idx(3, 3)).length, 8);
});

test('CountFree: border neighbours do not count', function () {
  var f = new C.Field(5);
  var m = new C.Model(f, new H.ScriptedRandom([]));
  assert.equal(m.countFree(f.idx(1, 1)).length, 3, 'a corner sees 3 live neighbours');
  assert.equal(m.countFree(f.idx(1, 3)).length, 5, 'an edge sees 5');
});

test('CountFree: grass counts as free, animals do not', function () {
  var f = new C.Field(5);
  var m = new C.Model(f, new H.ScriptedRandom([]));
  var i = f.idx(3, 3);
  f.set(2, 3, C.GRASS);
  assert.equal(m.countFree(i).length, 8, 'grass is still free');
  f.set(2, 3, C.RABBIT);
  assert.equal(m.countFree(i).length, 7, 'a rabbit is not');
  f.set(2, 2, C.RABBIT | C.GRASS);
  assert.equal(m.countFree(i).length, 6, 'a rabbit on grass is not free either');
  f.set(4, 4, C.FOX);
  assert.equal(m.countFree(i).length, 5, 'nor a fox');
});

// ---- BuildCandidateList, 7:182B --------------------------------------

test('grassTargets: excludes cells that already have grass, and the border', function () {
  var f = new C.Field(5);
  var m = new C.Model(f, new H.ScriptedRandom([]));
  assert.equal(m.grassTargets(f.idx(3, 3)).length, 8);
  f.set(2, 3, C.GRASS);
  assert.equal(m.grassTargets(f.idx(3, 3)).length, 7, 'already grass');
  f.set(2, 2, C.RABBIT | C.GRASS);
  assert.equal(m.grassTargets(f.idx(3, 3)).length, 6, 'grass under a rabbit still counts as grass');
  f.set(2, 4, C.RABBIT);
  assert.equal(m.grassTargets(f.idx(3, 3)).length, 6, 'a bare rabbit cell is a valid target');

  // A fresh field: the corner sees only three live neighbours.
  var g = new C.Field(5);
  var m2 = new C.Model(g, new H.ScriptedRandom([]));
  assert.equal(m2.grassTargets(g.idx(1, 1)).length, 3, 'corner: border excluded');
});

// ---- FindAdjacent, 7:1E00 --------------------------------------------

test('findAdjacent: locates an adjacent rabbit, or reports none', function () {
  var f = new C.Field(5);
  var m = new C.Model(f, new H.ScriptedRandom([]));
  assert.equal(m.findAdjacent(f.idx(3, 3), C.RABBIT), -1);
  f.set(2, 3, C.RABBIT);
  assert.equal(m.findAdjacent(f.idx(3, 3), C.RABBIT), f.idx(2, 3));
  var g = new C.Field(5);
  var m2 = new C.Model(g, new H.ScriptedRandom([]));
  g.set(2, 3, C.RABBIT | C.GRASS);
  assert.equal(m2.findAdjacent(g.idx(3, 3), C.RABBIT), g.idx(2, 3),
    'a rabbit on grass is still prey');
});

// ---- neighbour ordering ----------------------------------------------
// Recovered from CountFree (7:1A41) by walking its unrolled scan. The order
// matters: reproduction and grass spread both index a candidate list built in
// this sequence, so a different order sends the same random draw elsewhere.

test('primitives: neighbours are scanned N, NW, W, SW, S, SE, E, NE', function () {
  var S = C.STRIDE;
  assert.deepEqual(C.NEIGHBOURS, [
    -S,        // N
    -S - 1,    // NW
    -1,        // W
    S - 1,     // SW
    S,         // S
    S + 1,     // SE
    1,         // E
    -S + 1,    // NE
  ]);
});

test('primitives: movement uses only the four orthogonal directions', function () {
  assert.deepEqual(Object.keys(C.MOVE_DIRS).sort(), ['1', '3', '5', '7']);
  assert.equal(C.MOVE_DIRS[1], -C.STRIDE, 'north');
  assert.equal(C.MOVE_DIRS[3], -1, 'west');
  assert.equal(C.MOVE_DIRS[5], C.STRIDE, 'south');
  assert.equal(C.MOVE_DIRS[7], 1, 'east');
  [2, 4, 6, 8].forEach(function (d) {
    assert.equal(C.MOVE_DIRS[d], undefined, 'direction ' + d + ' must not move');
  });
});
