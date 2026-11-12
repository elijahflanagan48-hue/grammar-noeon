Ты — методист по английской грамматике для русскоязычных учеников (A2–C1, ЕГЭ, IELTS). Делаешь часть A банка упражнений на тему Infinitive · -ing (to do / do / doing) для сайта Grammar NOEON.

Ниже в этом сообщении три части: TASK (спецификация — прочитай целиком и соблюдай), RULE (правило — опирайся только на него) и EXAMPLES (эталон формата и качества). Валидатора у тебя нет — проверку делает Claude, поэтому будь особенно внимателен к формату.

## Твой объём: 480 заданий, id ig-0001 … ig-0480

| target | всего | open_brackets | multiple_choice | id |
|---|---|---|---|---|
| ig_verb_to | 90 | 65 | 25 | ig-0001 … ig-0090 |
| ig_verb_ing | 100 | 70 | 30 | ig-0091 … ig-0190 |
| ig_prep | 90 | 65 | 25 | ig-0191 … ig-0280 |
| ig_bare | 70 | 50 | 20 | ig-0281 … ig-0350 |
| ig_object | 70 | 50 | 20 | ig-0351 … ig-0420 |
| ig_adj | 60 | 45 | 15 | ig-0421 … ig-0480 |

Уровни внутри каждой цели: примерно 30% basic, 45% medium, 25% advanced.
Внутри цели покрой все её пункты (якоря `ref` из таблицы target в TASK) и как можно больше разных управляющих слов из RULE, а не один-два самых простых. Один управляющий глагол — не больше 6 раз на цель.

## Как работать

1. Работай партиями по 60 заданий (8 партий). Ответ на каждую партию — имя файла первой строкой (`part-A-01.jsonl` … `part-A-08.jsonl`) и сразу блок ```jsonl``` с 60 строками, без пояснений вокруг. Потом жди слова «дальше».
2. Перед выдачей партии перечитай каждое задание как ученик, который видит только предложение и глагол в скобках. Может ли подойти другая форма? Если да и смысл тот же — добавь её в accept; если смысл другой — перепиши контекст.
3. Особенно внимательно с разделом 3 TASK: like / begin (обе формы), see / hear sb do / doing, help (to), afraid to / of.
4. Не повторяй предложения из EXAMPLES и RULE дословно. Одна схема предложения — не больше трёх раз на все 480.
5. Позиция верного ответа в multiple_choice: равномерно 0/1/2/3.
6. В конце последней партии выведи сводку: сколько заданий по каждому target, type и level.

Начни с партии part-A-01 (ig-0001 … ig-0060).

=============== TASK ===============

# Grammar NOEON · Infinitive · -ing · Банк из 800 заданий

Общая спецификация для всех исполнителей. Твой объём и порядок работы — в начале этого сообщения.

## 1. Контекст

- Сайт grammar.noeon.org для русскоязычных учеников, уровни A2–C1, подготовка к ЕГЭ и IELTS. Вариант английского — британский.
- Правило темы — в RULE. Опирайтесь только на него: чего в нём нет, в задания не берём.
- Эталон качества — EXAMPLES (32 задания). Повторяйте их формат, а не их предложения.

## 2. Главные требования

1. **Ровно один правильный ответ из контекста.** Ученик видит только предложение и глагол в скобках, без подсказок и названий форм. Если подходят две формы с разным смыслом (remember to do / doing), контекст должен однозначно выбрать одну: маркер времени, следствие, вторая часть предложения.
2. **Все верные варианты — в `accept`.** Если грамматически верны обе формы без разницы в смысле (begin to rain / raining; help sb (to) do; needs cleaning / to be cleaned; deny doing / having done), обе кладём в `accept`. Но такие задания не должны быть заданиями «на различение»: валидатор помечает их, если в `accept` есть и to do, и -ing.
3. **В скобках — один глагол в начальной форме:** `(visit)`, `(be)`, `(tell)`. Ответ — вся форма целиком: `to visit`, `visiting`, `visit`, `to have visited`, `being told`, `to be repaired`. Всё остальное остаётся в предложении: предлог (`good at (draw)` → `drawing`), частица `not` (`promised not (tell)` → `to tell`), объект (`made me (wait)` → `wait`), частица фразового глагола (`kept (switch) off` → `switching`).
4. **Живой современный английский.** Разные ситуации и имена: работа, учёба, семья, путешествия, спорт, соцсети, техника, покупки, здоровье, новости. Никаких шаблонов «X enjoys Ying» с подменой имён. Одна и та же схема предложения — не больше трёх раз на весь ваш объём. Один и тот же управляющий глагол — не больше 6 раз на 100 заданий.
5. **Без русского в английских заданиях**, без слов hint, rule, gerund, infinitive, подсказка.
6. **`why_ru`** — одна короткая фраза по-русски (до 160 знаков), называет решающее слово или смысл: «После avoid — -ing», «Не забыть сделать (впереди) — remember to do», «Вещь нуждается: needs doing = needs to be done».
7. **`ref`** — якорь пункта правила из RULE (`ig-enjoy`, `ig-stop`, `ig-to-prep` …). Для каждой цели разрешены только свои якоря (таблица в разделе 4).

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

Одна строка — одно задание. Поля и примеры — в EXAMPLES.

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

=============== RULE ===============

# Infinitive · -ing — правило (текстовая версия для исполнителей)

