# Conditionals: обновление до 1007 заданий

Версия `conditionals-2026-11-23.1`, источники CD01–CD29 из origin/main (`25639f793301bb1b2c3b1a7f803a700d8f5a7386`). Локальная интеграция перенесена поверх обновлений командой `git rebase origin/main`, без конфликтов. Прямой `git pull --rebase origin main` не смог подключиться к github.com из терминала; исходные Git-объекты получены через подключение GitHub с проверкой SHA.

Собрано 1007 заданий / 1650 полей ответа в 11 частях. Общий банк: 12861 задание / 16609 полей. Уровни: basic — 275, medium — 439, advanced — 293. Новых заданий относительно предыдущей сборки: 203. Пуш в main и автоматический деплой разрешены текущим запросом владельца. Результат автоматического деплоя отдельно не подтверждён.

Исходные final/ JSONL, правило, чужие банки заданий, схема D1 и запись последнего подтверждённого опубликованного выпуска сохранены. Представление CD29-05 и CD29-11 адаптировано: дублирующие маркеры `___ (cue)` отображаются одним полем; условие и ключи не менялись.

## Банк и исправления

| Формат источника | Заданий |
|---|---:|
| `bank` | 14 |
| `fact` | 63 |
| `fix` | 116 |
| `gap` | 228 |
| `hunt` | 22 |
| `match` | 18 |
| `mc` | 184 |
| `mini` | 113 |
| `order` | 32 |
| `sort` | 28 |
| `transform` | 103 |
| `which` | 86 |

| Цель | basic | medium | advanced |
|---|---:|---:|---:|
| `cd_zero` | 36 | 20 | 5 |
| `cd_first` | 52 | 55 | 12 |
| `cd_conj` | 21 | 46 | 28 |
| `cd_second` | 51 | 54 | 26 |
| `cd_third` | 21 | 66 | 38 |
| `cd_mixed` | 6 | 29 | 54 |
| `cd_implied` | 16 | 37 | 32 |
| `cd_inversion` | 0 | 16 | 36 |
| `cd_wish` | 31 | 46 | 15 |
| `cd_unreal` | 16 | 33 | 20 |
| `cd_all` | 25 | 37 | 27 |

`CD20-01` исправлен автором: accepts только `were`. Регрессионные тесты браузерного JS, Worker и Python проверяют, что `was` с `they` больше не засчитывается.

Все 60 меток cd_* покрыты минимум 8 заданиями. Прежние пять дефицитов меток закрыты. У Mixed теперь есть basic; у `cd_inversion` basic по-прежнему отсутствует, поэтому требование «в каждой цели все уровни» не выполнено.

Восемь sort-заданий имеют три группы вместо двух из исходного технического задания: `CD23-11`, `CD23-21`, `CD23-28`, `CD24-11`, `CD24-17`, `CD24-30`, `CD26-40`, `CD29-42`. Движок поддерживает все три группы; авторский материал сохранён. Эти расхождения перечислены в source_issues; новых найденных ошибок принимаемых ответов нет.

## Пройденные проверки

- `npm run test:conditionals`: PASS — все 1007 заданий и 12 форматов источника, 2213 принимаемых вариантов, 3951 отрицательная подстановка, отсутствие объяснений до ответа, фильтры карты, неизменность исходников и повторяемость сборки.
- `tests/conditionals-workflows.mjs`: PASS — настоящий код Worker с SQLite в одном процессе: все 10 типов сайта, скрытие ключей, сохранение/восстановление черновиков, проверка и история, объяснения, фильтр конструкции, разделение свободной практики и назначений в обе стороны. Этот тест не заменяет workerd.
- Python: 44 unit-теста PASS. Включены ключи Conditionals и безопасные ученические снимки.
- Проверки соответствия JS/Worker/Python: PASS на 12861 записи / 16609 полях / 53688 отправках.
- Общая валидация контента и документации: PASS. Правило, версия банка и PWA согласованы; PWA — `grammar-v100-conditionals`.

## Точный список непройденных проверок

`npm run check-all`: exit 1; 13 непройденных команд.

