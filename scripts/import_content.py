#!/usr/bin/env python3
"""Build the public, static data bundle from the editorial source directory."""

from __future__ import annotations

import argparse
import json
import re
import shutil
from collections import Counter
from pathlib import Path


THEORY_FILES = [
    ("foundations", "01-foundations.md", "Основы системы времён"),
    ("present", "02-present.md", "Настоящее время"),
    ("past", "03-past.md", "Прошедшее время"),
    ("future", "04-future.md", "Будущее время"),
    ("contrasts", "05-contrasts-and-pitfalls.md", "Сопоставления и подводные камни"),
    ("sources", "SOURCES.md", "Источники и редакционные принципы"),
]

EXERCISE_FILES = [
    "source-exercise-bank.json",
    "original-supplement.json",
    "advanced-pack-b2-c2.json",
]

# These source sentences tested inversion by hiding subjects inside answer fields.
# On the learner-facing site, open-brackets tasks must ask for verb forms only.
# The same tense contrast is retained with a natural, fully visible sentence frame.
VERB_ONLY_CORRECTIONS = {
    "src-u05-083": ("He (to open) the door only moments before he (to see) a beautiful bunch of flowers left on the doorstep.", ["had opened", "saw"]),
    "src-u05-084": ("She (to finish) reading the report just before he (to come) into the office with yet another stack of work.", ["had finished", "came"]),
    "src-u07-013": ("I (to go) to bed only moments before my phone (to ring) with what turned out to be a completely unnecessary notification.", ["had gone", "rang"]),
    "src-u08-001": ("He (to fall) asleep only moments before his phone buzzed loudly with an urgent notification.", ["had fallen"]),
    "src-u08-002": ("She (to finish) reading the last chapter just before he walked into the room.", ["had finished"]),
    "src-u08-045": ("He (to tell) me that he was in trouble only moments before I (to offer) him my help.", ["had told", "offered"]),
    "src-u08-050": ("He (to read) the article just before he (to discuss) it excitedly with his colleague over coffee.", ["had read", "discussed"]),
    "src-u08-090": ("I (to hear) the wonderful news only moments before she (to begin) congratulating me with a huge smile.", ["had heard", "began"]),
    "src-u08-091": ("He (to read) the article just before he (to share) it enthusiastically with everyone in the group chat.", ["had read", "shared"]),
    "src-u08-092": ("I (to open) the front door only moments before I (to see) her standing there with a bunch of flowers.", ["had opened", "saw"]),
    "src-u09-006": ("She (to buy) brand-new AirPods only shortly before she (to lose) them somewhere on the way home.", ["had bought", "lost"]),
    "src-u09-016": ("I (to open) the front door only moments before I (to see) my neighbour. He (to walk) his dog in the heavy rain.", ["had opened", "saw", "was walking"]),
    "src-u09-029": ("The artist (to appear) on the stage only moments before the excited crowd (to begin) to cheer and applaud loudly.", ["had appeared", "began"]),
    "src-u09-030": ("I (to finish) my last-minute revision only moments before the power suddenly (to go) out in the entire building.", ["had finished", "went"]),
    "src-u09-055": ("They (to get) the exciting news only moments before they (to send) us a very enthusiastic voice message.", ["had got", "sent"]),
    "src-u10-032": ("He (to finish) the last piece of work just before he (to go) straight to bed — he was completely drained.", ["had finished", "went"]),
    "src-u10-097": ("He (to finish) his morning workout only moments before his friend (to call) him with some very exciting news.", ["had finished", "called"]),
}

# Small editorial repairs that preserve the tested verb form while making the
# visible sentence frame idiomatic. Keeping them here makes future imports
# deterministic even when the upstream exercise bank is rebuilt.
SENTENCE_CORRECTIONS = {
    "src-u01-018": {
        "prompt": "18. When you wake up tomorrow morning, I (to work) for two hours on this urgent project.",
        "answer_text": "18. When you wake up tomorrow morning, I will have been working for two hours on this urgent project.",
        "marker": "for two hours",
    },
    "src-u01-061": {
        "prompt": "61. When you wake up tomorrow morning, I (to work) for three full hours on the big presentation.",
        "answer_text": "61. When you wake up tomorrow morning, I will have been working for three full hours on the big presentation.",
        "marker": "for three full hours",
    },
}


def first_paragraph(markdown: str) -> str:
    blocks = re.split(r"\n\s*\n", markdown)
    for block in blocks:
        line = " ".join(part.strip() for part in block.splitlines()).strip()
        if line and not line.startswith(("#", "|", "- ", ">")):
            return re.sub(r"[*_`]", "", line)[:240]
    return ""


