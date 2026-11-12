# Grammar NOEON · Infinitive · -ing · Банк из 800 заданий

Общая спецификация для всех исполнителей. Ваш личный объём и порядок работы — в вашем промпте (`PROMPT-Gemini.md` или `PROMPT-Codex.md`).

## 1. Контекст

- Сайт grammar.noeon.org для русскоязычных учеников, уровни A2–C1, подготовка к ЕГЭ и IELTS. Вариант английского — британский.
- Правило темы — в `RULE.md`. Опирайтесь только на него: чего в нём нет, в задания не берём.
- Эталон качества — `examples.jsonl` (32 задания). Повторяйте их формат, а не их предложения.

## 2. Главные требования

1. **Ровно один правильный ответ из контекста.** Ученик видит только предложение и глагол в скобках, без подсказок и названий форм. Если подходят две формы с разным смыслом (remember to do / doing), контекст должен однозначно выбрать одну: маркер времени, следствие, вторая часть предложения.
2. **Все верные варианты — в `accept`.** Если грамматически верны обе формы без разницы в смысле (begin to rain / raining; help sb (to) do; needs cleaning / to be cleaned; deny doing / having done), обе кладём в `accept`. Но такие задания не должны быть заданиями «на различение»: валидатор помечает их, если в `accept` есть и to do, и -ing.
3. **В скобках — один глагол в начальной форме:** `(visit)`, `(be)`, `(tell)`. Ответ — вся форма целиком: `to visit`, `visiting`, `visit`, `to have visited`, `being told`, `to be repaired`. Всё остальное остаётся в предложении: предлог (`good at (draw)` → `drawing`), частица `not` (`promised not (tell)` → `to tell`), объект (`made me (wait)` → `wait`), частица фразового глагола (`kept (switch) off` → `switching`).
4. **Живой современный английский.** Разные ситуации и имена: работа, учёба, семья, путешествия, спорт, соцсети, техника, покупки, здоровье, новости. Никаких шаблонов «X enjoys Ying» с подменой имён. Одна и та же схема предложения — не больше трёх раз на весь ваш объём. Один и тот же управляющий глагол — не больше 6 раз на 100 заданий.
5. **Без русского в английских заданиях**, без слов hint, rule, gerund, infinitive, подсказка.
6. **`why_ru`** — одна короткая фраза по-русски (до 160 знаков), называет решающее слово или смысл: «После avoid — -ing», «Не забыть сделать (впереди) — remember to do», «Вещь нуждается: needs doing = needs to be done».
7. **`ref`** — якорь пункта правила из `RULE.md` (`ig-enjoy`, `ig-stop`, `ig-to-prep` …). Для каждой цели разрешены только свои якоря (таблица в разделе 4).

## 3. Опасные места

- **like / love / hate / prefer, begin / start / continue, intend, bother, can’t bear** — обе формы верны. Не делайте с ними заданий на выбор одной формы. Исключение: **would like / love / prefer** — только to.
- **remember / forget / regret / stop / try / go on / mean / need / afraid / sorry / interested** — смысл задаёт контекст. Нужен жёсткий маркер:
  - remember / forget **doing**: событие уже было (`last summer`, `when I was six`, `I’ll never forget`); **to do**: обязанность впереди (`Don’t forget…`, `Remember… before you leave`, `I forgot…, so the door was open`).
  - stop **to do**: остановились ради другого действия (`stopped at a café to…`); stop **doing**: прекратили то же (`stopped … years ago`, `stop … — it’s annoying`).
  - try **to do**: усилие и неудача (`…, but it was too heavy`); try **doing**: эксперимент-совет (`Why not try…? It might help`).
  - regret **to**: только с inform / tell / say / announce / let you know; regret **doing**: жалеть о сделанном.
- **afraid to / afraid of doing** часто оба возможны. Однозначно -ing: страх случайного события (`afraid of falling / of losing my way`). Однозначно to do: не решился на действие (`was afraid to ask, so she said nothing`). В остальных случаях — оба в `accept` или перепишите.
- **see / hear / watch sb do / doing** — оба возможны почти всегда. Однозначно только: целое короткое событие + второе действие (`saw him jump and land`) — do; длительный фон (`heard them arguing all night`) — doing. Иначе оба в `accept`.
- **help sb (to) do** — всегда оба в `accept`.
- **forbid sb to do / from doing** — оба в `accept`, если стоит `forbid sb …`.
- **suggest, recommend**: suggest + человек + to do невозможно; recommend sb to do допустимо в британском, поэтому не делайте задания, где ученик должен его отвергнуть.
- **to как предлог** (look forward to, be / get used to, object to, prefer X to Y, when it comes to, admit to, in addition to) — однозначно -ing. Не путать с `used to do` (раньше) — там скобка без be / get.
- **Перфект и пассив** (ig_forms): если подходит и простая форма, и перфектная (`deny doing / having done`, `remember doing / having done`, `thank for helping / having helped`), обе в `accept`. Пассив — только если подлежащее явно испытывает действие (`hate (interrupt) by people` → `being interrupted`).
- **needs / wants / deserves + -ing**: о предмете `needs cleaning` и `needs to be cleaned` — обе в `accept`. `worth` — только -ing. О людях с deserve — пассивный инфинитив (`deserves to be praised`), `deserves praising` не используем.
- **Цель**: `to do` (in order to, so as to). `for + -ing` — только назначение предмета. Не делайте заданий, где ответ — `in order to`, если в скобке один глагол: ответ — форма глагола, `in order` остаётся в предложении.
- **Модальные глаголы** — лёгкая тема, не больше 10% заданий ig_bare.
- В выборе из четырёх (multiple_choice) неверные варианты должны быть **точно** неверными в этом предложении. Не ставьте рядом `to go` и `going` после begin или like.

