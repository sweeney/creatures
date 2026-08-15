# Creatures — browser build

A client-side reconstruction of the *Creatures 1.0* interface (Future Skill
Software, 1996), driving the simulation core in [`../core/`](../core/).

```
open index.html
```

No server, no build, no dependencies. Everything — the six shipped `.FLD`
fields included — is embedded in the page, so it works straight off `file://`.

The model is not reimplemented here. `app.js` is UI only: it reads and writes
`core/creatures.js`, which is transcribed instruction by instruction from
`CREATURE.EXE` and has its own tests (`node ../core/test.js`). If a generation
comes out wrong, the fault is in the core, not on this side of the line.

## Where the interface comes from

Two sources, and they disagree.

The **binary** is authoritative for everything it contains: the recovered form
resources give the exact controls, their captions and their order. The
**screenshot** (`creatu1.jpg`) shows a build that is not the one that shipped.

Where they conflict this reconstruction follows the screenshot, because that is
the version people remember. The differences worth knowing about:

- **The Simulation Speed slider does not exist in the shipped binary.** Its
  form has five sliders — sunlight, grass death, fox hunting, rabbit death, fox
  death — and speed is set only from the Speed menu. The screenshot has a sixth
  slider for it, so this build has both, wired together: the menu presets move
  the slider, and dragging the slider clears the tick.

Anything in that list is a deliberate departure, not an oversight. Check here
before "correcting" a control against the disassembly.

## Using it

- **Start / Stop / One Generation**, simulation speed, generation counter
- **Five parameter sliders** — sunlight, grass death rate, fox hunting ability,
  rabbit death rate, fox death rate. They read as a percentage of each
  parameter's ceiling, which is why the original's screenshot shows "87%"
  rather than a rate.
- **Graph panel** with the original's y-scale steps (100 … 6000), a ticked
  generation axis, and per-species plot toggles
- **Add grass / rabbits / foxes** — pick a brush, then paint on the field
- **File › Load** any of the six shipped fields; **File › Save** writes a real
  `.FLD` the 1996 binary would load, round-trip byte-identical
- **Disasters** — fire, disease, over-hunting, asteroid. Each changes a
  parameter rather than damaging the field; the first three revert on a timer,
  the asteroid is permanent and moves the Sunlight slider with it.
- **Options** — clear the field, populate with grass, add a diseased rabbit,
  switch between 50×50 and 80×80
- **Speed** — Fast / Medium / Slow, mirrored by the Simulation Speed slider
- **Configure › Appearance** — 1996 or 2026, see [`css/README.md`](css/README.md)
- **Configure › Revert parameters to internal defaults** — restores the values
  compiled into `SetDefaultParameters`, not the ones in `STARTUP.INI` that the
  original reads over the top of them at startup. Numbers only: the field and
  generation counter are left alone, so you can re-run the same population
  under default settings. Each `.FLD` carries its own parameters, so loading a
  field also changes the numbers.
- **About** — a dialog, as in the original, which had it as a separate form
  rather than a page of the notebook

The four notebook pages — Main, Field Options, Graph Options, Save/Print — are
the original's four, in the original's order.

## Checking the UI

The interface can be driven without a mouse, and its layout audited
automatically:

```
node uicheck.js [outdir]      # 36 scenarios, screenshots + layout audit
```

One Chrome instance is launched and reused over the DevTools protocol; each
scenario reloads the page, drives it via `window.__run(...)` from
`testhooks.js`, and reports what `window.__audit()` finds. Exits non-zero on
any issue. `UICHECK_ONLY=initial,running node uicheck.js` runs a subset.

`testhooks.js` is inert unless the page is loaded with `?do=...`, so it costs
the real app nothing:

```
index.html?do=gen:200                 advance 200 generations
index.html?do=open:Disasters          open a menu and leave it open
index.html?do=set:sldSun=100,gen:150  drag a slider, then run
index.html?do=field:BIG,menu:fire     load a field, trigger a disaster
index.html?do=skin:2026               switch appearance
```

The auditor checks for elements escaping their window, elements escaping their
own parent, overlapping controls, clipped text, unhittable targets, notebook
state, and horizontal page scroll. An open dialog counts as a second window, so
it is audited too, and only overlaps *within* one window are reported.

Real defects it has caught:

- **Sliders with a 4px hit area.** The track was styled to 4px but the input
  had no height, so the thumb rendered outside anything you could grab.
- **`alert()` in the Disasters menu.** A native dialog blocks the JS thread,
  freezing the running simulation. Now an in-window notice; the driver also
  reports any dialog as `BLOCKING DIALOG` rather than hanging on it.
- **The graph canvas overflowing into the Status column.** A flex item defaults
  to `min-width: auto`, so the wrapper would not shrink below the canvas's
  intrinsic attribute width, and the canvas slid under the right-hand panel.
- **Vertical sliders collapsing to 18×18px.** A skin loads after `base.css`, so
  its `.slider { height: 18px }` beat `.slider--vertical` at equal specificity.
- **A notebook with no page selected.** Showing About as a page cleared every
  tab's selected state, leaving no visible way back to the graph and sliders.

The overlap test includes panels rather than only interactive controls, and
checks parent-overflow as well as window-overflow — the canvas defect above
never left the *window*, so a window-only check missed it.

## Files

```
index.html      the window — semantic markup, no look
app.js          UI only; never computes a generation
css/base.css    structure and layout
css/skin-1996.css, css/skin-2026.css    appearance
fields.js       the six shipped .FLD files, base64  | node build-fields.js
testhooks.js    window.__ui / __audit / ?do= — UI control + layout auditor
uicheck.js      drives 36 scenarios in one Chrome, screenshots + audit
```

`fields.js` is generated, but the `.FLD` files never change, so it is a
one-time asset step rather than a build.
