# Repair batch BN12

Below are the problems found by the automatic check. Rewrite **only** the listed tasks, keeping `id`, `cell`, `format`, `level`. Stay inside the level contract: simpler words, shorter sentence, allowed forms only. Reply with JSONL only (the corrected lines).

- BN12-01: level contract: labelled basic but is medium: words above the level: outdoor, boots
  {"id": "BN12-01", "seed_id": "BN12-01", "cell": "D3", "format": "mc", "genre": "sport", "level": "basic", "prompt": "Outdoor boots ___ on the indoor basketball court.", "options": ["cannot used", "cannot be used", "can't been used", "cannot to be used"], "correct_option_index": 1, "construction": "pv_modal", "explanation_ru": "После модального глагола cannot в пассивном залоге ставится be + третья форма глагола (V3): cannot be used."}
- BN12-16: level contract: labelled medium but is advanced: words above the level: rackets
  {"id": "BN12-16", "seed_id": "BN12-16", "cell": "D3", "format": "gap", "genre": "sport", "level": "medium", "prompt": "Shared tennis rackets (have to / to clean) carefully after each afternoon club session.", "blanks": [{"cue": "have to / to clean", "answer": "have to be cleaned", "accepted_answers": ["have to be cleaned"], "voice": "passive", "construction": "pv_modal"}], "explanation_ru": "После конструкции have to в пассивном залоге ставится be + V3 (для множественного числа rackets): have to be cleaned."}
