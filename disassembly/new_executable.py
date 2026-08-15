#!/usr/bin/env python3
"""Parse the NE (New Executable) container and expose its segments.

Every other script here imports `load()` from this one. NE is the 16-bit
Windows executable format: a DOS stub, then a second header giving the segment
table, the entry table and the per-segment relocation records. There are no
symbols, so nothing in the file says where the simulation lives.

It is findable anyway, because the field format pins down several constants
distinctive enough to serve as a fingerprint:

    0xA0 (160)    the border sentinel written around the live field
    82 / 81 / 83  the Moore-neighbourhood offsets in the 82-wide array
    1 / 2 / 4     the grass / rabbit / fox bits

Code that compares a byte against 0xA0 and indexes at +-82 is the neighbour
scan. Everything else follows from there.

    ./venv/bin/python new_executable.py    # print the header and segment map
"""
import os
import struct
import sys

PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                    'original', 'files', 'CREATURE.EXE')


def load():
    d = open(PATH, 'rb').read()
    ne = struct.unpack_from('<I', d, 0x3c)[0]
    assert d[ne:ne + 2] == b'NE', d[ne:ne + 2]
    h = {
        'entry_off': struct.unpack_from('<H', d, ne + 0x04)[0],
        'cs_ip': struct.unpack_from('<I', d, ne + 0x14)[0],
        'nsegs': struct.unpack_from('<H', d, ne + 0x1c)[0],
        'nmods': struct.unpack_from('<H', d, ne + 0x1e)[0],
        'seg_off': struct.unpack_from('<H', d, ne + 0x22)[0],
        'res_off': struct.unpack_from('<H', d, ne + 0x24)[0],
        'resname_off': struct.unpack_from('<H', d, ne + 0x26)[0],
        'modref_off': struct.unpack_from('<H', d, ne + 0x28)[0],
        'impname_off': struct.unpack_from('<H', d, ne + 0x2a)[0],
        'align': struct.unpack_from('<H', d, ne + 0x32)[0],
    }
    shift = h['align'] or 9
    segs = []
    base = ne + h['seg_off']
    for i in range(h['nsegs']):
        off, ln, flags, minalloc = struct.unpack_from('<HHHH', d, base + i * 8)
        segs.append({
            'n': i + 1,
            'file_off': off << shift,
            'len': ln if ln else 0x10000,
            'flags': flags,
            'code': not (flags & 1),
            'reloc': bool(flags & 0x100),
        })
    return d, ne, h, segs


def main():
    d, ne, h, segs = load()
    print('NE header at %#x   segments=%d  align=1<<%d  CS:IP=%08x'
          % (ne, h['nsegs'], h['align'], h['cs_ip']))
    print('\n%-4s %-10s %-8s %-6s %s' % ('seg', 'file_off', 'len', 'type', 'flags'))
    total_code = 0
    for s in segs:
        print('%-4d %#-10x %-8d %-6s %#06x%s'
              % (s['n'], s['file_off'], s['len'],
                 'CODE' if s['code'] else 'data', s['flags'],
                 '  reloc' if s['reloc'] else ''))
        if s['code']:
            total_code += s['len']
    print('\ntotal code: %d bytes across %d segments'
          % (total_code, sum(1 for s in segs if s['code'])))

    # Where does the border sentinel 0xA0 get compared, and where do the
    # neighbour strides appear? Search code segments only.
    print('\nscanning code segments for the automaton\'s constants...')
    hits = {}
    for s in segs:
        if not s['code']:
            continue
        body = d[s['file_off']:s['file_off'] + s['len']]
        for name, pat in (
            ('cmp al,0A0h', b'\x3c\xa0'),
            ('cmp byte,0A0h', b'\x80\x3e'),
            ('mov ?,0A0h', b'\xb0\xa0'),
            ('imm 82 (stride)', b'\x52\x00'),
            ('imm 81', b'\x51\x00'),
            ('imm 83', b'\x53\x00'),
        ):
            n = body.count(pat)
            if n:
                hits.setdefault(s['n'], {})[name] = n
    for segn, counts in sorted(hits.items()):
        print('  seg %-3d %s' % (segn, counts))


if __name__ == '__main__':
    main()