Это содержание страницы правила на сайте. Якоря `ig-…` в скобках — значения поля `ref` в заданиях.

## Три формы (ig-map)

**to do** — Цель, план, впереди. Действие ещё впереди: хотим, решаем, обещаем, идём, чтобы сделать.
- Схемы: want **to go** · decide **to stay** · easy **to read** · came **to help**
- Примеры: We decided **to stay** at home. / It’s hard **to explain**. / She called **to say** sorry.
- После глаголов желания и решения, после прилагательных, для цели. Русское «чтобы» — почти всегда **to do**.

**do** — Без to. Голый инфинитив: начальная форма без частицы.
- Схемы: can **swim** · make sb **laugh** · let sb **stay** · had better **go**
- Примеры: You must **see** this film. / They made us **wait**. / Why not **ask** her?
- После модальных глаголов, make / let, had better, would rather, why not. Таких слов немного — их можно выучить списком.

**doing** — Процесс, опыт, факт. Действие как занятие: оно уже идёт, уже было или просто «явление».
- Схемы: enjoy **swimming** · good at **drawing** · look forward to **seeing** · **Walking** is fun.
- Примеры: I enjoy **cooking** for friends. / Thanks for **coming**. / He left without **saying** goodbye.
- После любого предлога — только **-ing**. После глаголов удовольствия, избегания, окончания.

## Что стоит перед глаголом (ig-after)

| Слово перед глаголом | to do | do | doing | Заметка |
|---|---|---|---|---|
| enjoy · avoid · mind (Глаголы «на -ing») | ✗ enjoy to swim | ✗ | ✓ I enjoy swimming. | Удовольствие, избегание, окончание: enjoy, avoid, mind, finish, give up, keep, can’t stand. → ig-verb-ing |
| want · decide · hope (Глаголы «на to») | ✓ We decided to stay. | ✗ | ✗ decided staying | Желание, план, решение, обещание: want, hope, plan, decide, promise, refuse, manage. → ig-verb-to |
| about · of · in · without (Предлог) | ✗ good at to draw | ✗ | ✓ She’s good at drawing. | После предлога глагол всегда с **-ing**: interested in, tired of, before, after, without, instead of. → ig-prep |
| look forward to («to» — это предлог) | ✗ look forward to see | ✗ | ✓ I look forward to seeing you. | Проверка: подставьте существительное. _look forward to the party_ — значит, to здесь предлог, и дальше **-ing**. → ig-to-prep |
| can · must · should (Модальные глаголы) | ✗ must to go | ✓ You must go. | ✗ | После can, could, must, should, may, might, will, would — глагол без to. → ig-modal |
| make · let + кого-то (Заставить, позволить) | ✓ с условием В пассиве: I was made to wait. | ✓ They made me wait. | ✗ | make / let sb **do**. В пассиве у make возвращается to: _was made to wait_; у let пассива нет — _was allowed to_. → ig-make-let |
| see · hear + кого-то (Видел, слышал) | ✓ с условием В пассиве: He was seen to leave. | ✓ I saw him fall. — целиком | ✓ I saw him falling. — в процессе | Целое событие — **do**, кусочек процесса — **doing**. → ig-senses |
| stop · remember · try (Смысл меняется) | ✓ He stopped to rest. — чтобы отдохнуть | ✗ | ✓ He stopped smoking. — бросил | Обе формы верны, но это разные предложения. Подробно — в разделе 6. → ig-meaning |
| begin · start · continue (Разницы почти нет) | ✓ It began to rain. | ✗ | ✓ It began raining. | begin, start, continue, intend, bother — обе формы. Но после -ing-формы берите to: _It’s starting to rain_. → ig-same |
| easy · happy · ready (Прилагательное) | ✓ This app is easy to use. | ✗ | ✓ с условием Только worth и busy: worth seeing | Прилагательное + **to do**. Исключения на -ing: _worth_, _busy_, а также прилагательные с предлогом (_good at_). → ig-adj-to |
| too · enough (Слишком, достаточно) | ✓ too tired to drive | ✗ | ✗ too tired for driving | too + прилагательное + to do; прилагательное + enough + to do. → ig-too |
| had better · would rather (Лучше бы, предпочёл бы) | ✗ had better to go | ✓ You’d better hurry. | ✗ | had better, would rather, would sooner, why not, rather than — без to. → ig-rather |
| The car needs … (Вещь нуждается) | ✓ с условием needs to be repaired | ✗ | ✓ The car needs repairing. | О предмете: needs **doing** = needs **to be done**. О человеке: _I need to repair it._ → ig-needs |
| «чтобы» (цель) (Зачем?) | ✓ I came to help. | ✗ | ✓ с условием Только о назначении вещи: a knife for cutting | Цель человека — **to do** (in order to, so as to). _for + -ing_ — для чего служит предмет. → ig-purpose |

## Глагол + to do (ig-verb-to)

### Желания и планы — to do (ig-want)

Схема: want · would like · hope · plan · intend · expect

- I want to learn Japanese.
- We’re planning to move in spring.
- I hope to see you soon.
- Would you like to join us?
- ✗ I hope seeing you soon.

Сюда же: aim, wish, can’t wait, would love / prefer. **would like** — только to.

### Решения, обещания, отказ — to do (ig-decide)

Схема: decide · agree · refuse · promise · offer

