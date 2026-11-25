# Repair batch BN18

Below are the problems found by the automatic check. Rewrite **only** the listed tasks, keeping `id`, `cell`, `format`, `level`. Stay inside the level contract: simpler words, shorter sentence, allowed forms only. Reply with JSONL only (the corrected lines).

Batch-level problems (fix them by changing the tasks listed below):
- opening «at the» repeated 2 times

- BN18-05: level contract: labelled medium but is advanced: words above the level: dora
  {"id": "BN18-05", "seed_id": "BN18-05", "cell": "D6", "format": "gap", "genre": "home", "level": "medium", "prompt": "Dora (to give) a free tracking code for her birthday box yesterday.", "blanks": [{"cue": "to give", "answer": "was given", "accepted_answers": ["was given"], "voice": "passive", "construction": "pv_two_objects"}], "explanation_ru": "Доре выдали код отслеживания вчера; с глаголом give получатель (Dora) становится подлежащим в Past Simple Passive: was given."}
- BN18-07: level contract: labelled medium but is advanced: words above the level: milo, checkout
  {"id": "BN18-07", "seed_id": "BN18-07", "cell": "D6", "format": "gap", "genre": "shopping", "level": "medium", "prompt": "Milo's online shoe order (not / to pay for) yet at the checkout page.", "blanks": [{"cue": "not / to pay for", "answer": "has not been paid for", "accepted_answers": ["has not been paid for", "hasn't been paid for"], "voice": "passive", "construction": "pv_prepositional"}], "explanation_ru": "Предложный глагол pay for в пассиве сохраняет предлог for на конце, а слово yet требует Present Perfect Passive: has not been paid for."}
- BN18-19: level contract: labelled medium but is advanced: words above the level: mismatched
  {"id": "BN18-19", "seed_id": "BN18-19", "cell": "D6", "format": "gap", "genre": "home", "level": "medium", "prompt": "Poor little Bram (to laugh at) by his older cousins for wearing mismatched socks.", "blanks": [{"cue": "to laugh at", "answer": "was laughed at", "accepted_answers": ["was laughed at"], "voice": "passive", "construction": "pv_prepositional"}], "explanation_ru": "Предложный глагол laugh at в пассивном залоге сохраняет предлог at после причастия: was laughed at."}
