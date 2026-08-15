// Behavioural tests for each pass, asserting the exact rules transcribed in
// ../../disassembly/README.md. The RNG is scripted, so these are exact outcomes
// rather than distributions.
'use strict';

var H = require('../harness.js');
var C = require('../creatures.js');
var test = H.test, assert = H.assert, S = H.ScriptedRandom, rn = H.forRandomN;

// step() begins with NEXT := TMP; when driving a single pass we do the same.
function build(size, rng) {
  var f = new C.Field(size);
  var m = new C.Model(f, rng);
  m.next.set(m.tmp);
  return { f: f, m: m };
}

// ---- GrassPass, 7:1FC8 -----------------------------------------------

test('GrassPass: grass never appears spontaneously', function () {
  var b = build(3, new S([]));          // no draws at all on an empty field
  b.m.grassPass();
  for (var r = 1; r <= 3; r++) {
    for (var c = 1; c <= 3; c++) assert.equal(b.m.next[b.f.idx(r, c)], C.EMPTY);
  }
});

test('GrassPass: a grass cell spreads to exactly one neighbour', function () {
  var b = build(3, new S([H.ALWAYS, rn(1, 8), H.NEVER]));
  b.f.set(2, 2, C.GRASS);
  b.m.grassPass();
  assert.equal(b.m.next[b.f.idx(1, 2)], C.GRASS, 'direction 1 is north');
  assert.equal(b.m.next[b.f.idx(2, 2)], C.GRASS, 'source survives');
  var lit = 0;
  for (var r = 1; r <= 3; r++) {
    for (var c = 1; c <= 3; c++) if (b.m.next[b.f.idx(r, c)] & C.GRASS) lit++;
  }
  assert.equal(lit, 2, 'exactly one new cell, never more');
});

test('GrassPass: no spread when the solar draw fails', function () {
  var b = build(3, new S([H.NEVER, H.NEVER]));   // solar fails, death fails
  b.f.set(2, 2, C.GRASS);
  b.m.grassPass();
  assert.equal(b.m.next[b.f.idx(1, 2)], C.EMPTY);
  assert.equal(b.m.next[b.f.idx(2, 2)], C.GRASS);
});

test('GrassPass: grass dies when the death draw passes', function () {
  var b = build(3, new S([H.NEVER, H.ALWAYS]));  // no spread, then dies
  b.f.set(2, 2, C.GRASS);
  b.m.grassPass();
  assert.equal(b.m.next[b.f.idx(2, 2)], C.EMPTY);
});

// ---- AnimalPass, 7:2169 ----------------------------------------------

test('AnimalPass: odd directions move N, W, S, E', function () {
  var dirs = [[1, 1, 2], [3, 2, 1], [5, 3, 2], [7, 2, 3]];
  dirs.forEach(function (d) {
    var b = build(3, new S([rn(1, 50), rn(d[0], 8)]));   // no grazing, then move
    b.f.set(2, 2, C.RABBIT);
    b.m.animalPass();
    assert.equal(b.m.next[b.f.idx(d[1], d[2])], C.RABBIT,
      'direction ' + d[0] + ' should land on ' + d[1] + ',' + d[2]);
  });
});

test('AnimalPass: an even direction leaves the animal where it is', function () {
  // Only 1/3/5/7 name a direction; an even draw routes to the stay-put write
  // at 7:2478, which ORs the animal back into its own cell. It does NOT
  // vanish — GrassPass has already overwritten the byte, so without that
  // write every stationary animal would be deleted.
  [2, 4, 6, 8].forEach(function (d) {
    var b = build(3, new S([rn(1, 50), rn(d, 8)]));
    b.f.set(2, 2, C.RABBIT);
    b.m.animalPass();
    assert.equal(b.m.next[b.f.idx(2, 2)] & C.RABBIT, C.RABBIT,
      'direction ' + d + ': the rabbit stays put');
    var elsewhere = 0;
    for (var r = 1; r <= 3; r++) {
      for (var c = 1; c <= 3; c++) {
        if ((r !== 2 || c !== 2) && (b.m.next[b.f.idx(r, c)] & C.RABBIT)) elsewhere++;
      }
    }
    assert.equal(elsewhere, 0, 'direction ' + d + ': and does not appear anywhere else');
  });
});

test('AnimalPass: a stationary animal survives the generation', function () {
  // The regression that made STABLE.FLD die out: GrassPass writes the whole
  // byte, so an animal that is never written back is erased at the commit.
  var b = build(3, new S([rn(1, 50), rn(2, 8)]));   // even draw: no move
  b.f.set(2, 2, C.RABBIT | C.GRASS);
  b.m.animalPass();
  assert.ok(b.m.next[b.f.idx(2, 2)] & C.RABBIT, 'the rabbit is still there');
});