- They decided to sell the house.
- She refused to answer.
- He promised not to be late.
- My brother offered to help.
- We agreed to meet at six.

Также: choose, threaten, arrange, prepare, demand, ask (to do).

### Удалось или нет — to do (ig-manage)

Схема: manage · fail · afford · attempt · learn

- Did you manage to find the hotel?
- He failed to notice the sign.
- We can’t afford to buy a car.
- She learnt to swim at five.
- Don’t hesitate to ask.

Также: deserve, tend, hesitate, struggle, can’t wait.

### Кажется, оказалось — to do (ig-seem)

Схема: seem · appear · pretend · happen · tend

- She seems to know everyone.
- He pretended to be asleep.
- I happened to see her at the station.
- Prices tend to rise in summer.
- The plan turned out to be a disaster.

happen to do — «случайно сделать», pretend to do — «притворяться».

### Вопросительное слово + to — to do (ig-wh)

Схема: how to · what to · where to · whether to

- I don’t know what to say.
- Can you show me how to use it?
- She couldn’t decide whether to stay.
- Tell me where to put the box.

После know, learn, show, explain, wonder, decide: «как сделать», «что сказать».

## Глагол + doing (ig-verb-ing)

### Нравится, не нравится — doing (ig-enjoy)

Схема: enjoy · don’t mind · can’t stand · fancy · feel like

- I really enjoy cooking.
- Do you mind waiting a minute?
- He can’t stand queuing.
- I don’t feel like going out tonight.
- ✗ I enjoy to cook.

Также: dislike, detest, can’t bear (и с to), fancy (UK, «хотеть»).

### Избегать, откладывать, рисковать — doing (ig-avoid)

Схема: avoid · put off · postpone · delay · risk · miss

- She avoided looking at me.
- Stop putting off calling the bank.
- I miss living by the sea.
- You risk losing everything.
- I couldn’t help laughing.

**can’t help doing** — «не могу не…»: _I couldn’t help laughing_.

### Закончить, продолжать — doing (ig-finish)

Схема: finish · give up · quit · keep (on) · carry on · practise

- Have you finished packing?
- He gave up eating sugar.
- Keep trying — you’re nearly there!
- They carried on talking.
- You should practise speaking every day.

### Мысли и слова — doing (ig-admit)

Схема: admit · deny · suggest · consider · imagine · mention · involve

- He admitted taking the money.
- She denied breaking the vase.
- I suggest leaving early.
- Have you considered studying abroad?
- The job involves travelling a lot.
- ✗ I suggest to leave early.

Также: recommend (doing), report, describe, discuss, justify, resent, appreciate.

### go + -ing и время — doing (ig-go)

Схема: go swimming · spend time doing · be busy doing

- Let’s go skiing in March.
- We went shopping on Saturday.
- I spent the evening reading.
- Don’t waste time worrying.
- She’s busy writing her essay.

go + спорт и развлечения: go fishing, go camping, go dancing.

### Готовые выражения — doing (ig-worth)

Схема: it’s no use · no point (in) · worth · have trouble (in)

- It’s no use crying about it.
- There’s no point (in) arguing.
- The museum is worth visiting.
- I had trouble finding the house.
- We had difficulty (in) getting tickets.

Также: it’s no good, it’s a waste of time, can’t help, feel like.

## Предлог + doing (ig-prep)

После любого предлога — только -ing, в том числе после to-предлога.

### Глагол + предлог — doing (ig-prep-verb)

Схема: think of · insist on · succeed in · apologise for

- I’m thinking of changing jobs.
- He insisted on paying.
- She succeeded in passing the exam.
- I apologise for being late.
- It depends on getting the money.

Также: believe in, dream of, rely on, approve of, complain about, worry about, feel like.

### Прилагательное + предлог — doing (ig-prep-adj)

Схема: good at · interested in · tired of · afraid of · fond of

- She’s good at solving puzzles.
- Are you interested in joining the club?
- I’m tired of waiting.
- He’s proud of winning.
- They’re keen on hiking.

Также: capable of, responsible for, famous for, bored with, worried about, sorry for.

### Глагол + кого-то + предлог — doing (ig-prep-obj)

Схема: prevent sb from · accuse sb of · thank sb for

- The rain prevented us from going out.
- They accused him of cheating.
- Thank you for helping me.
- She talked me into buying it.
- Congratulations on passing your test!

Также: stop sb (from), blame sb for, warn sb about, discourage sb from, forgive sb for.

### Свободные предлоги — doing (ig-prep-free)

Схема: before · after · without · instead of · by · on

- Wash your hands before eating.
- He left without saying goodbye.
- Instead of complaining, help me.
- You can save money by cooking at home.
- On arriving, call me.
- Despite feeling ill, she came.

Также: besides, apart from, in spite of, despite, as well as, since.

### «to» — предлог, а не частица — doing (ig-to-prep)

Схема: look forward to · be / get used to · object to

- I look forward to hearing from you.
- I’m used to getting up early.
- You’ll soon get used to living here.
- I object to being treated like a child.
- I prefer walking to driving.
- When it comes to cooking, he’s the best.
- ✗ I look forward to see you.

Тест: можно ли после to поставить существительное? _look forward to the trip_ — да, значит дальше -ing. Не путайте: **used to do** — «раньше делал», **be used to doing** — «привык».

## Инфинитив без to (ig-bare)

### Модальные глаголы — do (ig-modal)

