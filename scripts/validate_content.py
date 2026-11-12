#!/usr/bin/env python3
"""Validate the generated public content bundle."""

from __future__ import annotations

import json
import re
from pathlib import Path
from content_repairs import SLOT, ADVERBS
from bank_versions import validate_version
from build_modal_verbs import SOURCE, adapt, read_source


ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    manifest = json.loads((ROOT / "data/exercises/index.json").read_text(encoding="utf-8"))
    items = []
    for part in manifest["parts"]:
        chunk = json.loads((ROOT / part["file"]).read_text(encoding="utf-8"))
        assert len(chunk) == part["count"], part["file"]
        items.extend(chunk)

    passive = [item for item in items if item.get('topic')=='passive']
    tenses = [item for item in items if not item['id'].startswith('cmp-') and item.get('topic') not in {'passive','modals','reported','nouns','speaking','infinitive'}]
    modals = [item for item in items if item.get('topic') == 'modals']
    assert len(modals) == manifest['sections']['modals'] == 1040
    if (SOURCE / 'data/modal-verbs.exercises.jsonl').exists():
        assert modals == [adapt(row) for row in read_source()], 'Modal adapter changed author content or ordering'
    else:
        print('SKIP modal source comparison: author package is not in the repository')
    reported=[i for i in items if i.get('topic')=='reported']
    assert len(reported)==manifest['sections']['reported']==1000
    reported=[i for i in items if i.get('topic')=='reported']
    assert len(reported)==manifest['sections']['reported']==1000
    reported=[i for i in items if i.get('topic')=='reported']
    assert len(reported)==manifest['sections']['reported']==1000
    nouns=[i for i in items if i.get('topic')=='nouns']
    assert len(nouns)==manifest['sections']['nouns']==1000
    speaking=[i for i in items if i.get('topic')=='speaking']
    assert len(speaking)==manifest['sections']['speaking']==500
    infinitive=[i for i in items if i.get('topic')=='infinitive']
    assert len(infinitive)==manifest['sections']['infinitive']==1000
    comparisons = [item for item in items if item['id'].startswith('cmp-')]
    assert len(tenses) == manifest["sections"]["tenses"]
    assert len(comparisons) == manifest["sections"]["comparison"]
    assert len(passive)==manifest['sections']['passive']==1000
    assert len(items) == manifest["total_items"]
    assert len({item["id"] for item in items}) == len(items)
    assert manifest["answer_slots"] == sum(len(item.get("blanks", [])) or 1 for item in items)
    assert manifest["excluded_non_publishable"] == 62

    forbidden = {"publishable", "source", "source_prompt", "license_note", "provenance"}
    expected_types = {
        "open_brackets", "multiple_choice", "context_cloze", "active_to_passive", "translation_ru_en", "direct_to_reported", "direct_to_reported", "direct_to_reported",
        "modal_gap", "modal_meaning", "modal_fix",
    }
    assert {x["type"] for x in items} == expected_types

    for section in (tenses, comparisons, passive, nouns):
        assert sum(i['type']=='open_brackets' for i in section)*5 >= len(section)*(3 if section is nouns else 4)

    assert manifest["levels3"] == dict(__import__("collections").Counter(i["level"] for i in items))
    for item in items:
        if item.get('topic') not in ('modals','reported','nouns','speaking','infinitive'):
            assert not re.search(r"\bshall\b|\bshan[’']t\b", json.dumps(item, ensure_ascii=False), re.I), (item['id'], 'shall in current exercise')
        assert item.get("level") in {"basic", "medium", "advanced"}, item["id"]
        assert not forbidden.intersection(item), item["id"]
        assert item.get('response_contract') == ('manual-review-v1' if item['type']=='translation_ru_en' else 'bounded-v1'), item['id']
        assert item.get('options') or item.get('blanks'), item['id']
        validate_version(item, manifest['content_versions'])
        if item.get('options'):
            indices=item.get('accepted_option_indices',[item['correct_option_index']])
            assert item['correct_option_index'] in indices, item['id']
            assert all(type(n) is int and 0 <= n < len(item['options']) for n in indices), item['id']
            assert len(set(indices)) < len(item['options']), (item['id'],'Every choice is accepted')
            correct = item['options'][item['correct_option_index']]
            expected = item['prompt'].replace('___', correct) if item['type'] == 'multiple_choice' and item['prompt'].count('___') == 1 else correct
            assert re.sub(r'^\s*\d+\s*[.)]\s+', '', item['answer']) in {correct, expected}, item['id']
        for field in item.get('blanks') or [item]:
            if not item.get('options'):
                maximum=64 if item.get('answer_profile')=='english-standard-v2' else 6 if item.get('answer_profile')=='modal-exact-v1' else 2
                assert 1 <= len(field.get('accepted_answers', [])) <= maximum, (item['id'], 'Reviewed answer variants per field')
                assert field['answer'] in field.get('accepted_answers',[]), (item['id'],'Canonical answer omitted')
        assert item.get("prompt")
        assert item.get("explanation_ru")
        refs = item.get("rule_refs", [])
        blanks = item.get("blanks", [])
        assert refs or all(blank.get("rule_refs") for blank in blanks), item["id"]
        if blanks:
            if item["type"] == "open_brackets":
                assert "___" not in item["prompt"], item["id"]
                placeholders = re.findall(r"\((?:to )?[^)]+\)", item["prompt"])
                assert len(placeholders) == len(blanks), item["id"]
                answers = iter(b['answer'] for b in blanks)
                completed = SLOT.sub(lambda _: next(answers), item['prompt'])
                assert item['answer_text'] == completed, (item['id'], 'Completed text differs from keys')
                pieces = SLOT.split(item['prompt'])
                for index, blank in enumerate(blanks):
                    for word in ADVERBS:
                        if re.search(r'\b' + word + r'\b', blank['answer'], re.I):
                            assert not re.search(r'\b' + word + r'\s*$', pieces[index], re.I), (item['id'], 'Repeated adverb before blank')
                            assert not re.match(r'\s*' + word + r'\b', pieces[index+1], re.I), (item['id'], 'Repeated adverb after blank')
            for blank in blanks:
                assert blank.get("answer"), blank["id"]
                assert blank.get("explanation_ru") or item.get("explanation_ru"), blank["id"]
        else:
            assert item.get("answer") is not None, item["id"]

    theory = json.loads((ROOT / "data/theory.json").read_text(encoding="utf-8"))
    assert len(theory) == 12
    assert {entry['id'] for entry in theory} == {'foundations', 'present', 'past', 'future', 'contrasts', 'comparison', 'passive', 'modals', 'reported', 'nouns', 'speaking', 'infinitive'}
    assert all(entry["id"] != "sources" for entry in theory)
    assert not (ROOT / "content/theory/SOURCES.md").exists()
    for entry in theory:
        assert (ROOT / entry["file"]).is_file()

    print(f"Content validation passed: {len(tenses)} tense, {len(comparisons)} comparison and {len(passive)} passive, {len(modals)} modal exercises, {manifest['answer_slots']} answer slots, {len(theory)} theory sections.")


if __name__ == "__main__":
    main()
