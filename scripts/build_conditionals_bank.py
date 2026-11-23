#!/usr/bin/env python3
"""Adapt the reviewed Conditionals JSONL without editing its text or answer keys."""
import hashlib
import json
import re
from collections import Counter
from pathlib import Path
from bankgen_specs import SPECS

ROOT = Path(__file__).resolve().parents[1]
VERSION = 'conditionals-2026-11-23.2'
TARGETS = dict(zip((f'C{n}' for n in range(1, 12)), (
    'cd_zero', 'cd_first', 'cd_conj', 'cd_second', 'cd_third', 'cd_mixed',
    'cd_implied', 'cd_inversion', 'cd_wish', 'cd_unreal', 'cd_all')))
TYPES = dict(gap='open_brackets', mini='context_cloze', mc='multiple_choice',
             which='multiple_choice', fact='multiple_choice', fix='error_fix',
             transform='transformation', order='word_order', match='match',
             sort='sort', bank='bank', hunt='hunt')
INSTRUCTIONS = dict(gap='Раскройте скобки.', mini='Заполните каждый пропуск.',
    mc='Выберите правильный вариант.', which='Выберите предложение по смыслу ситуации.',
    fact='Выберите, что произошло на самом деле.', fix='Исправьте ошибку. Верное предложение перепишите без изменений.',
    transform='Перепишите целое предложение с заданным началом.',
    order='Нажимайте слова в нужном порядке.', match='Соедините каждое начало с одним окончанием.',
    sort='Выберите группу для каждого предложения.', bank='Заполните пропуски словами из банка. Два варианта лишние.',
    hunt='Нажмите на все предложения с ошибкой.')


def load():
    paths = sorted((ROOT / 'content/bankgen/conditionals/final').glob('CD*.jsonl'))
    assert [p.name for p in paths] == [f'CD{n:02d}.jsonl' for n in range(1, 30)], 'Expected CD01–CD29'
    return [json.loads(line) for path in paths for line in path.read_text().splitlines()
            if line.strip() and not line.startswith('#')]


def constructions(row):
    return sorted({c for c in [row.get('construction'),
        *(b.get('construction') for b in row.get('blanks', []))] if c})


def site_item(row):
    fmt, target = row['format'], TARGETS[row['cell']]
    anchor = 'cd-core' if target == 'cd_all' else target.replace('_', '-')
    refs = [f'content/conditionals/12-conditionals-rule.html#{anchor}']
    item = dict(id=row['id'], topic='conditionals', type=TYPES[fmt], source_format=fmt,
        cell=row['cell'], level=row['level'], content_version=VERSION,
        response_contract='bounded-v1', answer_profile='conditionals-exact-v1',
        prompt=row['prompt'], instruction_ru=INSTRUCTIONS[fmt], explanation_ru=row['explanation_ru'],
        practice_tenses=[target], tags=[target, *constructions(row)], rule_refs=refs)

    def blank(n, answer, accepted=None, construction=None, **extra):
        assert isinstance(answer, str) and answer
        accepted = [answer] if accepted is None else accepted
        assert answer in accepted and all(isinstance(a, str) and a for a in accepted), row['id']
        return dict(id=f"{row['id']}-b{n+1}", answer=answer, accepted_answers=accepted,
                    tense_or_construction=target, construction=construction or row.get('construction'),
                    rule_refs=refs, **extra)

    if fmt in ('mc', 'which', 'fact'):
        ix = row['correct_option_index']
        item.update(options=row['options'], correct_option_index=ix, accepted_option_indices=[ix], answer=row['options'][ix])
    elif fmt in ('gap', 'mini'):
        item['blanks'] = [blank(n, b['answer'], b['accepted_answers'], b['construction'], base_verb=b['cue'].split('/')[-1].strip().removeprefix('to '))
                          for n, b in enumerate(row['blanks'])]
        # Some author rows print both ___ and a bracket cue for the same slot.
        # Keep the source intact; the site's bracket control replaces both markers.
        source_prompt = row['prompt']
        for b in row['blanks']:
            source_prompt = re.sub(r'___\s*(?=' + re.escape('(' + b['cue'] + ')') + ')', '', source_prompt)
        item['prompt'] = source_prompt
        prompt, completed = source_prompt, source_prompt
        for n, b in enumerate(row['blanks'], 1):
            cue = '(' + b['cue'] + ')'
            assert cue in prompt, row['id']
            prompt = prompt.replace(cue, '{{%d:%s}}' % (n, b['cue']), 1)
            completed = completed.replace(cue, b['answer'], 1)
        if fmt == 'mini':
            item['prompt'] = prompt
        item['answer_text'] = completed
    elif fmt == 'fix':
        item.update(answer=row['answer'], accepted_answers=row['accepted_answers'])
    elif fmt in ('transform', 'order'):
        item['blanks'] = [blank(0, row['answer'], row['accepted_answers'])]
        item['answer_text'] = row['answer']
        if fmt == 'order':
            item['blocks'] = row['words']
    elif fmt == 'match':
        item['starts'] = [p[0] for p in row['pairs']]
        # Never expose aligned pairs to an unchecked learner snapshot.
        item['endings'] = sorted((p[1] for p in row['pairs']), key=lambda s: hashlib.sha256(s.encode()).hexdigest())
        item['blanks'] = [blank(n, p[1]) for n, p in enumerate(row['pairs'])]
        item['answer_text'] = ' · '.join(' '.join(p) for p in row['pairs'])
    elif fmt == 'sort':
        item.update(groups=row['groups'], sort_items=[i['text'] for i in row['items']])
        item['blanks'] = [blank(n, i['group']) for n, i in enumerate(row['items'])]
        item['answer_text'] = ' · '.join(f"{i['text']} → {i['group']}" for i in row['items'])
    elif fmt == 'bank':
        item['word_bank'] = row['bank']
        item['blanks'] = [blank(n, a) for n, a in enumerate(row['answers'])]
        answers = iter(row['answers'])
        item['answer_text'] = re.sub('___', lambda _: next(answers), row['prompt'])
    elif fmt == 'hunt':
        item['sentences'] = row['sentences']
        item['fixes'] = row['fixes']
        item['blanks'] = [blank(n, '1' if n in row['wrong'] else '0') for n in range(len(row['sentences']))]
        item['answer_text'] = ' · '.join(f"Sentence {n+1}: {row['fixes'][str(n)]}" for n in sorted(row['wrong']))
    return item


