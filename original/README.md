# The original program

*Creatures 1.0* — **Foxes and Rabbits Simulator** — © 1996 Future Skill
Software, Ystrad Meurig, Dyfed. This is the artefact everything else in the
project is derived from, and the only authority on what the program did.

`creat.exe` is not the program. It is an **LHA 2.13S self-extracting archive**,
a DOS stub wrapping an LZH payload; `bsdtar -xf creat.exe` unpacks it on macOS
with no extra tooling. Everything in `files/` came out of it.

For what any of this *means* — the model, the memory layout, the generation
algorithm — see [`../disassembly/README.md`](../disassembly/README.md). This
file is an inventory.

```
creat.exe      the shipped download, an LHA self-extracting archive
creatu1.jpg    contemporary screenshot — of a later build, see below
files/         the archive contents, as unpacked
forms/         the UI, decoded from the binary
fields/        the six saved fields, rendered
```

## `files/`

| file | what it is |
|---|---|
| `CREATURE.EXE` | the program: 692 KB, 16-bit **NE** (Windows 3.x), built with Delphi 1 |
| `SETUP.EXE`, `INST.EXE` | installer, also NE |
| `CTL3DV2.DL_` | MS-compressed (SZDD) copy of Microsoft's 3D control DLL |
| `STABLE`, `BIG`, `STARTUP`, `SEX`, `FISSION`, `RADIO` `.FLD` | six saved fields — the manual's worked examples |
| `STARTUP.INI`, `SETUP.INI` | settings, read over the compiled defaults at startup |
| `README.TXT` | the shipped release notes |

**Three things here are load-bearing**, not archival:

- `CREATURE.EXE` is what `../disassembly/` reads.
- The six `.FLD` files are regression fixtures for `../core/tests/fld.test.js`,
  which round-trips each one byte-identically, and the source for
  `../web/build-fields.js`, which embeds them in the browser build.
- `STARTUP.INI` names the twenty parameters in the order they appear in a
  `.FLD` header, which is how that mapping was confirmed rather than guessed.

Four of the six fields isolate a single mechanism — asexual division, sexual
reproduction, pure decay — which makes them diagnostic instruments rather than
just saved games. A model that cannot make `FISSION.FLD` grow past two rabbits
is missing something, whatever its population statistics say.

## `forms/`

The eight Delphi forms, decoded from the binary by
[`../disassembly/decode_form_resources.py`](../disassembly/decode_form_resources.py):
`Form1` (the main window), `ConfigBox`, `SplashScreen`, `AboutBox`,
`EPAboutDialogFm`, `SaveForm`, `PreviewForm`, `frmProtect`.

Every control with exact pixel geometry and captions, and the name of every
event handler — a labelled index of the program's behaviour, and what makes the
compiled code navigable at all. See "The forms" in
[`../disassembly/README.md`](../disassembly/README.md).

## `creatu1.jpg`

Worth a warning: the screenshot shows a **six**-slider layout, and the shipped
`Form1` has five. They are different builds, and the screenshot is the later
one. Where they disagree, the binary is authoritative about the artefact in
`files/` — but the browser reconstruction deliberately follows the screenshot,
because that is the version people remember. See `../web/README.md`.

## Running it

Useful when you want ground truth to compare against:

- **DOSBox-X** or **86Box** with Windows 3.11 or 95
- **Wine** — Win16 support was dropped from 64-bit Windows, but Wine still
  handles NE binaries

## Licensing

Commercial software. The material here is private reference; the
reimplementation is written from documented behaviour rather than by
transcribing anything shipped.
