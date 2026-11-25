# Repair batch BN25

Below are the problems found by the automatic check. Correct **only** the listed tasks, keeping their `id` and `seed_id` (you may replace a seed with an unused one from the same batch's list if the storyline is the problem). Reply with JSONL only: the corrected lines, nothing else. The master instruction still applies.

- BN25-11: overused name: {'Bob'}
  {"id": "BN25-11", "seed_id": "BN25-11", "cell": "D11", "format": "gap", "genre": "chat", "level": "basic", "prompt": "Has Bob's lost phone (to find) on the school bus yet?", "blanks": [{"cue": "to find", "answer": "been found", "accepted_answers": ["been found"], "voice": "passive", "construction": "pv_question"}], "explanation_ru": "В вопросе Present Perfect Passive после Has и подлежащего ставится been + третья форма глагола find (found): been found."}
