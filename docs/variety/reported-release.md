# Reported Speech: локальная сборка 22 ноября 2026

Версия `reported-2026-11-22.1`, PWA `grammar-v99`. Собраны 21 проверенная пачка RP01–RP21: **700 активных заданий / 1083 поля**. 1000 прежних заданий сохранены с `retired=reported-bankgen`. Всего в разделе 1700 записей, во всём банке 12554 записи / 16042 поля. Публикация, commit и push не выполнялись.

## Состав проверенного банка

| Формат final | Заданий | Тип в приложении |
|---|---:|---|
| gap | 229 | open_brackets, sentence |
| mini | 181 | open_brackets, mini_text |
| mc | 109 | multiple_choice |
| which | 50 | multiple_choice |
| fix | 92 | error_fix |
| transform | 39 | direct_to_reported, полный ответ |

| Уровень | Заданий |
|---|---:|
| basic | 216 |
| medium | 281 |
| advanced | 203 |

Исходные final импортированы из GitHub `elijahflanagan48-hue/grammar-noeon`, commit `bc812e742f9bdd0c070aad0b43f15f05d681223f`; каждый Git blob проверен по SHA. При сборке текст, объяснения, варианты выбора и accepted_answers не редактировались. Проверено совпадение SHA-256 всех 21 final и 111 частей других тем с состоянием перед сборкой; содержимое 1000 старых записей совпадает с HEAD за исключением добавленной метки retired. `passive_v7_status` сохранён. Conditionals и соседний checkout не изменялись.

## Реализация

- `scripts/build_bankgen.py <topic> [--date YYYY-MM-DD]`: проверка final и плана до записи, шесть форматов, стабильный id-map `<code>-<cell>-NNN`, keep.txt, архивирование отозванных ID, защита от коллизий, смешанных частей и понижения версии.
- 30 конструкций Reported в фильтрах и пресетах; миграция старых настроек и ссылок rs01–rs20. Исторические задания доступны для проверки сохранённых ответов.
- Ссылки на существующие якоря правила. Для transform используется автоматическая проверка полного предложения и textarea.
- Добавлены `docs/variety/reported-gates.json`, gate разнообразия и вызов лексического gate в `scripts/check-all.mjs`. Passive-specific ограничение D2 применяется только когда задано в конфигурации.
- Обновлены index.json, current-release.json, README, PROJECT-STATUS, CHANGELOG и sw.js. D1, worker routes и задания других тем не менялись.

## Проверки

Успешно выполнены:

- 45 Python unit tests, включая три теста общего сборщика: все принятые ключи, неверные ответы, все позиции выбора, стабильность ID, повторная сборка, keep/retired, отзыв задания, ошибки входных данных без записи и сохранность других тем.
- Проверка одинаковых результатов клиентского кода, Worker checker и Python: **52095 отправок**, 12554 записи / 16042 поля.
- Отдельный тест нового Reported: 700 заданий, **1573 принятых текстовых варианта**, все дистракторы, 30 доступных подтем и 20 старых ссылок.
- Проверка структуры банка, правил/якорей и манифеста; gate разнообразия Reported и Passive; `git diff --check`.
- Повторная сборка рабочего банка побайтно стабильна (131 файл: части, манифесты и id-map).

