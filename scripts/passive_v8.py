#!/usr/bin/env python3
"""Passive Voice v8: level-correct bank. Plan, Gemini prompts, strict validation, finalising.

  python3 -B scripts/passive_v8.py archive            # move v7 raw/final/prompts out of the way (once)
  python3 -B scripts/passive_v8.py keep               # choose old v6 items that really fit a level -> keep-v6.txt, levels-v6.json
  python3 -B scripts/passive_v8.py plan               # slots + plan.json (docs/variety/passive-v7/plan.json is overwritten)
  python3 -B scripts/passive_v8.py prompts [BN01 ...] # per-batch prompts + combined ATTACH files
  python3 -B scripts/passive_v8.py validate [BN01 ..] # level contract + structure; reports + repair prompts
  python3 -B scripts/passive_v8.py finalize BN01 [--drop BN01-07,BN01-09]
  python3 -B scripts/passive_v8.py status             # final counts against quotas

Needs: pip install wordfreq cefrpy
"""
from __future__ import annotations
import collections, json, math, random, re, shutil, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import passive_v7 as pv7                      # noqa: E402  (schema check, helpers)
import passive_level_audit as L               # noqa: E402

ROOT = HERE.parent
DOC7 = ROOT / 'docs/variety/passive-v7'
DOC = ROOT / 'docs/variety/passive-v8'
BANK = ROOT / 'content/passive-bank/v7'
LEVELS = ['basic', 'medium', 'advanced']
CELLS = [f'D{i}' for i in range(1, 12)]

# New items to generate (old v6 items kept by `keep` count towards D1 on top of this)
QUOTA = {
    'basic':    {'D1': 188, 'D2': 76, 'D3': 27, 'D10': 18, 'D11': 23},
    'medium':   {'D1': 50, 'D2': 80, 'D3': 34, 'D4': 21, 'D6': 34, 'D7': 17, 'D8': 13, 'D9': 17, 'D10': 17, 'D11': 21},
    'advanced': {'D1': 9, 'D2': 50, 'D3': 27, 'D4': 24, 'D5': 24, 'D6': 18, 'D7': 21, 'D8': 15, 'D9': 12, 'D10': 9, 'D11': 12},
}
ALLOWED_FMT = {'D1': ['gap', 'mini', 'mc', 'fix'], 'D2': ['gap', 'mini', 'mc', 'fix', 'which'], 'D3': ['gap', 'mc', 'fix'],
               'D4': ['gap', 'mc', 'fix'], 'D5': ['gap', 'mc', 'fix'], 'D6': ['gap', 'mc', 'fix'],
               'D7': ['gap', 'mc', 'which', 'fix'], 'D8': ['gap', 'mc', 'fix'], 'D9': ['gap', 'mc', 'which', 'fix'],
               'D10': ['mc', 'gap', 'fix'], 'D11': ['gap', 'mc', 'fix']}
FMT_MIX = {'basic': dict(gap=.55, mini=.17, mc=.20, fix=.05, which=.03),
           'medium': dict(gap=.48, mini=.22, mc=.18, fix=.07, which=.05),
           'advanced': dict(gap=.40, mini=.26, mc=.16, fix=.10, which=.08)}
DOMAINS = ['home and family', 'school lessons', 'university', 'office work', 'a job interview', 'bus or train',
           'airport and flights', 'hotel', 'restaurant', 'café', 'supermarket', 'clothes shop', 'post office and parcels',
           'bank', 'clinic or pharmacy', 'park and street', 'sports club', 'gym', 'football or basketball match',
           'cinema or theatre', 'concert or festival', 'library', 'neighbours', 'weather', 'phone and apps', 'internet and email',
           'holiday trip', 'birthday or party', 'cooking at home', 'garden', 'traffic and roads', 'lost and found',
           'moving house', 'online shopping', 'a school trip', 'a news item about a town', 'a notice on a wall', 'a text message to a friend']
POV = [('first person (I / we)', .30), ('second person (notice, instruction, "you")', .12),
       ('third person (a person or people)', .38), ('impersonal (news, rule, description)', .20)]
TONE = [('neutral', .55), ('good news', .15), ('bad news (small, everyday)', .15), ('light and friendly', .15)]
SLOT_RE = re.compile(r'^BN\d{2}$')


def dump(path, obj):
    path = Path(path); path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=1) + '\n')


