Ты — методист по английской грамматике для русскоязычных учеников (A2–C1, ЕГЭ, IELTS). Делаешь часть A банка упражнений на тему Say · Tell · Speak · Talk для сайта Grammar NOEON.

Ниже в этом сообщении три части: TASK (спецификация — прочитай целиком и соблюдай), RULE (правило — опирайся только на него) и EXAMPLES (эталон формата и качества). Валидатора у тебя нет — проверку делает Claude, поэтому будь особенно внимателен к формату.

## Твой объём: 300 заданий, id sv-0001 … sv-0300

| target | всего | open_brackets | multiple_choice | id |
|---|---|---|---|---|
| sv_say_tell | 90 | 60 | 30 | sv-0001 … sv-0090 |
| sv_tell_fixed | 45 | 30 | 15 | sv-0091 … sv-0135 |
| sv_say_fixed | 45 | 30 | 15 | sv-0136 … sv-0180 |
| sv_speak_talk | 60 | 40 | 20 | sv-0181 … sv-0240 |
| sv_speak_language | 35 | 25 | 10 | sv-0241 … sv-0275 |
| sv_mixed | 25 | 15 | 10 | sv-0276 … sv-0300 |

Уровни внутри каждой цели: примерно 30% basic, 45% medium, 25% advanced.
Внутри цели покрой все её пункты из таблицы target в TASK, а не один-два самых простых.

## Как работать

1. Работай партиями по 50 заданий (sv-0001 … sv-0050, потом sv-0051 … sv-0100 и т. д.). Выдай партию одним блоком ```jsonl``` и жди моего слова «дальше».
2. Перед выдачей партии перечитай каждое задание как ученик, который видит только предложение и скобку: может ли подойти другой глагол из скобки или другое время? Если да — перепиши контекст.
3. Особенно внимательно с speak / talk (раздел 3 в TASK): там два ответа почти всегда возможны, нужен жёсткий маркер.
4. Не повторяй предложения из EXAMPLES и RULE дословно. Одна схема предложения — не больше трёх раз на все 300.
5. Позиция верного ответа в multiple_choice: равномерно 0/1/2/3.

Начни с первой партии (sv-0001 … sv-0050).

=============== TASK ===============

# Grammar NOEON · Say · Tell · Speak · Talk · Банк из 500 заданий

Общая спецификация для всех исполнителей. Твой объём и порядок работы — в начале этого сообщения.

## 1. Контекст

- Сайт grammar.noeon.org для русскоязычных учеников, уровни A2–C1, подготовка к ЕГЭ и IELTS.
- Правило темы — в RULE. Опирайтесь только на него: что в нём не описано, в задания не берём.
- Эталон качества — `examples.jsonl` (14 заданий). Повторяйте их формат, а не их предложения.

## 2. Главные требования

1. **Ровно один правильный ответ из контекста.** Ученик видит только формат задания, без подсказок и названий правил. Если подходят два глагола, задание переписывается: добавьте маркер (человек сразу после глагола, кавычки, язык, тема без предлога, телефонная формула, устойчивое слово). Принять два разных глагола можно только в исключительном случае, валидатор такие места помечает.
2. **Форма глагола тоже однозначна.** Время задают маркеры (yesterday, every week, right now, has just…). Если подходит и said, и says, оба кладём в `accept`.
3. **Ответ — одно слово**: форма глагола (`told`, `speaks`, `talking`, `spoken`). Вспомогательные глаголы, частицы и предлоги остаются в предложении: `They were (speak / talk) football.` → `talking`; `Could you (say / tell / speak / talk) up?` → `speak`.
4. **Живой современный английский.** Разные ситуации, имена, места: работа, школа, семья, путешествия, соцсети, спорт, звонки, новости. Никаких шаблонов «X said/told Y» с подменой имён. Одна и та же схема предложения — не больше трёх раз на весь ваш объём.
5. **Без русского в английских заданиях**, без слов hint, rule, подсказка.
6. **`why_ru`** — одна короткая фраза по-русски (до 120 знаков), называет решающий маркер: «Человек сразу после глагола — tell», «Язык — speak».
7. **`ref`** — якорь пункта правила из RULE (`sv-reported`, `sv-phone`, …). Для выражений и фразовых глаголов — `sv-phrasal`.

## 3. Опасные места (здесь чаще всего два верных ответа)

