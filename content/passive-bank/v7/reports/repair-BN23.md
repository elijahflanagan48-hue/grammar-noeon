# Repair batch BN23

Below are the problems found by the automatic check. Correct **only** the listed tasks, keeping their `id` and `seed_id` (you may replace a seed with an unused one from the same batch's list if the storyline is the problem). Reply with JSONL only: the corrected lines, nothing else. The master instruction still applies.

- BN23-01: overused name: {'Bob'}
  {"id": "BN23-01", "seed_id": "BN23-01", "cell": "D10", "format": "mc", "genre": "sport", "level": "basic", "prompt": "The winning goal in Sunday's match was scored ___ Bob.", "explanation_ru": "Исполнитель действия (человек — Боб) вводится предлогом by: was scored by Bob.", "options": ["from", "in", "by", "with"], "correct_option_index": 2, "construction": "pv_agent"}