Схема: can · must · should · might · will

- You must try this cake.
- She can’t come today.
- We might go to Rome.
- ✗ You must to try it.

Также после do / does / did в вопросах и отрицаниях. Исключения с to: ought to, have to, be able to, need to.

### make · let · have — do (ig-make-let)

Схема: make / let / have sb do

- The film made me cry.
- Let me carry that.
- I’ll have the porter bring your bags.
- We were made to wait outside.
- We weren’t allowed to leave.
- ✗ They made me to wait.

Но **get sb to do** и **force sb to do** — с to: _I got him to fix it._

### help (to) do — do (ig-help)

Схема: help sb (to) do

- Can you help me (to) move the sofa?
- This app helps you (to) learn words.

Обе формы верны. Без to чаще в разговоре.

### see · hear · watch · feel + кого-то — do (ig-senses)

Схема: do — целиком, doing — процесс

- I saw her cross the road. — видел от начала до конца
- I saw her crossing the road. — видел в процессе
- I heard someone call my name.
- We watched the kids playing.
- He was seen to leave at ten.

В пассиве — to: _was seen to leave_, _was heard to say_.

### Лучше, предпочитаю, почему бы не — do (ig-rather)

Схема: had better · would rather · why not · rather than

- You’d better take an umbrella.
- I’d rather stay in tonight.
- Why not ask the teacher?
- Why wait? Book it now.
- I’ll walk rather than take a taxi.
- ✗ Why to wait?

Также: would sooner, cannot but (книжно), do nothing but: _He did nothing but complain._ Но _had no choice but **to** agree_.

## Обе формы, но смысл разный (ig-meaning)

### remember (ig-remember)
- **+ to do** — не забыть сделать: _Remember to lock the door._ (Не забудь запереть дверь.; сначала помню → потом делаю)
- **+ doing** — помнить, как делал: _I remember locking the door._ (Помню, что запер дверь.; сначала сделал → потом помню)

### forget (ig-forget)
- **+ to do** — забыть сделать: _I forgot to call her._ (Я забыл ей позвонить.; не сделал)
- **+ doing** — забыть то, что было: _I’ll never forget seeing the sea for the first time._ (Никогда не забуду, как впервые увидел море.; было → не забуду)

### stop (ig-stop)
- **+ to do** — остановиться, чтобы…: _We stopped to buy some water._ (Мы остановились, чтобы купить воды.; остановились → потом купили)
- **+ doing** — перестать, бросить: _He stopped smoking last year._ (Он бросил курить в прошлом году.; делал → перестал)

### try (ig-try)
- **+ to do** — пытаться (трудно): _I tried to open the window, but it was stuck._ (Я пытался открыть окно, но его заело.; усилие, может не получиться)
- **+ doing** — попробовать как способ: _Try opening the window — it might help._ (Попробуй открыть окно — может, поможет.; сделать легко, вопрос — поможет ли)

### regret (ig-regret)
- **+ to do** — с сожалением сообщаю: _We regret to inform you that the flight is cancelled._ (С сожалением сообщаем, что рейс отменён.; сейчас; inform, tell, say, announce)
- **+ doing** — жалеть о сделанном: _I regret telling him the truth._ (Жалею, что сказал ему правду.; было → жалею)

### go on (ig-go-on)
- **+ to do** — перейти к следующему: _After school, she went on to study law._ (После школы она пошла учиться на юриста.; одно → потом другое)
- **+ doing** — продолжать то же: _He went on talking for an hour._ (Он продолжал говорить ещё час.; то же самое дальше)

### mean (ig-mean)
- **+ to do** — собираться, намереваться: _I meant to call you, but I forgot._ (Я собирался тебе позвонить, но забыл.; намерение)
- **+ doing** — означать, влечь за собой: _The new job means moving to Leeds._ (Новая работа означает переезд в Лидс.; следствие)

### need (ig-need)
- **+ to do** — человеку нужно сделать: _I need to wash the car._ (Мне нужно помыть машину.; кто-то сделает)
- **+ doing** — вещь нуждается: _The car needs washing._ (Машину нужно помыть.; = needs to be washed)

### be afraid (ig-afraid)
- **+ to do** — боюсь и не решаюсь: _She was afraid to ask._ (Она боялась (не решалась) спросить.; зависит от меня)
- **+ doing** — боюсь, что случится: _I’m afraid of falling._ (Боюсь упасть.; может случиться само)

### be sorry (ig-sorry)
- **+ to do** — сожалею сейчас: _I’m sorry to hear that._ (Жаль это слышать.; сейчас или сразу после)
- **+ doing** — извиняюсь за прошлое: _I’m sorry for being late._ (Извини, что опоздал.; было → извиняюсь)

### be interested (ig-interested)
- **+ to do** — интересно узнать: _I’d be interested to hear your opinion._ (Мне было бы интересно узнать ваше мнение.; hear, know, learn, see)
- **+ doing** — интересуюсь, хочу заниматься: _I’m interested in learning Spanish._ (Мне интересно изучать испанский.; занятие)

### like (ig-like)
- **+ to do** — предпочитаю так делать: _I like to see the dentist twice a year._ (Я стараюсь ходить к стоматологу дважды в год.; считаю правильным)
- **+ doing** — получаю удовольствие: _I like swimming._ (Я люблю плавать.; нравится само занятие)

