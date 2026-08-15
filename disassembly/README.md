# Disassembling CREATURE.EXE

The simulation model of *Creatures 1.0* (Future Skill Software, 1996), read out
of the shipped binary.

```
python3 -m venv venv && ./venv/bin/pip install capstone

./venv/bin/python new_executable.py                  # header and segment map
./venv/bin/python resolve_method_addresses.py        # handler names -> addresses
./venv/bin/python annotate_routine.py 7 2169         # annotated disassembly
./venv/bin/python annotate_routine.py 7 2169 --raw   # ...without substitution
./venv/bin/python coverage_report.py 7               # how much has been decoded
```

`venv/` is not worth keeping; the two lines above rebuild it. The binary itself
and everything unpacked from it live in [`../original/`](../original/).

## The scripts

Two of them decode *formats* and need no disassembler. They came first, and
between them they turn an opaque 692 KB binary into something with named entry
points and a known data layout:

| script | what it does |
|---|---|
| `decode_form_resources.py` | Decodes the Delphi 1 DFM form resources — every control, its geometry, and the name of every event handler. Losslessly, unlike code. |
| `field_file.py` | Reads, writes and renders the `.FLD` saved-field format. Round-trips all six shipped files byte-identically. |

The rest read machine code:

| script | what it does |
|---|---|
| `new_executable.py` | Parses the NE container and exposes `load()`. Every script below imports it. Run alone, prints the header and segment map. |
| `resolve_method_addresses.py` | Walks Delphi's published-method table to real code addresses — the thing that makes the binary navigable. Writes `resolved_methods.json`. |
| `disassemble_routine.py` | Disassembles from an address, resolving each call through its relocation record so the outgoing edges are readable. No symbol layer. |
| `annotate_routine.py` | The same, plus every recovered symbol name, end-of-function detection and branch-target labels. The one to read code with. |
| `coverage_report.py` | Enumerates every routine in a segment and reports decoded bytes against total. The answer to "are we finished". |

The order matters. `decode_form_resources.py` yields the handler names,
`resolve_method_addresses.py` turns those into addresses, and only then is
there anywhere worth pointing a disassembler.

Use `annotate_routine.py --raw`, or `disassemble_routine.py`, whenever a
substitution might be hiding a mis-decode. A symbol is a claim about what an
address means, and a wrong claim reads as fluently as a right one — several
findings below turned on re-reading the actual bytes.

## Getting in

`CREATURE.EXE` is a 16-bit NE binary built with Delphi 1: 19 segments, 311 KB of
code, no symbols. Two things make it navigable.

**Published methods carry their names.** Delphi resolves DFM event properties
(`OnTimer = Timer1Timer`) by name at load time, so every handler sits in the
class's method table as `address, ShortString name`. The address is stored as
the NE placeholder `FF FF 00 00` and patched through a relocation record, so
`resolve_method_addresses.py` walks name → relocation → entry table → code. That yields
`Timer1Timer`, `FieldonScreenPaint`, `btnStartClick` and the rest directly.

**The automaton has a fingerprint.** The field is 82 bytes per row, so indexing
compiles to `imul di, ax, 0x52`. Segment 7 contains 181 of them; no other
segment has more than a handful. **Segment 7 is the simulation engine.**

One trap: the border sentinel is never an immediate. It lives in a variable at
`DS:021A`, so searching for `cmp al, 0xA0` finds nothing at all.

## The forms

Delphi serialises each form into the binary as a DFM resource, which decodes
losslessly — every control, its geometry, its properties, and the name of every
event handler. All eight decode cleanly:

| form | role |
|---|---|
| `Form1` | the main window — the whole simulator UI |
| `ConfigBox` | parameter configuration dialog |
| `SplashScreen`, `AboutBox`, `EPAboutDialogFm` | splash and about |
| `SaveForm`, `PreviewForm` | save and print preview |
| `frmProtect` | copy-protection / registration |

`Form1` alone carries **60 distinct handlers across 78 bindings**; all eight
together name 89. That is a labelled index of the program's entire behaviour,
and it is what `resolve_method_addresses.py` turns into code addresses.

Two counts from `Form1` settle questions the code alone would not:

- **Exactly five sliders**, all `TEPSlider`: `SunSlider`, `GrassDeathSlider`,
  `FoxHuntSlider`, `RDeathSlider`, `FDeathSlider`. There is **no simulation
  speed slider** — speed is set from the Speed menu alone. Screenshots showing
  a sixth slider are of a later build than the one that shipped.
- **Exactly four `TPage` children** under `Notebook1`, which is the tab strip:
  Main, Field Options, Graph Options, Save/Print.

`ConfigBox` is more than a dialog: its help text states the central rule of the
model in the author's own words, which is how that rule was known before any
code had been read.

> The likelihood of a rabbit reproducing depends on the number of free squares
> around the animal. The array below shows the current probabilities for the
> eight possible patterns of vacancies.

That is the `ReproductiveProb0..8` array, indexed by vacancy count — later
confirmed in the machine code as `CountFree` feeding a table lookup.

## Memory layout

Three 82×82 byte buffers, contiguous, 6724 bytes apart:

| addr | name | role |
|---|---|---|
| `DS:19CA` | `FIELD_CUR` | the live field — what gets drawn and counted |
| `DS:340E` | `FIELD_NEXT` | the buffer each pass writes into |
| `DS:4E52` | `FIELD_TMP` | a clean template: borders set, interior all `EMPTY` |

Cell values, from `DS:021A` onward:

| addr | name | value |
|---|---|---|
| `021A` | `BORDER` | `0xA0` |
| `021B` | `EMPTY` | `0` |
| `021C` | `GRASS` | `1` |
| `021D` | `RABBIT` | `2` |
| `021E` | `FOX` | `4` |
| `021F` | `DISEASED` | `8` |
| `0224` | `ANIMAL_MASK` | `0x0E` = rabbit\|fox\|diseased |
| `0226` | `FIELD_SIZE` | `50` |

Cells are a **bitfield**, so `3` is a rabbit on grass and `5` a fox on grass.
`0xA0` is chosen so that a border cell reads as "no grass, no rabbit, no fox"
under a plain bit test.

Parameters live at `DS:0228` on a 16-byte stride as `(value, max)` pairs, in
exactly the order `STARTUP.INI` lists them — which is what the INI loader writes
into:

| addr | parameter | compiled default | max |
|---|---|---|---|
| `0228` | RabbitDeathRate | 0.1 | 0.4 |
| `0238` | FoxDeathRate | 0.15 | 0.5 |
| `0248` | FoxReproductionRate (hunting ability) | 1.0 | 1.0 |
| `0258` | GrassDeathRate | 0.3 | 1.0 |
| `0268` | SolarEnergyInput | 0.7 | 0.8 |
| `0278` | DiseasePenalty | 3.0 | — |

Both columns are decoded from the constants `SetDefaultParameters` (7:1376)
loads out of the code segment, not read off `STARTUP.INI` — the `max` at
`base+8` is a real ceiling the program compiles in, and the disaster handlers
divide by it to position a slider.

`ReproductiveProb[0..8]` is nine doubles at `DS:0280`
(`0, 0, 0.1, 0.2, 0.3, 0.5, 0.5, 0.6, 0.8`). An identical copy sits at `DS:02C8`
and is the one the rabbit loop actually indexes.

The compiled defaults are not quite the INI's — the binary has GrassDeathRate
0.3 and Solar 0.7 where the INI says 0.2 and 0.5 — but the INI is read at
startup and overrides them.

**The ceilings differ too**, which matters more than the values do because a
ceiling is what every slider is a percentage of. `STARTUP.INI` ships
`FoxDeathRateMax=0.6` against the binary's compiled 0.5; the rest agree. So the
shipped program runs with 0.6, and 0.5 is only what it would fall back to
without its INI. Both numbers are real — they answer different questions.

Which one a given routine sees depends on when it runs.
`ReverttointernalDefaults1Click` (`1:2320`) calls `SetDefaultParameters`
directly, so "revert to internal defaults" restores the *compiled* values and
deliberately ignores the INI.

## Primitives

`Random_n` (7:1814) wraps Delphi's `Random(n)` (seg 18:1A24, yielding `0..n-1`)
and **increments the result**, so it returns **`1..n`**. Every draw in the
engine goes through it; an off-by-one here desynchronises everything.

`CountFree` (7:1A41) counts, of the eight neighbours, those whose cell value is
**exactly** `EMPTY` or **exactly** `GRASS` — i.e. holding no animal and not the
border. It returns the count `0..8` and records each qualifying direction in a
list at `DS:170E`.

