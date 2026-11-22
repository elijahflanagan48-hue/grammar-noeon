# Repair batch B15

Below are the problems found by the automatic check. Correct **only** the listed tasks, keeping their `id` and `seed_id` (you may replace a seed with an unused one from the same batch's list if the storyline is the problem). Reply with JSONL only: the corrected lines, nothing else. The master instruction still applies.

- B15-06: banned storyline (repair/building/default)
  {"id": "B15-06", "seed_id": "S1-194", "cell": "D7", "format": "gap", "genre": "email", "level": "basic", "prompt": "After the school play in the rain, the school (thirty costumes / to clean) professionally.", "blanks": [{"cue": "thirty costumes / to clean", "answer": "had thirty costumes cleaned", "accepted_answers": ["had thirty costumes cleaned", "got thirty costumes cleaned"], "voice": "passive", "construction": "pv_causative"}], "explanation_ru": "Школа не сама чистила плащи, а отдала в химчистку (had something done в прошедшем времени).", "lex_rev": true}