- **speak / talk** почти всегда оба возможны: `I spoke / talked to her yesterday`. Однозначно только: язык и умение говорить (speak), телефон (Can I speak to…? — Speaking), выступление перед аудиторией (speak at / to an audience), тема без предлога (talk politics, talk shop), sense / nonsense (talk), болтовня и сплетни (Stop talking, People will talk), фразовые глаголы и выражения. Младенец и попугай — talk и speak оба верны, избегайте.
- **say / tell + that**: без слушателя — say, со слушателем без предлога — tell. `He ___ that he was busy` → только said. `He ___ me that…` → только told. `He ___ to me that…` → только said.
- **tell / ask**: в скобках нет ask, но не пишите контекст, где по смыслу нужен ask (вопрос).
- **say + to do** без человека (`She said to wait`) разговорно возможно: не делайте заданий, где это единственный ответ или где оно конкурирует с tell.
- **mention / discuss / explain** не входят в выбор, но контекст не должен их требовать.
- В выборе из четырёх (multiple_choice) неверные варианты должны быть **точно** неверными.

## 4. Авторский формат: JSON Lines

Одна строка — одно задание. Поля и примеры — в `examples.jsonl`.

| type | что это | обязательные поля |
|---|---|---|
| `open_brackets` | одно предложение, одна скобка с глаголами | id, target, type, level, prompt, answer, accept, why_ru, ref |
| `multiple_choice` | пропуск `___` и 4 варианта | id, target, type, level, prompt, options, answer_index, why_ru, ref |
| `context_cloze` | связный текст 35–90 слов, 3–5 пропусков `{{1}}`…`{{5}}` | id, target, type, level, prompt, blanks[] (options, answer, accept, why_ru, ref) |
| `translation_ru_en` | русское предложение для перевода, проверяет учитель | id, target, type, level, prompt, answer, accept (2–6 вариантов), why_ru, ref |

**Скобки** пишутся так: `(say / tell)`, `(speak / talk)` или `(say / tell / speak / talk)`, глаголы в начальной форме.

| target | что тренирует | глаголы в скобках | ref |
|---|---|---|---|
| `sv_say_tell` | человек после глагола, пересказ, прямая речь, просьбы, «сказал о…» | say / tell | sv-reported, sv-orders, sv-direct |
| `sv_tell_fixed` | truth, lie, story, joke, secret, the time; tell apart / from; can tell | say / tell | sv-tell-fixed, sv-tell-distinguish |
| `sv_say_fixed` | say a word, yes, sorry, hello; вещь «говорит»; they say, it is said, is said to | say / tell | sv-say-objects, sv-things-say, sv-hearsay |
| `sv_speak_talk` | телефон, выступление, тема без предлога, болтовня, sense / nonsense | speak / talk | sv-phone, sv-speak-public, sv-talk-topic, sv-talk-chat, sv-talk-sense |
| `sv_speak_language` | язык, умение говорить, манера | speak / talk | sv-speak-ability |
| `sv_phrases` | выражения и фразовые глаголы из RULE | все четыре | sv-phrasal |
| `sv_mixed` | всё вперемешку, тексты, переводы | все четыре | любой подходящий |

**multiple_choice в парах** (`sv_say_tell`, `sv_tell_fixed`, `sv_say_fixed`, `sv_speak_talk`, `sv_speak_language`): варианты строятся только из двух глаголов пары, но с разным управлением или формой. Пример: `She ___ that she was tired.` → `said / told / said me / told to me` (верно только `said`). В `sv_phrases` и `sv_mixed` варианты — четыре глагола в одной форме или четыре частицы (`speak up / speak out / speak for / speak of`). Позицию верного ответа распределяйте равномерно (0, 1, 2, 3 примерно поровну).

**context_cloze**: в тексте минимум три разных глагола, сюжет лёгкий и современный, у каждого пропуска свой маркер внутри текста.

**translation_ru_en**: короткие бытовые фразы, где русское «сказать / говорить / рассказать / разговаривать» переводится разными глаголами. В `accept` — естественные варианты перевода.

**level** — по сложности предложения, не по глаголу: `basic` (короткое простое, частые слова), `medium` (придаточное, менее частая лексика), `advanced` (длинное, идиомы, книжные конструкции, is said to). Пропорция: basic 30%, medium 45%, advanced 25%.

## 5. Проверка

Формат, скобки, формы глаголов, якоря, дубли и баланс позиций проверяет скрипт на стороне Claude. Перед выдачей партии сам проверь каждую строку: валидный JSON, нужные поля, id по порядку.