`BuildCandidateList` (7:182B) is the same idea for grass: it lists neighbours
that are *not* already grass and *not* border, into `DS:171E`.

`FindAdjacent` (7:1E00) scans the eight neighbours for one matching a mask and
returns its coordinates.

`DrawField` (7:15E3) draws and counts in one sweep: it zeroes the three counters
at `DS:0310/0312/0314`, walks `FIELD_CUR`, and accumulates as it paints. That it
reads `FIELD_CUR` is what identifies `FIELD_CUR` as the live field.

`SetBorders` (7:2B79) writes `BORDER` into the first and last row and column of
both `FIELD_CUR` and `FIELD_TMP`. `ClearField` (7:2C31) writes `EMPTY` through
the interior of both.

## The generation

```
DoGeneration:                                    ; 7:28F7
    NEXT := TMP                                  ; clears the working buffer
    GrassPass                                    ; 7:1FC8
    AnimalPass                                   ; 7:2169
    CUR := NEXT
    DiseasePass                                  ; 7:24F4
    CUR := NEXT
    RabbitLoop                                   ; inline at 7:293A
    FoxLoop                                      ; inline at 7:2A64
```

Every pass reads `FIELD_CUR` and writes `FIELD_NEXT`. The update is
double-buffered, with explicit commits between passes.

### GrassPass — 7:1FC8

```
for each cell where CUR has GRASS:
    if Random < SolarEnergyInput:
        n := BuildCandidateList(cell)            ; neighbours not already grass
        if n > 0: NEXT[one of them at random] := GRASS
    if Random < GrassDeathRate: NEXT[cell] := EMPTY
    else:                      NEXT[cell] := GRASS
```

Only cells that already hold grass do anything, so grass never appears
spontaneously — it only spreads from existing grass, at most one cell per
generation.

### AnimalPass — 7:2169

```
for each cell:
    if cell has RABBIT or DISEASED:
        if Random_n(50) == 25 and NEXT[cell] has GRASS:
            NEXT[cell] := EMPTY                  ; grazing
    if cell has RABBIT, FOX or DISEASED:
        d := Random_n(8)                         ; 1..8
        moved := false
        if d in (1,3,5,7):                       ; N, W, S, E
            t := neighbour in direction d
            if CUR[t] == GRASS or CUR[t] == EMPTY:
                NEXT[t] := NEXT[cell] | (CUR[cell] & ANIMAL_MASK)
                moved := true
        if not moved:                            ; 7:2478
            NEXT[cell] |= CUR[cell] & ANIMAL_MASK
```

Three things here are easy to get wrong.

**Grazing is 1 in 50** — a rabbit does not eat the grass under it every
generation.

**Movement is orthogonal only, and at most half the time.** `Random_n(8)`
returns 1..8, but the dispatch is a compare chain testing only 1, 3, 5 and 7.
There are no diagonal moves. The author clearly knew how to write an 8-way
dispatch — reproduction uses a real jump table — so this reads as deliberate.

**A failed move still writes the animal.** Every path that does not move —
an even draw, a border, an occupied target — falls to the stay-put write at
`7:2478`, which ORs the animal back into its own cell. This is not optional
bookkeeping: `GrassPass` has already overwritten the whole byte with the new
grass state, so an animal that is never written back is deleted at the commit.

**The move overwrites the target, and the source is never cleared.** The animal
"moves" only because nothing writes it back at the source. Since `NEXT` was
cleared at the start of the generation and `GrassPass` has since written the new
grass layer, `NEXT[source]` holds the source's *new ground state* — so a moving
animal carries its grass with it, and destroys whatever grass was at the target.

### DiseasePass — 7:24F4

```
for each cell:
    NEXT[cell] |= CUR[cell]
    if CUR[cell] has DISEASED:
        for each of the 8 neighbours holding a RABBIT:
            NEXT[nb] := CUR[nb] | DISEASED
```

Disease spreads to *every* adjacent rabbit, with no probability roll.

Each neighbour branch contains a dead store: it first writes
`CUR[nb] AND NOT RABBIT` and then immediately overwrites the same address with
`CUR[nb] OR DISEASED`. Only the second write survives.

### RabbitLoop — 7:293A

