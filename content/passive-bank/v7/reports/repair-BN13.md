# Repair batch BN13

Below are the problems found by the automatic check. Rewrite **only** the listed tasks, keeping `id`, `cell`, `format`, `level`. Stay inside the level contract: simpler words, shorter sentence, allowed forms only. Reply with JSONL only (the corrected lines).

- BN13-03: level contract: labelled medium but is advanced: words above the level: reusable
  {"id": "BN13-03", "seed_id": "BN13-03", "cell": "D3", "format": "gap", "genre": "shopping", "level": "medium", "prompt": "At our local food shop, reusable cloth bags (may / to use) instead of plastic ones.", "blanks": [{"cue": "may / to use", "answer": "may be used", "accepted_answers": ["may be used"], "voice": "passive", "construction": "pv_modal"}], "explanation_ru": "Для выражения разрешения в пассиве после may ставится be + третья форма глагола (V3): may be used."}
- BN13-13: level contract: labelled medium but is advanced: words above the level: hallway, muddy
  {"id": "BN13-13", "seed_id": "BN13-13", "cell": "D3", "format": "mc", "genre": "home", "level": "medium", "prompt": "Our shared hallway gets muddy in rainy weather, so the floor ___ every Friday.", "options": ["has to washed", "has to be wash", "has to be washed", "have to be washed"], "correct_option_index": 2, "construction": "pv_modal", "explanation_ru": "Для подлежащего в единственном числе (floor) нужна форма has to, а затем be + третья форма глагола: has to be washed."}
