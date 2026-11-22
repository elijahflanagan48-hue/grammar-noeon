# Repair batch B18

Below are the problems found by the automatic check. Correct **only** the listed tasks, keeping their `id` and `seed_id` (you may replace a seed with an unused one from the same batch's list if the storyline is the problem). Reply with JSONL only: the corrected lines, nothing else. The master instruction still applies.

Problems of the batch as a whole (fix them by changing the tasks listed below or by choosing other tasks):
- tasks: 46, expected 48
- opening «during the» repeated 2 times in the batch

- B18-13: banned storyline (repair/building/default)
  {"id": "B18-13", "seed_id": "S3-168", "cell": "D9", "format": "gap", "genre": "report", "level": "advanced", "prompt": "Each painted canvas backdrop in the Newcastle fly-tower (to weigh) ninety kilos, yet one technician can lift it.", "blanks": [{"cue": "to weigh", "answer": "weighs", "accepted_answers": ["weighs"], "voice": "active", "construction": "active_present_simple"}], "explanation_ru": "Глагол weigh в значении «иметь вес» является глаголом состояния и не используется в пассиве."}