# Editorial decision: inversion (Should/Were/Had + subject) is not taught at basic level.
LEVEL_EXCEPTIONS = {'cd_inversion'}


def coverage(rows):
    counts = Counter({c: 0 for cell in SPECS['conditionals']['cells'] for c in cell['cons']})
    counts.update(c for row in rows for c in constructions(row))
    levels = {t: dict(Counter(r['level'] for r in rows if r['cell'] == cell)) for cell, t in TARGETS.items()}
    return dict(total=len(rows), formats=dict(sorted(Counter(r['format'] for r in rows).items())),
        levels=dict(sorted(Counter(r['level'] for r in rows).items())), constructions=dict(sorted(counts.items())),
        targets=levels, coverage_met=all(n >= 8 for n in counts.values()) and all(len(v) == 3 or t in LEVEL_EXCEPTIONS for t, v in levels.items()),
        undercovered=[dict(construction=c, count=n, ids=[r['id'] for r in rows if c in constructions(r)])
                      for c, n in sorted(counts.items()) if n < 8],
        source_issues=[*[dict(id='CD20-01', field='blanks[0].accepted_answers', reason='was is not grammatical with plural they; only were is valid. The reviewed source is preserved.')
                for r in rows if r['id'] == 'CD20-01' and any('was' in b.get('accepted_answers', []) for b in r.get('blanks', []))],
            *[dict(id=r['id'], field='groups', reason=f"Source has {len(r['groups'])} groups; integration brief allows 2 or 3. All source groups are preserved.") for r in rows if r['format'] == 'sort' and len(r['groups']) not in (2, 3)]],
        missing_levels={t: sorted({'basic', 'medium', 'advanced'} - set(ls)) for t, ls in levels.items() if len(ls) < 3})


def build():
    rows = load()
    assert len(rows) == len({r['id'] for r in rows}) == 1003
    converted = [site_item(r) for r in rows]
    path = ROOT / 'data/exercises/index.json'
    manifest = json.loads(path.read_text())
    existing = [p for p in manifest['parts'] if p.get('section') != 'conditionals']
    old = [i for p in existing for i in json.loads((ROOT / p['file']).read_text())]
    first = max(int(Path(p['file']).stem.split('-')[1]) for p in existing) + 1
    freq = lambda xs, key, default=None: dict(sorted(Counter(x.get(key, default) for x in xs).items()))
    parts = []
    for off in range(0, len(converted), 100):
        chunk = converted[off:off+100]
        file = f'data/exercises/part-{first+off//100:02d}.json'
        dest = ROOT / file
        if dest.exists():
            assert all(i.get('topic') == 'conditionals' for i in json.loads(dest.read_text())), file
        dest.write_text(json.dumps(chunk, ensure_ascii=False, indent=2) + '\n')
        parts.append(dict(file=file, count=len(chunk), section='conditionals', types=freq(chunk, 'type'),
                          levels3=freq(chunk, 'level'), levels=freq(chunk, 'cefr_estimate', 'unrated')))
    bank = old + converted
    manifest['sections']['conditionals'] = len(converted)
    manifest['section_types']['conditionals'] = freq(converted, 'type')
    manifest['content_versions']['conditionals'] = VERSION
    manifest.update(total_items=len(bank), answer_slots=sum(len(i.get('blanks', [])) or 1 for i in bank),
                    parts=existing+parts, types=freq(bank, 'type'), levels3=freq(bank, 'level'),
                    levels=freq(bank, 'cefr_estimate', 'unrated'))
    report = coverage(rows)
    manifest.setdefault('construction_counts', {})['conditionals'] = report['constructions']
    path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    (ROOT / 'docs/conditionals/bank-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(f"Conditionals: {len(converted)} items; {len(parts)} parts; source coverage met: {report['coverage_met']}")


if __name__ == '__main__':
    build()