test('AnimalPass: a move into the border fails and the animal stays put', function () {
  var b = build(3, new S([rn(1, 50), rn(1, 8)]));   // north, into the border
  b.f.set(1, 2, C.RABBIT);
  b.m.animalPass();
  assert.equal(b.m.next[b.f.idx(0, 2)], C.BORDER, 'border untouched');
  assert.ok(b.m.next[b.f.idx(1, 2)] & C.RABBIT, 'the rabbit stays where it was');
});

test('AnimalPass: a move onto another animal fails', function () {
  // (2,2) is visited before (3,2), so the mover draws first.
  var b = build(3, new S([rn(1, 50), rn(5, 8), rn(5, 8)]));
  b.f.set(2, 2, C.RABBIT);
  b.f.set(3, 2, C.FOX);            // blocks the square to the south
  b.m.animalPass();
  assert.equal(b.m.next[b.f.idx(3, 2)] & C.RABBIT, 0, 'rabbit must not land on the fox');
  assert.ok(b.m.next[b.f.idx(2, 2)] & C.RABBIT, 'and stays where it was');
});

test('AnimalPass: the target is overwritten, destroying grass already there', function () {
  var b = build(3, new S([rn(1, 50), rn(1, 8)]));
  b.f.set(2, 2, C.RABBIT);
  b.m.next[b.f.idx(2, 2)] = C.EMPTY;      // source will be bare
  b.m.next[b.f.idx(1, 2)] = C.GRASS;      // target has grass
  b.m.animalPass();
  assert.equal(b.m.next[b.f.idx(1, 2)] & C.GRASS, 0,
    "the target's grass is destroyed, not merged");
  assert.ok(b.m.next[b.f.idx(1, 2)] & C.RABBIT, 'and the rabbit is there');
});

test('AnimalPass: the source ground state travels with the animal', function () {
  var b = build(3, new S([rn(1, 50), rn(1, 8)]));
  b.f.set(2, 2, C.RABBIT);
  b.m.next[b.f.idx(2, 2)] = C.GRASS;      // source will have grass
  b.m.next[b.f.idx(1, 2)] = C.EMPTY;
  b.m.animalPass();
  assert.equal(b.m.next[b.f.idx(1, 2)], C.GRASS | C.RABBIT,
    'grass is carried to the target');
});

test('AnimalPass: grazing happens only on a 25 out of 50 draw', function () {
  var eats = build(3, new S([rn(25, 50), rn(2, 8)]));
  eats.f.set(2, 2, C.RABBIT);
  eats.m.next[eats.f.idx(2, 2)] = C.GRASS;
  eats.m.animalPass();
  // The rabbit is OR'd back in by the stay-put write, so test the grass bit
  // rather than the whole byte.
  assert.equal(eats.m.next[eats.f.idx(2, 2)] & C.GRASS, 0, '25 grazes');

  [1, 24, 26, 50].forEach(function (k) {
    var b = build(3, new S([rn(k, 50), rn(2, 8)]));
    b.f.set(2, 2, C.RABBIT);
    b.m.next[b.f.idx(2, 2)] = C.GRASS;
    b.m.animalPass();
    assert.equal(b.m.next[b.f.idx(2, 2)] & C.GRASS, C.GRASS, k + ' does not graze');
  });
});

test('AnimalPass: a fox draws for movement but never for grazing', function () {
  var rng = new S([rn(2, 8)]);            // a single draw is all a fox may take
  var b = build(3, rng);
  b.f.set(2, 2, C.FOX);
  b.m.animalPass();
  assert.equal(rng.drawsUsed(), 1, 'foxes do not graze');
});

// ---- RabbitLoop, 7:293A ----------------------------------------------

test('RabbitLoop: a dying rabbit leaves its grass behind', function () {
  var b = build(3, new S([H.ALWAYS]));
  b.f.set(2, 2, C.RABBIT | C.GRASS);
  b.m.rabbitLoop();
  assert.equal(b.m.next[b.f.idx(2, 2)], C.GRASS);
});

test('RabbitLoop: reproduction needs grass at the parent', function () {
  var rng = new S([H.NEVER, H.ALWAYS]);   // survives, repro draw passes
  var b = build(3, rng);
  b.f.set(2, 2, C.RABBIT);
  b.m.next[b.f.idx(2, 2)] = C.EMPTY;      // ...but no grass at the parent
  b.m.rabbitLoop();
  var born = 0;
  for (var r = 1; r <= 3; r++) {
    for (var c = 1; c <= 3; c++) if (b.m.next[b.f.idx(r, c)] & C.RABBIT) born++;
  }
  assert.equal(born, 0, 'no offspring without grass');
  assert.equal(rng.drawsUsed(), 2, 'and no direction is drawn');
});

