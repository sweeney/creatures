#!/usr/bin/env python3
"""Disassemble one routine and substitute every symbol recovered so far.

Raw hex is slow to read. This names the globals and helper routines already
identified, detects the end of the function, and marks branch targets, so a
whole routine can be read in one pass.

    ./venv/bin/python annotate_routine.py 7 24f4          # dump a function
    ./venv/bin/python annotate_routine.py 7 24f4 --raw    # no substitutions

Always confirm a finding against `--raw` before trusting it. A substitution is
a claim about what an address means, and a wrong claim reads as fluently as a
right one -- several findings in README.md turned on re-reading the bytes.

Sibling: disassemble_routine.py, the same dump without any symbol layer.
"""
import re
import struct
import sys
from capstone import Cs, CS_ARCH_X86, CS_MODE_16
from new_executable import load

d, ne, h, segs = load()
md = Cs(CS_ARCH_X86, CS_MODE_16)

# --- symbols recovered from the data segment and from reading the code ------

DATA = {
    0x21a: 'BORDER',        # 0xA0
    0x21b: 'EMPTY',         # 0
    0x21c: 'GRASS',         # 1
    0x21d: 'RABBIT',        # 2
    0x21e: 'FOX',           # 4
    0x21f: 'DISEASED',      # 8
    0x220: 'RABBIT_GRASS',  # 3
    0x221: 'FOX_GRASS',     # 5
    0x224: 'ANIMAL_MASK',   # 0x0E = rabbit|fox|diseased
    0x226: 'FIELD_SIZE',    # 50
    0x310: 'nRabbits?',
    0x312: 'nFoxes?',
    0x314: 'nGrass?',
    0x316: 'generation',
    0x171e: 'candidates[]',
    0x19ca: 'FIELD_CUR',
    0x340e: 'FIELD_NEXT',
    0x4e52: 'FIELD_TMP',
}

FUNCS = {
    (7, 0x1814): 'Random_n',
    (7, 0x182b): 'BuildCandidateList',
    (7, 0x1e00): 'FindAdjacent',
    (7, 0x2169): 'AnimalPass',
    (7, 0x24f4): 'RabbitPass',
    (7, 0x28f7): 'DoGeneration',
    (7, 0x1fc8): 'Pass_1fc8',
    (7, 0x1a41): 'Fn_1a41',
    (7, 0x15e3): 'Fn_15e3',
    (18, 0x1c25): 'Move',
    (18, 0x1a5e): 'Random',
    (17, 0x0775): 'Str',
    (14, 0x1d8c): 'SetText',
}


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


def subst(op):
    """Replace known data offsets with names."""
    def rep(m):
        v = int(m.group(1), 16)
        return DATA.get(v, m.group(0))
    op = re.sub(r'\[(0x[0-9a-f]+)\]', lambda m: '[%s]' % rep(m), op)
    op = re.sub(r'\+ (0x[0-9a-f]+)\]',
                lambda m: '+ %s]' % DATA.get(int(m.group(1), 16), m.group(1)), op)
    return op


def dump(segn, start, limit=400, raw=False):
    s = segs[segn - 1]
    R = relocs(s)
    body = d[s['file_off']:s['file_off'] + s['len']]
    name = FUNCS.get((segn, start), 'sub_%04x' % start)
    print('; ---- %s  (seg %d:%04x) ----' % (name, segn, start))

    # first pass: collect local branch targets so we can label them
    targets, pos, n = set(), start, 0
    while n < limit and pos < len(body):
        got = list(md.disasm(body[pos:pos + 16], pos, count=1))
        if not got:
            pos += 1
            continue
        i = got[0]
        if i.mnemonic.startswith('j') or i.mnemonic == 'call':
            m = re.match(r'^0x([0-9a-f]+)$', i.op_str)
            if m:
                targets.add(int(m.group(1), 16))
        if i.mnemonic in ('ret', 'retf') and n > 2:
            break
        pos = i.address + i.size
        n += 1

    pos, n = start, 0
    while n < limit and pos < len(body):
        got = list(md.disasm(body[pos:pos + 16], pos, count=1))
        if not got:
            print('  %04x   (data %s)' % (pos, body[pos:pos + 2].hex()))
            pos += 1
            continue
        i = got[0]
        op = i.op_str if raw else subst(i.op_str)
        note = ''
        for k in range(i.size):
            r = R.get(i.address + k)
            if r:
                atype, rtype, t1, t2 = r
                if rtype & 3 == 0:
                    tgt = ET.get(t2) if (t1 & 0xFF) == 0xFF else (t1 & 0xFF, t2)
                    if tgt:
                        note = '  ; -> %s' % FUNCS.get(
                            tgt, 'seg %d:%04x' % tgt)
                break
        m = re.match(r'^0x([0-9a-f]+)$', i.op_str)
        if m and i.mnemonic == 'call':
            t = int(m.group(1), 16)
            note = '  ; -> %s' % FUNCS.get((segn, t), 'sub_%04x' % t)
        label = 'L%04x:' % i.address if i.address in targets else ''
        print('  %-7s %04x   %-7s %-34s%s' % (label, i.address, i.mnemonic, op, note))
        if i.mnemonic in ('ret', 'retf') and n > 2:
            break
        pos = i.address + i.size
        n += 1


if __name__ == '__main__':
    seg = int(sys.argv[1])
    off = int(sys.argv[2], 16)
    lim = 400
    raw = '--raw' in sys.argv
    for a in sys.argv[3:]:
        if a.isdigit():
            lim = int(a)
    dump(seg, off, lim, raw)