После этого задания решаются вслепую другим исполнителем, а Claude сверяет ключ, исправляет расхождения и встраивает банк в сайт.

=============== RULE ===============

# Say · Tell · Speak · Talk — правило (текстовая версия для исполнителей)

Это содержание страницы правила на сайте. Якоря `sv-…` в скобках — значения поля `ref` в заданиях.

## Четыре глагола (sv-map)

**SAY** — слова: что именно сказано.
- Схемы: say sth · say (that) … · say sth to sb · say “…”
- Примеры: He said nothing to me. / She said (that) she’d be late. / “I’m ready,” he said.
- Человек после say — только через to: ✓ say to me, ✗ say me.

**TELL** — слушатель: кому сообщили.
- Схемы: tell sb sth · tell sb (that) … · tell sb about sth · tell sb to do
- Примеры: She told me the news. / He told me to wait. / Tell me about your trip.
- Человек стоит сразу после tell, без предлога: ✓ tell me, ✗ tell to me.

**SPEAK** — голос и язык: сам акт речи, манера, умение.
- Схемы: speak (to sb) (about sth) · speak + язык · speak + как? · speak at a meeting
- Примеры: Do you speak Chinese? / He was too shocked to speak. / Can I speak to Tom, please?
- Чаще в одну сторону и официальнее: выступление, звонок, серьёзный разговор.

**TALK** — разговор: обмен репликами, неформально.
- Схемы: talk (to / with sb) · talk about sth · talk + тема · talk sb into …
- Примеры: We talked for hours. / They talked about work. / Stop talking!
- Двое и больше, живая беседа. Языком не «владеют» через talk: ✗ talk English.

Say words. Tell people. Speak a language. Talk to a friend.

## Что стоит после глагола (sv-after)

✓ — да, ✓* — да, с условием, ✗ — нельзя.

- **… + me / Anna** (человек сразу после глагола): say ✗ (He said me… → said to me); tell ✓ (She told me everything.); speak ✗ (speak to me); talk ✗ (talk to me). Без предлога человек стоит только после tell.
- **… + to me** (человек через to): say ✓ (What did he say to you?); tell ✗ (He told to me… → told me); speak ✓ (I’ll speak to the manager.); talk ✓ (Who were you talking to?). С to работают say, speak и talk. У tell предлога нет.
- **… + “Hello!”** (прямая речь): say ✓ (“Hello!” she said.); tell ✗ (He told, “Hello.” → said); speak ✗; talk ✗. Реплику в кавычках вводит say. После приказа бывает и tell с человеком: “Wait here,” he told me.
- **… + that …** (пересказ: что сказали): say ✓ (He said (that) he was tired.); tell ✓* (He told me (that) he was tired.); speak ✗; talk ✗. say that — без человека, tell sb that — с человеком.
- **… + to do** (просьба, приказ): say ✗ (She said me to wait. → told me); tell ✓* (She told me to wait.); speak ✗; talk ✗. Приказ и просьба: tell sb (not) to do.
- **… + English** (язык): say ✗ (Но: say it in English); tell ✗; speak ✓ (She speaks three languages.); talk ✗ (talk English → speak). Владеть языком — только speak. Say it in English — это про слова, а не про язык.
- **… + about the trip** (о чём речь): say ✗ (He said about… → talked about); tell ✓* (Tell me about the trip.); speak ✓ (He spoke about climate change.); talk ✓ (We talked about the trip.). «Сказал о…» — не ✗ said about: talked / spoke about, told sb about, mentioned.
- **… + the truth · a lie** (правда, ложь, история, шутка): say ✗ (say the truth → tell); tell ✓ (Always tell the truth.); speak ✓* (speak the truth — книжно); talk ✗. truth, lie, story, joke, secret — с tell, человек не нужен.
- **… + a word · yes · sorry** (отдельные слова): say ✓ (He didn’t say a word.); tell ✗; speak ✗; talk ✗. say a word, yes / no, hello, sorry, thank you, a prayer.
- **… + politics · shop** (тема без предлога): say ✗; tell ✗; speak ✗; talk ✓ (They were talking football.). talk politics, business, football, shop (о работе).
- **… + sense · nonsense** (дело или чушь): say ✗; tell ✗; speak ✗ (speaking nonsense → talking); talk ✓ (Don’t talk nonsense!). talk sense — говорить дело, talk nonsense — нести чушь.
- **… + slowly · loudly** (как говорят): say ✗; tell ✗; speak ✓ (Please speak more slowly.); talk ✓ (He talks too fast.). Манера: speak и talk. В просьбах к собеседнику чаще speak.
- **… + with my boss** (вдвоём, с кем-то): say ✗; tell ✗; speak ✓ (I spoke with her yesterday.); talk ✓ (I need to talk with my boss.). speak / talk with sb. В британском чаще to, в американском обе формы.

