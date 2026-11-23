#!/usr/bin/env python3
"""Turn the best retired Reported Speech tasks into scenario seeds for the bank factory.

The old tasks are not published as they are: each becomes a seed (rl-NNNN) and is rewritten by the
model into the new task formats. Selection: lexically simple, no near duplicates of the live bank
or of each other, and per-cell counts that lift the live bank from 700 to 1000 tasks.

Usage: python3 -B scripts/reported_legacy_seeds.py
"""
from __future__ import annotations
import collections, json, math, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lexical_audit as la
from bankgen_specs import SPECS

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'content/bankgen/reported/seeds/seeds-legacy.jsonl'
CELL_OF = {'rs02': 'R1', 'rs03': 'R1', 'rs04': 'R2', 'rs05': 'R3', 'rs06': 'R3', 'rs07': 'R3',
           'rs09': 'R4', 'rs10': 'R4', 'rs11': 'R5', 'rs12': 'R5', 'rs13': 'R5', 'rs15': 'R5',
           'rs14': 'R6', 'rs16': 'R6', 'rs17': 'R6', 'rs18': 'R6', 'rs19': 'R6',
           'rs08': 'R7', 'rs20': 'R7', 'rs01': 'R9', 'rs_mixed': 'R8'}
EXTRA = 300
SPARE = 1.2   # a few more seeds than tasks so the model can drop awkward ones


def key(text):
    return ' '.join(re.findall(r'[a-z]+', text.lower()))


def tokens(text):
    return set(re.findall(r'[a-z]{3,}', text.lower()))


def main():
    cells = {c['id']: c for c in SPECS['reported']['cells']}
    need = {c: round(EXTRA * cells[c]['share']) for c in cells}
    need['R8'] += EXTRA - sum(need.values())
    items = la.load_items('reported', include_retired=True)
    live = [x for _, x in items if not x.get('retired')]
    old = [x for _, x in items if x.get('retired') and x['type'] in ('direct_to_reported', 'open_brackets')]
    names = la.find_names(items)
    live_tokens = [tokens(x['prompt'] + ' ' + x.get('answer_text', '')) for x in live]
    live_keys = {key(x['prompt']) for x in live}
    picked, taken = collections.defaultdict(list), []
    rank = {'basic': 0, 'medium': 1, 'advanced': 2}
    for x in sorted(old, key=lambda x: (rank[x['level']], x['id'])):
        cell = CELL_OF.get(x['tags'][0])
        if not cell:
            continue
        hw = la.hard_words(x, names)
        if la.over_limit(x, hw):
            continue
        text = x['prompt'] + ' ' + x.get('answer_text', '')
        tk = tokens(text)
        if key(x['prompt']) in live_keys:
            continue
        if any(len(tk & t) / max(1, len(tk | t)) > .5 for t in live_tokens + taken):
            continue
        picked[cell].append(x)
        taken.append(tk)
    rows, counter = [], 0
    for cell in sorted(cells):
        want = math.ceil(need[cell] * SPARE)
        pool = picked[cell]
        if len(pool) < need[cell]:
            print(f'WARN {cell}: only {len(pool)} usable legacy tasks, need {need[cell]}')
        # spread over levels and over the original sub-topics
        by = collections.defaultdict(list)
        for x in pool:
            by[(x['tags'][0], x['level'])].append(x)
        chosen = []
        while len(chosen) < min(want, len(pool)) and any(by.values()):
            for k in sorted(by):
                if by[k] and len(chosen) < want:
                    chosen.append(by[k].pop(0))
        for x in chosen:
            counter += 1
            reported = x.get('answer_text') or ''
            rows.append(dict(
                seed_id=f'rl-{counter:04d}', domain='everyday life', place='an ordinary place',
                who='the people in the example', cell_hint=cell, level_hint=x['level'],
                situation=f"Source example (rewrite it in new words, keep the grammar point): {x['prompt']} → {reported}",
                hooks=[cells[cell]['hooks'][0]], tone='neutral', register='dialogue'))
        print(cell, 'need', need[cell], 'pool', len(pool), 'seeds', len(chosen))
    OUT.write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in rows))
    print('wrote', len(rows), 'seeds to', OUT.relative_to(ROOT))


if __name__ == '__main__':
    main()
