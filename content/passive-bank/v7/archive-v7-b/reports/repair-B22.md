# Repair batch B22

Below are the problems found by the automatic check. Correct **only** the listed tasks, keeping their `id` and `seed_id` (you may replace a seed with an unused one from the same batch's list if the storyline is the problem). Reply with JSONL only: the corrected lines, nothing else. The master instruction still applies.

- B22-22: overused name: {'John'}
  {"id": "B22-22", "seed_id": "S4-119", "cell": "D1", "format": "mini", "genre": "news", "level": "medium", "prompt": "St John Ambulance volunteers barely sat down at the county show. Over two sunny days, four hundred plasters (to hand out) for new-boot blisters. At the same time, dozens of angry wasps (to coax) out of lemonade cans.", "blanks": [{"cue": "to hand out", "answer": "were handed out", "accepted_answers": ["were handed out"], "voice": "passive", "construction": "pv_past_simple"}, {"cue": "to coax", "answer": "were being coaxed", "accepted_answers": ["were being coaxed", "were coaxed"], "voice": "passive", "construction": "pv_past_continuous"}], "explanation_ru": "Итог двух дней — Past Simple Passive (were handed out), а параллельный процесс — Past Continuous Passive (were being coaxed)."}