## Say или tell (sv-say-tell)

- **Пересказ** (sv-reported) — said (that) · told sb (that). He said (that) he was busy. / He told me (that) he was busy. / He said to me that he was busy. / ✗ He said me that he was busy.. Слушателя можно не называть — тогда say. Назвали — tell sb или say to sb.
- **Просьбы и приказы** (sv-orders) — tell sb (not) to do. Tom’s mum told him to clean his room. / He told me not to make a noise. / ✗ She said me to wait.. В разговоре встречается She said to wait, но с человеком — только tell.
- **Прямая речь** (sv-direct) — say, “…”. He said, “I’ll come on Friday.” / “I’ll come on Friday,” he said. / ✗ He told, “Good morning.”
- **Без слушателя** (sv-tell-fixed) — tell the truth, a lie, a story…. tell the truth / tell a lie / lies / tell a story / a joke / tell a secret / tell the time / tell sb’s fortune. Короткий закрытый список: с этими словами tell обходится без человека.
- **Различать, понимать** (sv-tell-distinguish) — tell A from B · tell apart · can tell. I can’t tell them apart. / He can’t tell a good book from a bad one. / Can you tell the difference? / I could tell she was upset.
- **Готовые слова** (sv-say-objects) — say yes, sorry, hello…. say a word / nothing / say yes / no / say hello / goodbye / say sorry / thank you / say a prayer / Say hello to Jo for me.
- **Когда «говорит» вещь** (sv-things-say) — the sign says · my watch says. The sign says “No parking”. / My watch says ten thirty. / The rules say we need a majority. / It says on the box that…. Текст, табличка, правило, часы «говорят» через says. Но tell the time — уметь определять время по часам.
- **Слухи** (sv-hearsay) — they say · it is said · sb is said to. They say laughter is the best medicine. / It is said that he was a spy. / She is said to be very talented.

## Speak или talk (sv-speak-talk)

- **Язык и способность** (sv-speak-ability) — speak English · learn to speak. Do you speak Chinese? / The baby is learning to speak. / He was too shocked to speak. / ✗ He talks three languages.. Исключение: Can your baby talk yet?, Can the parrot talk? — первые слова и попугай.
- **Телефон** (sv-phone) — Can I speak to…? — Speaking.. Can I speak to Tom, please? — Speaking. / Who’s speaking? — This is Mark.. «Speaking» = «это я».
- **Выступление** (sv-speak-public) — speak at / to an audience. I have to speak at the meeting. / She spoke to an audience of 2,000.
- **Тема без предлога** (sv-talk-topic) — talk politics · talk shop. The boys talked football. / Dad and his colleagues were talking shop. / He always wants to talk politics.
- **Болтать и сплетничать** (sv-talk-chat) — Stop talking · People will talk. Everybody stopped talking. / You can’t stay here — the neighbours will talk. / peace talks — переговоры
- **Дело и чушь** (sv-talk-sense) — talk sense · talk nonsense. He always talks sense. / Don’t listen — he’s talking nonsense. / ✗ He is speaking nonsense. / talk through one’s hat — говорить о том, чего не знаешь

Speak — чаще один говорит, официально (speak at a conference, I need to speak to you, Can I speak to Tom?). Talk — разговор, по-дружески (talk to a friend, We talked for hours, Stop talking!). Часто подходят оба: I spoke / talked to her yesterday.

## Выражения и фразовые глаголы (sv-phrases, sv-phrasal)