### Обе формы, смысл тот же — to do / doing (ig-same)

Схема: begin · start · continue · intend · bother

- It started to rain / raining.
- She continued to work / working.
- Don’t bother to call / calling.
- It’s starting to rain. — не starting raining

Если сам главный глагол стоит в -ing, берите to, чтобы не было двух -ing подряд.

### love · hate · prefer · can’t bear — to do / doing (ig-love)

Схема: почти без разницы

- I love dancing / to dance.
- She hates being late / to be late.
- I prefer to walk / walking.
- I’d love to come. — только to
- I prefer walking to driving.
- I’d rather walk than drive.

С would — только to: _would like / love / hate / prefer to do_. Сравнение: prefer **doing** X **to doing** Y.

### used to do · be used to doing — to do / doing (ig-used)

Схема: раньше делал · привык

- I used to live in Kazan. — раньше жил
- I’m used to living alone. — привык
- She’ll get used to working nights. — привыкнет

## Глагол + кого-то + … (ig-object)

### Глагол + кого-то + to do — to do (ig-obj-to)

Схема: want · ask · tell · advise · allow · expect · remind

- I want you to listen.
- She asked me to wait.
- They told us not to worry.
- Mum reminded me to call Grandma.
- Nobody expected him to win.
- ✗ I want that you listen.

Также: would like, invite, encourage, persuade, force, order, teach, warn (not to), get, enable, allow, permit.

### Без объекта → -ing — doing (ig-obj-ing)

Схема: allow · permit · advise · recommend · forbid + doing

- They don’t allow smoking here.
- They don’t allow us to smoke here.
- I’d advise booking early.
- I’d advise you to book early.
- Smoking is not allowed.
- We aren’t allowed to smoke.

С человеком — **to do**, без человека — **-ing**.

### suggest · recommend — doing (ig-suggest)

Схема: suggest doing · suggest (that) sb do

- She suggested going by train.
- She suggested (that) we go by train.
- I recommend booking a table.
- I recommend that you book a table.
- ✗ She suggested me to go.

После suggest человек + to do невозможен. _Recommend sb to do_ встречается в британском английском, но надёжнее _recommend that…_ или _recommend doing_.

### Запретить, помешать — doing (ig-forbid)

Схема: forbid sb to do / from doing · prevent sb from doing

- Her parents forbade her to go out.
- He forbade them from mentioning it.
- Nothing can prevent us from leaving.
- Stop him (from) eating the cake!

prevent / stop / discourage sb **from doing**.

### Кто делает: my / me / Tom’s + -ing — doing (ig-poss)

Схема: Do you mind my opening…?

- Do you mind my / me opening the window?
- I don’t like him / his shouting at people.
- We appreciate your helping us.
- It’s important for us to be on time.

Притяжательное (my, his) — более официально, объектное (me, him) — разговорно. С инфинитивом исполнитель вводится через **for**.

### считать, знать кого-то + to be — to do (ig-believe)

Схема: consider / believe / find sb to be

- We consider him to be the best candidate.
- I found her to be very helpful.
- He is said to be very rich.
- She is believed to have left the country.

Это книжный стиль. В разговоре: _I think he’s the best._ Пассивные формы — в разделе 9.

## Прилагательные, существительные, цель (ig-adj)

### Прилагательное + to do — to do (ig-adj-to)

Схема: easy · hard · nice · glad · ready · likely · sure

- This book is easy to read.
- I’m glad to hear that.
- Are you ready to order?
- He’s likely to be late.
- She’s sure to win.
- It’s kind of you to help.

Оценка человека: _It’s kind / silly / clever **of** you to…_; оценка действия: _It’s easy **for** me to…_

### too · enough — to do (ig-too)

Схема: too + adj + to · adj + enough + to

- She’s too young to drive.
- He’s old enough to vote.
- It’s too cold for us to swim.
- There isn’t enough time to finish.
- ✗ He isn’t enough old.

enough стоит **после** прилагательного, но **перед** существительным: old enough, enough time.

### the first / last / only + to — to do (ig-first)

Схема: the first to arrive

- She was the first to arrive.
- He’s the only one to pass.
- The last person to leave turns off the lights.

Также с порядковыми: the second / next to do.

### Существительное + to do — to do (ig-noun-to)

Схема: a chance to · time to · nothing to do · a book to read

- It’s time to go.
- I have nothing to wear.
- We need somewhere to stay.
- There’s no one to talk to.
- Her decision to leave surprised us.

Но у части существительных — of + -ing: _the idea of moving_, _the chance of winning_ (вероятность), _the thought of leaving_.

### Цель: чтобы — to do (ig-purpose)

Схема: to · in order to · so as (not) to

- I went out to buy some bread.
- She saved money in order to travel.
- We left early so as not to miss the train.
- This tool is for cutting glass.
- ✗ I came here for learning English.

Цель человека — **to do**. **for + -ing** — назначение предмета. «Чтобы не» — _so as not to / in order not to_.

### -ing как подлежащее — doing (ig-subject)

Схема: Swimming is good for you.

- Swimming is good for your back.
- Learning a language takes time.
- It’s nice to see you. — с it обычно to

В начале предложения как подлежащее — чаще -ing. После _It’s + прилагательное_ — to.

## Формы: раньше, в процессе, пассив (ig-forms)

