// Creatures — the simulation model of Creatures 1.0 (Future Skill Software,
// 1996), transcribed from CREATURE.EXE. See ../disassembly/README.md for the
// disassembly this is derived from; the addresses in the comments below refer
// to it, so any line here can be checked against the original.
//
// Standalone and dependency-free. Works as a plain <script> (including from
// file://) and as a CommonJS module:
//
//     const { Model, Field, Xorshift32 } = require('./creatures.js');
//     const m = new Model(field, new Xorshift32(0));
//     m.step();
//
// The RNG is injected rather than built in, so tests can drive the model with
// a scripted sequence and assert exact outcomes instead of distributions.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Creatures = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---- cell values, DS:021A..0226 -------------------------------------

  var BORDER = 0xa0;      // DS:021A
  var EMPTY = 0;          // DS:021B
  var GRASS = 1;          // DS:021C
  var RABBIT = 2;         // DS:021D
  var FOX = 4;            // DS:021E
  var DISEASED = 8;       // DS:021F
  var ANIMAL_MASK = 0x0e; // DS:0224 — rabbit|fox|diseased

  var STRIDE = 82;        // the field is a fixed [0..81][0..81] array

  // Movement directions. Random_n(8) yields 1..8 but the dispatch at 7:2231
  // is a compare chain testing only 1, 3, 5 and 7 — even draws do nothing, so
  // movement is orthogonal and happens at most half the time.
  var MOVE_DIRS = {
    1: -STRIDE,   // N   (row-1, col)
    3: -1,        // W   (row, col-1)
    5: STRIDE,    // S   (row+1, col)
    7: 1,         // E   (row, col+1)
  };

  // The eight neighbours, in the order the original scans them (7:1A41).
  var NEIGHBOURS = [
    -STRIDE, -STRIDE - 1, -1, STRIDE - 1, STRIDE, STRIDE + 1, 1, -STRIDE + 1,
  ];

  // ---- RNG -------------------------------------------------------------
  // Any object with random() -> [0,1) works. randomN(n) mirrors Random_n at
  // 7:1814, which wraps Delphi's Random(n) and increments, giving 1..n.

  function Xorshift32(seed) {
    var s = ((seed | 0) ^ 0x9e3779b9) >>> 0;
    this.s = s === 0 ? 0x9e3779b9 : s;
  }
  Xorshift32.prototype.random = function () {
    var x = this.s;
    x ^= (x << 13) >>> 0;
    x ^= x >>> 17;
    x ^= (x << 5) >>> 0;
    this.s = x >>> 0;
    return this.s / 4294967296;
  };

  function randomN(rng, n) {
    return Math.floor(rng.random() * n) + 1;   // 1..n
  }

  // ---- parameters ------------------------------------------------------
  // DS:0228 on a 16-byte stride as (value, max) pairs, plus DiseasePenalty
  // at DS:0278 and ReproductiveProb[0..8] at DS:0280.

  function defaultParams() {
    return {
      RabbitDeathRate: 0.1,
      FoxDeathRate: 0.15,
      FoxReproductionRate: 1.0,
      GrassDeathRate: 0.3,
      SolarEnergyInput: 0.7,
      DiseasePenalty: 3.0,
      ReproductiveProb: [0, 0, 0.1, 0.2, 0.3, 0.5, 0.5, 0.6, 0.8],
    };
  }

  // ---- field -----------------------------------------------------------

  function Field(size) {
    this.size = size || 50;
    this.cells = new Uint8Array(STRIDE * STRIDE);
    this.params = defaultParams();
    this.setBorders();
  }

  Field.prototype.idx = function (row, col) { return row * STRIDE + col; };
  Field.prototype.get = function (row, col) { return this.cells[row * STRIDE + col]; };
  Field.prototype.set = function (row, col, v) { this.cells[row * STRIDE + col] = v; };

  // SetBorders, 7:2B79 — the ring around the live area.
  Field.prototype.setBorders = function () {
    var n = this.size, i;
    for (i = 0; i <= n + 1; i++) {
      this.cells[i * STRIDE] = BORDER;
      this.cells[i * STRIDE + n + 1] = BORDER;
      this.cells[i] = BORDER;
      this.cells[(n + 1) * STRIDE + i] = BORDER;
    }
  };

  // ClearField, 7:2C31 — EMPTY through the interior.
  Field.prototype.clear = function () {
    for (var r = 1; r <= this.size; r++) {
      for (var c = 1; c <= this.size; c++) this.cells[r * STRIDE + c] = EMPTY;
    }
  };

  Field.prototype.counts = function () {
    var rabbits = 0, foxes = 0, grass = 0;
    for (var r = 1; r <= this.size; r++) {
      for (var c = 1; c <= this.size; c++) {
        var v = this.cells[r * STRIDE + c];
        if (v & RABBIT) rabbits++;
        if (v & FOX) foxes++;
        if (v & GRASS) grass++;
      }
    }
    return { rabbits: rabbits, foxes: foxes, grass: grass };
  };

  // ---- .FLD files ------------------------------------------------------
  // 6930 bytes: a Pascal string, twenty float64 parameters, the populations,
  // some flags, the field size, then the 82x82 grid. The twenty parameters are
  // stored in the order STARTUP.INI lists them.

  var FLD_PARAMS = [
    'RabbitDeathRate', 'FoxDeathRate', 'FoxReproductionRate',
    'GrassDeathRate', 'SolarEnergyInput',
    'RabbitDeathRateMax', 'FoxDeathRateMax', 'FoxReproductionRateMax',
    'GrassDeathRateMax', 'SolarEnergyRateMax',
    'ReproductiveProb0', 'ReproductiveProb1', 'ReproductiveProb2',
    'ReproductiveProb3', 'ReproductiveProb4', 'ReproductiveProb5',
    'ReproductiveProb6', 'ReproductiveProb7', 'ReproductiveProb8',
    'DiseasePenalty',
  ];
  var FLD_MAGIC = 'CPATTERN1';
  var FLD_SIZE = 6930;
  var FLD_GRID = 206;

  Field.fromFLD = function (bytes) {
    if (bytes.length !== FLD_SIZE) {
      throw new Error('not a .FLD file: expected ' + FLD_SIZE + ' bytes, got ' + bytes.length);
    }
    var magic = '';
    for (var k = 0; k < bytes[0]; k++) magic += String.fromCharCode(bytes[1 + k]);
    if (magic !== FLD_MAGIC) throw new Error('not a .FLD file: bad magic "' + magic + '"');

    var dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    var raw = {};
    FLD_PARAMS.forEach(function (name, i) { raw[name] = dv.getFloat64(10 + i * 8, true); });

    var f = new Field(dv.getUint16(204, true));
    f.params = {
      RabbitDeathRate: raw.RabbitDeathRate,
      FoxDeathRate: raw.FoxDeathRate,
      FoxReproductionRate: raw.FoxReproductionRate,
      GrassDeathRate: raw.GrassDeathRate,
      SolarEnergyInput: raw.SolarEnergyInput,
      DiseasePenalty: raw.DiseasePenalty,
      ReproductiveProb: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (i) {
        return raw['ReproductiveProb' + i];
      }),
    };
    f.max = {
      RabbitDeathRate: raw.RabbitDeathRateMax,
      FoxDeathRate: raw.FoxDeathRateMax,
      FoxReproductionRate: raw.FoxReproductionRateMax,
      GrassDeathRate: raw.GrassDeathRateMax,
      SolarEnergyInput: raw.SolarEnergyRateMax,
    };
    f.yscale = dv.getUint16(185, true);
    f.graphOn = bytes[187] !== 0;
    f.flags = [];
    for (var b = 0; b < 9; b++) f.flags.push(bytes[176 + b] !== 0);
    f.cells = bytes.slice(FLD_GRID);

    var got = f.counts();
    var want = {
      rabbits: dv.getUint16(170, true),
      foxes: dv.getUint16(172, true),
      grass: dv.getUint16(174, true),
    };
    if (got.rabbits !== want.rabbits || got.foxes !== want.foxes || got.grass !== want.grass) {
      throw new Error('.FLD population counts do not match the grid');
    }
    return f;
  };

  Field.fromBase64 = function (b64) {
    var bin = (typeof atob === 'function')
      ? atob(b64)
      : Buffer.from(b64, 'base64').toString('binary');
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return Field.fromFLD(out);
  };

  // Writes a file the 1996 binary will load.
  Field.prototype.toFLD = function () {
    var out = new Uint8Array(FLD_SIZE);
    var dv = new DataView(out.buffer);
    out[0] = FLD_MAGIC.length;
    for (var i = 0; i < FLD_MAGIC.length; i++) out[1 + i] = FLD_MAGIC.charCodeAt(i);

    var mx = this.max || {};
    var flat = {
      RabbitDeathRate: this.params.RabbitDeathRate,
      FoxDeathRate: this.params.FoxDeathRate,
      FoxReproductionRate: this.params.FoxReproductionRate,
      GrassDeathRate: this.params.GrassDeathRate,
      SolarEnergyInput: this.params.SolarEnergyInput,
      RabbitDeathRateMax: mx.RabbitDeathRate !== undefined ? mx.RabbitDeathRate : 0.4,
      FoxDeathRateMax: mx.FoxDeathRate !== undefined ? mx.FoxDeathRate : 0.6,
      FoxReproductionRateMax: mx.FoxReproductionRate !== undefined ? mx.FoxReproductionRate : 1,
      GrassDeathRateMax: mx.GrassDeathRate !== undefined ? mx.GrassDeathRate : 1,
      SolarEnergyRateMax: mx.SolarEnergyInput !== undefined ? mx.SolarEnergyInput : 0.8,
      DiseasePenalty: this.params.DiseasePenalty,
    };
    for (var p = 0; p < 9; p++) flat['ReproductiveProb' + p] = this.params.ReproductiveProb[p];
    FLD_PARAMS.forEach(function (name, k) { dv.setFloat64(10 + k * 8, flat[name], true); });

    var c = this.counts();
    dv.setUint16(170, c.rabbits, true);
    dv.setUint16(172, c.foxes, true);
    dv.setUint16(174, c.grass, true);
    var fl = this.flags || [];
    for (var b = 0; b < 9; b++) out[176 + b] = (fl[b] === undefined ? true : fl[b]) ? 1 : 0;
    dv.setUint16(185, this.yscale || 2000, true);
    out[187] = (this.graphOn === undefined ? true : this.graphOn) ? 1 : 0;
    dv.setUint16(204, this.size, true);
    out.set(this.cells, FLD_GRID);
    return out;
  };

  Field.prototype.clone = function () {
    var f = new Field(this.size);
    f.cells = this.cells.slice();
    f.params = JSON.parse(JSON.stringify(this.params));
    return f;
  };

  // ---- disasters -------------------------------------------------------
  // The Disasters menu never touches the field. Each item changes one
  // parameter; three save the old value so a timer can restore it, and the
  // asteroid does not. See ../disassembly/README.md, "Disasters".

  var DISASTERS = {
    fire: { param: 'GrassDeathRate', value: 0.79, restores: true,
            label: 'Fire destroys grass' },
    disease: { param: 'RabbitDeathRate', value: 0.5, restores: true,
               label: 'Disease spreads through rabbits' },
    overhunt: { param: 'FoxDeathRate', value: 0.75, restores: true,
                label: 'Over hunting of foxes' },
    // Captioned "Asteroid hits earth"; the component is NuclearWinter1, hence
    // the handler name in the binary. Permanent -- it moves the Sunlight
    // slider instead of reverting.
    asteroid: { param: 'SolarEnergyInput', value: 0.175, restores: false,
                label: 'Asteroid hits earth - dust in atmosphere' },
  };

  // ---- model -----------------------------------------------------------

  function Model(field, rng) {
    this.f = field;
    this.rng = rng || new Xorshift32(0);
    this.generation = 0;
    // FIELD_NEXT (DS:340E) and FIELD_TMP (DS:4E52). TMP is a clean template:
    // borders set, interior EMPTY, never anything else.
    this.next = new Uint8Array(STRIDE * STRIDE);
    this.tmp = new Uint8Array(STRIDE * STRIDE);
    var t = new Field(field.size);
    this.tmp.set(t.cells);
  }

  // CountFree, 7:1A41 — neighbours whose value is EXACTLY EMPTY or EXACTLY
  // GRASS. Returns the count 0..8 and the qualifying offsets.
  Model.prototype.countFree = function (i) {
    var free = [];
    for (var k = 0; k < NEIGHBOURS.length; k++) {
      var v = this.f.cells[i + NEIGHBOURS[k]];
      if (v === EMPTY || v === GRASS) free.push(NEIGHBOURS[k]);
    }
    return free;
  };

  // BuildCandidateList, 7:182B — neighbours that are neither already grass
  // nor border.
  Model.prototype.grassTargets = function (i) {
    var out = [];
    for (var k = 0; k < NEIGHBOURS.length; k++) {
      var v = this.f.cells[i + NEIGHBOURS[k]];
      if (v !== BORDER && !(v & GRASS)) out.push(NEIGHBOURS[k]);
    }
    return out;
  };

  // FindAdjacent, 7:1E00.
  Model.prototype.findAdjacent = function (i, mask) {
    for (var k = 0; k < NEIGHBOURS.length; k++) {
      var j = i + NEIGHBOURS[k];
      var v = this.f.cells[j];
      if (v !== BORDER && (v & mask) === mask) return j;
    }
    return -1;
  };

  Model.prototype._live = function (fn) {
    var n = this.f.size;
    for (var r = 1; r <= n; r++) {
      for (var c = 1; c <= n; c++) fn.call(this, r * STRIDE + c);
    }
  };

  // GrassPass, 7:1FC8.
  Model.prototype.grassPass = function () {
    this._live(function (i) {
      var cur = this.f.cells;
      if (!(cur[i] & GRASS)) return;
      if (this.rng.random() < this.f.params.SolarEnergyInput) {
        var targets = this.grassTargets(i);
        if (targets.length) {
          var d = targets[randomN(this.rng, targets.length) - 1];
          this.next[i + d] = GRASS;
        }
      }
      this.next[i] = this.rng.random() < this.f.params.GrassDeathRate ? EMPTY : GRASS;
    });
  };

  // AnimalPass, 7:2169 — grazing, then movement.
  Model.prototype.animalPass = function () {
    this._live(function (i) {
      var cur = this.f.cells, v = cur[i];

      if ((v & RABBIT) || (v & DISEASED)) {
        // Grazing: exactly 1 chance in 50.
        if (randomN(this.rng, 50) === 25 && (this.next[i] & GRASS)) {
          this.next[i] = EMPTY;
        }
      }

      if (!(v & (RABBIT | FOX | DISEASED))) return;

      // Random_n(8), but only the odd values name a direction (7:2231).
      var off = MOVE_DIRS[randomN(this.rng, 8)];
      var moved = false;
      if (off !== undefined) {
        var t = i + off;
        var tv = cur[t];
        if (tv === GRASS || tv === EMPTY) {
          // The target is overwritten rather than merged, and the source is
          // not cleared — the animal moves because nothing writes it back.
          this.next[t] = this.next[i] | (v & ANIMAL_MASK);
          moved = true;
        }
      }
      if (!moved) {
        // 7:2478 — a blocked move, or an even draw, ORs the animal back into
        // its own cell. GrassPass has already overwritten the whole byte, so
        // without this every stationary animal would be erased.
        this.next[i] |= (v & ANIMAL_MASK);
      }
    });
  };

  // DiseasePass, 7:24F4.
  Model.prototype.diseasePass = function () {
    this._live(function (i) {
      var cur = this.f.cells;
      this.next[i] |= cur[i];
      if (!(cur[i] & DISEASED)) return;
      for (var k = 0; k < NEIGHBOURS.length; k++) {
        var j = i + NEIGHBOURS[k];
        if (cur[j] !== BORDER && (cur[j] & RABBIT)) {
          this.next[j] = cur[j] | DISEASED;
        }
      }
    });
  };

  // PlaceOffspring, 7:1C47 — requires grass at the parent in NEXT.
  Model.prototype.placeOffspring = function (i, free) {
    if (!(this.next[i] & GRASS)) return;
    var d = free[randomN(this.rng, free.length) - 1];
    this.next[i + d] = RABBIT;
  };

  // RabbitLoop, 7:293A.
  Model.prototype.rabbitLoop = function () {
    var p = this.f.params;
    this._live(function (i) {
      var cur = this.f.cells, v = cur[i];
      if (v & RABBIT) {
        if (this.rng.random() < p.RabbitDeathRate) {
          this.next[i] = v & GRASS;
        } else {
          var free = this.countFree(i);
          if (this.rng.random() < p.ReproductiveProb[free.length]) {
            this.placeOffspring(i, free);
          }
        }
      }
      if (v & DISEASED) {
        // No clamp: a rate above 1/3 kills every diseased rabbit.
        if (this.rng.random() < p.DiseasePenalty * p.RabbitDeathRate) {
          this.next[i] = v & GRASS;
        }
      }
    });
  };

  // FoxLoop, 7:2A64 — catching a rabbit is reproduction.
  Model.prototype.foxLoop = function () {
    var p = this.f.params;
    this._live(function (i) {
      var cur = this.f.cells, v = cur[i];
      if (!(v & FOX)) return;
      if (this.rng.random() < p.FoxDeathRate) {
        this.next[i] = v & GRASS;
        return;
      }
      var prey = this.findAdjacent(i, RABBIT);
      if (prey >= 0 && this.rng.random() < p.FoxReproductionRate) {
        this.next[prey] = v | FOX;
      }
    });
  };

  // DoGeneration, 7:28F7.
  Model.prototype.step = function () {
    this.next.set(this.tmp);          // NEXT := TMP, clearing the buffer
    this.grassPass();
    this.animalPass();
    this.f.cells.set(this.next);      // CUR := NEXT
    this.diseasePass();
    this.f.cells.set(this.next);      // CUR := NEXT
    this.rabbitLoop();
    this.foxLoop();
    this.f.cells.set(this.next);
    this.generation++;
  };

  Model.prototype.counts = function () { return this.f.counts(); };

  // Trigger a disaster. Returns the label, mirroring the handlers at 1:3252,
  // 1:3C7B, 1:3A5D and 1:3206.
  Model.prototype.triggerDisaster = function (name) {
    var d = DISASTERS[name];
    if (!d) throw new Error('no such disaster: ' + name);
    if (d.restores) {
      // [0F88] := the parameter, [0F86] := the type, then enable the timer.
      this.pendingDisaster = { param: d.param, saved: this.f.params[d.param] };
    }
    this.f.params[d.param] = d.value;
    return d.label;
  };

  // DisasterTimerTimer, 1:32EE — put the saved value back.
  Model.prototype.expireDisaster = function () {
    if (!this.pendingDisaster) return false;
    this.f.params[this.pendingDisaster.param] = this.pendingDisaster.saved;
    this.pendingDisaster = null;
    return true;
  };

  // AddDiseasedRabbit, 7:2DCD. With no rabbits on the field it places one at a
  // random position; otherwise it draws Random_n(nRabbits) and walks the field
  // to the k'th. Note the two read-modify-writes at 7:2E8A: the RABBIT bit is
  // CLEARED and DISEASED set, so the cell ends up as 8, not 10 — the seeded
  // creature drops out of the rabbit count.
  Model.prototype.addDiseasedRabbit = function () {
    var n = this.f.size, r, c, i;
    var nRabbits = this.f.counts().rabbits;
    if (nRabbits === 0) {
      r = randomN(this.rng, n);
      c = randomN(this.rng, n);
      i = r * STRIDE + c;
    } else {
      var k = randomN(this.rng, nRabbits);
      var seen = 0;
      for (r = 1; r <= n && !i; r++) {
        for (c = 1; c <= n; c++) {
          if (this.f.cells[r * STRIDE + c] & RABBIT) {
            seen++;
            if (seen === k) { i = r * STRIDE + c; break; }
          }
        }
      }
    }
    if (!i) return -1;
    this.f.cells[i] &= ~RABBIT;
    this.f.cells[i] |= DISEASED;
    return i;
  };

  return {
    BORDER: BORDER, EMPTY: EMPTY, GRASS: GRASS, RABBIT: RABBIT,
    FOX: FOX, DISEASED: DISEASED, ANIMAL_MASK: ANIMAL_MASK,
    STRIDE: STRIDE, MOVE_DIRS: MOVE_DIRS, NEIGHBOURS: NEIGHBOURS,
    Xorshift32: Xorshift32, randomN: randomN,
    defaultParams: defaultParams, Field: Field, Model: Model,
    DISASTERS: DISASTERS, FLD_PARAMS: FLD_PARAMS,
  };
}));