| Команда / файл теста | Причина |
|---|---|
| `tests/cloudflare-check.mjs` | `listen EPERM: operation not permitted 127.0.0.1` |
| `tests/conditionals-bank.mjs --coverage` | Нет basic у cd_inversion; восемь sort-источников имеют 3 группы вместо 2. |
| `tests/fixed-assessments.mjs` | `listen EPERM: operation not permitted 127.0.0.1` |
| `tests/free-vs-assigned.mjs` | `listen EPERM: operation not permitted 127.0.0.1` |
| `tests/light-history.mjs` | `listen EPERM: operation not permitted 127.0.0.1` |
| `tests/local-worker.mjs` | `listen EPERM: operation not permitted 127.0.0.1` |
| `tests/manual-review.mjs` | `listen EPERM: operation not permitted 127.0.0.1` |
| `tests/modal-workflows.mjs` | `listen EPERM: operation not permitted 127.0.0.1` |
| `tests/remediation.mjs` | `listen EPERM: operation not permitted 127.0.0.1` |
| `tests/self-practice.mjs` | `listen EPERM: operation not permitted 127.0.0.1` |
| `tests/task-issues.mjs` | `listen EPERM: operation not permitted 127.0.0.1` |
| `tests/teacher-library.mjs` | `listen EPERM: operation not permitted 127.0.0.1` |
| `tests/today.mjs` | `listen EPERM: operation not permitted 127.0.0.1` |

`npm run test:browser`: exit 1; 40 непройденных запусков. Каждый остановился на `listen EPERM: operation not permitted 127.0.0.1`, до полноценного открытия браузера. У Conditionals настроены проверки 390 и 1280 px; успешный визуальный прогон не подтверждён.

| Файл браузерного теста | Запуск |
|---|---|
| `tests/adjective-clarity-browser.cjs` | локальный сервер заблокирован |
| `tests/adjective-constructions-browser.cjs` | локальный сервер заблокирован |
| `tests/adjectives-300-browser.cjs` | локальный сервер заблокирован |
| `tests/adjectives-advanced-browser.cjs` | локальный сервер заблокирован |
| `tests/assignment-preview.cjs` | локальный сервер заблокирован |
| `tests/bank-browser.cjs` | локальный сервер заблокирован |
| `tests/comparison-tables-browser.cjs` | локальный сервер заблокирован |
| `tests/conditionals-practice-browser.cjs` | локальный сервер заблокирован |
| `tests/delete-own-practice-browser.cjs` | локальный сервер заблокирован |
| `tests/error-feedback-browser.cjs` | локальный сервер заблокирован |
| `tests/fixed-assessments-browser.cjs` | локальный сервер заблокирован |
| `tests/infinitive-map-browser.cjs` | локальный сервер заблокирован |
| `tests/infinitive-practice-browser.cjs` | локальный сервер заблокирован |
| `tests/manual-review-browser.cjs` | локальный сервер заблокирован |
| `tests/modals-browser.cjs` | локальный сервер заблокирован |
| `tests/passive-v7-browser.cjs` | локальный сервер заблокирован |
| `tests/practice-presets-browser.cjs` | локальный сервер заблокирован |
| `tests/practice-reference-browser.cjs` | локальный сервер заблокирован |
| `tests/pwa.cjs` | локальный сервер заблокирован |
| `tests/remediation-browser.cjs` | локальный сервер заблокирован |
| `tests/roster-browser.cjs` | локальный сервер заблокирован |
| `tests/section-navigation-browser.cjs` | локальный сервер заблокирован |
| `tests/statistics-browser.cjs` | локальный сервер заблокирован |
| `tests/student-bank-counts-browser.cjs` | локальный сервер заблокирован |
| `tests/task-issues-browser.cjs` | локальный сервер заблокирован |
| `tests/teacher-library-browser.cjs` | локальный сервер заблокирован |
| `tests/tense-balance-browser.cjs` | локальный сервер заблокирован |
| `tests/test-skips-browser.cjs` | локальный сервер заблокирован |
| `tests/self-practice.mjs` | 375×812, light |
| `tests/student-management-browser.mjs` | 375×812, light |
| `tests/today-browser.mjs` | 375×812, light |
| `tests/self-practice.mjs` | 375×812, dark |
| `tests/student-management-browser.mjs` | 375×812, dark |
| `tests/today-browser.mjs` | 375×812, dark |
| `tests/self-practice.mjs` | 1280×800, light |
| `tests/student-management-browser.mjs` | 1280×800, light |
| `tests/today-browser.mjs` | 1280×800, light |
| `tests/self-practice.mjs` | 1280×800, dark |
| `tests/student-management-browser.mjs` | 1280×800, dark |
| `tests/today-browser.mjs` | 1280×800, dark |