## 4. Авторский формат: JSON Lines

Одна строка — одно задание. Поля и примеры — в `examples.jsonl`.

| type | что это | обязательные поля |
|---|---|---|
| `open_brackets` | одно предложение, одна скобка с глаголом | id, target, type, level, prompt, answer, accept, why_ru, ref |
| `multiple_choice` | пропуск `___` и 4 варианта формы, **или** prompt `Which sentence is correct?` и 4 целых предложения (не больше 15% вашего выбора) | id, target, type, level, prompt, options, answer_index, why_ru, ref |
| `context_cloze` | связный текст 40–110 слов, 3–5 пропусков `{{1}}`…`{{5}}`, у каждого свой глагол | id, target, type, level, prompt, blanks[] (verb, answer, accept, why_ru, ref) |
| `translation_ru_en` | русское предложение для перевода, проверяет учитель | id, target, type, level, prompt, answer, accept (2–6 вариантов), why_ru, ref |

| target | что тренирует | ref |
|---|---|---|
| `ig_verb_to` | глаголы + to do; вопросительное слово + to | ig-verb-to, ig-want, ig-decide, ig-manage, ig-seem, ig-wh |
| `ig_verb_ing` | глаголы + -ing; go + -ing; spend time; it’s no use, worth, no point, have trouble | ig-verb-ing, ig-enjoy, ig-avoid, ig-finish, ig-admit, ig-go, ig-worth |
| `ig_prep` | глагол / прилагательное / объект + предлог + -ing; свободные предлоги; to-предлог | ig-prep, ig-prep-verb, ig-prep-adj, ig-prep-obj, ig-prep-free, ig-to-prep |
| `ig_bare` | make / let / have sb do, help, see / hear sb do, had better, would rather, why not, rather than, модальные | ig-bare, ig-modal, ig-make-let, ig-help, ig-senses, ig-rather |
| `ig_object` | want / ask / allow sb to do; allow / advise / permit + -ing без объекта; suggest; forbid / prevent; my / me + -ing; consider sb to be | ig-object, ig-obj-to, ig-obj-ing, ig-suggest, ig-forbid, ig-poss, ig-believe |
| `ig_adj` | прилагательное + to; too / enough; the first to; существительное + to; цель; -ing как подлежащее | ig-adj, ig-adj-to, ig-too, ig-first, ig-noun-to, ig-purpose, ig-subject |
| `ig_meaning` | пары со сменой смысла; оба без разницы; used to / be used to | ig-meaning, ig-remember, ig-forget, ig-stop, ig-try, ig-regret, ig-go-on, ig-mean, ig-need, ig-afraid, ig-sorry, ig-interested, ig-like, ig-same, ig-love, ig-used |
| `ig_forms` | to have done, to be doing, to be done, being done, having done, needs doing, worth, несбывшееся, отрицание | ig-forms, ig-perf-inf, ig-cont-inf, ig-pass, ig-perf-ger, ig-needs, ig-unreal, ig-neg |
| `ig_mixed` | всё вперемешку, тексты, переводы | любой якорь |

**multiple_choice**: варианты — формы того же глагола (`to go / going / go / to going`, `to have lost / to lose / losing / having lost`). Позицию верного ответа распределяйте равномерно (0, 1, 2, 3 примерно поровну).

**context_cloze**: сюжет лёгкий и современный, минимум две разные формы в тексте, у каждого пропуска свой маркер внутри текста. Поле `verb` — глагол в начальной форме (на сайте он покажется у пропуска).

**translation_ru_en**: короткие бытовые фразы, где выбор формы — суть перевода (помню, как… / не забудь…; бросил… / остановился, чтобы…; предложил пойти; привык вставать). В `accept` — 3–6 естественных вариантов.

**level** — по сложности предложения, не по правилу: `basic` (короткое простое, частые слова), `medium` (придаточное, менее частая лексика), `advanced` (длинное, книжные конструкции, перфект и пассив, редкие управляющие глаголы). Пропорция: basic 30%, medium 45%, advanced 25%.

## 5. Проверка

`python3 ig_bank.py check ваш-файл.jsonl` — формат, скобки, соответствие ответа глаголу из скобок, якоря, дубли, баланс позиций и сводка по целям, формам и пунктам правила. Ошибки обязательно исправить. Предупреждения (`WARN`) — перечитать и переписать задание, если это возможно.

После этого задания решаются вслепую другим исполнителем (`PROMPT-SOLVE.md`), а Claude сверяет ключ, исправляет расхождения и встраивает банк в сайт.
