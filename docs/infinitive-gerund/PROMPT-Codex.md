Ты работаешь как методист и инженер. Делаешь часть B банка упражнений Infinitive · -ing (to do / do / doing) для сайта Grammar NOEON и сам проверяешь её скриптом.

В папке пакета: TASK.md (спецификация — прочитай целиком и соблюдай), RULE.md (правило, опирайся только на него), examples.jsonl (эталон формата и качества), ig_bank.py (валидатор).

## Твой объём: 320 заданий, id ig-0481 … ig-0800

| target | type | количество | id |
|---|---|---|---|
| ig_meaning | open_brackets | 90 | ig-0481 … ig-0570 |
| ig_meaning | multiple_choice | 40 | ig-0571 … ig-0610 |
| ig_forms | open_brackets | 60 | ig-0611 … ig-0670 |
| ig_forms | multiple_choice | 20 | ig-0671 … ig-0690 |
| ig_mixed | open_brackets | 30 | ig-0691 … ig-0720 |
| ig_mixed | multiple_choice | 20 | ig-0721 … ig-0740 |
| ig_mixed | context_cloze | 40 | ig-0741 … ig-0780 |
| ig_mixed | translation_ru_en | 20 | ig-0781 … ig-0800 |

Уровни: примерно 30% basic, 45% medium, 25% advanced.

## Требования к своей части

- **ig_meaning**: каждая пара из раздела «Обе формы, но смысл разный» (remember, forget, stop, try, regret, go on, mean, need, afraid, sorry, interested, like) — минимум 6 заданий, причём обе стороны пары поровну; remember, forget, stop, try — по 12–14. Плюс used to do / be used to doing — 8, ig-same и ig-love — по 4 (ответ в accept обеими формами, кроме would like / prefer). Маркер смысла обязательно внутри предложения (раздел 3 TASK.md).
- **ig_forms**: perfect infinitive после seem / appear / claim / is said / is believed (18), continuous infinitive (10), passive infinitive и passive -ing (22), having done (10, с простой формой в accept, где она верна), needs / wants doing и worth (12), несбывшееся с meant / was to / would like to have (4), отрицание not to do / not doing (4).
- **ig_mixed open_brackets / multiple_choice**: различение всех трёх форм по всему правилу, в том числе ловушки из раздела «Ловушки».
- **context_cloze**: 40 разных сюжетов (соседи, работа, поездки, чат, учёба, спорт, ремонт, здоровье). В каждом тексте 3–5 пропусков, минимум две разные формы, у каждого пропуска свой маркер внутри текста.
- **translation_ru_en**: короткие бытовые фразы, где выбор формы — суть перевода. В accept — 3–6 естественных вариантов.

## Порядок работы

1. Пиши задания в файлы `part-B-01.jsonl` … `part-B-04.jsonl` (по 80 строк).
2. После каждого файла запускай `python3 ig_bank.py check part-B-0N.jsonl`. Все ERROR исправь. Каждое WARN перечитай и, если можно, перепиши контекст так, чтобы ответ стал единственным, либо добавь вторую верную форму в accept.
3. В конце запусти `python3 ig_bank.py check part-B-*.jsonl` и проверь сводку: количество по target и type как в таблице, позиции верного ответа в выборе примерно поровну, пункты правила покрыты.
4. Перечитай все 320 заданий глазами ученика: может ли подойти другая форма? Если да — перепиши или добавь в accept.
5. Сделай слепую версию части A для перекрёстной проверки, когда она появится в папке: `python3 ig_bank.py blind part-A-*.jsonl > blind-A.jsonl`, реши её по PROMPT-SOLVE.md и сохрани как `solved-A.jsonl`.
6. Отдай четыре файла, итоговый вывод валидатора и solved-A.jsonl. Ничего в сайт не встраивай — это сделает Claude.