def apportion(total, weights):
    keys = list(weights)
    s = sum(weights.values())
    raw = {k: total * weights[k] / s for k in keys}
    out = {k: int(math.floor(v)) for k, v in raw.items()}
    for k in sorted(keys, key=lambda k: raw[k] - out[k], reverse=True)[:total - sum(out.values())]:
        out[k] += 1
    return out


# ------------------------------------------------------------------ archive / keep
def cmd_archive():
    dest = BANK / 'archive-v7-b'
    dest.mkdir(parents=True, exist_ok=True)
    for name in ('raw', 'final', 'prompts', 'reports', 'seeds', 'review', 'seed-assignment.json'):
        p = BANK / name
        if p.exists():
            shutil.move(str(p), str(dest / name))
            print('moved', name)
    old = DOC7 / 'plan.json'
    if old.exists() and not (DOC7 / 'plan-v7-original.json').exists():
        shutil.copy(old, DOC7 / 'plan-v7-original.json')
    for name in ('raw', 'final', 'prompts', 'reports'):
        (BANK / name).mkdir(parents=True, exist_ok=True)


def cmd_keep():
    items = L.load_items(str(ROOT))
    rows = {r['id']: r for r in L.audit([i for i in items if i['id'].startswith('pv5-')])}
    keep = sorted(i for i, r in rows.items() if r['required'] != 'beyond')
    levels = {i: rows[i]['required'] for i in keep}
    (BANK / 'keep-v6.txt').write_text('# Old v6 items kept after the v8 level audit (scripts/passive_v8.py keep)\n' + '\n'.join(keep) + '\n')
    dump(BANK / 'levels-v6.json', levels)
    print(len(keep), 'kept;', dict(collections.Counter(levels.values())), 'dropped', len(rows) - len(keep))


# ------------------------------------------------------------------ verbs
BASIC_VERBS = """open close make build write send sell buy find lose take give bring invite clean wash repair break cook teach ask tell show
wear use paint cut drive grow keep leave pay produce serve carry call see hear know read win visit catch stop forget hide push pull move
change clear help hold hit kick meet miss name order pick plant play put remove save share sing steal throw tie touch turn bake borrow
collect copy count cover cross damage deliver draw eat drink fill fix finish follow hurt join lock mend mix offer park print prepare press
sign start wake watch wrap tidy train type cancel choose check design discover destroy enjoy explain film hang improve return arrive
happen come go stay end fall wait begin rise appear disappear die live run sleep work rain snow melt walk ring cry smile laugh
need want like love hate bring ride lend count""".split()
MEDIUM_VERBS = """announce arrange attack charge complete connect divide employ expect fire force forgive gather hire introduce invent knock light
mention notice organise publish punish recommend record reduce repeat replace report rescue search select shoot spoil support surprise
trust warn welcome advise allow believe bury compare confirm consider develop disturb educate elect examine include inform injure
interview suggest translate treat upgrade accept achieve add admit amuse approve beat bend bite blame boil burn calm cause chase
choose complain control cure damage decorate delay describe destroy direct dry earn empty encourage escape exchange fail feed fight
fold guide handle hurry imagine insert kill lift lock marry measure miss obey owe perform plan pour praise prefer prevent promise protect
pull rent reply respect rob rub scare separate shake shut smell spread steal stick tear thank wipe""".split()


def verbs():
    path = DOC / 'verbs.json'
    import os
    if path.exists() and not os.environ.get('V8_REBUILD'):
        return json.loads(path.read_text())
    out = {'basic': [], 'medium': []}
    for w in dict.fromkeys(BASIC_VERBS):
        if L.verb_band(w) == 0:
            out['basic'].append(w)
        else:
            print('basic verb dropped (too rare):', w)
    for w in dict.fromkeys(MEDIUM_VERBS):
        if w not in out['basic'] and L.verb_band(w) <= 1:
            out['medium'].append(w)
        elif w not in out['basic']:
            print('medium verb dropped:', w)
    dump(path, out)
    return out


