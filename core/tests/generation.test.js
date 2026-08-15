// DoGeneration (7:28F7) — the whole generation, not the individual passes.
//
// The passes are tested in passes.test.js. What is left, and what is only
// visible here, is the sequencing: the order the passes run in, the two
// intermediate CUR := NEXT commits, and the clearing of the working buffer at
// the start. Every bug this file guards against is invisible to a pass tested
// on its own, because each pass is individually correct.
'use strict';

var fs = require('fs');
var path = require('path');
var H = require('../harness.js');
var C = require('../creatures.js');
var test = H.test, assert = H.assert, S = H.ScriptedRandom, rn = H.forRandomN;

function fieldWith(size, cells) {
  var f = new C.Field(size);
  (cells || []).forEach(function (c) { f.set(c[0], c[1], c[2]); });
  return f;
}

function live(f) {
  var n = 0;
  for (var r = 1; r <= f.size; r++) {
    for (var c = 1; c <= f.size; c++) if (f.get(r, c)) n++;
  }
  return n;
}

// ---- the buffer discipline -------------------------------------------

test('step: an empty field draws nothing and still advances', function () {
  var f = fieldWith(3);
  var rng = new S([]);                  // throws if anything asks for a draw
  var m = new C.Model(f, rng);
  m.step();
  assert.equal(m.generation, 1, 'generation counter');
  assert.equal(rng.drawsUsed(), 0, 'nothing to simulate, nothing drawn');
  assert.equal(live(f), 0);
});

test('step: NEXT is cleared first, so nothing survives from last generation', function () {
  var f = fieldWith(3);
  var m = new C.Model(f, new S([]));
  // Whatever a previous generation left in the working buffer must not reach
  // the field. Without `NEXT := TMP` this fox would materialise from nothing.
  m.next[f.idx(2, 2)] = C.FOX;
  m.step();
  assert.equal(f.get(2, 2), C.EMPTY, 'stale NEXT must not commit into CUR');
});

test('step: the border ring is intact after a generation', function () {
  var f = fieldWith(3, [[2, 2, C.GRASS]]);
  var m = new C.Model(f, new S([H.NEVER, H.NEVER]));
  m.step();
  for (var i = 0; i <= f.size + 1; i++) {
    assert.equal(f.get(0, i), C.BORDER, 'top row ' + i);
    assert.equal(f.get(f.size + 1, i), C.BORDER, 'bottom row ' + i);
    assert.equal(f.get(i, 0), C.BORDER, 'left col ' + i);
    assert.equal(f.get(i, f.size + 1), C.BORDER, 'right col ' + i);
  }
});

// ---- the sequencing --------------------------------------------------

// The draw order is the pass order. Scripting every draw for one generation
// pins the sequence: insert, remove or reorder a pass and this fails, because
// ScriptedRandom throws the moment the counts stop lining up.
test('step: one rabbit on grass consumes exactly the documented draws', function () {
  var f = fieldWith(3, [[2, 2, C.GRASS | C.RABBIT]]);
  var rng = new S([
    H.NEVER,              // GrassPass  solar: no spread
    H.NEVER,              // GrassPass  grass death: survives
    rn(1, 50),            // AnimalPass grazing draw, 1 != 25 so it does not eat
    rn(2, 8),             // AnimalPass movement: even, so it stays put
    H.NEVER,              // RabbitLoop death: survives
    H.NEVER,              // RabbitLoop reproduction: none
  ]);
  var m = new C.Model(f, rng);
  m.step();
  assert.equal(rng.drawsUsed(), 6, 'six draws, in that order');
  assert.equal(f.get(2, 2), C.GRASS | C.RABBIT, 'rabbit and its grass remain');
});

// The bug this whole file exists for. GrassPass overwrites the byte with the
// new grass state, so an animal that is not written back is deleted at the
// commit -- the failure that emptied STABLE.FLD.
test('step: a blocked rabbit is still there afterwards', function () {
  var f = fieldWith(3, [[2, 2, C.RABBIT]]);
  var rng = new S([
    rn(1, 50),            // grazing: not 25
    rn(2, 8),             // even draw: no move attempted at all
    H.NEVER,              // survives
    H.NEVER,              // does not reproduce
  ]);
  var m = new C.Model(f, rng);
  m.step();
  assert.equal(f.get(2, 2), C.RABBIT, 'the stay-put write at 7:2478');
  assert.equal(live(f), 1, 'and it was not duplicated');
});

test('step: a moving animal carries its grass and clears its old cell', function () {
  var f = fieldWith(3, [[2, 2, C.GRASS | C.RABBIT]]);
  var rng = new S([
    H.NEVER,              // GrassPass  solar
    H.NEVER,              // GrassPass  grass death: the grass survives
    rn(1, 50),            // grazing: not 25
    rn(1, 8),             // direction 1 = north
    H.NEVER,              // RabbitLoop death
    H.NEVER,              // RabbitLoop reproduction
  ]);
  var m = new C.Model(f, rng);
  m.step();
  assert.equal(f.get(1, 2) & C.RABBIT, C.RABBIT, 'rabbit moved north');
  assert.equal(f.get(2, 2) & C.RABBIT, 0, 'source no longer holds it');
});

