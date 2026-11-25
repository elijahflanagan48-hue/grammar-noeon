# Repair batch B06

Below are the problems found by the automatic check. Correct **only** the listed tasks, keeping their `id` and `seed_id` (you may replace a seed with an unused one from the same batch's list if the storyline is the problem). Reply with JSONL only: the corrected lines, nothing else. The master instruction still applies.

- B06-20: mini: fewer than 3 sentences; banned storyline (repair/building/default)
  {"id": "B06-20", "seed_id": "S2-075", "cell": "D2", "format": "mini", "genre": "email", "level": "basic", "prompt": "During a wet November, sixty workers (to sign) a letter. Soon after, a warm drying room (to build) in the basement.", "blanks": [{"cue": "to sign", "answer": "signed", "accepted_answers": ["signed"], "voice": "active", "construction": "active_past_simple"}, {"cue": "to build", "answer": "was built", "accepted_answers": ["was built", "has been built"], "voice": "passive", "construction": "pv_past_simple"}], "explanation_ru": "Рабочие подписали письмо сами (актив), а комнату построили (пассив).", "lex_rev": true}
