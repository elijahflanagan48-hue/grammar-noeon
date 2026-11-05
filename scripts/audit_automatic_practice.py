"""Finite-response contract and editorial change ledger, not linguistic certification."""
import json
from collections import Counter
from pathlib import Path
from automatic_practice import EDITS, BOUNDED, VERSIONS, reviewed_copy

ROOT=Path(__file__).resolve().parents[1]

def audit():
    bank=[i for path in sorted((ROOT/'data/exercises').glob('part-*.json')) for i in json.loads(path.read_text())]
    assert len(bank)==1424
    rows=[]
    for item in bank:
        assert item['response_contract']=='bounded-v1'
        assert item.get('options') or item.get('blanks'),item['id']
        assert item['type'] not in {'translation_ru_en','transformation','error_correction'},item['id']
        assert item==reviewed_copy(item),(item['id'],'review must be idempotent')
        assert item['explanation_ru'] and item['rule_refs']
        rows.append(dict(id=item['id'],version=item['content_version'],type=item['type'],fields=len(item.get('blanks',[])) or 1,review='explicit_choice_replacement' if item['id'] in EDITS or item['id'] in BOUNDED else 'bounded_key_and_structure',rule_refs=item['rule_refs']))
    summary=dict(versions=VERSIONS,total=len(bank),fields=sum(r['fields'] for r in rows),types=dict(Counter(r['type'] for r in rows)),replacements=sum(r['review']=='explicit_choice_replacement' for r in rows),scope='Structural and finite-key audit of all records; explicit editorial replacement of flagged items. Not independent linguistic certification or a guarantee against every possible error.',records=rows)
    (ROOT/'docs/review/AUTOMATIC-PRACTICE-LEDGER-2026-10-28.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in summary.items() if k!='records'},ensure_ascii=False))

if __name__=='__main__':audit()