// DiseasePass runs after the first commit, so it sees the post-movement
// field. Testing the pass alone cannot show that.
test('step: disease spreads using the post-movement positions', function () {
  var f = fieldWith(3, [[2, 2, C.DISEASED], [1, 2, C.RABBIT]]);
  var rng = new S([
    // AnimalPass walks the field in row order, so (1,2) is reached first.
    rn(1, 50), rn(2, 8),        // (1,2) healthy rabbit: graze, stay put
    rn(1, 50), rn(2, 8),        // (2,2) diseased: graze, stay put
    H.NEVER, H.NEVER,           // RabbitLoop: (1,2) survives, no offspring
    // Then the diseased sweep, which by now includes the cell infected in
    // this very generation -- so a newly infected rabbit is rolled twice.
    H.NEVER,                    // (1,2) diseased death roll
    H.NEVER,                    // (2,2) diseased death roll
  ]);
  var m = new C.Model(f, rng);
  m.step();
  assert.equal(rng.drawsUsed(), 8, 'the second roll on a freshly infected cell');
  assert.equal(f.get(1, 2) & C.DISEASED, C.DISEASED, 'neighbour was infected');
  assert.equal(f.get(1, 2) & C.RABBIT, C.RABBIT, 'and is still a rabbit');
});

// ---- the integration regression --------------------------------------

// The shipped STABLE.FLD is the manual's demonstration that the model settles
// rather than collapsing. Run it for real -- real PRNG, no scripting -- and it
// must still be populated at the end. This is the test that fails outright if
// the pass sequencing regresses, whatever the unit tests say.
test('step: STABLE.FLD is still alive after 200 generations', function () {
  var file = path.join(__dirname, '..', '..', 'original', 'files', 'STABLE.FLD');
  var f = C.Field.fromFLD(new Uint8Array(fs.readFileSync(file)));
  var m = new C.Model(f, new C.Xorshift32(1));
  var start = m.counts();
  assert.ok(start.rabbits > 0 && start.foxes > 0 && start.grass > 0, 'starts populated');

  for (var i = 0; i < 200; i++) m.step();

  var end = m.counts();
  assert.equal(m.generation, 200, 'generation counter kept up');
  assert.ok(end.grass > 0, 'grass survived: ' + end.grass);
  assert.ok(end.rabbits > 0, 'rabbits survived: ' + end.rabbits);
  // Foxes too. This once said they were "the fragile trophic level" and could
  // legitimately die out, which was an assumption rather than a measurement.
  // Measured: across seeds 0-9 and 400 generations they never reach zero, and
  // oscillate roughly 120-260. A field named STABLE ought to keep all three.
  assert.ok(end.foxes > 0, 'foxes survived: ' + end.foxes);
  assert.ok(end.rabbits < f.size * f.size, 'did not saturate: ' + end.rabbits);
});

// Foxes never eat to survive: the death roll is unconditional and finding prey
// only produces offspring (7:2AB0 rolls against FoxDeathRate before 7:2AF8
// looks for a rabbit at all). So a fox population is always decaying, and
// persists only while prey density keeps replacing it. That is why foxes
// vanish quickly on a rabbit-poor field and hold steady on a rich one.
test('step: foxes decay without prey and hold with it', function () {
  function foxesAfter(rabbits, generations) {
    var f = new C.Field(20);
    var m = new C.Model(f, new C.Xorshift32(3));
    var placed = 0, i = 0;
    // Rabbits along the top rows, foxes along the bottom, so the two only
    // meet if the rabbits are numerous enough to spread.
    for (var r = 1; r <= 10 && placed < rabbits; r++) {
      for (var c = 1; c <= 20 && placed < rabbits; c++, placed++) {
        f.set(r, c, C.GRASS | C.RABBIT);
      }
    }
    for (var fr = 11; fr <= 20; fr++) {
      for (var fc = 1; fc <= 20 && i < 40; fc++, i++) f.set(fr, fc, C.FOX);
    }
    for (var g = 0; g < generations; g++) m.step();
    return m.counts().foxes;
  }
  assert.equal(foxesAfter(0, 40), 0, 'with no prey at all, foxes die out');
  assert.ok(foxesAfter(200, 40) > 0, 'with prey, the population sustains');
});

test('step: a field of pure grass does not overrun the border', function () {
  var f = new C.Field(4);
  for (var r = 1; r <= 4; r++) {
    for (var c = 1; c <= 4; c++) f.set(r, c, C.GRASS);
  }
  var m = new C.Model(f, new C.Xorshift32(7));
  for (var i = 0; i < 25; i++) m.step();
  for (var k = 0; k <= 5; k++) {
    assert.equal(f.get(0, k), C.BORDER, 'top ' + k);
    assert.equal(f.get(5, k), C.BORDER, 'bottom ' + k);
  }
});