- [say] **it goes without saying** — само собой разумеется. It goes without saying that we’ll help.
- [say] **needless to say** — излишне говорить. Needless to say, we missed the train.
- [say] **to say the least** — мягко говоря. The flight was uncomfortable, to say the least.
- [say] **to say nothing of** — не говоря уже о. It’s bad for the soil, to say nothing of wildlife.
- [say] **let’s say** — скажем, допустим. Let’s meet at, let’s say, 10.45.
- [say] **that is to say** — то есть. Next week — that is to say, on Monday.
- [say] **having said that** — и всё же. It’s expensive. Having said that, it’s worth it.
- [say] **you can say that again** — не то слово. “It’s cold!” — “You can say that again.”
- [tell] **tell sb off** — отругать. She told me off for being late.
- [tell] **tell on sb / sth** — наябедничать; сказываться. The long trips are telling on his health.
- [tell] **to tell (you) the truth** — по правде говоря. To tell the truth, I’ve never been there.
- [tell] **I told you so** — я же говорил. You missed the bus? I told you so.
- [speak] **speak up** — говорить громче. Speak up! I can’t hear you.
- [speak] **speak up for sb / sth** — вступаться за. Nobody spoke up for her.
- [speak] **speak out (against)** — открыто выступать (против). Few dared to speak out against the war.
- [speak] **speak for sb** — говорить от имени. I speak for the whole team.
- [speak] **speak one’s mind** — говорить прямо, что думаешь. She always speaks her mind.
- [speak] **speak highly / ill of** — хорошо / дурно отзываться. Everyone speaks highly of him.
- [speak] **speak volumes** — говорить красноречивее слов. His silence speaks volumes.
- [speak] **speak for itself** — говорить само за себя. Her success speaks for itself.
- [speak] **so to speak** — так сказать. He’s our captain, so to speak.
- [speak] **frankly / generally speaking** — откровенно / вообще говоря. Frankly speaking, I’m tired.
- [speak] **speaking of …** — кстати о…. Speaking of money, did you pay the bill?
- [talk] **talk sb into (doing) sth** — уговорить. I talked her into coming.
- [talk] **talk sb out of (doing) sth** — отговорить. They talked me out of quitting.
- [talk] **talk sb round** — переубедить. You’ll talk her round.
- [talk] **talk sth over / through** — обсудить, разобрать. Let’s talk the plan through.
- [talk] **talk sth out** — обсудить и уладить. Sit down and talk it out.
- [talk] **talk sb through sth** — объяснить по шагам. He talked me through the setup.
- [talk] **talk back (to sb)** — дерзить. Don’t talk back to your mother.
- [talk] **talk down to sb** — говорить свысока. Don’t talk down to your students.

## Ловушки (sv-traps)

- ✗ He said me the news. → ✓ He told me the news. (Человек без предлога — только после tell.)
- ✗ He told to me the news. → ✓ He told me the news. (У tell нет предлога.)
- ✗ She said me to wait. → ✓ She told me to wait. (Просьба, приказ: tell sb to do.)
- ✗ He told, “Good morning.” → ✓ He said, “Good morning.” (Прямую речь вводит say.)
- ✗ Tell about your day. → ✓ Tell me about your day. (tell почти всегда требует человека.)
- ✗ He said about the problem. → ✓ He talked about the problem. (Или: mentioned the problem, told us about it.)
- ✗ To say the truth, … → ✓ To tell the truth, … (truth — с tell.)
- ✗ Do you talk English? → ✓ Do you speak English? (Язык — speak.)
- ✗ He talks three languages. → ✓ He speaks three languages. (Владение языком — speak.)
- ✗ He is speaking nonsense. → ✓ He is talking nonsense. (nonsense, sense, politics, shop — talk.)
- ✗ Speak up your mind. → ✓ Speak your mind. (speak up — громче; speak one’s mind — прямо.)
- ✗ My watch tells ten thirty. → ✓ My watch says ten thirty. (Вещи «говорят» через says.)

=============== EXAMPLES (examples.jsonl) ===============

