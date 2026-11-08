# Say · Tell · Speak · Talk — пакет для исполнителей

| Файл | Кому | Что |
|---|---|---|
| PROMPT-Gemini.md | Gemini | часть A: 300 заданий на пары say/tell и speak/talk |
| PROMPT-Codex.md | Codex | часть B: 200 заданий — выражения, смешанные, 40 текстов, 20 переводов |
| PROMPT-SOLVE.md | оба | слепое решение чужой части |
| TASK.md | всем | спецификация |
| RULE.md | всем | правило текстом |
| examples.jsonl | всем | 14 эталонных заданий |
| speaking_bank.py | Codex, Claude | валидатор, слепая версия, сверка, сборка |

## Порядок

1. Gemini: отправить PROMPT-Gemini.md + TASK.md + RULE.md + examples.jsonl. Просить партии по одной («дальше»). Сохранить ответы как part-A-01.jsonl … part-A-06.jsonl.
2. Codex: положить папку пакета в его рабочую папку и дать PROMPT-Codex.md. Он сам пишет part-B-01 … part-B-04 и прогоняет валидатор.
3. Слепая проверка:
   - `python3 speaking_bank.py blind part-A-*.jsonl > blind-A.jsonl` → отдать Codex вместе с PROMPT-SOLVE.md, ответ сохранить как solved-A.jsonl;
   - `python3 speaking_bank.py blind part-B-*.jsonl > blind-B.jsonl` → отдать Gemini с PROMPT-SOLVE.md, ответ сохранить как solved-B.jsonl.
   (Codex может сам сделать оба blind-файла.)
4. Все part-*.jsonl и solved-*.jsonl прислать Claude. Дальше: сверка, правка расхождений, моя вычитка, сборка и выкладка правила вместе с банком на сайт.
