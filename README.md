# Creatures 2.0

A reconstruction of **Foxes and Rabbits Simulator** (Future Skill Software,
1996) — a Windows 3.x educational predator–prey simulator — rebuilt from the
shipped binary, with the author's permission.

The simulation is not reimplemented from observed behaviour. It is
**transcribed instruction by instruction from `CREATURE.EXE`**, so the passes,
the probabilities and the quirks are the ones the original runs.

```
open web/index.html      # the app: no server, no build, no dependencies
node core/test.js        # 71 tests
node core/report.js      # tests + coverage, as a self-contained HTML report
```

## Layout

| | |
|---|---|
| [`core/`](core/) | the model — `creatures.js`, transcribed from the binary, and its tests. Standalone: no browser, no dependencies. |
| [`web/`](web/) | the browser app. Two skins: 1996 and 2026. |
| [`disassembly/`](disassembly/) | the tooling that read the binary, and [what it found](disassembly/README.md). |
| [`original/`](original/) | the artefact itself — `creat.exe`, the unpacked files, the decoded forms. |
| [`history/`](history/) | contemporary press and web captures. |
| [`walkthrough.html`](walkthrough.html) | how the engine was recovered, written for a general reader. |

The dependency direction is one way: `core/` knows nothing about `web/`, and
`web/app.js` never computes a generation. Everything asserted in
`disassembly/README.md` is traceable to an address in segment 7.

## What was recovered

Segment 7 is the simulation engine, found by fingerprint: the field is 82 bytes
per row, so every index into it compiles to `imul di, ax, 0x52`, and that
segment holds 181 of them where no other has more than a handful.
**100% of it is accounted for** — 6139 bytes of simulation read line by line,
5844 bytes of file I/O and UI identified by signature, 2 bytes of padding.

A generation is four passes over a double-buffered 82×82 grid of bitfield
cells. Some of what that turned up:

- **Movement is orthogonal only, and happens at most half the time.** The
  dispatch draws 1–8 but tests only 1, 3, 5 and 7. There are no diagonal moves.
- **A failed move still writes the animal back.** Miss that single store and
  the population dies out, because the grass pass has already overwritten the
  cell.
- **Grazing is 1-in-50**, not every generation.
- **A fox that catches a rabbit breeds into its cell** — hunting and
  reproduction are the same step.
- **Disasters change a parameter, not the field**, and three of the four revert
  on a timer. Three also position their slider with the wrong arithmetic,
  a bug in the original that has no effect on the simulation.

## Tests

`core/` has 71 tests driven by a scripted RNG, so a stochastic model is
asserted **exactly** rather than statistically — each test states the draws it
expects and fails if the code consumes a different number of them.

`web/uicheck.js` drives the interface in a real browser across 36 scenarios and
audits each rendered layout for overflow, overlap, clipped text, unhittable
controls and notebook state.

`node core/report.js --ui` runs both and writes a self-contained HTML report:
pass/fail per test, per-scenario UI findings, and the model's source annotated
line by line with what the tests actually reached. CI publishes it as the
**test-report** artifact on every push.

## Licence

The reconstruction — `core/`, `web/`, `disassembly/` — is original work.

`original/` and `history/` contain third-party material: *Creatures 1.0* is
© 1996 Future Skill Software, and the press captures belong to their
publishers. They are included as reference, not offered under any licence.