```jsonl
{"id":"sv-ex01","target":"sv_say_tell","type":"open_brackets","level":"basic","prompt":"She (say / tell) me the news as soon as I came in.","answer":"told","accept":["told"],"why_ru":"Сразу после глагола человек (me) — значит tell: told me the news.","ref":"sv-reported"}
{"id":"sv-ex02","target":"sv_say_tell","type":"open_brackets","level":"medium","prompt":"Nobody (say / tell) a word when the teacher walked in.","answer":"said","accept":["said"],"why_ru":"say a word — сказать слово; слушателя нет.","ref":"sv-say-objects"}
{"id":"sv-ex03","target":"sv_say_tell","type":"multiple_choice","level":"basic","prompt":"The doctor ___ me to stay in bed for two days.","options":["said","told","spoke","talked"],"answer_index":1,"why_ru":"Совет или указание человеку: tell sb to do.","ref":"sv-orders"}
{"id":"sv-ex04","target":"sv_tell_fixed","type":"open_brackets","level":"medium","prompt":"The twins look so alike that even their teacher can't (say / tell) them apart.","answer":"tell","accept":["tell"],"why_ru":"tell apart — различать.","ref":"sv-tell-distinguish"}
{"id":"sv-ex05","target":"sv_say_fixed","type":"open_brackets","level":"medium","prompt":"Look at the sign — it (say / tell) the museum is closed on Mondays.","answer":"says","accept":["says"],"why_ru":"Табличка «говорит» через says.","ref":"sv-things-say"}
{"id":"sv-ex06","target":"sv_speak_talk","type":"open_brackets","level":"basic","prompt":"Dad and his old friends always (speak / talk) football when they meet.","answer":"talk","accept":["talk"],"why_ru":"Тема без предлога: talk football.","ref":"sv-talk-topic"}
{"id":"sv-ex07","target":"sv_speak_talk","type":"multiple_choice","level":"basic","prompt":"— Hello, can I ___ to Ms Green, please? — ___.","options":["say … Saying","tell … Telling","speak … Speaking","talk … Talking"],"answer_index":2,"why_ru":"По телефону: Can I speak to…? — Speaking (это я).","ref":"sv-phone"}
{"id":"sv-ex08","target":"sv_speak_language","type":"open_brackets","level":"basic","prompt":"My grandmother (speak / talk) four languages fluently.","answer":"speaks","accept":["speaks"],"why_ru":"Владеть языком — speak.","ref":"sv-speak-ability"}
{"id":"sv-ex09","target":"sv_phrases","type":"open_brackets","level":"medium","prompt":"I wanted to quit the course, but my sister (say / tell / speak / talk) me out of it.","answer":"talked","accept":["talked"],"why_ru":"talk sb out of sth — отговорить.","ref":"sv-phrasal"}
{"id":"sv-ex10","target":"sv_phrases","type":"multiple_choice","level":"advanced","prompt":"He never says a word about his charity work, but the photos on his wall ___ volumes.","options":["say","tell","speak","talk"],"answer_index":2,"why_ru":"speak volumes — говорить красноречивее слов.","ref":"sv-phrasal"}
{"id":"sv-ex11","target":"sv_mixed","type":"open_brackets","level":"advanced","prompt":"Before the interview, my mentor (say / tell / speak / talk) me through every question they were likely to ask.","answer":"talked","accept":["talked"],"why_ru":"talk sb through sth — объяснить по шагам.","ref":"sv-phrasal"}
{"id":"sv-ex12","target":"sv_mixed","type":"multiple_choice","level":"medium","prompt":"“Sorry I'm late,” he ___, taking off his coat.","options":["said","told","spoke","talked"],"answer_index":0,"why_ru":"Прямую речь вводит say.","ref":"sv-direct"}
{"id":"sv-ex13","target":"sv_mixed","type":"context_cloze","level":"medium","prompt":"Last night my neighbour knocked on my door. He {{1}} me that his parrot had escaped. “It can {{2}},” he {{3}}, “so if you hear someone shouting ‘Hello, Kevin!’, that's him.” We {{4}} for a few minutes, and then I promised to call him.","blanks":[{"options":"say / tell / speak / talk","answer":"told","accept":["told"],"why_ru":"Человек сразу после глагола (me) — tell.","ref":"sv-reported"},{"options":"say / tell / speak / talk","answer":"talk","accept":["talk","speak"],"why_ru":"Попугай умеет говорить: talk (speak тоже возможно).","ref":"sv-speak-ability"},{"options":"say / tell / speak / talk","answer":"said","accept":["said"],"why_ru":"Прямая речь — say.","ref":"sv-direct"},{"options":"say / tell / speak / talk","answer":"talked","accept":["talked"],"why_ru":"Короткая беседа двух людей — talk.","ref":"sv-talk-chat"}]}
{"id":"sv-ex14","target":"sv_mixed","type":"translation_ru_en","level":"medium","prompt":"Скажи мне правду: ты разбил чашку?","answer":"Tell me the truth: did you break the cup?","accept":["Tell me the truth: did you break the cup?","Tell me the truth. Did you break the cup?","Tell me the truth — did you break the cup?","Tell me the truth, did you break the cup?","Tell me the truth: have you broken the cup?"],"why_ru":"сказать правду — tell the truth; с человеком: tell me.","ref":"sv-tell-fixed"}
```
