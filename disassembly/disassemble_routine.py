#!/usr/bin/env python3
"""Disassemble a routine, resolving each call through its relocation record.

A 16-bit far call does not name its destination in the instruction stream: the
operand is a placeholder the loader patches from the segment's relocation
table. Disassembling alone therefore yields calls into nowhere. This resolves
each one, so a routine's outgoing edges are readable.

    ./venv/bin/python disassemble_routine.py <segment> <hex-offset> [count]
    ./venv/bin/python disassemble_routine.py 7 24f4 80

Sibling: annotate_routine.py, which adds recovered symbol names on top and
stops at the end of the function by itself.
"""
import struct
import sys
from capstone import Cs, CS_ARCH_X86, CS_MODE_16
from new_executable import load

d, ne, h, segs = load()
md = Cs(CS_ARCH_X86, CS_MODE_16)


def relocs(s):
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
            if seg == 0xFF:
                out[ordinal] = (d[p + 3], struct.unpack_from('<H', d, p + 4)[0])
                p += 6
            else:
                out[ordinal] = (seg, struct.unpack_from('<H', d, p + 1)[0])
                p += 3
            ordinal += 1
    return out


ET = entry_table()
MODNAMES = {}


def imported(t1, t2):
    """t1 = module ref index, t2 = ordinal or name offset."""
    base = ne + h['modref_off']
    if t1 * 2 + 2 > 4096:
        return None
    try:
        nameoff = struct.unpack_from('<H', d, base + (t1 - 1) * 2)[0]
        p = ne + h['impname_off'] + nameoff
        mod = d[p + 1:p + 1 + d[p]].decode('ascii', 'replace')
        return '%s.%d' % (mod, t2)
    except Exception:
        return None


def show(segn, start, count=200):
    s = segs[segn - 1]
    R = relocs(s)
    body = d[s['file_off']:s['file_off'] + s['len']]
    pos, shown = start, 0
    while shown < count and pos < len(body):
        chunk = body[pos:pos + 16]
        got = list(md.disasm(chunk, pos, count=1))
        if not got:
            print('  %04x  %-20s (bad)' % (pos, chunk[:4].hex(' ')))
            pos += 1
            continue
        i = got[0]
        note = ''
        # a relocation inside this instruction's bytes names the real target
        for k in range(i.size):
            r = R.get(i.address + k)
            if r:
                atype, rtype, t1, t2 = r
                if rtype & 3 == 0:                       # internal ref
                    if (t1 & 0xFF) == 0xFF:
                        tgt = ET.get(t2)
                        note = '  -> seg %d:%04x (ord %d)' % (
                            tgt[0], tgt[1], t2) if tgt else '  -> ord %d' % t2
                    else:
                        note = '  -> seg %d:%04x' % (t1 & 0xFF, t2)
                elif rtype & 3 == 1:                     # imported ordinal
                    note = '  -> %s' % (imported(t1, t2) or 'import %d.%d' % (t1, t2))
                break
        print('  %04x  %-22s %-8s %-24s%s'
              % (i.address, i.bytes.hex(' '), i.mnemonic, i.op_str, note))
        if i.mnemonic in ('ret', 'retf') and shown > 3:
            break
        pos = i.address + i.size
        shown += 1


if __name__ == '__main__':
    seg = int(sys.argv[1])
    off = int(sys.argv[2], 16)
    cnt = int(sys.argv[3]) if len(sys.argv) > 3 else 200
    print('seg %d:%04x' % (seg, off))
    show(seg, off, cnt)
