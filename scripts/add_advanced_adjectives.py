"""Append the reviewed adjective pack without rebuilding any existing records.

The authored source stays outside public assets. Existing exercise revisions and
attempt snapshots are untouched. Re-running is deterministic and idempotent.
"""
import json
import re
from collections import Counter
from pathlib import Path
from build_comparisons import RULES

ROOT = Path(__file__).resolve().parents[1]
REVIEW = ROOT / 'docs/review/ADJECTIVES-ADVANCED-2026-11-01'
VERSION = 'comparison-2026-11-01.1'
PART = 'data/exercises/part-48.json'
PREFIX = 'cmp-adv-20261101-'


def read(path):
    return json.loads(path.read_text())


def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def authored_items():
    items = []
    for line in (REVIEW / 'authored.txt').read_text().splitlines():
        if not line or line.startswith('#'):
            continue
        rule, cefr, prompt, keys, reasons = line.split('|')
        target, anchor, _ = RULES[rule]
        bases = re.findall(r'\(([^)]+)\)', prompt)
        answers = [key.split('~') for key in keys.split(';')]
        explanations = reasons.split(';')
        ident = PREFIX + f'{len(items)+1:03d}'
        assert len(bases) == len(answers) == len(explanations), ident
        refs = [f'content/comparison/06-comparison.md#{anchor}']
        blanks = [dict(id=ident + f'-b{n}', base_adjective=base,
                       answer=variants[0], accepted_answers=variants,
                       rule_refs=refs, explanation_ru=explanation)
                  for n, (base, variants, explanation) in enumerate(
                      zip(bases, answers, explanations), 1)]
        values = iter(b['answer'] for b in blanks)
        items.append(dict(id=ident, type='open_brackets', prompt=prompt,
                          level='advanced', cefr_estimate=cefr,
                          topic='comparison', content_version=VERSION,
                          response_contract='bounded-v1', practice_tenses=[target],
                          tags=[target], rule_refs=refs, blanks=blanks,
                          answer_text=re.sub(r'\([^)]+\)', lambda _: next(values), prompt),
                          explanation_ru=' '.join(f'{n}) {reason}' for n, reason in enumerate(explanations, 1))))
    assert len(items) == 60
    assert len({i['prompt'].casefold() for i in items}) == 60
    assert set(i['practice_tenses'][0] for i in items) == {
        'cmp_forms', 'cmp_superlatives', 'cmp_equality', 'cmp_development', 'cmp_precision'}
    return items


def main():
    manifest_path = ROOT / 'data/exercises/index.json'
    manifest = read(manifest_path)
    items = authored_items()
    destination = ROOT / PART
    existing = {p['file']: read(ROOT / p['file']) for p in manifest['parts'] if p['file'] != PART}
    assert sum(map(len, existing.values())) == 4649
    assert not {i['id'] for bank in existing.values() for i in bank} & {i['id'] for i in items}
    if destination.exists():
        assert read(destination) == items, 'Refusing to overwrite a different part-48'
    write(destination, items)
    parts = [*existing.items(), (PART, items)]
    descriptors = []
    for file, chunk in parts:
        descriptors.append(dict(file=file, count=len(chunk),
            levels=dict(sorted(Counter(i['cefr_estimate'] for i in chunk).items())),
            types=dict(sorted(Counter(i['type'] for i in chunk).items())),
            levels3=dict(sorted(Counter(i['level'] for i in chunk).items()))))
    bank = [i for _, chunk in parts for i in chunk]
    manifest.update(parts=descriptors, total_items=len(bank),
        answer_slots=sum(len(i.get('blanks', [])) or 1 for i in bank),
        levels=dict(sorted(Counter(i['cefr_estimate'] for i in bank).items())),
        types=dict(sorted(Counter(i['type'] for i in bank).items())),
        levels3=dict(sorted(Counter(i['level'] for i in bank).items())),
        sections=dict(sorted(Counter(i.get('topic', 'tenses') for i in bank).items())))
    # Some historical tense records have no topic property.
    manifest['sections'] = {'comparison': sum(i['id'].startswith('cmp-') for i in bank),
                            'tenses': sum(not i['id'].startswith('cmp-') for i in bank)}
    manifest['content_versions']['comparison'] = VERSION
    write(manifest_path, manifest)
    print(f'{len(items)} advanced adjective exercises, {sum(len(i["blanks"]) for i in items)} fields; {len(bank)} total.')


if __name__ == '__main__':
    main()
