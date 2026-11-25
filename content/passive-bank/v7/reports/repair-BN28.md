# Repair batch BN28

Below are the problems found by the automatic check. Correct **only** the listed tasks, keeping their `id` and `seed_id` (you may replace a seed with an unused one from the same batch's list if the storyline is the problem). Reply with JSONL only: the corrected lines, nothing else. The master instruction still applies.

- BN28-18: overused name: {'Mia'}
  {"id": "BN28-18", "seed_id": "BN28-18", "cell": "D3", "format": "gap", "genre": "chat", "level": "advanced", "prompt": "Hi Mia, we got our summer festival passes early, so our group booking (must / to approve)!", "blanks": [{"cue": "must / to approve", "answer": "must have been approved", "accepted_answers": ["must have been approved"], "voice": "passive", "construction": "pv_modal_perfect"}], "explanation_ru": "Логический вывод о прошедшем событии в пассивном залоге требует формы must have been + V3: must have been approved."}
