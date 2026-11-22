Fix ONLY the tasks below and return them as JSONL (same ids, same seed_id). Do not change anything else.

### CD17-29
Problems: order: words are already in the right order
{"id": "CD17-29", "seed_id": "cd-0448", "cell": "C7", "format": "order", "genre": "notice", "level": "medium", "prompt": "Put the words in the right order to make a park notice.", "words": ["Leave", "the", "park", "before", "sunset;", "otherwise,", "Achieng", "will", "lock", "all", "gates."], "answer": "Leave the park before sunset; otherwise, Achieng will lock all gates.", "accepted_answers": ["Leave the park before sunset; otherwise, Achieng will lock all gates."], "construction": "cd_implied_otherwise", "explanation_ru": "Повелительное наклонение ставится в первой части, затем после точки с запятой идёт «otherwise,» и реальное последствие в будущем времени."}

### CD17-30
Problems: order: words are already in the right order
{"id": "CD17-30", "seed_id": "cd-0536", "cell": "C7", "format": "order", "genre": "food", "level": "advanced", "prompt": "Arrange the words into a sentence about the Seoul canteen.", "words": ["But", "for", "Ms", "Park's", "helpful", "warning,", "we", "would", "have", "missed", "lunch", "completely."], "answer": "But for Ms Park's helpful warning, we would have missed lunch completely.", "accepted_answers": ["But for Ms Park's helpful warning, we would have missed lunch completely."], "construction": "cd_implied_but_for", "explanation_ru": "Предложный оборот «But for» + существительное открывает предложение, а в главной части следует нереальный результат в прошлом «would have missed»."}
