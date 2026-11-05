"""Apply the owner's final v8 policy to the preserved reviewed JSON, never historical attempts.

Usage: python3 -B scripts/finalise_bank_v8.py --archive /path/to/original-v8.zip
The input archive is read as JSON only. No attached code is executed.
"""
from pathlib import Path, PurePosixPath
from collections import Counter
import argparse
import copy
import csv
import hashlib
import json
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PREVIOUS = ROOT / 'docs/review/V8-2026-10-30'
OUTPUT = ROOT / 'docs/review/V8-FINAL-2026-10-30'
VERSIONS = {'tenses': 'tenses-2026-10-30.10', 'comparison': 'comparison-2026-10-30.2'}
SHALL = re.compile(r'\bshall\b|\bshan[’\']t\b', re.I)
ADVERBS = ('already', 'just', 'still', 'ever', 'never', 'always', 'usually', 'often', 'finally',
           'recently', 'probably', 'gradually', 'painstakingly', 'perpetually', 'constantly')


def dump(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()


def sha(value):
    return hashlib.sha256(value).hexdigest()


def family(value):
    s = value.lower()
    s = re.sub(r'\b(?:' + '|'.join(ADVERBS) + r')\b\s*', '', s)
    s = re.sub(r'\b(?:i|you|he|she|it|we|they|the|two)\b\s*', '', s)
    s = re.sub(r'\s+', ' ', s).strip()
    if 'going to' in s:
        return 'going_to'
    for pattern, name in [
        (r'\bwill\b.*\bhave been\b', 'future_perfect_continuous'),
        (r'\bwill\b.*\bhave\b', 'future_perfect'),
        (r'\bwill\b.*\bbe\b', 'future_continuous'),
        (r'\bwill\b', 'future_simple'),
        (r'\bhad\b.*\bbeen\b', 'past_perfect_continuous'),
        (r'\bhad\b', 'past_perfect'),
        (r'\b(?:has|have)\b.*\bbeen\b', 'present_perfect_continuous'),
        (r'\b(?:has|have)\b', 'present_perfect'),
        (r'\b(?:was|were)\b', 'past_continuous'),
        (r'\b(?:is|are|am)\b', 'present_continuous'),
        (r'\b(?:would|could|can|may|might)\b', 'modal'),
    ]:
        if re.search(pattern, s):
            return name
    return 'simple'


def cue_for(item, index):
    pattern = r'\{\{\d+:([^}]+)}}' if item['type'] == 'context_cloze' else r'\(([^()]*)\)'
    matches = list(re.finditer(pattern, item['prompt']))
    return matches[index].group(1) if index < len(matches) else ''


def select_forms(item, index, original):
    b = item['blanks'][index]
    canonical = b['answer']
    assert not SHALL.search(canonical), item['id']
    forms = list(dict.fromkeys([canonical] + b['accepted_answers']))
    forms = [s for s in forms if not SHALL.search(s)]
    cue = cue_for(item, index).lower()
    required = [a for a in ADVERBS if re.search(r'\b' + a + r'\b', cue)]
    # A word explicitly requested in the bracket is part of the answer, rather than an optional alias.
    if required:
        forms = [s for s in forms if all(re.search(r'\b' + a + r'\b', s, re.I) for a in required)]
    if canonical not in forms:
        forms.insert(0, canonical)
    if len(forms) <= 2:
        return forms
    old = original.get(item['id'], {}).get('blanks', [])
    previous = old[index].get('accepted_answers', []) if index < len(old) else []
    target = family(canonical)
    neighbours = {
        'present_perfect_continuous': ['present_perfect'],
        'past_perfect_continuous': ['past_perfect'],
        'future_perfect_continuous': ['future_perfect'],
        'past_perfect': ['simple', 'past_perfect_continuous'],
        'present_perfect': ['present_perfect_continuous', 'simple'],
        'future_perfect': ['future_perfect_continuous', 'future_simple'],
        'future_continuous': ['future_simple', 'going_to', 'present_continuous'],
        'future_simple': ['going_to', 'future_continuous', 'present_continuous'],
        'present_continuous': ['going_to', 'future_simple', 'simple'],
        'past_continuous': ['simple'],
    }.get(target, [])
    def score(s):
        f = family(s)
        # Same construction with legitimate collective agreement/spelling comes first.
        rank = -1 if f == target else neighbours.index(f) if f in neighbours else 10
        return (rank, 0 if s in previous else 1, forms.index(s))
    return [canonical, min((s for s in forms if s != canonical), key=score)]


def complete(item):
    if item.get('options'):
        correct = item['options'][item['correct_option_index']]
        return item['prompt'].replace('___', correct) if item['type'] == 'multiple_choice' and item['prompt'].count('___') == 1 else correct
    n = 0
    def replace(match):
        nonlocal n
        result = item['blanks'][n]['answer']
        n += 1
        return result
    pattern = r'\{\{\d+:[^}]+}}' if item['type'] == 'context_cloze' else r'\([^()]*\)'
    return re.sub(pattern, replace, item['prompt'])


def clean_explanation(text, field=None):
    # Preserve the substantive explanation before the old, potentially extensive alternative list.
    text = re.split(r'В данном контексте также принимаются:|Также засчитываются:|Также принимается:|Также принимаются:', text)[0]
    text = re.sub(r'Основной ответ:\s*[^.]+\.\s*', '', text)
    text = re.sub(r'[^.!?]*\b(?:shall|shan[’\']t)\b[^.!?]*[.!?]?', '', text, flags=re.I)
    text = re.sub(r'\s+', ' ', text).strip()
    if field:
        if not text:
            text = 'Форма соответствует времени и смыслу ситуации в предложении.'
        text += ' Основной ответ: ' + field['answer'] + '.'
        if len(field['accepted_answers']) == 2:
            text += ' Также принимается: ' + field['accepted_answers'][1] + '.'
    return text


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--archive', required=True, type=Path)
    args = parser.parse_args()
    current = json.loads((ROOT / 'data/exercises/index.json').read_text())
    assert current['content_versions']['tenses'] in {'tenses-2026-10-30.9', VERSIONS['tenses']}, 'Refusing to replace a later bank revision'
    archive_bytes = args.archive.read_bytes()
    old_proof = json.loads((PREVIOUS / 'import-proof.json').read_text())
    assert sha(archive_bytes) == old_proof['source_archive_sha256'], 'Unexpected source ZIP'
    with zipfile.ZipFile(args.archive) as z:
        names = [n for n in z.namelist() if PurePosixPath(n).name == 'bank.json' and len(PurePosixPath(n).parts) <= 2]
        assert len(names) == 1
        original_list = json.loads(z.read(names[0]))
    original = {i['id']: i for i in original_list}
    before = json.loads((PREVIOUS / 'corrected/bank.json').read_text())
    items = copy.deepcopy(before)
    by_id = {i['id']: i for i in items}
    overrides = json.loads((OUTPUT / 'manual-overrides.json').read_text())
    rows = list(csv.DictReader((PREVIOUS / 'owner-decisions.csv').open(encoding='utf-8-sig')))
    decisions = []
    for n, row in enumerate(rows):
        item = by_id[row['exercise_id']]
        proposal = json.loads(row['suggested_answer_or_text'])['proposal_not_applied']
        category = row['issue'].split(';')[0][1:]
        action, reason = 'keep', 'Дополнительная интерпретация требует иной ситуации или меняет смысловой акцент; не расширяем ключ автоматически.'
        if category == 'level':
            item['level'] = proposal['level']
            action, reason = 'level', 'Сложность определена по лексике и синтаксису, без завышения из-за длины ответа или количества полей.'
        elif category == 'duplicate':
            action, reason = 'keep_formats', 'Сохранены разные форматы; существующий отбор исключает совпадающие законченные предложения из одной тренировки.'
        elif category == 'other' and not proposal:
            action, reason = 'keep', 'Самостоятельное задание на образование формы сохранено; это допустимая часть грамматической практики.'
        elif proposal.get('prompt'):
            item['prompt'] = proposal['prompt']
            action, reason = 'context', 'Добавлена временная или смысловая опора без названия времени и без ответа в инструкции.'
        if n in {20, 21, 22, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 76, 78}:
            field = item['blanks'][int(row['field_number']) - 1]
            field['accepted_answers'] = list(dict.fromkeys(field['accepted_answers'] + proposal.get('add', [])))
            action, reason = 'add', 'В этом контексте намерение/предложение помощи либо факт деятельности допускает указанную альтернативу; итоговый ключ ограничен двумя формами.'
        if proposal.get('options'):
            item['options'] = proposal['options']
            action, reason = 'options', 'Конкурирующий ответ заменён; у задания выбора остаётся один ключ.'
        if proposal.get('remove') and int(row['field_number']) > 0:
            field = item['blanks'][int(row['field_number']) - 1]
            field['accepted_answers'] = [a for a in field['accepted_answers'] if a not in proposal['remove']]
            action, reason = 'remove', 'Исключён разговорный/региональный либо не соответствующий смыслу вариант; оставлены нейтральные учебные формы.'
        decisions.append({'row': n, 'id': item['id'], 'field': int(row['field_number']), 'category': category,
                          'action': action, 'reason': reason})
    for id_, change in overrides.items():
        item = by_id[id_]
        if 'prompt' in change:
            item['prompt'] = change['prompt']
        for a, b in change.get('replace', []):
            assert a in item['prompt'], (id_, a)
            item['prompt'] = item['prompt'].replace(a, b)
        if 'options' in change:
            item['options'] = change['options']
        for key, forms in change.get('fields', {}).items():
            field = item['blanks'][int(key) - 1]
            field['answer'], field['accepted_answers'] = forms[0], forms
        for key, value in change.get('base_verbs', {}).items():
            item['blanks'][int(key) - 1]['base_verb'] = value
    for decision in decisions:
        if decision['id'] in overrides:
            decision['action'] = 'editorial_resolution'
            decision['reason'] = 'Выполнено конкретное редакторское исправление; итоговые контекст и ключ приведены в этой записи.'
    ledger = []
    for old, item in zip(before, items):
        if item.get('options'):
            # There is exactly one answer in multiple choice, independently of the open-input limit.
            item.pop('accepted_option_indices', None)
            item['explanation_ru'] = clean_explanation(item['explanation_ru'])
        for index, field in enumerate(item.get('blanks', [])):
            was = copy.deepcopy(field['accepted_answers'])
            selected = select_forms(item, index, original)
            field['accepted_answers'] = selected
            assert 1 <= len(selected) <= 2 and field['answer'] in selected
            field['explanation_ru'] = clean_explanation(field.get('explanation_ru', ''), field)
            if old.get('blanks', [])[index]['accepted_answers'] != selected:
                ledger.append({'id': item['id'], 'field': index + 1, 'prompt': item['prompt'],
                    'before': old['blanks'][index]['accepted_answers'], 'after': selected,
                    'reason': 'shall исключён; сохранены основной ответ и не более одной ближайшей нормативной альтернативы; слова из скобок обязательны.'})
        if item.get('blanks'):
            item['explanation_ru'] = ' '.join(f"{n}) {b['explanation_ru']}" for n, b in enumerate(item['blanks'], 1))
            item['review_note_ru'] = 'Вводите форму глагола и все слова, указанные в скобках. Слова, уже напечатанные вне пропуска, повторять не нужно. Можно использовать полную или сокращённую форму.'
        result = complete(item)
        if 'answer_text' in item:
            item['answer_text'] = result
        if 'answer' in item:
            item['answer'] = ([b['answer'] for b in item['blanks']] if isinstance(item['answer'], list)
                              else result if item.get('options') else item['answer'])
        # No trace of shall in current exercise content, including ancillary text.
        assert not SHALL.search(json.dumps(item, ensure_ascii=False)), item['id']
        if item != old:
            item['content_version'] = VERSIONS['comparison' if item['id'].startswith('cmp-') else 'tenses']
    manifest = json.loads((PREVIOUS / 'corrected/data/exercises/index.json').read_text())
    manifest['content_versions'] = VERSIONS
    manifest['content_version'] = VERSIONS['tenses']
    manifest['levels3'] = dict(sorted(Counter(i['level'] for i in items).items()))
    # Preserve deprecated CEFR counters and all IDs/part boundaries for compatibility.
    offset = 0
    hashes = {}
    for part in manifest['parts']:
        chunk = items[offset:offset + part['count']]
        offset += part['count']
        if 'levels3' in part:
            part['levels3'] = dict(sorted(Counter(i['level'] for i in chunk).items()))
        payload = dump(chunk)
        target = ROOT / part['file']
        target.write_bytes(payload)
        copy_target = OUTPUT / 'corrected' / part['file']
        copy_target.parent.mkdir(parents=True, exist_ok=True)
        copy_target.write_bytes(payload)
        hashes[part['file']] = sha(payload)
    assert offset == len(items) == 4722
    (ROOT / 'data/exercises/index.json').write_bytes(dump(manifest))
    (OUTPUT / 'corrected/data/exercises/index.json').write_bytes(dump(manifest))
    (OUTPUT / 'corrected/bank.json').write_bytes(dump(items))
    corrections = [i for i in items if i != original[i['id']]]
    (OUTPUT / 'corrected-records.json').write_bytes(dump(corrections))
    (OUTPUT / 'changed-ids.json').write_bytes(dump([i['id'] for i in items if i != dict((i['id'], i) for i in before)[i['id']]]))
    proof = {**old_proof, 'parts_sha256': hashes, 'manifest_sha256': sha(dump(manifest))}
    (OUTPUT / 'import-proof.json').write_bytes(dump(proof))
    for decision in decisions:
        i = by_id[decision['id']]
        decision['prompt'] = i['prompt']
        decision['answers'] = [i['options'][i['correct_option_index']]] if i.get('options') else (
            i['blanks'][decision['field']-1]['accepted_answers'] if decision['field'] else [b['accepted_answers'] for b in i['blanks']])
        decision['level'] = i['level']
    (OUTPUT / 'resolved-decisions.json').write_bytes(dump(decisions))
    (OUTPUT / 'answer-changes.json').write_bytes(dump(ledger))
    summary = {'items': len(items), 'fields': sum(len(i.get('blanks', [])) or 1 for i in items),
        'resolved_questions': len(decisions), 'pending_questions': 0, 'changed_records': sum(a != b for a,b in zip(before,items)),
        'changed_answer_fields': len(ledger), 'accepted_sizes': dict(Counter(len(b['accepted_answers']) for i in items for b in i.get('blanks', []))),
        'shall_occurrences': 0, 'content_versions': VERSIONS, 'levels3': manifest['levels3']}
    (OUTPUT / 'summary.json').write_bytes(dump(summary))
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