| | Актив | Пассив |
|---|---|---|
| Инфинитив | to do · to be doing · to have done · to have been doing | to be done · to have been done |
| -ing | doing · having done | being done · having been done |

### Раньше главного: to have done — to do (ig-perf-inf)

Схема: seem · appear · is said to have done

- He seems to have forgotten.
- She claims to have met the Queen.
- They are said to have married in secret.
- I’m glad to have met you.

Перфектный инфинитив показывает, что действие **было раньше** глагола-«хозяина».

### В процессе: to be doing — to do (ig-cont-inf)

Схема: seem to be doing · pretend to be doing

- You seem to be enjoying yourself.
- He pretended to be reading.
- She is said to be writing a new book.

### Пассив: to be done · being done — doing (ig-pass)

Схема: expect to be promoted · hate being told

- She expects to be promoted.
- I hate being told what to do.
- He avoided being seen.
- The documents need to be signed.

Если с подлежащим что-то делают, нужна пассивная форма: _I don’t like being laughed at._

### Раньше: having done — doing (ig-perf-ger)

Схема: deny having done · after having done

- He denied having seen her.
- I regret not having studied harder.
- I remember meeting her. — обычно без having
- Thank you for helping me. — обычно без having

После remember, forget, regret, deny, thank, apologise for, after, on, without обычно хватает простого -ing, даже если действие было раньше.

### needs doing · worth doing — doing (ig-needs)

Схема: -ing с пассивным смыслом

- The windows need cleaning. = need to be cleaned
- This shirt wants ironing. — разговорное британское
- The film is worth seeing.
- He deserves to be promoted.
- ✗ It’s worth to see.

_worth_ — только -ing. О людях с deserve берите пассивный инфинитив: _deserves to be praised_.

### Несбывшееся в прошлом — to do (ig-unreal)

Схема: meant / hoped / was to have done

- I meant to call you, but I forgot.
- I would like to have seen her face!
- He was to have arrived yesterday, but his flight was cancelled.

Перфектный инфинитив после meant, hoped, intended, was to, would like подчёркивает, что задуманное **не случилось**. Это книжный оттенок; в разговоре хватает _I meant to call you, but…_

### Отрицание — to do (ig-neg)

Схема: not to do · not doing

- Try not to be late.
- He promised not to tell anyone.
- I regret not going.
- She told me not to worry.

**not** ставится прямо перед формой: not to do, not doing.

## Список: какой глагол что любит (ig-finder)

- **to do**: afford, agree, appear, arrange, ask, choose, claim, decide, demand, deserve, expect, fail, hesitate, hope, intend, learn, manage, offer, plan, prepare, pretend, promise, refuse, seem, tend, threaten, want, would like
- **doing**: admit, appreciate, avoid, can’t help, can’t stand, carry on, consider, delay, deny, dislike, enjoy, fancy, feel like, finish, give up, imagine, involve, keep, mention, mind, miss, postpone, practise, put off, quit, recommend, resist, risk, suggest
- **do**: can / must / should, make sb, let sb, had better, would rather, why not
- **to do / doing**: begin / start, continue, love / hate / prefer, help (sb), remember / forget, stop / try / regret

## Ловушки (ig-traps)

- ✗ I enjoy to swim. → ✓ I enjoy swimming. (enjoy — только -ing.)
- ✗ I’m looking forward to see you. → ✓ I’m looking forward to seeing you. (to здесь предлог.)
- ✗ She suggested me to go. → ✓ She suggested (that) I go. (Или: She suggested going.)
- ✗ They made me to wait. → ✓ They made me wait. (make sb do — без to.)
- ✗ You must to go. → ✓ You must go. (После модальных — без to.)
- ✗ I want that you come. → ✓ I want you to come. (want sb to do.)
- ✗ I’m used to get up early. → ✓ I’m used to getting up early. (be used to + -ing — «привык».)
- ✗ He came here for learning English. → ✓ He came here to learn English. (Цель человека — to do.)
- ✗ Why to wait? → ✓ Why wait? (why / why not + глагол без to.)
- ✗ The museum is worth to visit. → ✓ The museum is worth visiting. (worth — только -ing.)
- ✗ You’d better to hurry. → ✓ You’d better hurry. (had better — без to.)
- ✗ He isn’t enough old to drive. → ✓ He isn’t old enough to drive. (enough — после прилагательного.)
- ✗ I’d like going with you. → ✓ I’d like to go with you. (would like — только to.)
- ✗ The room needs clean. → ✓ The room needs cleaning. (Или: needs to be cleaned.)
- ✗ Let me to explain. → ✓ Let me explain. (let sb do — без to.)
- ✗ I stopped to smoke last year. → ✓ I stopped smoking last year. (Бросил — stop doing.)

=============== EXAMPLES (examples.jsonl) ===============

