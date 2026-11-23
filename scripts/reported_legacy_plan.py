#!/usr/bin/env python3
"""Plan and batch prompts for the legacy-seed Reported batches (RP22…).

Writes content/bankgen/reported/plan-legacy.json (merge into plan.json once the finals exist,
because the builder requires plan.json and final/ to list the same batches) and prompts/RP22.md….
Usage: python3 -B scripts/reported_legacy_plan.py
"""
from __future__ import annotations
import json, math, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import bankgen as bg

TOPIC = 'reported'
EXTRA = 300


def main():
    sp = bg.spec_of(TOPIC)
    base = bg.base(TOPIC)
    plan = json.loads((base / 'plan.json').read_text())
    seeds = {}
    for line in (base / 'seeds/seeds-legacy.jsonl').read_text().splitlines():
        row = json.loads(line)
        seeds[row['seed_id']] = row
    cells = {c['id']: c for c in sp['cells']}
    need = {c: round(EXTRA * cells[c]['share']) for c in cells}
    need['R8'] += EXTRA - sum(need.values())
    n = max(int(b['batch'][2:]) for b in plan['batches'])
    batches, assign = [], {}
    for cid, count in need.items():
        k = max(1, math.ceil(count / 33))
        sizes = bg.largest_remainder(count, {i: 1 for i in range(k)})
        pool = [s['seed_id'] for s in seeds.values() if s['cell_hint'] == cid]
        for i in range(k):
            n += 1
            sz = sizes[i]
            fm = bg.largest_remainder(sz, cells[cid]['formats'] or bg.GENERIC_FORMATS)
            lv = bg.largest_remainder(sz, cells[cid].get('levels') or sp.get('levels', bg.LEVELS))
            bid = f'RP{n:02d}'
            batches.append(dict(batch=bid, cell=cid, size=sz, formats={f: v for f, v in fm.items() if v},
                                levels={f: v for f, v in lv.items() if v}))
            want = math.ceil(sz * 1.2)
            assign[bid] = pool[:want]
            pool = pool[want:]
    (base / 'plan-legacy.json').write_text(json.dumps(dict(topic=TOPIC, batches=batches), ensure_ascii=False, indent=1))
    ops, names, verbs = bg.used_context(TOPIC, set())
    d = base / 'prompts'
    for b in batches:
        sids = assign[b['batch']]
        body = '\n'.join(json.dumps({k: seeds[i][k] for k in ('seed_id', 'domain', 'place', 'who', 'situation', 'hooks', 'tone', 'register')},
                                    ensure_ascii=False) for i in sids)
        text = bg.BATCH_TEMPLATE.format(
            batch=b['batch'], cell=b['cell'], size=b['size'], formats=', '.join(f'{k} {v}' for k, v in b['formats'].items()),
            levels=', '.join(f'{k} {v}' for k, v in b['levels'].items()), guide=bg.cell_block(cells[b['cell']]), n=len(sids), seeds=body,
            ops=', '.join(f'«{o}»' for o, c in ops.most_common(40)) or '(none yet)',
            verbs=', '.join(v for v, c in verbs.most_common(25) if c >= 4) or '(none yet)',
            names=', '.join(sorted(names)[:60]) or '(none yet)', fmt_keys='/'.join(b['formats']))
        text = text.replace('Use the seed as the **idea**', 'Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea**')
        (d / f"{b['batch']}.md").write_text(text)
        print(b['batch'], b['cell'], b['size'], len(sids))
    print('total', sum(b['size'] for b in batches))


if __name__ == '__main__':
    main()