```
for each cell where CUR has RABBIT:
    if Random < RabbitDeathRate:
        NEXT[cell] := CUR[cell] & GRASS          ; dies, grass remains
    else:
        n := CountFree(cell)
        if Random < ReproductiveProb[n]:
            PlaceOffspring(n, cell)              ; 7:1C47

for each cell where CUR has DISEASED:
    if Random < DiseasePenalty * RabbitDeathRate:
        NEXT[cell] := CUR[cell] & GRASS
```

`PlaceOffspring` first checks `NEXT[parent] has GRASS` — reproduction requires
grass at the parent — then picks one of the `n` free directions at random
through an 8-way jump table and writes a rabbit there.

The diseased death test is `DiseasePenalty * RabbitDeathRate` with **no clamp**,
so a rabbit death rate above 1/3 kills every diseased rabbit every generation.

### FoxLoop — 7:2A64

```
for each cell where CUR has FOX:
    if Random < FoxDeathRate:
        NEXT[cell] := CUR[cell] & GRASS
    else if FindAdjacent(RABBIT) and Random < FoxReproductionRate:
        NEXT[prey] := CUR[cell] | FOX            ; eats and breeds in one step
```

A fox has no separate reproduction step: catching a rabbit *is* reproduction,
and the cub takes the prey's cell. As with movement, the value written carries
the hunter's own cell contents.

## Neighbour ordering

`CountFree` scans in a fixed order, recovered by walking its unrolled body:

```
N, NW, W, SW, S, SE, E, NE
```

This matters more than it looks. Reproduction and grass spread both build a
candidate list in this sequence and then index it with a random draw, so a
different order sends the same draw to a different cell.

Movement is separate and uses only four of the eight: `Random_n(8)` with a
compare chain on 1/3/5/7 giving N/W/S/E.

## Coverage

`coverage_report.py` enumerates every routine in a segment — by prologue, by local
call target, and by the entry points recovered from the relocation table — and
reports what is identified against what is not.

```
$ ./venv/bin/python coverage_report.py 7
simulation        6139 bytes   51.2%
file I/O, UI      5844 bytes   48.8%
unread               2 bytes    0.0%
identified       11983 bytes  100.0%
```

Every routine in segment 7 is accounted for. The two remaining bytes are
padding before the first entry point.

"Identified" is not the same claim for all of them. The simulation routines
below were read instruction by instruction and transcribed. The file I/O and UI
routines were identified from their signatures and cross-checked against what
they reference — `LoadField`/`SaveField` touch `FIELD_CUR` and `FIELD_SIZE` and
carry Delphi exception frames; `LoadSettings`/`SaveSettings` build a `TIniFile`
— but their internals were not needed for the model and were not read line by
line.

| addr | bytes | kind | routine |
|---|---|---|---|
| `0002` | 666 | io | unit init helper |
| `029C` | 721 | io | `LoadField` (.FLD) |
| `056D` | 156 | io | ...its exception handler |
| `0609` | 819 | io | `SaveField` (.FLD) |
| `093C` | 321 | io | ...its exception handler |
| `0A7D` | 1023 | io | `LoadSettings` (`TIniFile`) |
| `0E7C` | 1274 | io | `SaveSettings` (`TIniFile`) |
| `1376` | 318 | **sim** | `SetDefaultParameters` |
| `14B4` | 107 | io | string/path helper |
| `151F` | 49 | io | dispose |
| `1550` | 147 | io | canvas setup |
| `15E3` | 561 | io | `DrawField` + population counts |
| `1814` | 23 | **sim** | `Random_n(n)` → `1..n` |
| `182B` | 534 | **sim** | `BuildCandidateList` (grass targets) |
| `1A41` | 518 | **sim** | `CountFree` (free neighbours, 0..8) |
| `1C47` | 441 | **sim** | `PlaceOffspring` |
| `1E00` | 456 | **sim** | `FindAdjacent` |
| `1FC8` | 417 | **sim** | `GrassPass` |
| `2169` | 907 | **sim** | `AnimalPass` |
| `24F4` | 1027 | **sim** | `DiseasePass` |
| `28F7` | 642 | **sim** | `DoGeneration` |
| `2B79` | 184 | **sim** | `SetBorders` |
| `2C31` | 207 | **sim** | `ClearField` |
| `2D00` | 205 | **sim** | `CountPopulations` |
| `2DCD` | 260 | **sim** | `AddDiseasedRabbit` |

