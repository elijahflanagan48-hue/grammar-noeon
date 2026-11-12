# Infinitive · -ing — пакет для исполнителей

| Файл | Кому | Что |
|---|---|---|
| GEMINI-MESSAGE.md | Gemini | всё в одном сообщении: промпт, спецификация, правило, эталон (для чата без файлов) |
| PROMPT-Gemini.md | Gemini | часть A: 480 заданий — глагол + to / -ing, предлоги, без to, объект, прилагательные |
| PROMPT-Codex.md | Codex | часть B: 320 заданий — смена смысла, формы, смешанные, 40 текстов, 20 переводов |
| PROMPT-SOLVE.md | оба | слепое решение чужой части |
| TASK.md | всем | спецификация |
| RULE.md | всем | правило текстом (собирается из страницы: `python3 scripts/infinitive_gerund_rule_md.py`) |
| examples.jsonl | всем | 32 эталонных задания, все цели и типы |
| ig_bank.py | Codex, Claude | валидатор, слепая версия, сверка, сборка |

## Порядок

1. Gemini: вставить GEMINI-MESSAGE.md одним сообщением (или PROMPT-Gemini.md с файлами TASK.md, RULE.md, examples.jsonl). Просить партии по одной («дальше»). Сохранить ответы как part-A-01.jsonl … part-A-08.jsonl.
2. Codex: положить папку пакета в его рабочую папку и дать PROMPT-Codex.md. Он сам пишет part-B-01 … part-B-04 и прогоняет валидатор.
3. Слепая проверка:
   - `python3 ig_bank.py blind part-A-*.jsonl > blind-A.jsonl` → Codex решает по PROMPT-SOLVE.md, ответ — solved-A.jsonl (это шаг 5 в его промпте);
   - `python3 ig_bank.py blind part-B-*.jsonl > blind-B.jsonl` → отдать Gemini с PROMPT-SOLVE.md, ответ сохранить как solved-B.jsonl.
4. Все part-*.jsonl и solved-*.jsonl прислать Claude. Дальше: сверка, правка расхождений, моя вычитка, сборка банка и включение практики на сайте.
