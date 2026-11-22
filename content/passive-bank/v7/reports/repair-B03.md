# Repair batch B03

Below are the problems found by the automatic check. Correct **only** the listed tasks, keeping their `id` and `seed_id` (you may replace a seed with an unused one from the same batch's list if the storyline is the problem). Reply with JSONL only: the corrected lines, nothing else. The master instruction still applies.

- B03-20: banned storyline (repair/building/default)
  {"id": "B03-20", "seed_id": "S2-052", "cell": "D2", "format": "mini", "genre": "work", "level": "basic", "prompt": "The main office (to get) too noisy. So, quiet phone rooms (to build) along the wall. Now people can take calls in peace.", "blanks": [{"cue": "to get", "answer": "got", "accepted_answers": ["got", "was getting"], "voice": "active", "construction": "active_past_simple"}, {"cue": "to build", "answer": "were built", "accepted_answers": ["were built"], "voice": "passive", "construction": "pv_past_simple"}], "explanation_ru": "Офис стал шумным (актив), а комнаты построили рабочие (пассив).", "lex_rev": true}
