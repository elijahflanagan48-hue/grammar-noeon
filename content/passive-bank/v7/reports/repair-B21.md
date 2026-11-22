# Repair batch B21

Below are the problems found by the automatic check. Correct **only** the listed tasks, keeping their `id` and `seed_id` (you may replace a seed with an unused one from the same batch's list if the storyline is the problem). Reply with JSONL only: the corrected lines, nothing else. The master instruction still applies.

Problems of the batch as a whole (fix them by changing the tasks listed below or by choosing other tasks):
- tasks: 39, expected 40
- explicit time markers in 14/39 tasks (> 35%)

- B21-35: opening with By the time / By the end is banned
  {"id": "B21-35", "seed_id": "S5-038", "cell": "D1", "format": "mc", "genre": "review", "level": "advanced", "prompt": "By the time the Berlin exhibition closes next month, that rare Siberian fish-skin coat ___ by over fifty thousand visitors.", "options": ["will be admired", "will have been admired", "will have admired", "is being admired"], "correct_option_index": 1, "construction": "pv_future_perfect", "explanation_ru": "Оборот By the time ... closes задаёт будущий рубеж, к которому действие завершится: Future Perfect Passive."}