test('RabbitLoop: with grass at the parent, offspring lands on a free square', function () {
  var b = build(3, new S([H.NEVER, H.ALWAYS, rn(1, 8)]));
  b.f.set(2, 2, C.RABBIT);
  b.m.next[b.f.idx(2, 2)] = C.GRASS;
  b.m.rabbitLoop();
  assert.equal(b.m.next[b.f.idx(1, 2)], C.RABBIT, 'first free direction is north');
});

test('RabbitLoop: the reproduction chance is indexed by the free-square count', function () {
  var f = new C.Field(3);
  var m = new C.Model(f, new S([]));
  f.set(2, 2, C.RABBIT);
  assert.equal(m.countFree(f.idx(2, 2)).length, 8);
  f.set(1, 1, C.FOX);
  f.set(1, 2, C.FOX);
  assert.equal(m.countFree(f.idx(2, 2)).length, 6);
  var p = C.defaultParams().ReproductiveProb;
  assert.equal(p[8], 0.8);
  assert.equal(p[6], 0.5);
  assert.equal(p[0], 0);
  assert.equal(p[1], 0, 'a rabbit with one free square never breeds');
});

test('RabbitLoop: a diseased rabbit dies at penalty x rate, with no clamp', function () {
  var b = build(3, new S([H.NEVER, H.NEVER, 0.5]));
  b.f.params.RabbitDeathRate = 0.2;       // penalty 3 -> 0.6
  b.f.set(2, 2, C.RABBIT | C.DISEASED | C.GRASS);
  b.m.rabbitLoop();
  assert.equal(b.m.next[b.f.idx(2, 2)], C.GRASS, '0.5 < 0.6 so it dies');

  var b2 = build(3, new S([H.NEVER, H.NEVER, 0.99]));
  b2.f.params.RabbitDeathRate = 0.4;      // penalty 3 -> 1.2, above 1
  b2.f.set(2, 2, C.RABBIT | C.DISEASED | C.GRASS);
  b2.m.rabbitLoop();
  assert.equal(b2.m.next[b2.f.idx(2, 2)], C.GRASS,
    'unclamped: every draw is below 1.2, so it always dies');
});

// ---- DiseasePass, 7:24F4 ---------------------------------------------

test('DiseasePass: disease spreads to every adjacent rabbit, with no roll', function () {
  var rng = new S([]);                    // consumes no randomness at all
  var b = build(3, rng);
  b.f.set(2, 2, C.RABBIT | C.DISEASED);
  b.f.set(1, 2, C.RABBIT);
  b.f.set(2, 3, C.RABBIT);
  b.f.set(3, 3, C.GRASS);                 // not a rabbit, must not be infected
  b.m.diseasePass();
  assert.ok(b.m.next[b.f.idx(1, 2)] & C.DISEASED, 'north rabbit infected');
  assert.ok(b.m.next[b.f.idx(2, 3)] & C.DISEASED, 'east rabbit infected');
  assert.equal(b.m.next[b.f.idx(3, 3)] & C.DISEASED, 0, 'grass is not infected');
  assert.equal(rng.drawsUsed(), 0);
});

// ---- FoxLoop, 7:2A64 -------------------------------------------------

test('FoxLoop: a fox eats an adjacent rabbit and breeds into its cell', function () {
  var b = build(3, new S([H.NEVER, H.ALWAYS]));
  b.f.set(2, 2, C.FOX);
  b.f.set(2, 3, C.RABBIT);
  b.m.foxLoop();
  assert.equal(b.m.next[b.f.idx(2, 3)], C.FOX, 'the cub takes the prey cell');
});

test('FoxLoop: a dying fox leaves its grass behind', function () {
  var b = build(3, new S([H.ALWAYS]));
  b.f.set(2, 2, C.FOX | C.GRASS);
  b.m.foxLoop();
  assert.equal(b.m.next[b.f.idx(2, 2)], C.GRASS);
});

test('FoxLoop: with no adjacent rabbit a fox takes only its death draw', function () {
  var rng = new S([H.NEVER]);
  var b = build(3, rng);
  b.f.set(2, 2, C.FOX);
  b.m.foxLoop();
  assert.equal(rng.drawsUsed(), 1, 'the hunt draw is skipped when there is no prey');
});