```jsonl
{"id": "ig-ex01", "target": "ig_verb_to", "type": "open_brackets", "level": "basic", "prompt": "We can't afford (eat) out every week, so we usually cook at home.", "answer": "to eat", "accept": ["to eat"], "why_ru": "afford + to do: позволить себе.", "ref": "ig-manage"}
{"id": "ig-ex02", "target": "ig_verb_to", "type": "open_brackets", "level": "medium", "prompt": "When the alarm went off, Nadia pretended (be) asleep so that her brother would make breakfast.", "answer": "to be", "accept": ["to be"], "why_ru": "pretend + to do: притвориться.", "ref": "ig-seem"}
{"id": "ig-ex03", "target": "ig_verb_to", "type": "multiple_choice", "level": "advanced", "prompt": "I've read the instructions three times and I still don't know where ___ the battery.", "options": ["putting", "to put", "put", "to putting"], "answer_index": 1, "why_ru": "Вопросительное слово + to do: where to put.", "ref": "ig-wh"}
{"id": "ig-ex04", "target": "ig_verb_ing", "type": "open_brackets", "level": "basic", "prompt": "Do you mind (wait) here while I find the manager?", "answer": "waiting", "accept": ["waiting"], "why_ru": "После mind — -ing.", "ref": "ig-enjoy"}
{"id": "ig-ex05", "target": "ig_verb_ing", "type": "open_brackets", "level": "medium", "prompt": "The new manager suggested (move) the weekly meeting to Thursday mornings.", "answer": "moving", "accept": ["moving"], "why_ru": "suggest + -ing (без человека).", "ref": "ig-admit"}
{"id": "ig-ex06", "target": "ig_verb_ing", "type": "multiple_choice", "level": "medium", "prompt": "There's no point ___ to the station now — the last train left ten minutes ago.", "options": ["to run", "run", "to running", "running"], "answer_index": 3, "why_ru": "После there's no point (in) — -ing.", "ref": "ig-worth"}
{"id": "ig-ex07", "target": "ig_verb_ing", "type": "open_brackets", "level": "advanced", "prompt": "Taking the job in Dubai would involve (spend) half the year away from his family.", "answer": "spending", "accept": ["spending"], "why_ru": "involve + -ing: влечь за собой.", "ref": "ig-admit"}
{"id": "ig-ex08", "target": "ig_verb_ing", "type": "open_brackets", "level": "medium", "prompt": "The film was so silly that I couldn't help (laugh) out loud in the cinema.", "answer": "laughing", "accept": ["laughing"], "why_ru": "can't help + -ing: не мог не…", "ref": "ig-avoid"}
{"id": "ig-ex09", "target": "ig_prep", "type": "open_brackets", "level": "basic", "prompt": "Thanks for (lend) me your umbrella yesterday.", "answer": "lending", "accept": ["lending"], "why_ru": "После предлога for — -ing.", "ref": "ig-prep-obj"}
{"id": "ig-ex10", "target": "ig_prep", "type": "open_brackets", "level": "medium", "prompt": "After two months in Glasgow, Lucas is finally getting used to (understand) the local accent.", "answer": "understanding", "accept": ["understanding"], "why_ru": "get used to + -ing: to здесь предлог.", "ref": "ig-to-prep"}
{"id": "ig-ex11", "target": "ig_prep", "type": "multiple_choice", "level": "basic", "prompt": "Instead of ___ a taxi, we walked along the river to the hotel.", "options": ["take", "to take", "taking", "took"], "answer_index": 2, "why_ru": "После instead of — -ing.", "ref": "ig-prep-free"}
{"id": "ig-ex12", "target": "ig_prep", "type": "open_brackets", "level": "advanced", "prompt": "The committee strongly objected to (inform) about the changes only a day before the vote.", "answer": "being informed", "accept": ["being informed"], "why_ru": "object to + -ing; комитет сообщения получал — пассив being informed.", "ref": "ig-to-prep"}
{"id": "ig-ex13", "target": "ig_bare", "type": "open_brackets", "level": "basic", "prompt": "The dentist let my little sister (choose) a sticker after the check-up.", "answer": "choose", "accept": ["choose"], "why_ru": "let sb do — без to.", "ref": "ig-make-let"}
{"id": "ig-ex14", "target": "ig_bare", "type": "open_brackets", "level": "medium", "prompt": "It's getting dark — you'd better (leave) now if you want to catch the ferry.", "answer": "leave", "accept": ["leave"], "why_ru": "had better + глагол без to.", "ref": "ig-rather"}
{"id": "ig-ex15", "target": "ig_bare", "type": "multiple_choice", "level": "medium", "prompt": "From the window I saw the cat ___ off the fence and land perfectly on its feet.", "options": ["jump", "to jump", "jumped", "jumps"], "answer_index": 0, "why_ru": "see sb do — увидел действие целиком.", "ref": "ig-senses"}
{"id": "ig-ex16", "target": "ig_bare", "type": "open_brackets", "level": "advanced", "prompt": "After the cyber attack, all the staff were made (change) their passwords.", "answer": "to change", "accept": ["to change"], "why_ru": "В пассиве make возвращает to: were made to change.", "ref": "ig-make-let"}
{"id": "ig-ex17", "target": "ig_object", "type": "open_brackets", "level": "basic", "prompt": "My parents never allowed us (watch) TV during dinner.", "answer": "to watch", "accept": ["to watch"], "why_ru": "allow sb to do — с человеком to do.", "ref": "ig-obj-to"}
{"id": "ig-ex18", "target": "ig_object", "type": "open_brackets", "level": "medium", "prompt": "The museum doesn't permit (take) photos with a flash.", "answer": "taking", "accept": ["taking"], "why_ru": "permit без человека — -ing.", "ref": "ig-obj-ing"}
{"id": "ig-ex19", "target": "ig_object", "type": "multiple_choice", "level": "medium", "prompt": "Which sentence is correct?", "options": ["She suggested me to take the earlier bus.", "She suggested me that I take the earlier bus.", "She suggested to take the earlier bus.", "She suggested that I take the earlier bus."], "answer_index": 3, "why_ru": "suggest (that) sb do; suggest sb to do невозможно.", "ref": "ig-suggest"}
{"id": "ig-ex20", "target": "ig_adj", "type": "open_brackets", "level": "basic", "prompt": "This puzzle looks easy, but it's surprisingly hard (solve).", "answer": "to solve", "accept": ["to solve"], "why_ru": "Прилагательное + to do: hard to solve.", "ref": "ig-adj-to"}
{"id": "ig-ex21", "target": "ig_adj", "type": "open_brackets", "level": "medium", "prompt": "Mira was the first (notice) that the bridge had been closed.", "answer": "to notice", "accept": ["to notice"], "why_ru": "После the first — to do.", "ref": "ig-first"}
{"id": "ig-ex22", "target": "ig_adj", "type": "multiple_choice", "level": "basic", "prompt": "We went to the market ___ some fresh fish for dinner.", "options": ["for buying", "to buy", "buying", "for to buy"], "answer_index": 1, "why_ru": "Цель человека — to do.", "ref": "ig-purpose"}
{"id": "ig-ex23", "target": "ig_meaning", "type": "open_brackets", "level": "basic", "prompt": "Don't forget (water) the tomatoes while I'm in Spain!", "answer": "to water", "accept": ["to water"], "why_ru": "Не забыть сделать (впереди) — forget to do.", "ref": "ig-forget"}
{"id": "ig-ex24", "target": "ig_meaning", "type": "open_brackets", "level": "medium", "prompt": "I clearly remember (lock) the front door — I even checked it twice.", "answer": "locking", "accept": ["locking", "having locked"], "why_ru": "Помню, что сделал (было раньше) — remember doing.", "ref": "ig-remember"}
{"id": "ig-ex25", "target": "ig_meaning", "type": "open_brackets", "level": "medium", "prompt": "Halfway up the hill we stopped (take) a photo of the valley.", "answer": "to take", "accept": ["to take"], "why_ru": "Остановились, чтобы сделать — stop to do.", "ref": "ig-stop"}
{"id": "ig-ex26", "target": "ig_meaning", "type": "multiple_choice", "level": "medium", "prompt": "The router still isn't working? Have you tried ___ it off and on again? That usually fixes it.", "options": ["to turn", "turn", "turning", "turned"], "answer_index": 2, "why_ru": "Попробовать как способ — try doing.", "ref": "ig-try"}
{"id": "ig-ex27", "target": "ig_meaning", "type": "open_brackets", "level": "advanced", "prompt": "We regret (inform) passengers that the 18:40 service to York has been cancelled.", "answer": "to inform", "accept": ["to inform"], "why_ru": "Официальное сообщение с сожалением — regret to inform.", "ref": "ig-regret"}
{"id": "ig-ex28", "target": "ig_forms", "type": "open_brackets", "level": "medium", "prompt": "The witness claims (see) the driver before the crash, but the police don't believe her.", "answer": "to have seen", "accept": ["to have seen"], "why_ru": "Видела раньше, чем утверждает, — to have done.", "ref": "ig-perf-inf"}
{"id": "ig-ex29", "target": "ig_forms", "type": "open_brackets", "level": "basic", "prompt": "These windows are filthy — they really need (clean).", "answer": "cleaning", "accept": ["cleaning", "to be cleaned"], "why_ru": "Вещь нуждается: needs doing = needs to be done.", "ref": "ig-needs"}
{"id": "ig-ex30", "target": "ig_forms", "type": "multiple_choice", "level": "medium", "prompt": "Nobody likes ___ in front of the whole class.", "options": ["being criticised", "criticising", "to criticise", "having criticised"], "answer_index": 0, "why_ru": "Критикуют самого человека — пассив being criticised.", "ref": "ig-pass"}
{"id": "ig-ex31", "target": "ig_mixed", "type": "context_cloze", "level": "medium", "prompt": "Last spring my cousin Ilya decided {{1}} a coffee cart near the station. At first he wasn't used to {{2}} up at half past four, and he kept {{3}} off his alarm without waking up. Now he's quite good at it, and he says he'll never regret {{4}} his boring office job.", "blanks": [{"verb": "open", "answer": "to open", "accept": ["to open"], "why_ru": "После decide — to do.", "ref": "ig-decide"}, {"verb": "get", "answer": "getting", "accept": ["getting"], "why_ru": "be used to + -ing: привык.", "ref": "ig-to-prep"}, {"verb": "switch", "answer": "switching", "accept": ["switching"], "why_ru": "keep + -ing: продолжал, снова и снова.", "ref": "ig-finish"}, {"verb": "leave", "answer": "leaving", "accept": ["leaving", "having left"], "why_ru": "Не жалеет о сделанном — regret doing.", "ref": "ig-regret"}]}
{"id": "ig-ex32", "target": "ig_mixed", "type": "translation_ru_en", "level": "medium", "prompt": "Я помню, как впервые прыгнул с парашютом.", "answer": "I remember jumping with a parachute for the first time.", "accept": ["I remember jumping with a parachute for the first time.", "I remember doing my first parachute jump.", "I remember making my first parachute jump.", "I remember my first parachute jump."], "why_ru": "Воспоминание о прошлом — remember doing.", "ref": "ig-remember"}
```