def public_item(item: dict) -> dict:
    allowed = {
        "id", "type", "prompt", "answer", "answer_text", "accepted_answers",
        "explanation_ru", "review_note_ru", "rule_refs", "cefr_estimate",
        "options", "correct_option_index", "title", "blanks", "tags",
    }
    clean = {key: value for key, value in item.items() if key in allowed}
    if "blanks" in clean:
        blank_allowed = {
            "id", "base_verb", "answer", "accepted_answers",
            "tense_or_construction", "rule_refs", "explanation_ru",
        }
        clean["blanks"] = [
            {key: value for key, value in blank.items() if key in blank_allowed}
            for blank in clean["blanks"]
        ]
    correction = VERB_ONLY_CORRECTIONS.get(clean["id"])
    if correction:
        prompt, answers = correction
        clean["prompt"] = prompt
        explanations = []
        for index, answer in enumerate(answers):
            blank = clean["blanks"][index]
            blank["answer"] = answer
            blank["accepted_answers"] = [answer]
            if answer.startswith("had "):
                blank["tense_or_construction"] = "past_perfect"
                blank["rule_refs"] = ["content/tenses/03-past.md#past-perfect-simple"]
                blank["explanation_ru"] = "Past Perfect показывает действие, которое завершилось раньше другого события в прошлом."
            elif answer.startswith(("was ", "were ")):
                blank["tense_or_construction"] = "past_continuous"
                blank["rule_refs"] = ["content/tenses/03-past.md#past-continuous"]
                blank["explanation_ru"] = "Past Continuous показывает процесс, происходивший в рассматриваемый момент прошлого."
            else:
                blank["tense_or_construction"] = "past_simple"
                blank["rule_refs"] = ["content/tenses/03-past.md#past-simple"]
                blank["explanation_ru"] = "Past Simple обозначает последующее завершённое событие в прошлом."
            explanations.append(blank["explanation_ru"])
        if clean["id"] == "src-u08-090":
            clean["blanks"][0]["base_verb"] = "hear"
        clean["explanation_ru"] = " ".join(dict.fromkeys(explanations))
        clean["review_note_ru"] = "В этом задании заполняются только формы глаголов; все подлежащие и дополнения уже даны."
        clean["rule_refs"] = list(dict.fromkeys(ref for blank in clean["blanks"] for ref in blank["rule_refs"]))
        clean["tags"] = sorted({blank["tense_or_construction"] for blank in clean["blanks"]})
        clean["answer_text"] = re.sub(
            r"\(to [^)]+\)",
            lambda match, iterator=iter(answers): next(iterator),
            prompt,
        )
    sentence_correction = SENTENCE_CORRECTIONS.get(clean["id"])
    if sentence_correction:
        clean["prompt"] = sentence_correction["prompt"]
        clean["answer_text"] = sentence_correction["answer_text"]
        marker = sentence_correction["marker"]
        explanation = f"Future Perfect Continuous подчёркивает длительность процесса к будущей точке. Маркер контекста: «{marker}»."
        clean["explanation_ru"] = explanation
        clean["blanks"][0]["explanation_ru"] = explanation
    return clean


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--chunk-size", type=int, default=100)
    args = parser.parse_args()

    source = args.source.resolve()
    output = args.output.resolve()
    source_theory = source / "content" / "tenses"
    source_exercises = source_theory / "exercises"
    theory_out = output / "content" / "theory"
    exercise_out = output / "data" / "exercises"
    theory_out.mkdir(parents=True, exist_ok=True)
    exercise_out.mkdir(parents=True, exist_ok=True)

    theory_index = []
    for slug, filename, fallback_title in THEORY_FILES:
        src = source_theory / filename
        text = src.read_text(encoding="utf-8")
        shutil.copyfile(src, theory_out / filename)
        heading = re.search(r"^#\s+(.+)$", text, re.MULTILINE)
        theory_index.append({
            "id": slug,
            "file": f"content/theory/{filename}",
            "title": heading.group(1).strip() if heading else fallback_title,
            "description": first_paragraph(text),
        })

    (output / "data" / "theory.json").write_text(
        json.dumps(theory_index, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    items = []
    excluded = 0
    for filename in EXERCISE_FILES:
        payload = json.loads((source_exercises / filename).read_text(encoding="utf-8"))
        for item in payload["items"]:
            if item.get("publishable") is True:
                items.append(public_item(item))
            else:
                excluded += 1

    ids = [item["id"] for item in items]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate public exercise IDs")

    for old in exercise_out.glob("part-*.json"):
        old.unlink()

    parts = []
    for offset in range(0, len(items), args.chunk_size):
        chunk = items[offset : offset + args.chunk_size]
        filename = f"part-{offset // args.chunk_size + 1:02d}.json"
        (exercise_out / filename).write_text(
            json.dumps(chunk, ensure_ascii=False, separators=(",", ":")) + "\n",
            encoding="utf-8",
        )
        parts.append({
            "file": f"data/exercises/{filename}",
            "count": len(chunk),
            "levels": dict(sorted(Counter(x.get("cefr_estimate", "—") for x in chunk).items())),
            "types": dict(sorted(Counter(x["type"] for x in chunk).items())),
        })

    answer_slots = sum(len(item.get("blanks", [])) or 1 for item in items)
    manifest = {
        "schema_version": "1.0.0",
        "editorial_language": "British English",
        "total_items": len(items),
        "answer_slots": answer_slots,
        "excluded_non_publishable": excluded,
        "levels": dict(sorted(Counter(x.get("cefr_estimate", "—") for x in items).items())),
        "types": dict(sorted(Counter(x["type"] for x in items).items())),
        "parts": parts,
    }
    (exercise_out / "index.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Built {len(items)} public items / {answer_slots} answer slots; excluded {excluded} items.")


if __name__ == "__main__":
    main()