# ------------------------------------------------------------------ plan
def cmd_plan():
    rng = random.Random(8)
    slots_by_cell = collections.defaultdict(list)
    for lv in LEVELS:
        for cell, n in QUOTA[lv].items():
            mix = {f: FMT_MIX[lv][f] for f in ALLOWED_FMT[cell]}
            counts = apportion(n, mix)
            fm = [f for f, c in counts.items() for _ in range(c)]
            rng.shuffle(fm)
            for f in fm:
                slots_by_cell[cell].append(dict(cell=cell, level=lv, format=f))
    batches, slots_out, n_batch = [], {}, 0
    dom_cycle = DOMAINS[:]
    rng.shuffle(dom_cycle)
    di = 0
    for cell in CELLS:
        sl = slots_by_cell.get(cell, [])
        if not sl:
            continue
        sl.sort(key=lambda s: LEVELS.index(s['level']))
        nb = math.ceil(len(sl) / 42)
        size = math.ceil(len(sl) / nb)
        for k in range(nb):
            part = sl[k * size:(k + 1) * size]
            if not part:
                continue
            n_batch += 1
            name = f'BN{n_batch:02d}'
            rng.shuffle(part)
            pov = apportion(len(part), dict(POV)); povs = [p for p, c in pov.items() for _ in range(c)]; rng.shuffle(povs)
            tone = apportion(len(part), dict(TONE)); tones = [t for t, c in tone.items() for _ in range(c)]; rng.shuffle(tones)
            last = None
            for i, s in enumerate(part, 1):
                d = dom_cycle[di % len(dom_cycle)]; di += 1
                if d == last:
                    d = dom_cycle[di % len(dom_cycle)]; di += 1
                last = d
                s.update(id=f'{name}-{i:02d}', domain=d, pov=povs[i - 1], tone=tones[i - 1])
            slots_out[name] = part
            batches.append(dict(batch=name, cell=cell, size=len(part),
                                formats=dict(collections.Counter(s['format'] for s in part)),
                                levels=dict(collections.Counter(s['level'] for s in part))))
    total_new = sum(b['size'] for b in batches)
    plan = dict(version='passive-v8', target_total=total_new + 245, keep_old={'open_brackets_D1': 245}, new_total=total_new,
                seeds_per_item=1.0, batches=batches)
    dump(DOC7 / 'plan.json', plan)
    dump(DOC / 'slots.json', slots_out)
    verbs()
    print(f'{len(batches)} batches, {total_new} new tasks')
    for b in batches:
        print(b['batch'], b['cell'], b['size'], b['levels'], b['formats'])


# ------------------------------------------------------------------ prompts
def v7_master_parts():
    text = (DOC7 / 'gemini/00-master.md').read_text()
    a = text[text.index('## Task formats'):text.index('## Difficulty levels')]
    b = text[text.index('## Answers and checking'):text.index('## Before sending')]
    b = b.replace('`id` — `<batch number>-NN` (e.g. `B03-17`);', '`id` — the slot id (e.g. `BN03-17`);') \
         .replace('`seed_id` — the id of the seed used;', '`seed_id` — **the same value as `id`**;')
    a = a.replace('A connected mini-text or dialogue of 3–6 sentences with **2–4** gaps',
                  'A connected mini-text or dialogue with gaps (length and number of gaps: see the level contract; basic = 2–3 short sentences and exactly 2 gaps)')
    a = a.replace('it must be a story with development (beginning → event → consequence), not a list of facts; ',
                  'it must hang together (a short exchange or a small event with a result), not a list of facts; ')
    b = re.sub(r'\n# check: active_share=[^\n]*', '', b)
    return a, b


def cell_guide(cell):
    t = (DOC / 'cells.md').read_text()
    m = re.search(rf'<!-- CELL {cell} -->\n(.*?)(?=<!-- CELL|\Z)', t, re.S)
    return m[1].strip()


def collect_used():
    rows = []
    for d in ('raw', 'final'):
        for f in sorted((BANK / d).glob('BN*.jsonl')):
            r, _ = pv7.read_jsonl(f)
            rows += r
    return rows


def master_text():
    master = (DOC / 'master.md').read_text()
    a, b = v7_master_parts()
    return master + '\n' + a + '\n' + b


def verbs_text():
    v = verbs()
    return ('### Verbs for the brackets\n\n**basic slots** — choose the bracket verb only from this list:\n`' + ', '.join(v['basic']) +
            '`\n\n**medium slots** — the list above plus:\n`' + ', '.join(v['medium']) +
            '`\n\n**advanced slots** — any common verb of the two lists; other verbs only if you are sure that every learner knows them. '
            'The list contains intransitive verbs too: choose transitive ones for the passive, intransitive ones for active answers in D2.')