**Полный `npm run check` не зелёный в текущем окружении.** Его финальный запуск завершился 12 ошибками: каждый из 12 тестов, которым нужен локальный Worker/D1, остановился на `listen EPERM: operation not permitted 127.0.0.1`. Это ограничения среды; такие тесты не объявлены успешными и не отключены. Ещё 24 исторические проверки штатно пропущены существующим раннером из-за отсутствующих в репозитории локальных архивов docs/review и content/*.

**Лексический gate не выполнен:** скрипт сообщил SKIP, поскольку wordfreq и cefrpy не установлены. Попытка установить их не нашла доступных пакетов в этом окружении. Успешный лексический аудит не заявляется.

Добавлен `tests/bankgen-reported-browser.cjs` для 390/1280 px, шести форматов, старой ссылки, отсутствия retired в подборе и реальной серверной проверки. Запуск остановлен тем же EPERM локального сервера. Отдельная попытка запуска установленного Chrome через Playwright также завершилась SIGABRT. Браузерная приёмка не подтверждена; скриншоты не получены.

Для завершения приёмки в окружении с доступным loopback и установленными словарями:

```sh
python3 -B scripts/build_bankgen.py reported --date 2026-11-22
npm run check
GRAMMAR_CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/bankgen-reported-browser.cjs
```

Данные разнообразия активного банка: [reported-audit.md](reported-audit.md). Разрешение на публикацию после успешных проверок получено 23 ноября; ограничения описаны ниже.

## Повторная попытка 23 ноября 2026

Пользователь разрешил commit и push Reported после успешного `npm run check`, затем pull --rebase main и сборку Comparison. Nouns нельзя собирать до готовности NN01–NN14. Это разрешение принято; новая авторизация публикации не требуется.

Повторный `npm run check` завершился с кодом 1: 12 ошибок запуска локального сервера, 24 пропуска исторических архивов. Python suite: 45 тестов успешно; проверка 52095 отправок и тест нового Reported также успешны. Лексические проверки Passive и Reported по-прежнему SKIP (нет wordfreq/cefrpy).

Точный список упавших проверок (причина у всех: `listen EPERM: operation not permitted 127.0.0.1`):

- `node --import ./scripts/no-network.mjs tests/cloudflare-check.mjs`
- `node --import ./scripts/no-network.mjs tests/fixed-assessments.mjs`
- `node --import ./scripts/no-network.mjs tests/free-vs-assigned.mjs`
- `node --import ./scripts/no-network.mjs tests/light-history.mjs`
- `node --import ./scripts/no-network.mjs tests/local-worker.mjs`
- `node --import ./scripts/no-network.mjs tests/manual-review.mjs`
- `node --import ./scripts/no-network.mjs tests/modal-workflows.mjs`
- `node --import ./scripts/no-network.mjs tests/remediation.mjs`
- `node --import ./scripts/no-network.mjs tests/self-practice.mjs`
- `node --import ./scripts/no-network.mjs tests/task-issues.mjs`
- `node --import ./scripts/no-network.mjs tests/teacher-library.mjs`
- `node --import ./scripts/no-network.mjs tests/today.mjs`

Исторические проверки, пропущенные существующим раннером из-за отсутствующих архивов:

- `node --import ./scripts/no-network.mjs tests/adjective-clarity.mjs`
- `node --import ./scripts/no-network.mjs tests/adjective-constructions.mjs`
- `node --import ./scripts/no-network.mjs tests/adjective-mix.mjs`
- `node --import ./scripts/no-network.mjs tests/adjectives-300.mjs`
- `node --import ./scripts/no-network.mjs tests/adjectives-advanced.mjs`
- `node --import ./scripts/no-network.mjs tests/agreement.mjs`
- `node --import ./scripts/no-network.mjs tests/answer-checking.mjs`
- `node --import ./scripts/no-network.mjs tests/answer-cues.mjs`
- `node --import ./scripts/no-network.mjs tests/cloze-variety.mjs`
- `node --import ./scripts/no-network.mjs tests/course-context.mjs`
- `node --import ./scripts/no-network.mjs tests/distinct-cloze.mjs`
- `node --import ./scripts/no-network.mjs tests/final-answer-policy.mjs`
- `node --import ./scripts/no-network.mjs tests/frontend-check.mjs`
- `node --import ./scripts/no-network.mjs tests/future-reference.mjs`
- `node --import ./scripts/no-network.mjs tests/modal-bank.mjs`
- `node --import ./scripts/no-network.mjs tests/passive-assessments.mjs`
- `node --import ./scripts/no-network.mjs tests/passive-integration.mjs`
- `node --import ./scripts/no-network.mjs tests/practice-formats.mjs`
- `node --import ./scripts/no-network.mjs tests/reported-release.mjs`
- `node --import ./scripts/no-network.mjs tests/temporal-context.mjs`
- `node --import ./scripts/no-network.mjs tests/tense-balance.mjs`
- `node --import ./scripts/no-network.mjs tests/tense-clarity.mjs`
- `node --import ./scripts/no-network.mjs tests/training-context.mjs`
- `node --import ./scripts/no-network.mjs tests/v8-review.mjs`

Дополнительные подтверждённые блокировки:

- Запрос на `npm run check` с `sandbox_permissions=require_escalated` автоматически отвергнут до запуска: `sandbox_approval: false`, `request_permissions: false`. Диалог разрешения пользователю не был показан. Тесты не отключались и исключения для EPERM не добавлялись.
- `git add -- scripts/build_bankgen.py`: `Unable to create .../.git/index.lock: Operation not permitted`. Коммит не создан.
- `git ls-remote --heads origin main`: `Could not resolve host: github.com`. Pull и push через терминал не выполнены.

Через разрешённое подключение GitHub выполнено только чтение main (`22fe907a3b359925c46a7623b68d980f19e6f702`): Comparison CP01–CP20 присутствуют, Nouns содержит NN01–NN04. Рабочий банк Comparison не заменён, поскольку предшествующий этап Reported ещё не прошёл обязательные проверки и не опубликован. Nouns, Conditionals и соседний checkout не менялись.

Для продолжения текущей задаче нужен доступ к loopback, сети и запись в `.git`. После изменения режима нужно повторить проверки, commit/push Reported, затем pull --rebase и интеграцию Comparison.
