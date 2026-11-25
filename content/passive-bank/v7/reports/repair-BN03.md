# Repair batch BN03

Below are the problems found by the automatic check. Rewrite **only** the listed tasks, keeping `id`, `cell`, `format`, `level`. Stay inside the level contract: simpler words, shorter sentence, allowed forms only. Reply with JSONL only (the corrected lines).

Batch-level problems (fix them by changing the tasks listed below):
- opening «i went» repeated 2 times

- BN03-37: level contract: labelled basic but is medium: words above the level: (to weigh)
  {"id": "BN03-37", "seed_id": "BN03-37", "cell": "D1", "format": "mini", "genre": "home", "level": "basic", "prompt": "I went to the post office today. My letter (to weigh) at the desk. It (to send) to Rome tonight.", "blanks": [{"cue": "to weigh", "answer": "was weighed", "accepted_answers": ["was weighed"], "voice": "passive", "construction": "pv_past_simple"}, {"cue": "to send", "answer": "will be sent", "accepted_answers": ["will be sent", "'ll be sent", "is going to be sent"], "voice": "passive", "construction": "pv_future_simple"}], "explanation_ru": "Действие на почте уже прошло (went → was weighed), а tonight указывает на будущее: will be sent."}
- BN03-38: level contract: labelled basic but is medium: words above the level: fishermen
  {"id": "BN03-38", "seed_id": "BN03-38", "cell": "D1", "format": "mc", "genre": "travel", "level": "basic", "prompt": "On this island, small boats ___ by local fishermen.", "options": ["is build", "are build", "are built", "built"], "correct_option_index": 2, "construction": "pv_present_simple", "explanation_ru": "Boats — множественное число, а третья форма от build — built: are built, а не are build."}
