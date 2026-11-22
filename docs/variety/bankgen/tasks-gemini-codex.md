# Задания для Gemini и Codex (reported, сюжеты готовы)

## Gemini: пачки reported (21 штука)

Вариант А (вручную, в приложении Gemini): для каждой пачки RP01…RP21 прикрепить `reported/master.md` (один раз на чат) и `reported/prompts/RPxx.md`, отправить, ответ целиком (только JSONL) сохранить как `reported/raw/RPxx.jsonl`. Один чат на 3–4 пачки, чтобы модель не «усреднялась».

Вариант Б (через Codex + Gemini CLI, см. ниже): Codex сам гоняет все 21 файл, проверяет и делает повторные запросы.

## Codex, задача 1: прогнать пачки reported через Gemini CLI

Работай только в новой папке: `git clone https://github.com/elijahflanagan48-hue/grammar-noeon.git ~/Projects/grammar-noeon-bankgen`. Не трогай `~/Projects/grammar-noeon` (там чужая незакоммиченная работа по conditionals).

1. Файлы промптов: `~/Projects/bankgen-exchange/reported/prompts/RP01.md … RP21.md`, мастер-промпт `~/Projects/bankgen-exchange/reported/master.md` (копии есть и в репозитории: `content/bankgen/reported/`).
2. Для каждого RPxx: отправь в Gemini CLI (самая сильная доступная модель, не flash) мастер-промпт + содержимое RPxx.md одним запросом в неинтерактивном режиме. Ответ сохрани как `content/bankgen/reported/raw/RPxx.jsonl`: только строки JSON, без ``` и без пояснений (строку `# check:` оставь).
3. После каждого ответа: `python3 scripts/bankgen.py validate reported RPxx`. Если в `content/bankgen/reported/reports/repair-RPxx.md` появились исправления — отправь этот файл в Gemini вместе с мастер-промптом, подставь исправленные строки по id, проверь снова. Не больше двух повторов.
4. В конце скопируй `content/bankgen/reported/raw/` и `reports/` в `~/Projects/bankgen-exchange/reported/` и покажи таблицу: пачка, число заданий, ошибки, предупреждения.
5. Ничего не коммить и не пушь. Не правь сами задания руками.

Если Gemini CLI не может принять большой запрос одним сообщением, режь на два: сначала мастер-промпт как системную инструкцию (GEMINI.md или `--system`), потом RPxx.md.

## Codex, задача 2: сборщик банка

См. `docs/variety/bankgen/codex-prompt.md` (общий `scripts/build_bankgen.py`). Начинать после того, как появятся первые файлы `final/`. Рабочий клон тот же (`~/Projects/grammar-noeon-bankgen`), основной репозиторий и conditionals не трогать.
