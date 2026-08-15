#!/usr/bin/env python3
"""Report how much of a segment has actually been decoded, in bytes.

Enumerates every routine in a segment two ways -- by prologue (`enter`, or the
`push bp / mov bp, sp` form the shorter routines use) and by the target of any
local `call` -- then splits them into the ones named in the symbol map and the
ones still anonymous, with a byte count for each.

The byte count is the point. Counting *routines* flatters the result, because
the unread remainder is usually a few large routines rather than many small
ones. Counting bytes is the honest answer to "are we finished".

    ./venv/bin/python coverage_report.py [segment]     # default: segment 7
"""
import sys
from capstone import Cs, CS_ARCH_X86, CS_MODE_16
from new_executable import load

# name, and whether it is simulation ('sim') or supporting code ('io').
NAMED = {
    0x0002: ('unit init helper', 'io'),
    0x029c: ('LoadField (.FLD)', 'io'),
    0x056d: ('  ...LoadField handler', 'io'),
    0x0609: ('SaveField (.FLD)', 'io'),
    0x093c: ('  ...SaveField handler', 'io'),
    0x0a7d: ('LoadSettings (TIniFile)', 'io'),
    0x0e7c: ('SaveSettings (TIniFile)', 'io'),
    0x1376: ('SetDefaultParameters', 'sim'),
    0x14b4: ('string/path helper', 'io'),
    0x151f: ('dispose', 'io'),
    0x1550: ('canvas setup', 'io'),
    0x15e3: ('DrawField + counts', 'io'),
    0x1814: ('Random_n', 'sim'),
    0x182b: ('BuildCandidateList', 'sim'),
    0x1a41: ('CountFree', 'sim'),
    0x1c47: ('PlaceOffspring', 'sim'),
    0x1e00: ('FindAdjacent', 'sim'),
    0x1fc8: ('GrassPass', 'sim'),
    0x2169: ('AnimalPass', 'sim'),
    0x24f4: ('DiseasePass', 'sim'),
    0x28f7: ('DoGeneration', 'sim'),
    0x2b79: ('SetBorders', 'sim'),
    0x2c31: ('ClearField', 'sim'),
    0x2d00: ('CountPopulations', 'sim'),
    0x2dcd: ('AddDiseasedRabbit', 'sim'),
}


def main():
    segn = int(sys.argv[1]) if len(sys.argv) > 1 else 7
    d, ne, h, segs = load()
    s = segs[segn - 1]
    body = d[s['file_off']:s['file_off'] + s['len']]
    md = Cs(CS_ARCH_X86, CS_MODE_16)

    starts, calls, ins = set(), set(), {}
    pos = 0
    while pos < len(body):
        got = 0
        for i in md.disasm(body[pos:], pos):
            got += 1
            ins[i.address] = i
            if i.mnemonic == 'enter':
                starts.add(i.address)
            if i.mnemonic == 'push' and i.op_str == 'bp':
                nxt = i.address + i.size
                for j in md.disasm(body[nxt:nxt + 4], nxt, count=1):
                    if j.mnemonic == 'mov' and j.op_str == 'bp, sp':
                        starts.add(i.address)
            if i.mnemonic == 'call' and i.op_str.startswith('0x'):
                try:
                    calls.add(int(i.op_str, 16))
                except ValueError:
                    pass
            pos = i.address + i.size
        if got == 0:
            pos += 1
        elif pos < len(body):
            pos += 1

    # Entry points recovered from the relocation table (see the note in
    # README.md) -- these routines are reached by far call and have prologues
    # the linear scan does not recognise.
    starts |= set(NAMED)
    bounds = sorted(starts | calls)
    # Everything before the first detected routine is unread too -- omitting it
    # would flatter the percentage.
    if bounds and bounds[0] != 0:
        bounds.insert(0, 0)
    print('segment %d: %d bytes, %d routine entries found'
          % (segn, s['len'], len(bounds)))
    print('  (%d by prologue, %d additional call targets)\n'
          % (len(starts), len(calls - starts)))

    sim_bytes = io_bytes = unknown_bytes = 0
    rows = []
    for k, a in enumerate(bounds):
        end = bounds[k + 1] if k + 1 < len(bounds) else s['len']
        size = end - a
        entry = NAMED.get(a)
        if entry and entry[1] == 'sim':
            sim_bytes += size
        elif entry:
            io_bytes += size
        else:
            unknown_bytes += size
        rows.append((a, end, size, entry))

    print('%-8s %-8s %-7s %-5s %s' % ('start', 'end', 'bytes', 'kind', 'routine'))
    print('-' * 66)
    for a, end, size, entry in rows:
        name = entry[0] if entry else '** not yet read **'
        kind = entry[1] if entry else '?'
        print('%-8s %-8s %-7d %-5s %s' % ('%04x' % a, '%04x' % end, size, kind, name))

    total = sim_bytes + io_bytes + unknown_bytes
    print('\nsimulation      %6d bytes  %5.1f%%' % (sim_bytes, 100 * sim_bytes / total))
    print('file I/O, UI    %6d bytes  %5.1f%%' % (io_bytes, 100 * io_bytes / total))
    print('unread          %6d bytes  %5.1f%%' % (unknown_bytes, 100 * unknown_bytes / total))
    print('\nidentified      %6d bytes  %5.1f%%'
          % (sim_bytes + io_bytes, 100 * (sim_bytes + io_bytes) / total))


if __name__ == '__main__':
    main()
