# Repair batch BN09

Below are the problems found by the automatic check. Correct **only** the listed tasks, keeping their `id` and `seed_id` (you may replace a seed with an unused one from the same batch's list if the storyline is the problem). Reply with JSONL only: the corrected lines, nothing else. The master instruction still applies.

- BN09-38: banned storyline (repair/building/default)
  {"id": "BN09-38", "seed_id": "BN09-38", "cell": "D2", "format": "which", "genre": "travel", "level": "medium", "prompt": "Situation: The hotel staff is cleaning all the upstairs rooms right now. Which sentence matches the situation?", "options": ["All the upstairs rooms are cleaning right now.", "All the upstairs rooms are being cleaned right now.", "All the upstairs rooms have been clean right now.", "The hotel staff is being cleaned all the upstairs rooms right now."], "correct_option_index": 1, "construction": "pv_present_continuous", "explanation_ru": "Номера убирают прямо сейчас (Present Continuous Passive: are being cleaned); вариант are cleaning означает, что комнаты убирают сами себя."}
