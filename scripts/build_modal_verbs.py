#!/usr/bin/env python3
"""Adapt the reviewed modal bank, applying explicit audited editorial overlays.

Run explicitly after a modal source update. The complete author bank includes
its forty texts; batch files are historical drafting inputs, not extra records.
"""
from __future__ import annotations
from collections import Counter
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parents[1] / 'content/modal-verbs/source/modal-verbs-package'
PATCHES = ROOT.parents[1] / 'docs/reports/MODAL-VERBS-PATCHES-2026-11-05.json'
VERSION = 'modals-2026-11-05.1'
TYPE_MAP = {'gap': 'modal_gap', 'mc': 'multiple_choice', 'meaning': 'modal_meaning', 'fix': 'modal_fix', 'text': 'context_cloze'}
INSTRUCTIONS = {
    'gap': 'Впишите подходящую форму в пропуск.',
    'mc': 'Выберите правильный вариант.',
    'meaning': 'Выберите предложение, которое подходит к контексту.',
    'fix': 'Перепишите предложение, исправив ошибку.',
    'text': 'Заполните каждый пропуск в тексте.',
}


def read_source():
    """Read originals into memory, then apply only assert-guarded audit patches."""
    rows = [json.loads(line) for line in (SOURCE / 'data/modal-verbs.exercises.jsonl').read_text(encoding='utf-8').splitlines() if line.strip()]
    by_id = {row['id']: row for row in rows}
    assert len(by_id) == len(rows), 'Duplicate author IDs'
    overlay = json.loads(PATCHES.read_text(encoding='utf-8'))
    assert overlay.get('source_unchanged') is True, 'Overlay must preserve source files'
    for patch in overlay['exercise_patches']:
        identity = patch['id']
        assert identity in by_id, f'Unknown patched exercise: {identity}'
        original = by_id[identity]
        assert patch['before'] and patch['after'], f'Empty editorial patch: {identity}'
        for field, expected in patch['before'].items():
            assert field in original and original[field] == expected, f'Outdated editorial patch: {identity}.{field}'
        assert 'id' not in patch['after'], f'Patch cannot change identity: {identity}'
        original.update(patch['after'])
    return rows


def adapt(source):
    kind = source['type']
    targets = ['mv_' + source['sub'], 'mv_' + source['rule']]
    refs = ['content/modals/08-modals.html#mv-' + source['rule'].lower()]
    item = dict(id=source['id'], topic='modals', type=TYPE_MAP[kind], modal_type=kind,
                modal_sub=source['sub'], modal_rule=source['rule'], level=source['level'],
                content_version=VERSION, answer_profile='modal-exact-v1', response_contract='bounded-v1',
                prompt=source['q'], answer=source['answer'], accept=source['accept'],
                accepted_answers=[source['answer'], *source['accept']],
                explanation_ru=source['why_ru'], instruction_ru=source.get('instruction_ru', INSTRUCTIONS[kind]),
                practice_tenses=targets, tags=targets, rule_refs=refs)
    if kind in ('mc', 'meaning'):
        item.update(options=source['options'], correct_option_index=source['options'].index(source['answer']), answer_text=source['answer'])
    else:
        fields = source['gaps'] if kind == 'text' else [source]
        item['blanks'] = [dict(id=f"{source['id']}-b{index}", answer=field['answer'],
                               accepted_answers=[field['answer'], *field['accept']],
                               explanation_ru=source['why_ru'], rule_refs=refs,
                               practice_tenses=targets, tense_or_construction=targets[0],
                               modal_options=field['options'])
                          for index, field in enumerate(fields, 1)]
        item['modal_options'] = source['options']
        if kind in ('gap', 'text'):
            answers = iter(field['answer'] for field in fields)
            item['answer_text'] = re.sub('___', lambda _: next(answers), source['q'])
        else:
            item['answer_text'] = source['answer']
    return item


def section(item):
    return item.get('topic') if item.get('topic') in ('modals', 'passive') else 'comparison' if item['id'].startswith('cmp-') else 'tenses'


def frequencies(items, key, fallback=None):
    return dict(sorted(Counter(item.get(key, fallback) for item in items).items()))


def build():
    rows = read_source()
    assert len(rows) == 1040 and Counter(row['type'] for row in rows) == dict(gap=700, mc=200, fix=50, meaning=50, text=40)
    assert len({row['id'] for row in rows}) == len(rows)
    converted = [adapt(row) for row in rows]
    destination = ROOT / 'data/exercises'
    manifest_path = destination / 'index.json'
    manifest = json.loads(manifest_path.read_text())
    existing_parts = [part for part in manifest['parts'] if part.get('section') != 'modals']
    # Guard every old record and file; only append new, dedicated modal chunks.
    old_items = [item for part in existing_parts for item in json.loads((ROOT / part['file']).read_text())]
    assert len(old_items) == 6379 and all(section(item) != 'modals' for item in old_items)
    first_number = max(int(Path(part['file']).stem.split('-')[1]) for part in existing_parts) + 1
    parts = []
    for offset in range(0, len(converted), 100):
        chunk = converted[offset:offset + 100]
        file = f'data/exercises/part-{first_number + offset // 100:02d}.json'
        path = ROOT / file
        if path.exists():
            previous = json.loads(path.read_text())
            assert all(item.get('topic') == 'modals' for item in previous), f'Refusing to replace non-modal part: {file}'
        path.write_text(json.dumps(chunk, ensure_ascii=False, indent=2) + '\n')
        parts.append(dict(file=file, count=len(chunk), section='modals',
                          levels=frequencies(chunk, 'cefr_estimate', 'unrated'),
                          types=frequencies(chunk, 'type'), levels3=frequencies(chunk, 'level')))
    current_files = {part['file'] for part in parts}
    for previous in manifest['parts']:
        if previous.get('section') == 'modals' and previous['file'] not in current_files:
            obsolete = ROOT / previous['file']
            assert all(item.get('topic') == 'modals' for item in json.loads(obsolete.read_text()))
            obsolete.unlink()
    bank = old_items + converted
    sections = dict(manifest['sections'])
    sections['modals'] = len(converted)
    manifest.update(total_items=len(bank), answer_slots=sum(len(item.get('blanks', [])) or 1 for item in bank),
                    parts=existing_parts + parts, sections=sections,
                    types=frequencies(bank, 'type'), levels=frequencies(bank, 'cefr_estimate', 'unrated'),
                    levels3=frequencies(bank, 'level'),
                    section_types={name: frequencies([item for item in bank if section(item) == name], 'type') for name in sections})
    manifest['content_versions']['modals'] = VERSION
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(f'Modals: {len(converted)} records, {sum(len(item.get("blanks", [])) or 1 for item in converted)} answer fields; existing 6379 records preserved.')


if __name__ == '__main__':
    build()
