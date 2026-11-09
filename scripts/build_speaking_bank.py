#!/usr/bin/env python3
"""Собирает банк Say · Tell · Speak · Talk из docs/speaking-verbs/source/part-*.jsonl в data/exercises и обновляет манифест."""
import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))
import speaking_bank as SB  # noqa: E402

SECTION = 'speaking'


def section(item):
    if item.get('topic') in ('passive', 'modals', 'reported', 'nouns', 'speaking'):
        return item['topic']
    return 'comparison' if item['id'].startswith('cmp-') else 'tenses'


def freq(items, key, fallback=None):
    return dict(sorted(Counter(item.get(key, fallback) for item in items).items()))


def build():
    src = sorted((ROOT / 'docs/speaking-verbs/source').glob('part-*.jsonl'))
    rows = SB.load(src)
    errs, _ = SB.check(rows)
    assert not errs, errs[:5]
    assert len(rows) == 500 and len({r['id'] for r in rows}) == 500
    converted = [SB.site_item(r) for r in sorted(rows, key=lambda r: r['id'])]
    dest = ROOT / 'data/exercises'
    mpath = dest / 'index.json'
    manifest = json.loads(mpath.read_text())
    existing = [p for p in manifest['parts'] if p.get('section') != SECTION]
    old = [i for p in existing for i in json.loads((ROOT / p['file']).read_text())]
    assert all(section(i) != SECTION for i in old)
    first = max(int(Path(p['file']).stem.split('-')[1]) for p in existing) + 1
    parts = []
    for off in range(0, len(converted), 100):
        chunk = converted[off:off + 100]
        file = f'data/exercises/part-{first + off // 100:02d}.json'
        path = ROOT / file
        if path.exists():
            assert all(i.get('topic') == SECTION for i in json.loads(path.read_text())), file
        path.write_text(json.dumps(chunk, ensure_ascii=False, indent=2) + '\n')
        parts.append(dict(file=file, count=len(chunk), section=SECTION, types=freq(chunk, 'type'),
                          levels3=freq(chunk, 'level'), levels=freq(chunk, 'cefr_estimate', 'unrated')))
    bank = old + converted
    sections = dict(manifest['sections'])
    sections[SECTION] = len(converted)
    manifest.update(total_items=len(bank), answer_slots=sum(len(i.get('blanks', [])) or 1 for i in bank),
                    parts=existing + parts, sections=sections, types=freq(bank, 'type'),
                    levels=freq(bank, 'cefr_estimate', 'unrated'), levels3=freq(bank, 'level'),
                    section_types={n: freq([i for i in bank if section(i) == n], 'type') for n in sections})
    manifest['content_versions'][SECTION] = SB.VERSION
    mpath.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(f'{SECTION}: {len(converted)} items in {len(parts)} parts; total {len(bank)}')


if __name__ == '__main__':
    build()
