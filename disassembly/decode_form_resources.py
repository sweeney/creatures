#!/usr/bin/env python3
"""Decode the Delphi 1 form resources embedded in the executable.

This is what makes the binary navigable, and it runs before any disassembly.
Delphi serialises each form into the .EXE as a binary DFM resource, and unlike
compiled code that format is *losslessly* decodable: it yields every control,
its exact geometry and properties, and the name of every event handler the form
binds. The compiled Pascal is gone; the program's skeleton is not.

Resources are found by scanning for the `TPF0` signature and parsed with Delphi
1's own TValueType ordering (below), which differs from later versions -- Delphi
1 is the only release that emitted 16-bit code, so a modern DFM reader will
mis-decode these.

    ./venv/bin/python decode_form_resources.py <exe> <outdir>
    ./venv/bin/python decode_form_resources.py ../original/files/CREATURE.EXE out/

Prints a table of what it found and writes one .dfm text file per form. The
eight recovered from CREATURE.EXE are checked in at ../original/forms/, and
what they establish is written up in README.md under "The forms" -- notably
that the shipped build has five sliders and four notebook pages.

The handler names it recovers are the input to resolve_method_addresses.py,
which turns each one into a code address.
"""
import struct, sys, os

# Delphi 1 TValueType ordering
NULL, LIST, INT8, INT16, INT32, EXTENDED, STRING, IDENT, FALSE, TRUE, \
    BINARY, SET, LSTRING, NIL, COLLECTION = range(15)


class R:
    def __init__(self, d, p=0):
        self.d, self.p = d, p

    def u8(self):
        v = self.d[self.p]; self.p += 1; return v

    def raw(self, n):
        v = self.d[self.p:self.p + n]; self.p += n; return v

    def sstr(self):
        return self.raw(self.u8()).decode('cp1252', 'replace')

    def lstr(self):
        n = struct.unpack_from('<I', self.d, self.p)[0]; self.p += 4
        return self.raw(n).decode('cp1252', 'replace')


def quote(s):
    """Delphi string literal, splitting unprintables into #NN escapes."""
    out, lit = [], ''
    for ch in s:
        o = ord(ch)
        if o < 32 or o > 126:
            if lit:
                out.append("'" + lit.replace("'", "''") + "'"); lit = ''
            out.append('#%d' % o)
        else:
            lit += ch
    if lit or not out:
        out.append("'" + lit.replace("'", "''") + "'")
    return ' + '.join(out)


def ext80(b):
    """80-bit x87 extended -> float."""
    m = int.from_bytes(b[:8], 'little')
    se = int.from_bytes(b[8:10], 'little')
    sign, exp = -1 if se >> 15 else 1, se & 0x7FFF
    if exp == 0 and m == 0:
        return 0.0
    try:
        return sign * m * 2.0 ** (exp - 16383 - 63)
    except OverflowError:
        return float('inf') * sign


def value(r, ind):
    t = r.u8()
    if t == NULL:     return 'nil'
    if t == INT8:     return str(struct.unpack('<b', r.raw(1))[0])
    if t == INT16:    return str(struct.unpack('<h', r.raw(2))[0])
    if t == INT32:    return str(struct.unpack('<i', r.raw(4))[0])
    if t == EXTENDED: return repr(ext80(r.raw(10)))
    if t == STRING:   return quote(r.sstr())
    if t == LSTRING:  return quote(r.lstr())
    if t == IDENT:    return r.sstr()
    if t == FALSE:    return 'False'
    if t == TRUE:     return 'True'
    if t == NIL:      return 'nil'
    if t == SET:
        items = []
        while True:
            s = r.sstr()
            if not s: break
            items.append(s)
        return '[' + ', '.join(items) + ']'
    if t == LIST:
        items = []
        while r.d[r.p] != NULL:
            items.append(value(r, ind))
        r.u8()
        return '(' + ' '.join(items) + ')'
    if t == COLLECTION:
        pad = '  ' * (ind + 1)
        out = ['<']
        while r.d[r.p] != NULL:
            if r.d[r.p] == LIST: r.u8()
            out.append(pad + 'item')
            out += props(r, ind + 2)
            out.append(pad + 'end')
        r.u8()
        out.append('  ' * ind + '>')
        return '\n'.join(out)
    if t == BINARY:
        n = struct.unpack_from('<I', r.d, r.p)[0]; r.p += 4
        b = r.raw(n)
        pad = '  ' * (ind + 1)
        hexs = b.hex().upper()
        lines = [pad + hexs[i:i + 64] for i in range(0, min(len(hexs), 64 * 8), 64)]
        if len(hexs) > 64 * 8:
            lines.append(pad + '... (%d bytes total)' % n)
        return '{\n' + '\n'.join(lines) + '\n' + '  ' * ind + '}'
    raise ValueError('bad value type %d at %#x' % (t, r.p - 1))


def props(r, ind):
    out, pad = [], '  ' * ind
    while True:
        name = r.sstr()
        if not name: break
        out.append('%s%s = %s' % (pad, name, value(r, ind)))
    return out


def obj(r, ind):
    cls, name = r.sstr(), r.sstr()
    pad = '  ' * ind
    kw = 'object' if ind == 0 else 'object'
    out = ['%s%s %s: %s' % (pad, kw, name, cls) if name else '%s%s %s' % (pad, kw, cls)]
    out += props(r, ind + 1)
    while r.d[r.p] != 0:
        out += obj(r, ind + 1)
    r.u8()
    out.append(pad + 'end')
    return out


def main(path, outdir):
    d = open(path, 'rb').read()
    os.makedirs(outdir, exist_ok=True)
    i, found = 0, []
    while True:
        i = d.find(b'TPF0', i)
        if i < 0: break
        r = R(d, i + 4)
        try:
            text = '\n'.join(obj(r, 0))
            cls = text.split(':')[-1].split('\n')[0].strip()
            name = text.split()[1].rstrip(':')
            fn = os.path.join(outdir, name + '.dfm')
            open(fn, 'w').write(text + '\n')
            found.append((name, cls, i, r.p - i, fn))
        except Exception as e:
            pass
        i += 4
    for n, c, off, sz, fn in found:
        print('%-18s %-20s @%#08x  %6d bytes -> %s' % (n, c, off, sz, fn))
    return found


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
