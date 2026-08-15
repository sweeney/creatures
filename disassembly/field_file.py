#!/usr/bin/env python3
"""Read, write and render the .FLD saved-field format.

    ./venv/bin/python field_file.py ../original/files/*.FLD

Prints each file's size, populations, graph scale and all twenty parameters.
Importable as well: `Field.load(path)` gives an object that reads, writes and
renders, and `Field.save` round-trips byte-identically.

Recovering this format came first and paid for itself twice over. The twenty
doubles in the header sit in the same order as STARTUP.INI, which is how the
parameter names were assigned rather than guessed; and the 82-byte row stride
is the constant that later identifies the simulation engine, because indexing
an 82-wide array compiles to `imul di, ax, 0x52` and segment 7 is full of them.

Verified against all six shipped files: a read/write cycle reproduces every
byte, and the population counts stored in each header are reproduced exactly by
independently decoding the grid.

The live implementation of this format is `Field.fromFLD` / `Field.toFLD` in
core/creatures.js, which the browser build uses. This one stays as an
independent decoder -- useful for checking the other, and for reading a field
at the command line without a browser.

Layout (6930 bytes, fixed):

  off    size  meaning
  0      1     Pascal string length (9)
  1      9     magic "CPATTERN1"
  10     160   20 x IEEE-754 little-endian float64 parameters (see PARAMS)
  170    2     uint16 rabbit count
  172    2     uint16 fox count
  174    2     uint16 grass count
  176    9     9 x bool display/print flags (see FLAGS)
  185    2     uint16 graph y-axis scale (100/250/500/1000/2000/3000/6000)
  187    1     bool graph on/off
  188    16    unused / zero padding
  204    2     uint16 field size N (50 or 80)
  206    6724  82x82 byte grid, row-major, ALWAYS stride 82 regardless of N

The grid is a fixed `array[0..81, 0..81] of Byte` dumped wholesale, so the
row stride stays 82 even when the live field is only 50x50. Live cells are
rows/cols 1..N; index 0 and N+1 form a border ring of 0xA0.

Cell bytes are a bitfield:
  bit 0 (1) = grass
  bit 1 (2) = rabbit
  bit 2 (4) = fox
  0xA0      = border sentinel
Observed values: 0,1,2,3,4,5 (grass coexists with one animal; no 6/7 seen).
"""
import struct

MAGIC = b'CPATTERN1'
SIZE = 6930
STRIDE = 82
GRID_OFF = 206
BORDER = 0xA0

GRASS, RABBIT, FOX = 1, 2, 4

# Order verified against STARTUP.INI: indices 10..18 and 19 match it exactly.
PARAMS = [
    'RabbitDeathRate', 'FoxDeathRate', 'FoxReproductionRate',
    'GrassDeathRate', 'SolarEnergyInput',
    'RabbitDeathRateMax', 'FoxDeathRateMax', 'FoxReproductionRateMax',
    'GrassDeathRateMax', 'SolarEnergyRateMax',
    'ReproductiveProb0', 'ReproductiveProb1', 'ReproductiveProb2',
    'ReproductiveProb3', 'ReproductiveProb4', 'ReproductiveProb5',
    'ReproductiveProb6', 'ReproductiveProb7', 'ReproductiveProb8',
    'DiseasePenalty',
]

FLAGS = [
    'PlotGrass', 'PlotRabbits', 'PlotFoxes',
    'DisplayGrassInField', 'DisplayRabbitsInField', 'DisplayFoxesInField',
    'PrintGrass', 'PrintRabbits', 'PrintFoxes',
]


class Field:
    def __init__(self, size=50):
        self.size = size
        self.params = dict.fromkeys(PARAMS, 0.0)
        self.flags = dict.fromkeys(FLAGS, True)
        self.yscale = 1000
        self.graph_on = True
        self.grid = bytearray(STRIDE * STRIDE)
        self.reset_border()

    # -- access ----------------------------------------------------------
    def reset_border(self):
        n = self.size
        for i in range(n + 2):
            self.grid[i] = BORDER
            self.grid[(n + 1) * STRIDE + i] = BORDER
            self.grid[i * STRIDE] = BORDER
            self.grid[i * STRIDE + n + 1] = BORDER

    def __getitem__(self, rc):
        r, c = rc
        return self.grid[r * STRIDE + c]

    def __setitem__(self, rc, v):
        r, c = rc
        self.grid[r * STRIDE + c] = v

    def cells(self):
        """Live cells only, as (row, col, value)."""
        for r in range(1, self.size + 1):
            for c in range(1, self.size + 1):
                yield r, c, self.grid[r * STRIDE + c]

    def counts(self):
        g = r_ = f = 0
        for _, _, v in self.cells():
            if v & GRASS:  g += 1
            if v & RABBIT: r_ += 1
            if v & FOX:    f += 1
        return r_, f, g

    # -- io --------------------------------------------------------------
    @classmethod
    def load(cls, path):
        d = open(path, 'rb').read()
        if len(d) != SIZE or d[1:1 + d[0]] != MAGIC:
            raise ValueError('not a Creatures .FLD file: %s' % path)
        self = cls()
        vals = struct.unpack_from('<20d', d, 10)
        self.params = dict(zip(PARAMS, vals))
        stored = struct.unpack_from('<3H', d, 170)
        self.flags = {k: bool(d[176 + i]) for i, k in enumerate(FLAGS)}
        self.yscale = struct.unpack_from('<H', d, 185)[0]
        self.graph_on = bool(d[187])
        self.size = struct.unpack_from('<H', d, 204)[0]
        self.grid = bytearray(d[GRID_OFF:])
        if self.counts() != stored:
            raise ValueError('count mismatch %s: stored %s decoded %s'
                             % (path, stored, self.counts()))
        return self

    def save(self, path):
        d = bytearray(SIZE)
        d[0] = len(MAGIC)
        d[1:1 + len(MAGIC)] = MAGIC
        struct.pack_into('<20d', d, 10, *[self.params[k] for k in PARAMS])
        struct.pack_into('<3H', d, 170, *self.counts())
        for i, k in enumerate(FLAGS):
            d[176 + i] = 1 if self.flags[k] else 0
        struct.pack_into('<H', d, 185, self.yscale)
        d[187] = 1 if self.graph_on else 0
        struct.pack_into('<H', d, 204, self.size)
        d[GRID_OFF:] = self.grid
        open(path, 'wb').write(bytes(d))

    def to_text(self):
        """ASCII art: . empty, " grass, r rabbit, R rabbit+grass, f/F fox."""
        sym = {0: '.', 1: '"', 2: 'r', 3: 'R', 4: 'f', 5: 'F'}
        return '\n'.join(
            ''.join(sym.get(self[r, c], '?') for c in range(1, self.size + 1))
            for r in range(1, self.size + 1))


if __name__ == '__main__':
    import sys
    for p in sys.argv[1:]:
        f = Field.load(p)
        r, fx, g = f.counts()
        print('%s  %dx%d  rabbits=%d foxes=%d grass=%d  yscale=%d'
              % (p, f.size, f.size, r, fx, g, f.yscale))
        for k in PARAMS:
            print('    %-24s %g' % (k, f.params[k]))
