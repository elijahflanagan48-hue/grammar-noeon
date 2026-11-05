"""Reproducible structural triage ledger; not a claim of linguistic certification."""
import json
from collections import Counter
from pathlib import Path
from tense_clarity_review import CHOICES, EXTRAS, PROMPTS, RESULT_PAST
from automatic_practice import VERSIONS, reviewed_copy
VERSION=VERSIONS['tenses']

ROOT = Path(__file__).resolve().parents[1]

def audit():
    bank = [i for p in sorted((ROOT/'data/exercises').glob('part-*.json')) for i in json.loads(p.read_text()) if not i['id'].startswith('cmp-')]
    assert len(bank)==1115
    records=[]
    for item in bank:
        ident=item['id']
        assert item['content_version']==VERSION, ident
        assert item.get('explanation_ru') and item.get('rule_refs'), ident
        assert reviewed_copy(item)==item, (ident,'Non-idempotent review')
        if item.get('options'):
            indices=item.get('accepted_option_indices',[item['correct_option_index']])
            assert 0<len(set(indices))<len(item['options']), ident
        categories=[]
        for mapping,label in [(CHOICES,'concrete_choice'),(EXTRAS,'local_alternatives'),(RESULT_PAST,'result_past_variant'),(PROMPTS,'context')]:
            if ident in mapping: categories.append(label)
        if ident=='adv-cloze-003':categories.append('verb_only_inversion')
        if ident in {'src-u01-040','src-u09-064'}:categories.append('supplied_adverb')
        records.append(dict(id=ident,level=item['cefr_estimate'],type=item['type'],review=categories or ['structural_triage'],rule_refs=item['rule_refs']))
    result=dict(version=VERSION,scope='Structural triage of all records; editorial changes to flagged cases, not independent expert certification.',total=len(records),edited_records=sum(r['review']!=['structural_triage'] for r in records),display_only_completed_text=['new-cloze-001','new-cloze-004','adv-cloze-005'],categories=dict(Counter(c for r in records for c in r['review'])),records=records)
    target=ROOT/'docs/review/TENSE-CLARITY-LEDGER-2026-10-28.json'
    target.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in result.items() if k!='records'},ensure_ascii=False))

if __name__=='__main__':audit()
