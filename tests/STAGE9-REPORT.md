# Этап 9 — ключи и согласование

29 октября 2026. Подготовлено локально, НЕ опубликовано.

## Результат

- Исправлены 37 заданий: 36 альтернатив приоритета 2 удалены, две ошибочные альтернативы It удалены, I has chosen исправлено на I have chosen.
- Банк tenses: 2026-10-29.2; версия comparison осталась 2026-10-29.1. Новую content_version получили только изменённые задания. Обновлены обе версии tenses в index.json.
- Все остальные поля и варианты приоритета 3 сохранены. Все 309 заданий comparison побайтово прежние.
- Удалённые варианты вычищены из перечислений explanation_ru; сопутствующие утверждения о will для этих заданий уточнены.
- Клиент, Worker, checker, схема и миграции побайтово совпадают с исходным полным архивом. CACHE grammar-v9 и версии ресурсов прежние: клиент не менялся.

## Проверки

- Все 28 локальных запусков завершились успешно; подробные результаты и журналы — stage9-results/.
- 1424 официальных ответа проходят evaluate() и grade(); все удалённые варианты отвергаются обеими проверками. have chosen принят, has chosen отклонён для текущего src-u03-092.
- agreement_check.mjs: 1424 задания, 0 находок. Есть отрицательные тесты, собирательные существительные, имена, множественное число, отрицательные сокращения, coordinated subject и irrealis were.
- Проверка согласования эвристическая: определяет локальное подлежащее перед пропуском, переносит его между однородными сказуемыми. Не пытается однозначно разбирать произвольные сложные английские предложения; неясные подлежащие пропускает. Это дополнительный регрессионный контроль, а не полная лингвистическая экспертиза банка.
- Изолированный Worker/D1 с поддельным Firebase и адресами @example.test: роли, ключи, назначения, черновики, история, доверенное оценивание и сохранение исторических снимков — PASS.
- Playwright: 375×812 и 1280×800, light/dark; каждый прогон — 58 проверок, без ошибок JavaScript. Дополнительно bank-browser и PWA — PASS.
- Python unittest: 34 теста — OK; validate_content.py и clean-bank — PASS.
- В старых локальных тестах актуализированы ожидания версии и will finish. Валидаторы допускают предыдущую версию неизменённых заданий в обновлённом разделе.
- Исторический снимок с прежним ключом продолжает оцениваться по своему ключу; D1 и сохранённые оценки не переписывались. Рабочие аккаунты, удалённая БД и сайт не использовались.

Повторить: python3 -B scripts/build_cloudflare.py; затем при Node на PATH и установленном GRAMMAR_TOOLING_DIR выполнить python3 -B scripts/run_local_tests.py. Live/published-тесты намеренно не запускаются: они обращаются к удалённым сервисам.

## Изменённые задания и поля

| ID | Поле | Удалено / исправлено |
|---|---|---|
| adv-cloze-002 | adv-cloze-002-b3 | will complete |
| adv-cloze-006 | adv-cloze-006-b7 | will process |
| new-cloze-001 | new-cloze-001-b8 | will start |
| new-cloze-003 | new-cloze-003-b3 | will give |
| src-u01-005 | src-u01-005-b5 | will do |
| src-u01-017 | src-u01-017-b1 | will finish |
| src-u01-059 | src-u01-059-b1 | will paint |
| src-u01-060 | src-u01-060-b1 | will write |
| src-u01-099 | src-u01-099-b1 | will finish |
| src-u02-001 | src-u02-001-b1 | will finish |
| src-u02-012 | src-u02-012-b4 | will check |
| src-u02-018 | src-u02-018-b5 | will complete |
| src-u02-039 | src-u02-039-b1 | will finish |
| src-u02-040 | src-u02-040-b2 | will finish |
| src-u02-050 | src-u02-050-b4 | will finish |
| src-u02-060 | src-u02-060-b1 | will receive |
| src-u02-098 | src-u02-098-b2 | will finish |
| src-u03-005 | src-u03-005-b1 | will finish |
| src-u03-007 | src-u03-007-b4 | will finish |
| src-u03-058 | src-u03-058-b1 | will master |
| src-u03-066 | src-u03-066-b2 | will finish |
| src-u03-072 | src-u03-072-b1 | will draft |
| src-u04-010 | src-u04-010-b2 | will pass |
| src-u04-066 | src-u04-066-b1 | will tidy |
| src-u04-068 | src-u04-068-b1 | will renovate |
| src-u05-003 | src-u05-003-b1 | will look |
| src-u06-065 | src-u06-065-b1 | will finish |
| src-u06-092 | src-u06-092-b1 | will finish |
| src-u06-096 | src-u06-096-b1 | will send |
| src-u07-030 | src-u07-030-b2 | will finish |
| src-u07-077 | src-u07-077-b1 | will release |
| src-u08-012 | src-u08-012-b2 | will finish |
| src-u08-072 | src-u08-072-b1 | will reach |
| src-u08-085 | src-u08-085-b1 | will complete |
| src-u09-046 | src-u09-046-b1 | will do |
| src-u10-023 | src-u10-023-b1 | will develop |
| src-u03-092 | src-u03-092-b1 | has chosen → have chosen |
| adv-cloze-006 | adv-cloze-006-b3 | have been testing |
| adv-cloze-006 | adv-cloze-006-b3 | have tested |

## На решение владельца

| ID / поле | Предложение | Официальный | Спорный вариант | Рекомендация |
|---|---|---|---|---|
| src-u01-099 / 1 | The lesson (to finish) by 2 o'clock, so we can grab something to eat afterwards. | will have finished | finishes | Оставить до решения владельца; рассмотреть удаление Present Simple, если требуется только Future Perfect. |

Рассмотрены все 37 кандидатов приоритета 2: 36 удалений по утверждённым правилам, 1 вариант сохранён. В src-u01-099 вариант will finish удалён, finishes сохранён. Кандидат adv-cloze-002 / 1 относится к приоритету 3 и сохранён, хотя в его контексте есть official programme: по условию этот приоритет не менялся.

## Что осталось

Решение владельца по finishes; отдельное разрешение на публикацию. Автоматическая проверка согласования не заменяет будущую редакционную проверку сложных синтаксических случаев.
