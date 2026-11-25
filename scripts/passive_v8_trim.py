#!/usr/bin/env python3
"""Retire the minimum number of passive items so no non-exempt verb exceeds max_verb_uses.
Prefers items from cells that are over their quota, then medium/advanced, never touches kept v6 (pv5-/pv6-) items."""
import json, re, collections
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
G = json.loads((ROOT/'docs/variety/passive-gates.json').read_text())
idx = json.loads((ROOT/'data/exercises/index.json').read_text())
parts = {d['file']: json.loads((ROOT/d['file']).read_text()) for d in idx['parts']}
items = [i for c in parts.values() for i in c if i.get('topic') == 'passive' and not i.get('retired')]
exempt = set(G['verb_exempt']); limit = G['max_verb_uses']
def verbs_of(i):
    out = []
    for b in i.get('blanks', []):
        cue = b.get('base_verb', '')
        m = re.findall(r'\bto\s+([a-z]+)', cue.lower())
        v = m[-1] if m else cue.lower().strip()
        if v and v not in exempt: out.append(v)
    return out
byverb = collections.defaultdict(list)
for i in items:
    for v in verbs_of(i): byverb[v].append(i)
n = len(items); cells = collections.Counter(i.get('cell', 'D1') for i in items)
over_cell = lambda i: cells[i.get('cell', 'D1')] / n - G['cell_shares'][i.get('cell', 'D1')]
lvl = {'basic': 0, 'medium': 1, 'advanced': 2}
retire = set()
for _ in range(10):
    changed = False
    for v, lst in sorted(byverb.items()):
        live = [i for i in lst if i['id'] not in retire]
        excess = len(live) - limit  # one entry per blank, so an item with two blanks counts twice
        excess = len(set(i['id'] for i in live)) - limit if len(set(i['id'] for i in live)) == len(live) else excess
        if excess <= 0: continue
        cand = [i for i in live if i['id'].startswith('pv7-')]
        # prefer: cell above its quota, items carrying several flagged verbs, higher level (cheaper to lose), then id
        cand.sort(key=lambda i: (-over_cell(i), -len(verbs_of(i)), -lvl.get(i.get('level'), 0), i['id']))
        for i in cand[:excess]: retire.add(i['id']); changed = True
    if not changed: break
for c in parts.values():
    for i in c:
        if i['id'] in retire: i['retired'] = 'passive-v8-variety'
for f, c in parts.items():
    (ROOT/f).write_text(json.dumps(c, ensure_ascii=False, indent=2) + '\n')
print('retired for verb variety:', len(retire), sorted(retire))