`SetDefaultParameters` is where the compiled defaults come from: it loads 80-bit
constants out of the code segment (`fld xword cs:[...]`) and stores them as
doubles into the parameter block. `FoxReproductionRate` is loaded as a 4-byte
single rather than an extended, the compiler having picked the smallest exact
representation of 1.0.

`AddDiseasedRabbit` is the Options menu item: with no rabbits on the field it
places one at a random position, otherwise it draws `Random_n(nRabbits)` and
walks the field to infect the k'th.

## Disasters — segment 1

The Disasters menu does **not** touch the field. Each handler changes one
parameter, and three of the four save the old value first so a timer can put it
back. They are temporary shocks to the model, not damage to the grid.

There are **four**, not five: the item captioned "Asteroid hits earth" is the
component `NuclearWinter1`, so its handler is `NuclearWinter1Click` — the
caption was changed at some point and the name never followed.

| menu item | handler | effect | slider | restored? |
|---|---|---|---|---|
| Fire destroys grass | `1:3252` | `GrassDeathRate := 0.79` | `+0x3B4` | yes, type 0 |
| Disease spreads through rabbits | `1:3C7B` | `RabbitDeathRate := 0.5` | `+0x3BC` | yes, type 1 |
| Over hunting of foxes | `1:3A5D` | `FoxDeathRate := 0.75` | `+0x3B8` | yes |
| Asteroid hits earth | `1:3206` | `SolarEnergyInput := 0.175` | `+0x3B0` | **no** |

The three temporary ones follow the same shape:

```
[0F88] := <the parameter>          ; save
<the parameter> := <constant>      ; shock
<reposition the parameter's slider>
[0F86] := <disaster type>          ; remember which
DisasterTimer.Enabled := True
```

and `DisasterTimerTimer` (`1:32EE`) switches on `[0F86]`, restores `[0F88]` into
the right parameter, disables itself, and repositions the slider again.

**A disaster lasts one second.** The form declares the timer as

```
object DisasterTimer: TTimer
  Enabled = False
  OnTimer = DisasterTimerTimer
end
```

with no `Interval`, and Delphi omits any property still at its default — so the
interval is `TTimer`'s default of 1000 ms. The omission is the evidence, and
the same form proves the convention both ways: it writes `Enabled = False`
because that default is True, and writes `Interval = 1` on `Timer1` and
`Timer2` because 1 is not the default.

This is worth stating precisely because the duration is not a free parameter.
Fire sets `GrassDeathRate` to 0.79 and disease sets `RabbitDeathRate` to 0.5,
both far above anything a slider allows; they are survivable only because they
are brief. Held for ten times as long, either one takes `STABLE.FLD` to total
extinction with no recovery.

Note also that re-triggering a disaster before its timer fires saves the
*shocked* value into `[0F88]`, so the restore puts back 0.79 rather than the
original rate. The handler has no guard against it.

The asteroid is the odd one out only in being permanent: it writes
`SolarEnergyInput` with no save and starts no timer, so the Sunlight slider
stays where the disaster put it and the user has to drag it back.

### The slider is repositioned with the wrong formula

All four handlers move their parameter's slider, and three of them compute the
position incorrectly. The asteroid divides; the other three multiply:

```
asteroid   1:3206    position := round(value * 100 / max)     ; correct
fire       1:3252    position := round(value * 100 * max)
over-hunt  1:3A5D    position := round(value * 100 * max)
disease    1:3C7B    position := round(value * 100 * max)
```

Multiplying is only equivalent to dividing when `max` is 1.0, which is true of
`GrassDeathRate` alone — so fire happens to come out right (79%) and the other
two do not. Over-hunting compounds it by reading `[0260]`, `GrassDeathRate`'s
max, rather than `[0240]`, its own.

The parameter itself is always set correctly, so the simulation is unaffected;
only the number under the slider is wrong. Note also that both miscomputed
cases set a parameter *above* its own slider ceiling — `FoxDeathRate := 0.75`
against a max of 0.5, `RabbitDeathRate := 0.5` against 0.4 — so the correct
position would be 150% and 125%, off the end of the track. There is no
in-range position to show, which is plausibly why the error went unnoticed.
