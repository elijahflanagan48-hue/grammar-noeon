#!/usr/bin/env python3
"""Validate the generated public content bundle."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    manifest = json.loads((ROOT / "data/exercises/index.json").read_text(encoding="utf-8"))
    items = []
    for part in manifest["parts"]:
        chunk = json.loads((ROOT / part["file"]).read_text(encoding="utf-8"))
        assert len(chunk) == part["count"], part["file"]
        items.extend(chunk)

    assert len(items) == manifest["total_items"] == 1115
    assert len({item["id"] for item in items}) == len(items)
    assert manifest["answer_slots"] == 1479
    assert manifest["excluded_non_publishable"] == 62
    assert sum(1 for x in items if x.get("cefr_estimate") in {"B2", "C1", "C2"}) == 153

    forbidden = {"publishable", "source", "source_prompt", "license_note", "provenance"}
    expected_types = {
        "open_brackets", "translation_ru_en", "multiple_choice", "meaning_choice",
        "discourse_choice", "error_correction", "transformation", "context_cloze",
    }
    assert {x["type"] for x in items} == expected_types

    for item in items:
        assert not forbidden.intersection(item), item["id"]
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
            for blank in blanks:
                assert blank.get("answer"), blank["id"]
                assert blank.get("explanation_ru") or item.get("explanation_ru"), blank["id"]
        else:
            assert item.get("answer") is not None, item["id"]

    theory = json.loads((ROOT / "data/theory.json").read_text(encoding="utf-8"))
    assert len(theory) == 5
    assert all(entry["id"] != "sources" for entry in theory)
    assert not (ROOT / "content/theory/SOURCES.md").exists()
    for entry in theory:
        assert (ROOT / entry["file"]).is_file()

    print("Content validation passed: 1,115 exercises, 1,479 answer slots, 5 theory sections.")


if __name__ == "__main__":
    main()
