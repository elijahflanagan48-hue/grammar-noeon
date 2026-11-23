#!/usr/bin/env python3
"""Compile approved bankgen JSONL without rewriting editorial content.

Usage: python3 -B scripts/build_bankgen.py reported --date 2026-11-22
Old IDs remain available for issued assignments; only the selected topic changes.
"""
from __future__ import annotations

import argparse
from collections import Counter
import datetime
import json
from pathlib import Path
import re

from audit_variety import skeleton
from bankgen import check_item
from bankgen_specs import SPECS

ROOT = Path(__file__).resolve().parents[1]
INSTRUCTIONS = {
    'gap': 'Раскройте скобки.', 'mini': 'Раскройте скобки в тексте.',
    'mc': 'Выберите правильный вариант.',
    'which': 'Выберите предложение, которое подходит к ситуации.',
    'fix': 'Исправьте ошибку. Если ошибки нет, перепишите предложение без изменений.',
    'transform': 'Преобразуйте исходное предложение. Напишите новое предложение целиком.',
}
GROUPS = dict(gap='sentence', mini='mini_text', mc='choice', which='choice',
              fix='error_fix', transform='transformation')
WEIGHTS = dict(sentence=40, mini_text=25, choice=20, error_fix=10, transformation=5)
REPORTED_REFS = dict(R1=['rs02', 'rs03'], R2=['rs04'],
                     R3=['rs05', 'rs06', 'rs07'], R4=['rs09', 'rs10'],
                     R5=['rs11', 'rs12', 'rs13', 'rs15'],
                     R6=['rs14', 'rs16', 'rs17', 'rs18', 'rs19'],
                     R7=['rs08', 'rs20'], R8=['rs-check'], R9=['rs-check'])


