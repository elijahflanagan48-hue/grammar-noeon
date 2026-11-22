# Repair batch B20

Below are the problems found by the automatic check. Correct **only** the listed tasks, keeping their `id` and `seed_id` (you may replace a seed with an unused one from the same batch's list if the storyline is the problem). Reply with JSONL only: the corrected lines, nothing else. The master instruction still applies.

Problems of the batch as a whole (fix them by changing the tasks listed below or by choosing other tasks):
- tasks: 35, expected 36

- B20-25: banned storyline (repair/building/default)
  {"id": "B20-25", "seed_id": "S4-073", "cell": "D11", "format": "mini", "genre": "report", "level": "advanced", "prompt": "Engineers in Kobe built a full-sized three-storey timber house on a hydraulic platform. Why (the structure / to bolt) to the shaking table? They wanted to test whether the joints (would / badly / to damage) by thirty seconds of horizontal jolts.", "blanks": [{"cue": "the structure / to bolt", "answer": "was the structure bolted", "accepted_answers": ["was the structure bolted"], "voice": "passive", "construction": "pv_question"}, {"cue": "would / badly / to damage", "answer": "would be badly damaged", "accepted_answers": ["would be badly damaged", "would badly be damaged"], "voice": "passive", "construction": "pv_modal"}], "explanation_ru": "Прямой вопрос требует инверсии (was the structure bolted). Во втором пропуске наречие badly обычно ставится перед причастием damaged."}
