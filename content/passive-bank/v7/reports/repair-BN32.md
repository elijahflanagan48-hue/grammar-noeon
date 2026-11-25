# Repair batch BN32

Below are the problems found by the automatic check. Rewrite **only** the listed tasks, keeping `id`, `cell`, `format`, `level`. Stay inside the level contract: simpler words, shorter sentence, allowed forms only. Reply with JSONL only (the corrected lines).

- BN32-02: level contract: labelled advanced but is beyond: words above the level: (to interrupt)
  {"id": "BN32-02", "seed_id": "BN32-02", "cell": "D4", "format": "gap", "genre": "sport", "level": "advanced", "prompt": "I hate (to interrupt) by noisy phone calls during my evening tennis practice.", "blanks": [{"cue": "to interrupt", "answer": "being interrupted", "accepted_answers": ["being interrupted", "to be interrupted"], "voice": "passive", "construction": "pv_gerund"}], "explanation_ru": "Меня перебивают звонками (пассивное действие); после глагола hate одинаково верны формы being interrupted и to be interrupted."}
- BN32-03: level contract: labelled advanced but is beyond: words above the level: (to disturb)
  {"id": "BN32-03", "seed_id": "BN32-03", "cell": "D4", "format": "gap", "genre": "food", "level": "advanced", "prompt": "Quiet readers often sit in the corner coffee shop for hours without (to disturb).", "blanks": [{"cue": "to disturb", "answer": "being disturbed", "accepted_answers": ["being disturbed"], "voice": "passive", "construction": "pv_gerund"}], "explanation_ru": "После предлога without требуется герундий; поскольку посетителей никто не тревожит (пассивное значение), ставим being disturbed."}
