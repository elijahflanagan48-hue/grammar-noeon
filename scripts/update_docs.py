"""Render current documentation from the bank manifest; --check never writes."""
import json
from pathlib import Path
import re
import sys
ROOT = Path(__file__).resolve().parents[1]
index = json.loads((ROOT / 'data/exercises/index.json').read_text())
labels = {'open_brackets': 'Раскрытие скобок', 'multiple_choice': 'Выбор формы / предложения', 'meaning_choice': 'Выбор значения', 'discourse_choice': 'Связность текста', 'context_cloze': 'Пропуски в контекстном тексте'}
labels.update(error_fix='Исправить ошибку',direct_to_reported='Direct → Reported',modal_gap='Пропуск: модальная форма',modal_meaning='Выбор значения в контексте',modal_fix='Исправление предложения',active_to_passive='Active → Passive',passive_to_active='Passive → Active',word_order='Сборка цепочки',error_correction='Исправление слова',translation_ru_en='Перевод')
labels.update(match='Соединить половинки',sort='Распределить по группам',bank='Слова из банка',hunt='Найти неверные предложения',transformation='Перефразирование')
summary = [f"Банк: **{index['total_items']} задания / {index['answer_slots']} полей**, {len(index['types'])} форматов.",
    '',
    '| Формат | Название | Заданий |', '|---|---|---|']
summary += [f'| `{key}` | {labels[key]} | {count} |' for key, count in index['types'].items()]
summary += ['', 'Сложность: ' + ', '.join(f"{name} — {index['levels3'][name]}" for name in ['basic','medium','advanced']) + '.', '', 'Разделы: ' + ', '.join(f"{name} — {count}" for name, count in index['sections'].items()) + '.',
    '',
    'Версии: ' + ', '.join(f'`{value}`' for value in index['content_versions'].values()) + '.']
cache = re.search(r"const CACHE = ['\"]([^'\"]+)", (ROOT / 'sw.js').read_text())[1]
release_file = ROOT / 'docs/current-release.json'
release = json.loads(release_file.read_text()) if release_file.exists() else {}
published = release.get('content_versions') == index['content_versions'] and release.get('cache') == cache and not release.get('passive_v7_status')
local_file = ROOT / 'docs/current-review.json'
local = json.loads(local_file.read_text()) if local_file.exists() else {}
local_current = local.get('content_versions') == index['content_versions']
release_status = (release.get('description', 'Опубликована итоговая редакция v8: без shall, не более двух принимаемых форм на пропуск, три уровня сложности. После проверки ответа открывается объяснение; кнопка «Далее» остаётся видимой.') if published else local.get('description', 'Локально подготовлены изменения банка; они ещё не опубликованы.') if local_current else 'Локально подготовлены изменения банка; они ещё не опубликованы.')
release_status += (' [Отчёт о выпуске](' + release.get('report', 'docs/reports/RELEASE-V8-FINAL-2026-10-30.md') + ').') if published else ' [Отчёт о проверке](' + (local.get('report', 'docs/review/V8-FINAL-2026-10-30/REPORT.md') if local_current else 'docs/review/V8-FINAL-2026-10-30/REPORT.md') + ').'
readme = (ROOT / 'docs/README.template.md').read_text().replace('{{BANK_SUMMARY}}', '\n'.join(summary)).replace('{{RELEASE_STATUS}}', release_status)
production = ('Рабочий сайт: https://grammar.noeon.org. Worker: ' + release['version'] + '. Трафик 100%; схема и исторические оценки сохранены.' if published else 'Применение этих изменений к рабочему сайту ещё не подтверждено. Последний подтверждённый выпуск: ' + release.get('version', 'b60bd839-0891-4d19-9015-31e457d311d1') + '.')
if not published and local_current and local.get('deployment_note'):
    production = local['deployment_note']
v7_ready=all((ROOT/f'content/passive-bank/v7/final/B{n:02d}.jsonl').exists() for n in range(1,24)) and (ROOT/'content/passive-bank/v7/keep-v6.txt').exists()
v7_status='банк собран; выпуск требует успешного npm run check и браузерной проверки' if v7_ready else 'движок подготовлен; выпуск заблокирован отсутствием проверенных B01–B23 и keep-v6.txt'
status = '\n'.join(['# Текущее состояние', '',
    release_status, '',
    'Банк: ' + ', '.join(index['content_versions'].values()) + f"; {index['total_items']} задания / {index['answer_slots']} полей. PWA: {cache}.", '',
    'Уровни: ' + ', '.join(f"{key} — {index['levels3'][key]}" for key in ['basic','medium','advanced']) + '.', '',
    'Работают теория и карта, кабинеты, назначения, свободная практика с разрешением учителя, серверная проверка, история, отчёты и «Сегодня». Новый подбор использует level; ранее выданные снимки и оценки сохраняются. Схема D1 не менялась.', '',
    production, '',
    'Все 451 спорный пункт закрыты редакторскими решениями по поручению владельца. ' + ('Следующий шаг — наблюдение за выпуском.' if published else local.get('next_step', 'Следующий шаг — приёмка локального выпуска; публикация требует отдельной команды.') if local_current else 'Следующий шаг — приёмка локального выпуска; публикация требует отдельной команды.'), '',
    'Passive v7: '+v7_status+'. [Проверки и ограничения](docs/variety/passive-v7/RELEASE.md).', '',
    '[Итоговая редакция и проверки](docs/review/V8-FINAL-2026-10-30/REPORT.md) · [Как запустить](README.md) · [Журнал выпусков](docs/CHANGELOG.md)', ''])

failed = []
for name, text in [('README.md', readme), ('PROJECT-STATUS.md', status)]:
    path = ROOT / name
    if '--check' in sys.argv:
        if not path.exists() or path.read_text() != text:
            failed.append(name)
    else:
        path.write_text(text)
if failed:
    sys.exit('Stale documentation: ' + ', '.join(failed) + '. Run npm run docs:update.')
print('Documentation matches manifest.' if '--check' in sys.argv else 'Documentation updated from manifest.')
