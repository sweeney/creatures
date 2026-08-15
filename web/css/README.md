# Skins

The markup in `index.html` describes *what* things are, never how they look.
`base.css` lays them out. A skin supplies the appearance, and nothing else.

```
index.html          semantic markup — class names name the thing, not the style
css/base.css        structure and layout, no decoration
css/skin-1996.css   Windows 95, as the original shipped
css/skin-2026.css   a contemporary look — start here for a new skin
```

Switch at runtime with the picker in the title bar; the choice is remembered in
`localStorage`. `app.js` swaps the `href` of `<link id="skin">` and re-reads the
colour tokens afterwards.

## Writing a new skin

Copy `skin-2026.css`, not `skin-1996.css` — the latter carries a lot of
era-specific bevel work you would only have to undo. Redefine the tokens below;
add component rules only where tokens are not enough.

### Colour

| token | used for |
|---|---|
| `--bg` | the page behind the app |
| `--surface` | the app's own background |
| `--text`, `--text-muted` | body text, secondary text |
| `--accent` | focus rings, selected states |
| `--border`, `--border-hi`, `--border-lo` | edges; a bevel sets hi/lo differently |

### The simulation

These are read by `app.js` and painted onto the canvas, so a skin *can* restyle
the field itself, not just the chrome. `skin-2026.css` deliberately does not:
it keeps the original's black field with pure green, blue and red, because
those colours are the subject rather than decoration. A skin that changes them
is making a real claim about the simulation, not a stylistic one.

| token | used for |
|---|---|
| `--sim-empty` | bare ground |
| `--sim-grass`, `--sim-rabbit`, `--sim-fox` | the three species |
| `--sim-diseased` | a diseased rabbit; falls back to `--sim-rabbit` |
| `--graph-bg`, `--graph-grid` | the population graph |
| `--graph-grass`, `--graph-rabbit`, `--graph-fox` | its three lines |

### Type and metrics

| token | used for |
|---|---|
| `--font`, `--font-mono` | families |
| `--font-size`, `--font-size-sm`, `--line` | scale |
| `--gap`, `--pad`, `--panel-pad` | spacing rhythm |
| `--app-width` | the app's width |
| `--col-field`, `--col-status` | the fixed outer columns |
| `--col-main-basis` | flex basis of the middle column — raise it so the
  layout wraps rather than crushing on a narrow window |
| `--field-px` | rendered size of the field canvas |
| `--slider-h` | thickness of a slider across its short axis |
| `--slider-vertical-h` | length of the two vertical sliders |
| `--radius` | corner rounding |

A larger type scale needs more room. Raise `--app-width` and the column tokens
rather than letting content overflow — that is what `skin-2026.css` does, and
what the layout tokens are for.

## Rules of the seam

- **Never change layout from a skin.** If a skin needs different proportions,
  it changes the metric tokens. If that is not enough, the missing token
  belongs in `base.css`.
- **Never set a size on a shared class from a skin.** A skin loads after
  `base.css`, so at equal specificity it wins. `skin-1996.css` setting
  `.slider { height: 18px }` silently collapsed the two vertical sliders from
  130px to 18px, because base's `.slider--vertical` had the same specificity
  and lost on source order. Set the token instead; where base must not be
  overridable it uses a two-class selector such as `.slider.slider--vertical`.
- **Never hard-code a colour in `app.js`.** Canvas colours come from tokens so
  the field follows the skin.
- **State is a class, not a style.** `is-active`, `is-open`, `is-on` and
  `is-check` carry state; a skin decides what each looks like.
- **A dialog is a window, not a page.** `.modal` sits inside `.app` so a
  dialog centres on the window rather than the viewport, and `is-open` shows
  it. A skin decides whether the backdrop dims — `skin-1996.css` leaves it
  clear, because Windows 95 modals did.
- **Check both skins.** `node uicheck.js` drives 36 scenarios and audits the
  layout in each; two of them are the skins side by side. Writing the second
  skin exposed three genuine bugs in `base.css` that the 1996 skin happened to
  paper over — a second skin is the cheapest way to find them.

## Verifying

```
node uicheck.js            # 36 scenarios, screenshots + layout audit
node ../core/test.js       # the model's own tests
```
