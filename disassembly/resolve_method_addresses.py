#!/usr/bin/env python3
"""Turn Delphi's published-method names into real code addresses.

This is what makes the binary navigable without symbols. Delphi resolves an
event handler such as `OnTimer = Timer1Timer` by *name* at load time, so every
published method sits in its class's method table as an address followed by the
name in plain text. Recovering the address gives a named entry point into the
code for every button, menu item and timer in the program.

The address is not stored directly. The method table holds FF FF 00 00 -- an NE
relocation placeholder the loader patches -- and because these segments are
MOVEABLE the relocation record names an entry-table ordinal rather than a
segment. So the walk is four hops:

    method name  ->  file offset of its FF FF placeholder
                 ->  relocation record at that segment offset
                 ->  entry table ordinal
                 ->  (segment, offset) of the code

    ./venv/bin/python resolve_method_addresses.py

Prints the table and writes resolved_methods.json beside this script.
"""
import json
import os
import struct
from new_executable import load

d, ne, h, segs = load()


def relocs(s):
    """Relocation records for a segment, keyed by the offset they patch."""
    if not s['reloc']:
        return {}
    p = s['file_off'] + s['len']
    n = struct.unpack_from('<H', d, p)[0]
    out = {}
    for i in range(n):
        rec = d[p + 2 + i * 8: p + 10 + i * 8]
        if len(rec) < 8:
            break
        atype, rtype, off, t1, t2 = struct.unpack('<BBHHH', rec)
        out[off] = (atype, rtype, t1, t2)
    return out


def entry_table():
    """Ordinal -> (segment, offset)."""
    p = ne + h['entry_off']
    out, ordinal = {}, 1
    while True:
        cnt = d[p]
        if cnt == 0:
            break
        seg = d[p + 1]
        p += 2
        if seg == 0:
            ordinal += cnt
            continue
        for _ in range(cnt):
            if seg == 0xFF:            # movable
                flags = d[p]
                off = struct.unpack_from('<H', d, p + 4)[0]
                sg = d[p + 3]
                out[ordinal] = (sg, off)
                p += 6
            else:                      # fixed
                off = struct.unpack_from('<H', d, p + 1)[0]
                out[ordinal] = (seg, off)
                p += 3
            ordinal += 1
    return out


ET = entry_table()
print('entry table: %d ordinals\n' % len(ET))

# Walk the method table: repeating  FF FF 00 00 <len> <name>
NAMES = ['Timer1Timer', 'Timer2Timer', 'DelayTimerTimer', 'DisasterTimerTimer',
         'FieldonScreenPaint', 'FieldonScreenMouseDown', 'btnStartClick',
         'BtnOneGenClick', 'mnuPopulateClick', 'mnuClearFieldClick',
         'FormCreate',
         # the Disasters menu
         'FireinForest1Click', 'Diseasespreadsthroughrabbits1Click',
         'OverhuntingofFoxes1Click', 'NuclearWinter1Click',
         'Asteroidhitsearthdustinatmosphere1Click',
         'mnuAddDiseasedRabbitClick', 'mnuPopulateClick',
         'ReverttointernalDefaults1Click', 'mnuSetFieldSizeClick',
         'mnuFastClick', 'mnuMediumClick', 'mnuSlowClick',
         'SpeedSliderChange', 'DelayTimerTimer']

seg1 = segs[0]
R = relocs(seg1)
print('segment 1 has %d relocation records\n' % len(R))

print('%-24s %-10s %-8s %s' % ('method', 'placeholder', 'ordinal', 'code at'))
print('-' * 62)
resolved = {}
for name in NAMES:
    pat = b'\xff\xff\x00\x00' + bytes([len(name)]) + name.encode()
    i = d.find(pat)
    if i < 0:
        print('%-24s %s' % (name, '(no placeholder)'))
        continue
    segoff = i - seg1['file_off']          # offset of the FF FF within seg 1
    rec = R.get(segoff)
    if not rec:
        print('%-24s %#-10x %s' % (name, i, '(no reloc at %#x)' % segoff))
        continue
    atype, rtype, t1, t2 = rec
    if (t1 & 0xFF) == 0xFF:
        tgt = ET.get(t2)
    else:
        tgt = (t1 & 0xFF, t2)
    if tgt:
        sg, off = tgt
        fo = segs[sg - 1]['file_off'] + off if sg <= len(segs) else None
        print('%-24s %#-10x %-8s seg %d:%04x  file %#x'
              % (name, i, t2 if (t1 & 0xFF) == 0xFF else '-', sg, off, fo))
        resolved[name] = (sg, off, fo)
    else:
        print('%-24s %#-10x %s' % (name, i, 'unresolved %r' % (rec,)))

# Beside this script, not beside the caller's working directory.
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   'resolved_methods.json')
open(OUT, 'w').write(json.dumps(resolved, indent=1, sort_keys=True))
print('\nresolved %d methods -> %s' % (len(resolved), os.path.basename(OUT)))