def dump(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(value, ensure_ascii=False, indent=2) + '\n'
    if not path.exists() or path.read_text() != text:
        path.write_text(text)


def read_final(root, topic):
    spec = SPECS[topic]
    base = root / 'content/bankgen' / topic
    paths = sorted((base / 'final').glob('*.jsonl'))
    if not paths:
        raise ValueError('No approved final JSONL files for ' + topic)
    plan_path = base / 'plan.json'
    plan = json.loads(plan_path.read_text()) if plan_path.exists() else None
    batches = {b['batch']: b for b in plan['batches']} if plan else {}
    if batches and {p.stem for p in paths} != set(batches):
        raise ValueError('Final batches do not match plan.json')
    cells = {c['id'] for c in spec['cells']}
    constructions = {t for c in spec['cells'] for t in c['cons']}
    # The optional seed catalogue belongs to this root, not another checkout.
    seeds = {}
    for path in sorted((base / 'seeds').glob('*.jsonl')):
        for line in path.read_text().splitlines():
            if line.strip().startswith('{'):
                row = json.loads(line)
                seeds[row['seed_id']] = row
    rows, seen_ids, seen_seeds = [], set(), {}
    for path in paths:
        batch = []
        for number, line in enumerate(path.read_text().splitlines(), 1):
            if not line.strip() or line.lstrip().startswith('# check:'):
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError as error:
                raise ValueError(f'{path.name}:{number}: {error}') from error
            errors, _ = check_item(row, spec, constructions, cells, seeds, seen_seeds)
            if not re.fullmatch(re.escape(path.stem) + r'-\d{2,}', row.get('id', '')):
                errors.append('source ID does not match batch')
            if row.get('id') in seen_ids:
                errors.append('duplicate source ID')
            if batches and row.get('cell') != batches[path.stem]['cell']:
                errors.append('cell does not match plan')
            if errors:
                raise ValueError(str(row.get('id')) + ': ' + '; '.join(errors))
            seen_ids.add(row['id'])
            batch.append(row)
        if batches and len(batch) != batches[path.stem]['size']:
            raise ValueError(path.stem + ': count does not match plan')
        rows.extend(batch)
    if not rows:
        raise ValueError('Empty approved bank')
    return rows


def convert(rows, topic, mapping, version, reserved_ids=(), rule_refs=None):
    code = SPECS[topic]['code']
    if len(set(mapping.values())) != len(mapping):
        raise ValueError('Duplicate output ID in id-map')
    used = set(mapping.values()) | set(reserved_ids)
    result = []
    for row in rows:
        source, cell, fmt = row['id'], row['cell'], row['format']
        prefix = f'{code}-{cell}-'
        if source not in mapping:
            numbers = [int(x[len(prefix):]) for x in used
                       if x.startswith(prefix) and x[len(prefix):].isdigit()]
            mapping[source] = prefix + f'{max(numbers, default=0)+1:03d}'
            used.add(mapping[source])
        ident = mapping[source]
        if not re.fullmatch(re.escape(prefix) + r'\d{3,}', ident):
            raise ValueError('Cell/code changed for ' + source)
        tags = list(dict.fromkeys([b['construction'] for b in row.get('blanks', [])]
                                 + ([row['construction']] if row.get('construction') else [])))
        refs = (rule_refs.get(cell) if isinstance(rule_refs, dict) else rule_refs) or [f'#theory/{topic}']
        group = GROUPS[fmt]
        item = dict(id=ident, topic=topic, level=row['level'], content_version=version,
                    response_contract='bounded-v1', answer_profile='english-standard-v2',
                    bankgen_id=source, bankgen_format=fmt, prompt=row['prompt'],
                    instruction_ru=INSTRUCTIONS[fmt], explanation_ru=row['explanation_ru'],
                    rule_refs=refs, cell=cell, genre=row['genre'], seed_id=row['seed_id'],
                    skeleton=skeleton(row['prompt']), practice_tenses=tags, tags=tags,
                    practice_group=group, practice_weight=WEIGHTS[group])
        if fmt in ('gap', 'mini'):
            item.update(type='open_brackets', layout=group, blanks=[])
            for n, blank in enumerate(row['blanks'], 1):
                field = dict(id=f'{ident}-b{n}', answer=blank['answer'],
                             accepted_answers=list(blank['accepted_answers']),
                             base_verb=blank['cue'],
                             supplied_words=[p.strip() for p in blank['cue'].split('/')
                                             if not p.strip().startswith('to ')],
                             tense_or_construction=blank['construction'],
                             explanation_ru=row['explanation_ru'], rule_refs=refs)
                if 'voice' in blank:
                    field['voice'] = blank['voice']
                item['blanks'].append(field)
            answers = iter(b['answer'] for b in row['blanks'])
            item['answer_text'] = re.sub(r'\([^()]+\)', lambda _: next(answers), row['prompt'])
        elif fmt in ('mc', 'which'):
            options, ix = list(row['options']), row['correct_option_index']
            summary = row['prompt'].replace('___', options[ix]) if fmt == 'mc' else options[ix]
            item.update(type='multiple_choice', options=options, correct_option_index=ix,
                        accepted_option_indices=[ix], answer=options[ix], summary=summary,
                        answer_text=summary)
        elif fmt == 'fix':
            item.update(type='error_fix', answer=row['answer'],
                        accepted_answers=list(row['accepted_answers']),
                        answer_text=row['answer'], has_error=row['has_error'])
        else:
            item.update(type='direct_to_reported' if topic == 'reported' else 'transformation',
                        answer_text=row['answer'], blanks=[dict(
                            id=ident+'-b1', answer=row['answer'],
                            accepted_answers=list(row['accepted_answers']),
                            tense_or_construction=row['construction'],
                            explanation_ru=row['explanation_ru'], rule_refs=refs)])
        result.append(item)
    return result


def build(topic, date, root=ROOT):
    datetime.date.fromisoformat(date)
    base = root / 'content/bankgen' / topic
    rows = read_final(root, topic)
    version = f'{topic}-{date}.1'
    mapping_path = base / 'id-map.json'
    mapping = json.loads(mapping_path.read_text()) if mapping_path.exists() else {}
    manifest_path = root / 'data/exercises/index.json'
    manifest = json.loads(manifest_path.read_text())
    previous_version = manifest.get('content_versions', {}).get(topic, '')
    if previous_version:
        def version_key(value):
            return tuple(int(n) for n in re.findall(r'\d+', value.removeprefix(topic+'-')))
        if version_key(previous_version) > version_key(version):
            raise ValueError('Refusing to downgrade ' + previous_version + ' to ' + version)
    parts = {p['file']: json.loads((root / p['file']).read_text()) for p in manifest['parts']}
    original = [i for part in parts.values() for i in part]
    theory = json.loads((root / 'data/theory.json').read_text())
    refs = [entry['file'] for entry in theory if entry['id'] == topic]
    if topic == 'tenses':
        refs = [entry['file'] for entry in theory if entry['id'] in ('present', 'past', 'future')]
    if not refs or any(not (root / ref).is_file() for ref in refs):
        raise ValueError('Missing theory for ' + topic)
    if topic == 'reported':
        text = (root / refs[0]).read_text()
        for anchors in REPORTED_REFS.values():
            for anchor in anchors:
                if not re.search(r'id=[\'\"]'+re.escape(anchor)+r'[\'\"]', text):
                    raise ValueError('Missing theory anchor: ' + anchor)
        refs = {cell: [refs[0]+'#'+anchor for anchor in anchors]
                for cell, anchors in REPORTED_REFS.items()}
    else:
        anchored = []
        for ref in refs:
            text = (root / ref).read_text()
            anchors = re.findall(r'\bid=[\'\"]([^\'\"]+)[\'\"]', text)
            if not anchors:
                heading = re.search(r'^#{1,6}\s+(.+)', text, re.M)
                if heading:
                    anchors = [re.sub(r'[^\w\s-]', '', heading[1].lower()).strip().replace(' ', '-')]
            if not anchors:
                raise ValueError('No theory anchor in ' + ref)
            anchored.append(ref+'#'+anchors[0])
        refs = anchored
    def section(item):
        return item.get('topic') or ('comparison' if item['id'].startswith('cmp-') else 'tenses')
    new = convert(rows, topic, mapping, version, [i['id'] for i in original], refs)
    new_ids = {i['id'] for i in new}
    if any(i['id'] in new_ids and section(i) != topic for i in original):
        raise ValueError('Output ID collides with another topic')
    owners = {i['id']: i['bankgen_id'] for i in new}
    if any(i['id'] in owners and i.get('bankgen_id') != owners[i['id']] for i in original):
        raise ValueError('Output ID already belongs to a different historical task')
    keep_path = base / 'keep.txt'
    keep = {s.strip() for s in keep_path.read_text().splitlines()
            if s.strip() and not s.lstrip().startswith('#')} if keep_path.exists() else set()
    old = [dict(i) for i in original if section(i) == topic and i['id'] not in new_ids]
    if keep - {i['id'] for i in old}:
        raise ValueError('Unknown retained IDs: ' + ', '.join(sorted(keep - {i['id'] for i in old})))
    for item in old:
        if item['id'] in keep:
            item.pop('retired', None)
        else:
            item['retired'] = topic + '-bankgen'
    topic_items = old + new
    files = [f for f, chunk in parts.items() if any(section(i) == topic for i in chunk)]
    if any(any(section(i) != topic for i in parts[f]) for f in files):
        raise ValueError('Mixed topic part; refusing to rewrite another topic')
    chunks = [topic_items[n:n+100] for n in range(0, len(topic_items), 100)]
    next_part = max((int(Path(f).stem.split('-')[1]) for f in parts), default=0) + 1
    while len(files) < len(chunks):
        path = f'data/exercises/part-{next_part:02d}.json'
        next_part += 1
        if (root / path).exists():
            raise ValueError('Unlisted part would be overwritten: ' + path)
        files.append(path)
        manifest['parts'].append({'file': path})
    for n, path in enumerate(files):
        parts[path] = chunks[n] if n < len(chunks) else []
    all_items = [i for p in manifest['parts'] for i in parts[p['file']]]
    if len({i['id'] for i in all_items}) != len(all_items):
        raise ValueError('Duplicate bank ID')
    for entry in manifest['parts']:
        if entry['file'] in files:
            chunk = parts[entry['file']]
            entry.update(section=topic, count=len(chunk),
                         types=dict(Counter(i['type'] for i in chunk)),
                         levels3=dict(Counter(i['level'] for i in chunk)),
                         levels=dict(Counter(i.get('cefr_estimate', 'unrated') for i in chunk)))
    manifest.update(total_items=len(all_items),
                    answer_slots=sum(len(i.get('blanks', [])) or 1 for i in all_items))
    for key, field in [('types', 'type'), ('levels3', 'level')]:
        manifest[key] = dict(Counter(i[field] for i in all_items))
    manifest['levels'] = dict(Counter(i.get('cefr_estimate', 'unrated') for i in all_items))
    manifest['sections'][topic] = len(topic_items)
    manifest['section_types'][topic] = dict(Counter(i['type'] for i in topic_items if not i.get('retired')))
    manifest['content_versions'][topic] = version
    release_path = root / 'docs/current-release.json'
    release = json.loads(release_path.read_text())
    release.update(content_versions=manifest['content_versions'], total_items=len(all_items),
                   answer_slots=manifest['answer_slots'], parts=len(manifest['parts']),
                   sections=manifest['sections'])
    # No changes to passive_v7_status or any other topic's release state.
    for path in files:
        dump(root / path, parts[path])
    dump(mapping_path, mapping)
    dump(manifest_path, manifest)
    dump(release_path, release)
    print(f'{topic}: {len(new)} approved, {len(keep)} retained, '
          f'{sum(bool(i.get("retired")) for i in old)} archived; {version}')
    return new


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('topic', choices=sorted(SPECS))
    parser.add_argument('--date', default=datetime.datetime.now(
        datetime.timezone(datetime.timedelta(hours=3))).date().isoformat())
    args = parser.parse_args()
    try:
        build(args.topic, args.date)
    except (ValueError, KeyError, TypeError) as error:
        parser.exit(1, str(error)+'\n')
