"""The manifest is the sole source of current bank versions."""
import json
from pathlib import Path
import re

MANIFEST = json.loads((Path(__file__).resolve().parents[1] / 'data/exercises/index.json').read_text())
VERSIONS = MANIFEST['content_versions']

def version_parts(value, section):
    match = re.fullmatch(re.escape(section) + r'-(\d{4})-(\d{2})-(\d{2})\.(\d+)', value)
    assert match, f'Invalid {section} version: {value}'
    return tuple(map(int, match.groups()))

def validate_version(item, versions):
    section = item['topic'] if item.get('topic') in {'passive', 'modals', 'reported', 'nouns'} else 'comparison' if item['id'].startswith('cmp-') else 'tenses'
    assert version_parts(item['content_version'], section) <= version_parts(versions[section], section), item['id']