def batch_prompt(b, slots, used_rows):
    openings = sorted({o for o in (pv7.opening(r.get('prompt', '')) for r in used_rows) if o})
    vc = collections.Counter(v for r in used_rows for v in pv7.cue_verbs(r))
    names = sorted({n for r in used_rows for n in pv7.names(r.get('prompt', ''))} | pv7.OLD_NAMES)
    table = '\n'.join(json.dumps(dict(id=s['id'], level=s['level'], format=s['format'], domain=s['domain'], pov=s['pov'], tone=s['tone']),
                                 ensure_ascii=False) for s in slots)
    fc = collections.Counter(s['format'] for s in slots); lc = collections.Counter(s['level'] for s in slots)
    return (f"# Batch {b['batch']} · cell {b['cell']} · {b['size']} tasks\n\n"
            f"Write **exactly {b['size']} tasks**: one per slot below, with the slot's `id`, `cell`, `format` and `level`. "
            f"Formats: {', '.join(f'{k} {v}' for k, v in fc.items())}. Levels: {', '.join(f'{k} {v}' for k, v in lc.items())}. "
            f"**Every task must stay inside the limits of its own level** (see the level contract) — an easy sentence for a basic slot even if the cell guide shows harder examples.\n\n"
            f"## Cell guide\n\n{cell_guide(b['cell'])}\n\n## Slots\n\n"
            "Each slot gives a `domain` (the area of life the task is about), a point of view (`pov`) and a `tone`. Follow them. "
            "`format` and `level` are fixed; do not swap them between slots.\n\n" + table + "\n\n"
            "## Already used — do not repeat\n\n"
            f"- Openings (first two words): {', '.join(openings) or '—'}\n"
            f"- Verbs already used 4+ times in the bank (avoid): {', '.join(v for v, c in vc.items() if c >= 4) or '—'}\n"
            f"- Names: {', '.join(names)}\n\n"
            "## Last line\n\n"
            f"`# check: tasks={b['size']}, time_markers=<N>/{b['size']}, openings_unique=<yes/no>, verbs_max=<max uses of one verb>, "
            "level_limits_checked=<yes/no>, rare_words_found=<N>`\n\n"
            "Before you answer, go through every task: Is it natural? Is the vocabulary within the level? Is the grammar within the level? "
            "Is there exactly one correct meaning? Are all correct variants in `accepted_answers`?\n")


