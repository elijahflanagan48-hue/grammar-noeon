# Repair batch B12

Below are the problems found by the automatic check. Correct **only** the listed tasks, keeping their `id` and `seed_id` (you may replace a seed with an unused one from the same batch's list if the storyline is the problem). Reply with JSONL only: the corrected lines, nothing else. The master instruction still applies.

Problems of the batch as a whole (fix them by changing the tasks listed below or by choosing other tasks):
- tasks: 35, expected 36

- B12-04: gap 2: the bracket gives a hint (`to be`)
  {"id": "B12-04", "seed_id": "S4-175", "cell": "D5", "format": "gap", "genre": "chat", "level": "medium", "prompt": "That masked intruder rattling the conservatory latch (to think) (to be) just an escaped pet raccoon.", "blanks": [{"cue": "to think", "answer": "is thought", "accepted_answers": ["is thought"], "voice": "passive", "construction": "pv_present_simple"}, {"cue": "to be", "answer": "to have been", "accepted_answers": ["to have been", "to be"], "voice": "active", "construction": "active_other"}], "explanation_ru": "Енот был там в прошлом (перфектный инфинитив to have been), а думают об этом сейчас (is thought)."}
