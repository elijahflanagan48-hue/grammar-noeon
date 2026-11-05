"""Apply the explicit, reviewed future-reference corrections to the local bank.
One-shot editorial patch: refuses a different input version; never contacts D1.
"""
import copy
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
D = ROOT / 'docs/review/FUTURE-REFERENCE-2026-10-31'
PREV = ROOT / 'docs/review/TRAINING-CONTEXT-2026-10-31'
VERSION = 'tenses-2026-10-31.4'

def read(p):
    return json.loads(p.read_text())

def write(p, x):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(x, ensure_ascii=False, indent=2) + '\n')

def main():
    manifest = read(ROOT / 'data/exercises/index.json')
    assert manifest['content_versions']['tenses'] == 'tenses-2026-10-31.3', 'Patch already applied or wrong input'
    parts = {p['file']: read(ROOT / p['file']) for p in manifest['parts']}
    bank = [i for items in parts.values() for i in items]
    by_id = {i['id']: i for i in bank}
    edits = read(D / 'planned-edits.json')
    assert len({p['id'] for p in edits}) == len(edits)
    before = [copy.deepcopy(by_id[p['id']]) for p in edits]
    for p in edits:
        item = by_id[p['id']]
        assert item['prompt'] != p['prompt'] and p['anchor'] in p['prompt']
        item['prompt'] = p['prompt']
        item['content_version'] = VERSION
        context = f"Точка отсчёта в тексте — «{p['anchor']}». К этому будущему моменту указанный интервал уже пройдёт; это не начало нового периода. "
        if item['type'] == 'multiple_choice':
            key = item['options'][item['correct_option_index']]
            for field in ['answer', 'summary']:
                if field in item:
                    item[field] = item['prompt'].replace('___', key)
            item['explanation_ru'] = context + f'Правильный вариант: {key}. Future Perfect Continuous показывает накопленную к будущей границе длительность. Present Perfect Continuous относится к настоящему, а Future Simple не выражает такую длительность с since или к годовщине.'
        else:
            blanks = item['blanks']
            pattern = r'\{\{\d+:[^}]+\}\}' if item['type'] == 'context_cloze' else r'\([^()]+\)'
            assert len(re.findall(pattern, item['prompt'])) == len(blanks), item['id']
            keys = iter(b['answer'] for b in blanks)
            item['answer_text'] = re.sub(pattern, lambda m: next(keys), item['prompt'])
            for b in blanks:
                if b['tense_or_construction'] not in ['future_perfect', 'future_perfect_continuous']:
                    continue
                simple = b['tense_or_construction'] == 'future_perfect'
                meaning = ('Future Perfect показывает состояние или накопленный результат к этой границе. ' if simple else 'Future Perfect Continuous подчёркивает длительность предшествующего процесса. ')
                form = 'Форма: will have + V3. ' if simple else 'Форма: will have been + V-ing. '
                alternatives = [a for a in b['accepted_answers'] if a != b['answer']]
                b['explanation_ru'] = context + meaning + form + 'Основной ответ: ' + b['answer'] + '.'
                if alternatives:
                    b['explanation_ru'] += ' Также принимается: ' + '; '.join(alternatives) + '.'
            item['explanation_ru'] = ' '.join(f"{n}) {b['explanation_ru']}" for n, b in enumerate(blanks, 1))
    # Validate the entire proposed patch before writing any source data.
    for old, p in zip(before, edits):
        new = by_id[p['id']]
        assert new.get('blanks', []) == [dict(b, explanation_ru=new['blanks'][n]['explanation_ru']) for n,b in enumerate(old.get('blanks', []))]
        assert new.get('options') == old.get('options')
        assert new.get('correct_option_index') == old.get('correct_option_index')
    write(D / 'before-records.json', before)
    write(D / 'patch-records.json', [by_id[p['id']] for p in edits])
    for file, items in parts.items():
        write(ROOT / file, items)
    manifest['content_version'] = VERSION
    manifest['content_versions']['tenses'] = VERSION
    write(ROOT / 'data/exercises/index.json', manifest)
    write(D / 'corrected/data/exercises/index.json', manifest)
    write(D / 'bank.json', bank)
    overlay = {i['id']: i for i in read(PREV / 'corrected-records.json')}
    overlay.update({p['id']: by_id[p['id']] for p in edits})
    write(D / 'corrected-records.json', list(overlay.values()))
    proof = read(PREV / 'import-proof.json')
    sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
    proof['parts_sha256'] = {p: sha(ROOT / p) for p in parts}
    proof['manifest_sha256'] = sha(ROOT / 'data/exercises/index.json')
    proof['content_versions'] = manifest['content_versions']
    write(D / 'import-proof.json', proof)
    candidates = {i['id']: i for file in ['fpc-review-input.json','fp-review-input.json'] for i in read(D / file)}
    for item in bank:
        if item['type']=='multiple_choice' and set(item.get('practice_tenses', [])) & {'future_perfect', 'future_perfect_continuous'}:
            candidates[item['id']] = item
    changed = {p['id'] for p in edits}
    write(D / 'review-coverage.json', [dict(id=i, decision='clarified' if i in changed else 'preserved', prompt=by_id[i]['prompt']) for i in candidates])
    print(f'{len(edits)} records clarified / {len(candidates)} perfect-context candidates reviewed. Keys, IDs, counts and selection metadata preserved.')

if __name__ == '__main__':
    main()