Запрошен запуск вне песочницы для `node scripts/local-worker.mjs --smoke`. Автоматическая проверка разрешений отклонила запрос: конфигурация этой сессии содержит `sandbox_approval: false` и запрещает спрашивать повышение прав. Разрешение не было получено; запуск через другой терминал для обхода ограничения не выполнялся.

## Пропущенные проверки

24 проверки пропущены штатным механизмом проекта из-за отсутствующих исторических архивов; ещё две лексические проверки пропущены из-за отсутствия wordfreq/cefrpy. Они не считаются пройденными.

| Команда / файл | Причина пропуска |
|---|---|
| `python3 -B scripts/lexical_audit.py passive --gate 0.05` | Не установлены wordfreq/cefrpy. |
| `python3 -B scripts/lexical_audit.py conditionals --gate 0.05` | Не установлены wordfreq/cefrpy. |
| `tests/adjective-clarity.mjs` | Отсутствует исторический архив исходников/аудита. |
| `tests/adjective-constructions.mjs` | Отсутствует исторический архив исходников/аудита. |
| `tests/adjective-mix.mjs` | Отсутствует исторический архив исходников/аудита. |
| `tests/adjectives-300.mjs` | Отсутствует исторический архив исходников/аудита. |
| `tests/adjectives-advanced.mjs` | Отсутствует исторический архив исходников/аудита. |
| `tests/agreement.mjs` | Отсутствует исторический архив исходников/аудита. |
| `tests/answer-checking.mjs` | Отсутствует исторический архив исходников/аудита. |
| `tests/answer-cues.mjs` | Отсутствует исторический архив исходников/аудита. |
| `tests/cloze-variety.mjs` | Отсутствует исторический архив исходников/аудита. |
| `tests/course-context.mjs` | Отсутствует исторический архив исходников/аудита. |
| `tests/distinct-cloze.mjs` | Отсутствует исторический архив исходников/аудита. |
| `tests/final-answer-policy.mjs` | Отсутствует исторический архив исходников/аудита. |
| `tests/frontend-check.mjs` | Отсутствует исторический архив исходников/аудита. |
| `tests/future-reference.mjs` | Отсутствует исторический архив исходников/аудита. |
| `tests/modal-bank.mjs` | Отсутствует исторический архив исходников/аудита. |
| `tests/passive-assessments.mjs` | Отсутствует исторический архив исходников/аудита. |
| `tests/passive-integration.mjs` | Отсутствует исторический архив исходников/аудита. |
| `tests/practice-formats.mjs` | Отсутствует исторический архив исходников/аудита. |
| `tests/reported-release.mjs` | Отсутствует исторический архив исходников/аудита. |
| `tests/temporal-context.mjs` | Отсутствует исторический архив исходников/аудита. |
| `tests/tense-balance.mjs` | Отсутствует исторический архив исходников/аудита. |
| `tests/tense-clarity.mjs` | Отсутствует исторический архив исходников/аудита. |
| `tests/training-context.mjs` | Отсутствует исторический архив исходников/аудита. |
| `tests/v8-review.mjs` | Отсутствует исторический архив исходников/аудита. |

В validate_content.py также пропущено сравнение с исходным авторским пакетом Modals: пакет отсутствует в checkout; сама валидация контента пройдена.

Лексический gate Conditionals включён в check-all и охватывает условие, варианты ответа и содержимое структурных форматов. Его результат в этой среде — SKIP, не PASS.

Полные счётчики: [bank-report.json](bank-report.json). Машинный список выполненных команд и результатов: [verification-results.json](verification-results.json). Для завершения проверки нужны basic-материалы Inversion/редакторское решение по трём группам, лексические зависимости и среда с доступным локальным сервером.
