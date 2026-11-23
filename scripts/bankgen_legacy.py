#!/usr/bin/env python3
"""Turn the best old live tasks of a topic into seeds + extra batches for the bank factory.

Generalised from reported_legacy_seeds.py / reported_legacy_plan.py. The old tasks are not kept as
they are: each becomes a seed (<x>l-NNNN) that the model rewrites into the new formats.
Usage: python3 -B scripts/bankgen_legacy.py <topic> <extra_tasks> [batch_cap=35]
Writes seeds/seeds-legacy.jsonl, plan-legacy.json and prompts/<NEXT>.md… for the new batches.
"""
from __future__ import annotations
import collections, json, math, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bankgen as bg
import lexical_audit as la
from bankgen_specs import SPECS

ROOT = Path(__file__).resolve().parents[1]
CELL_OF = {
    'nouns': {'noun_count_uncount': 'N1', 'noun_partitives': 'N1', 'noun_articles': 'N2',
              'noun_plural_regular': 'N3', 'noun_plural_irregular': 'N3', 'noun_number_only': 'N3',
              'noun_dual_meaning': 'N3', 'noun_collective': 'N3', 'noun_possessive': 'N4',
              'noun_quantifiers': 'N5', 'noun_compound': 'N6', 'noun_attributive': 'N6',
              'noun_text': 'N7', 'noun_mixed': 'N7'},
}
SEED_PREFIX = {'nouns': 'nl'}


def key(t):
    return ' '.join(re.findall(r'[a-z]+', t.lower()))


def toks(t):
    return set(re.findall(r'[a-z]{3,}', t.lower()))


def main():
    topic, extra = sys.argv[1], int(sys.argv[2])
    cap = int(sys.argv[3]) if len(sys.argv) > 3 else 35
    sp = SPECS[topic]
    base = bg.base(topic)
    cells = {c['id']: c for c in sp['cells']}
    need = {c: round(extra * cells[c]['share']) for c in cells}
    need[max(need, key=need.get)] += extra - sum(need.values())
    cmap = CELL_OF[topic]
    names_pool = la.find_names(la.load_items(topic, include_retired=True))
    final_text = []
    for f in sorted((base / 'final').glob('*.jsonl')):
        for line in f.read_text().splitlines():
            if line.startswith('{'):
                final_text.append(toks(json.loads(line)['prompt']))
    old = [x for _, x in la.load_items(topic, include_retired=True) if not x.get('bankgen_id')]
    rank = {'basic': 0, 'medium': 1, 'advanced': 2}
    picked, taken = collections.defaultdict(list), []
    for x in sorted(old, key=lambda x: (rank[x['level']], x['id'])):
        cell = next((cmap[t] for t in x.get('tags', []) if t in cmap), None)
        if not cell or x['type'] == 'translation_ru_en':
            continue
        if la.over_limit(x, la.hard_words(x, names_pool)):
            continue
        text = (x.get('answer_text') or x['prompt'])
        tk = toks(text)
        if any(len(tk & t) / max(1, len(tk | t)) > .5 for t in final_text + taken):
            continue
        picked[cell].append((x, text))
        taken.append(tk)
    # Cells whose old pool is too small give their shortfall to the cells with the biggest spare pool.
    short = 0
    for cid in cells:
        cap_ = int(len(picked[cid]) / 1.08)
        if cap_ < need[cid]:
            short += need[cid] - cap_
            need[cid] = cap_
    while short:
        spare = {c: int(len(picked[c]) / 1.2) - need[c] for c in cells}
        best = max(spare, key=lambda c: spare[c] / (need[c] + 1))
        if spare[best] <= 0:
            print('WARN: not enough usable old tasks, total lowered by', short)
            break
        need[best] += 1
        short -= 1
    seeds, n = [], 0
    for cid in sorted(cells):
        pool = picked[cid]
        if len(pool) < need[cid]:
            print(f'WARN {cid}: only {len(pool)} usable old tasks, need {need[cid]}')
        by = collections.defaultdict(list)
        for x, t in pool:
            by[(x['tags'][0], x['level'])].append((x, t))
        chosen, want = [], min(len(pool), math.ceil(need[cid] * 1.2))
        while len(chosen) < min(want, len(pool)) and any(by.values()):
            for k in sorted(by):
                if by[k] and len(chosen) < want:
                    chosen.append(by[k].pop(0))
        for x, t in chosen:
            n += 1
            seeds.append(dict(seed_id=f'{SEED_PREFIX[topic]}-{n:04d}', domain='everyday life', place='an ordinary place',
                              who='the people in the example', cell_hint=cid, level_hint=x['level'],
                              situation=f'Source example (rewrite it in new words, keep the grammar point): {t}',
                              hooks=[cells[cid]['hooks'][0]], tone='neutral', register='dialogue'))
        print(cid, 'need', need[cid], 'pool', len(pool), 'seeds', len(chosen))
    (base / 'seeds/seeds-legacy.jsonl').write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in seeds))
    # plan + prompts
    plan = json.loads((base / 'plan.json').read_text())
    code = re.match(r'[A-Z]+', plan['batches'][0]['batch']).group(0)
    num = max(int(b['batch'][len(code):]) for b in plan['batches'])
    byid = {s['seed_id']: s for s in seeds}
    batches, assign = [], {}
    for cid, count in need.items():
        k = max(1, math.ceil(count / cap))
        sizes = bg.largest_remainder(count, {i: 1 for i in range(k)})
        pool = [s['seed_id'] for s in seeds if s['cell_hint'] == cid]
        for i in range(k):
            num += 1
            sz = sizes[i]
            fm = bg.largest_remainder(sz, cells[cid]['formats'] or bg.GENERIC_FORMATS)
            lv = bg.largest_remainder(sz, cells[cid].get('levels') or sp.get('levels', bg.LEVELS))
            bid = f'{code}{num:02d}'
            batches.append(dict(batch=bid, cell=cid, size=sz, formats={f: v for f, v in fm.items() if v},
                                levels={f: v for f, v in lv.items() if v}))
            w = math.ceil(sz * 1.2)
            assign[bid], pool = pool[:w], pool[w:]
    (base / 'plan-legacy.json').write_text(json.dumps(dict(topic=topic, batches=batches), ensure_ascii=False, indent=1))
    ops, names, verbs = bg.used_context(topic, set())
    for b in batches:
        sids = assign[b['batch']]
        body = '\n'.join(json.dumps({k: byid[i][k] for k in ('seed_id', 'domain', 'place', 'who', 'situation', 'hooks', 'tone', 'register')},
                                    ensure_ascii=False) for i in sids)
        text = bg.BATCH_TEMPLATE.format(
            batch=b['batch'], cell=b['cell'], size=b['size'], formats=', '.join(f'{k} {v}' for k, v in b['formats'].items()),
            levels=', '.join(f'{k} {v}' for k, v in b['levels'].items()), guide=bg.cell_block(cells[b['cell']]), n=len(sids), seeds=body,
            ops=', '.join(f'«{o}»' for o, c in ops.most_common(40)) or '(none yet)',
            verbs=', '.join(v for v, c in verbs.most_common(25) if c >= 4) or '(none yet)',
            names=', '.join(sorted(names)[:60]) or '(none yet)', fmt_keys='/'.join(b['formats']))
        text = text.replace('Use the seed as the **idea**', 'Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea**')
        (base / 'prompts' / f"{b['batch']}.md").write_text(text)
        print(b['batch'], b['cell'], b['size'], len(sids))
    print('total', sum(b['size'] for b in batches))


if __name__ == '__main__':
    main()
