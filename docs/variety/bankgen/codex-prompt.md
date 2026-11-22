# Задача для Codex: сборка банков из `content/bankgen/<тема>/final/*.jsonl`

Контекст: репозиторий Grammar NOEON. Для пассива уже сделан `scripts/build_passive_bank_v7.py` (final → `data/exercises/part-*.json`, id-map, retired, gate). Нужно то же для остальных тем одним общим сборщиком.

Сделать `scripts/build_bankgen.py <тема> [--date YYYY-MM-DD]`:
1. Читает `content/bankgen/<тема>/final/*.jsonl` (форматы gap, mini, mc, fix, which, transform; поля описаны в `docs/variety/bankgen/master-template.md`).
2. Конвертирует в элементы банка так же, как это делает `build_passive_bank_v7.py` (`open_brackets`, `mini_text`, `choice`, `error_fix`, для `transform` подобрать существующий тип или добавить), `content_version = <тема>-<дата>.1`, `practice_tenses`/`tags` из `construction`.
3. Стабильный `content/bankgen/<тема>/id-map.json` (`<код>-<ячейка>-NNN`), помечает старые задания темы `retired`, кроме списка `keep.txt` (если есть).
4. Обновляет `data/exercises/index.json`, `docs/current-release.json`, не трогает `passive_v7_status`.
5. Gate разнообразия по теме: взять `scripts/audit_variety.py` и сделать `docs/variety/<тема>-gates.json` по образцу passive; добавить в `scripts/check-all.mjs`.
6. Лексический gate: `python3 -B scripts/lexical_audit.py <тема> --gate 0.05` в `check-all.mjs`.
7. Тесты, обновление `sw.js` и CHANGELOG по правилам проекта; `npm run check` без падений.

Не трогать: файлы тем, над которыми идёт работа в других чатах (сейчас conditionals).