def cmd_prompts(only=None):
    slots = json.loads((DOC / 'slots.json').read_text())
    plan = {b['batch']: b for b in json.loads((DOC7 / 'plan.json').read_text())['batches']}
    used = collect_used()
    out = BANK / 'prompts'; out.mkdir(parents=True, exist_ok=True)
    comb = BANK / 'combined'; comb.mkdir(parents=True, exist_ok=True)
    master = master_text() + '\n' + verbs_text() + '\n'
    names = [n for n in plan if not only or n in only]
    for n in names:
        (out / f'{n}.md').write_text(f'# Grammar NOEON — Passive v8 · {n}\n\n' + master + '\n---\n\n' + batch_prompt(plan[n], slots[n], used))
    # combined attach files: master once, then up to 3 batches
    per = 3
    for i in range(0, len(names), per):
        grp = names[i:i + per]
        body = ('# Grammar NOEON — Passive v8 · ' + ' + '.join(grp) + '\n\n## PART A. General instruction (read it all)\n\n' + master +
                '\n\n## PART B. Batches\n\nProduce the output for **all** batches below, one after another, as **one JSONL code block** '
                '(one JSON object per line; a `# check:` line after the last task of each batch). Nothing else.\n\n' +
                '\n\n---\n\n'.join(batch_prompt(plan[n], slots[n], used) for n in grp))
        (comb / f'ATTACH_passive_{grp[0]}_{grp[-1]}.md').write_text(body)
        print('ATTACH_passive_%s_%s.md' % (grp[0], grp[-1]), len(body) // 1024, 'KB')


# ------------------------------------------------------------------ validate
def level_problems(it):
    r = L.audit([it])[0]
    lv = LEVELS.index(it['level'])
    req = L.NAMES.index(r['required'])
    probs = []
    if req > lv:
        parts = []
        if r['grammar'] > lv:
            parts.append(f"grammar needs {L.NAMES[r['grammar']]} ({', '.join(r['gwhy']) or 'unknown form'})")
        if r['vocab'] > lv:
            parts.append('words above the level: ' + ', '.join(f"{w}" for w, b, z in r['hard'] if b > (0 if lv == 0 else 1 if lv == 1 else 2)) or 'vocabulary')
        if r['size'] > lv:
            parts.append('too long/complex for the level (limits: basic ≤12 words per sentence, ≤26 in a mini-text, ≤1 subordinate clause, ≤2 gaps)')
        if CELL_MIN_BAD(it):
            parts.append(f"cell {it.get('cell')} is not allowed at {it['level']}")
        probs.append(f"level contract: labelled {it['level']} but is {r['required']}: " + '; '.join(parts))
    return probs, r


def CELL_MIN_BAD(it):
    return L.CELL_MIN.get(it.get('cell'), 0) > LEVELS.index(it['level'])


def validate_batch(name, rows, bad, slot_list, used_rows):
    slots = {s['id']: s for s in slot_list}
    report, per, batch_e, batch_w = [], collections.OrderedDict(), list(bad), []
    seen_ids = collections.Counter(r.get('id') for r in rows)
    for it in rows:
        e, w = pv7.check_item(it, {}, {})
        e = [x for x in e if 'seed' not in x]
        s = slots.get(it.get('id'))
        if not s:
            e.append('id is not a slot of this batch')
        else:
            for k in ('cell', 'format', 'level'):
                if k == 'format' and s[k] == 'gap' and it.get(k) == 'mc' and s['cell'] == 'D10':
                    continue  # D10 preposition gaps are delivered as mc
                if it.get(k) != s[k]:
                    e.append(f'{k} is {it.get(k)}, slot requires {s[k]}')
        if seen_ids[it.get('id')] > 1:
            e.append('duplicate id')
        if it.get('seed_id') != it.get('id'):
            e.append('seed_id must equal id')
        if it.get('level') in LEVELS and it.get('format') in pv7.FORMATS:
            try:
                p, r = level_problems(it)
                e += p
            except Exception as ex:  # malformed item
                e.append(f'level audit failed: {ex}')
        if it.get('level') == 'basic' and it.get('format') == 'mini':
            if len(it.get('blanks', [])) != 2:
                e.append('basic mini: exactly 2 gaps')
        per[it.get('id', '?')] = (e, w, it)
    missing = [i for i in slots if i not in per]
    if missing:
        batch_e.append(f'missing slots: {", ".join(missing)}')
    tm = sum(bool(pv7.TIME.search(r.get('prompt', ''))) for r in rows)
    if rows and tm / len(rows) > 0.35:
        batch_e.append(f'time markers in {tm}/{len(rows)} tasks (> 35%)')
    op = collections.Counter(pv7.opening(r.get('prompt', '')) for r in rows if r.get('format') != 'which')
    for o, c in op.items():
        if o and c > 1:
            batch_e.append(f'opening «{o}» repeated {c} times')
    vc = collections.Counter(v for r in rows for v in pv7.cue_verbs(r))
    for v, c in vc.items():
        if c > 2:
            batch_w.append(f'verb {v} used {c} times in the batch (> 2)')
    if slot_list and slot_list[0]['cell'] == 'D2':
        gaps = [b for r in rows for b in r.get('blanks', [])]
        if gaps:
            share = sum(g.get('voice') == 'active' for g in gaps) / len(gaps)
            if not 0.38 <= share <= 0.52:
                batch_e.append(f'D2: active share {share:.0%}, required 40–50%')
    nm = collections.Counter(n for r in rows for n in pv7.names(r.get('prompt', '')))
    rep = [n for n, c in nm.items() if c > 1]
    if rep:
        batch_w.append('names/words repeated: ' + ', '.join(rep[:12]))
    # near duplicates against everything already seen
    pool = [(r.get('id'), pv7.trigrams(r.get('prompt', ''))) for r in used_rows if r.get('id') not in per]
    for i, (e, w, it) in per.items():
        g = pv7.trigrams(it.get('prompt', ''))
        if len(g) >= 4:
            for oid, og in pool:
                if len(og) >= 4 and len(g & og) / len(g | og) >= 0.45:
                    e.append(f'too similar to {oid}'); break
    n_err = sum(bool(e) for e, _, _ in per.values()) + len(batch_e)
    lines = [f'# {name} — validation report', '',
             f'Tasks: {len(rows)} · with errors: {sum(bool(e) for e, _, _ in per.values())} · time markers: {tm}/{len(rows)}', '']
    if batch_e or batch_w:
        lines += ['## Batch', *[f'- ❌ {x}' for x in batch_e], *[f'- ⚠️ {x}' for x in batch_w], '']
    lines += ['## Tasks']
    for i, (e, w, it) in per.items():
        if e or w:
            lines.append(f"- **{i}** {it.get('prompt', '')[:120]}")
            lines += [f'  - ❌ {x}' for x in e] + [f'  - ⚠️ {x}' for x in w]
    (BANK / 'reports').mkdir(parents=True, exist_ok=True)
    (BANK / f'reports/{name}.md').write_text('\n'.join(lines) + '\n')
    broken = [(i, e, it) for i, (e, w, it) in per.items() if e]
    if broken or batch_e:
        rp = [f'# Repair batch {name}', '',
              'Below are the problems found by the automatic check. Rewrite **only** the listed tasks, keeping `id`, `cell`, `format`, `level`. '
              'Stay inside the level contract: simpler words, shorter sentence, allowed forms only. Reply with JSONL only (the corrected lines).', '']
        if batch_e:
            rp += ['Batch-level problems (fix them by changing the tasks listed below):', *[f'- {x}' for x in batch_e], '']
        for i, probs, it in broken:
            clean = {k: v for k, v in it.items() if not k.startswith('_')}
            rp += [f'- {i}: ' + '; '.join(probs), '  ' + json.dumps(clean, ensure_ascii=False)]
        (BANK / f'reports/repair-{name}.md').write_text('\n'.join(rp) + '\n')
    elif (BANK / f'reports/repair-{name}.md').exists():
        (BANK / f'reports/repair-{name}.md').unlink()
    return n_err, len(rows)


def cmd_validate(only=None, stage='raw'):
    slots = json.loads((DOC / 'slots.json').read_text())
    used = collect_used()
    total = 0
    for f in sorted((BANK / stage).glob('BN*.jsonl')):
        n = f.stem
        if only and n not in only:
            continue
        rows, bad = pv7.read_jsonl(f)
        err, cnt = validate_batch(n, rows, bad, slots.get(n, []), used)
        total += err
        print(f'{n}: tasks {cnt}, errors {err} -> content/passive-bank/v7/reports/{n}.md')
    return total


def cmd_finalize(name, drop):
    rows, bad = pv7.read_jsonl(BANK / 'raw' / f'{name}.jsonl')
    slots = json.loads((DOC / 'slots.json').read_text())[name]
    used = [r for r in collect_used() if not r.get('id', '').startswith(name)]
    err, _ = validate_batch(name, rows, bad, slots, used)
    keep, relabel = [], 0
    for it in rows:
        if it['id'] in drop:
            continue
        p, r = level_problems(it)
        if p:
            print('skip (level)', it['id']); continue
        e, _ = pv7.check_item(it, {}, {})
        if [x for x in e if 'seed' not in x]:
            print('skip (schema)', it['id']); continue
        if r['required'] != it['level'] and r['required'] != 'beyond':
            it['level'] = r['required']; relabel += 1
        keep.append(it)
    out = BANK / 'final'; out.mkdir(parents=True, exist_ok=True)
    (out / f'{name}.jsonl').write_text('\n'.join(json.dumps(r, ensure_ascii=False) for r in keep) + '\n')
    print(f'{name}: {len(keep)}/{len(rows)} written to final/, relabelled {relabel}')


def cmd_status():
    got = collections.Counter()
    for f in sorted((BANK / 'final').glob('BN*.jsonl')):
        r, _ = pv7.read_jsonl(f)
        for it in r:
            got[(it['level'], it['cell'])] += 1
    print('final new items:', sum(got.values()))
    for lv in LEVELS:
        print(lv)
        for c in CELLS:
            q = QUOTA[lv].get(c, 0)
            if q or got[(lv, c)]:
                print(f'  {c:4} {got[(lv, c)]:4}/{q:<4}' + ('  short %d' % (q - got[(lv, c)]) if got[(lv, c)] < q else ''))


if __name__ == '__main__':
    cmd, *args = sys.argv[1:] or ['help']
    if cmd == 'archive': cmd_archive()
    elif cmd == 'keep': cmd_keep()
    elif cmd == 'plan': cmd_plan()
    elif cmd == 'prompts': cmd_prompts(set(args) or None)
    elif cmd == 'validate': sys.exit(1 if cmd_validate(set(a for a in args if not a.startswith('--')) or None, 'final' if '--final' in args else 'raw') else 0)
    elif cmd == 'finalize':
        drop = set(args[args.index('--drop') + 1].split(',')) if '--drop' in args else set()
        cmd_finalize(args[0], drop)
    elif cmd == 'status': cmd_status()
    else: print(__doc__)
