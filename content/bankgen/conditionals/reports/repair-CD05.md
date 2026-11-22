Fix ONLY the tasks below and return them as JSONL (same ids, same seed_id). Do not change anything else.

### CD05-11
Problems: gap: 1–2 gaps required
{"id": "CD05-11", "seed_id": "cd-1201", "cell": "C2", "format": "gap", "genre": "travel", "level": "advanced", "prompt": "Stoyan (to extend) his stay if a room with a lake view (to open) up, but he (not / to stay) if none (to appear).", "blanks": [{"cue": "to extend", "answer": "will extend", "accepted_answers": ["will extend"], "construction": "cd_first_will"}, {"cue": "to open", "answer": "opens", "accepted_answers": ["opens"], "construction": "cd_first_no_will_after_if"}, {"cue": "not / to stay", "answer": "will not stay", "accepted_answers": ["will not stay", "won't stay"], "construction": "cd_first_will"}, {"cue": "to appear", "answer": "appears", "accepted_answers": ["appears"], "construction": "cd_first_no_will_after_if"}], "explanation_ru": "В главной части — will (будущее решение), а после if — Present Simple: opens, appears."}

### CD05-32
Problems: order: words are already in the right order
{"id": "CD05-32", "seed_id": "cd-1825", "cell": "C2", "format": "order", "genre": "health", "level": "medium", "prompt": "Build the sentence.", "words": ["The", "runner", "will", "race", "if", "the", "physio", "says", "her", "ankle", "is", "fine."], "answer": "The runner will race if the physio says her ankle is fine.", "accepted_answers": ["The runner will race if the physio says her ankle is fine."], "construction": "cd_first_will", "explanation_ru": "Порядок: главная часть с will, затем if + Present Simple."}
