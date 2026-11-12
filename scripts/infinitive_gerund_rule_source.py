#!/usr/bin/env python3
"""Источник страницы правила Infinitive · -ing (инфинитив и герундий).

Подача как у Say · Tell · Speak · Talk: три «линзы» (to do / do / doing), переключатель
«Что стоит перед глаголом?», строки-аккордеоны, пары со сменой смысла (переключатель to / -ing),
конструктор форм, фильтр «то» или «-ing», карточки-ловушки и мини-тест.
Токены — .mv (modal-verbs.css), готовые виджеты — .sv (speaking-verbs.css), своё — .ig (infinitive-gerund.css).

Опора: Swan, Practical English Usage (4th ed.); Murphy, English Grammar in Use; Cambridge Grammar (dictionary.cambridge.org/grammar);
British Council LearnEnglish (verb patterns, -ing or infinitive to change meaning); Oxford Learner's Dictionaries (recommend, forbid, deserve).
"""
from html import escape as E

FORMS = ['to', 'bare', 'ing']
FORM_LABEL = {'to': 'to do', 'bare': 'do', 'ing': 'doing'}

LENS = {
    'to': ('→', 'to do', 'Цель, план, впереди', 'Действие ещё впереди: хотим, решаем, обещаем, идём, чтобы сделать',
           ['want <b>to go</b>', 'decide <b>to stay</b>', 'easy <b>to read</b>', 'came <b>to help</b>'],
           ['We decided <b>to stay</b> at home.', 'It’s hard <b>to explain</b>.', 'She called <b>to say</b> sorry.'],
           'После глаголов желания и решения, после прилагательных, для цели. Русское «чтобы» — почти всегда <b>to do</b>.'),
    'bare': ('∅', 'do', 'Без to', 'Голый инфинитив: начальная форма без частицы',
             ['can <b>swim</b>', 'make sb <b>laugh</b>', 'let sb <b>stay</b>', 'had better <b>go</b>'],
             ['You must <b>see</b> this film.', 'They made us <b>wait</b>.', 'Why not <b>ask</b> her?'],
             'После модальных глаголов, make / let, had better, would rather, why not. Таких слов немного — их можно выучить списком.'),
    'ing': ('~ing', 'doing', 'Процесс, опыт, факт', 'Действие как занятие: оно уже идёт, уже было или просто «явление»',
            ['enjoy <b>swimming</b>', 'good at <b>drawing</b>', 'look forward to <b>seeing</b>', '<b>Walking</b> is fun.'],
            ['I enjoy <b>cooking</b> for friends.', 'Thanks for <b>coming</b>.', 'He left without <b>saying</b> goodbye.'],
            'После любого предлога — только <b>-ing</b>. После глаголов удовольствия, избегания, окончания.'),
}

# Переключатель «Что стоит перед глаголом?»: y — да, p — да, но с условием, n — нет.
SLOTS = [
    ('enjoy · avoid · mind', 'Глаголы «на -ing»', {
        'to': ('n', 'enjoy to swim'), 'bare': ('n', ''), 'ing': ('y', 'I enjoy swimming.')},
     'Удовольствие, избегание, окончание: enjoy, avoid, mind, finish, give up, keep, can’t stand.', 'ig-verb-ing'),
    ('want · decide · hope', 'Глаголы «на to»', {
        'to': ('y', 'We decided to stay.'), 'bare': ('n', ''), 'ing': ('n', 'decided staying')},
     'Желание, план, решение, обещание: want, hope, plan, decide, promise, refuse, manage.', 'ig-verb-to'),
    ('about · of · in · without', 'Предлог', {
        'to': ('n', 'good at to draw'), 'bare': ('n', ''), 'ing': ('y', 'She’s good at drawing.')},
     'После предлога глагол всегда с <b>-ing</b>: interested in, tired of, before, after, without, instead of.', 'ig-prep'),
    ('look forward to', '«to» — это предлог', {
        'to': ('n', 'look forward to see'), 'bare': ('n', ''), 'ing': ('y', 'I look forward to seeing you.')},
     'Проверка: подставьте существительное. <i>look forward to the party</i> — значит, to здесь предлог, и дальше <b>-ing</b>.', 'ig-to-prep'),
    ('can · must · should', 'Модальные глаголы', {
        'to': ('n', 'must to go'), 'bare': ('y', 'You must go.'), 'ing': ('n', '')},
     'После can, could, must, should, may, might, will, would — глагол без to.', 'ig-modal'),
    ('make · let + sb', 'Заставить, позволить', {
        'to': ('p', 'В пассиве: I was made to wait.'), 'bare': ('y', 'They made me wait.'), 'ing': ('n', '')},
     'make / let sb <b>do</b>. В пассиве у make возвращается to: <i>was made to wait</i>; у let пассива нет — <i>was allowed to</i>.', 'ig-make-let'),
    ('see · hear + sb', 'Видел, слышал', {
        'to': ('p', 'В пассиве: He was seen to leave.'), 'bare': ('y', 'I saw him fall. — целиком'), 'ing': ('y', 'I saw him falling. — в процессе')},
     'Целое событие — <b>do</b>, кусочек процесса — <b>doing</b>.', 'ig-senses'),
    ('stop · remember · try', 'Смысл меняется', {
        'to': ('y', 'He stopped to rest. — чтобы отдохнуть'), 'bare': ('n', ''), 'ing': ('y', 'He stopped smoking. — бросил')},
     'Обе формы верны, но это разные предложения. Подробно — в разделе 6.', 'ig-meaning'),
    ('begin · start · continue', 'Разницы почти нет', {
        'to': ('y', 'It began to rain.'), 'bare': ('n', ''), 'ing': ('y', 'It began raining.')},
     'begin, start, continue, intend, bother — обе формы. Но после -ing-формы берите to: <i>It’s starting to rain</i>.', 'ig-same'),
    ('easy · happy · ready', 'Прилагательное', {
        'to': ('y', 'This app is easy to use.'), 'bare': ('n', ''), 'ing': ('p', 'Только worth и busy: worth seeing')},
     'Прилагательное + <b>to do</b>. Исключения на -ing: <i>worth</i>, <i>busy</i>, а также прилагательные с предлогом (<i>good at</i>).', 'ig-adj-to'),
    ('too · enough', 'Слишком, достаточно', {
        'to': ('y', 'too tired to drive'), 'bare': ('n', ''), 'ing': ('n', 'too tired for driving')},
     'too + прилагательное + to do; прилагательное + enough + to do.', 'ig-too'),
    ('had better · would rather', 'Лучше бы, предпочёл бы', {
        'to': ('n', 'had better to go'), 'bare': ('y', 'You’d better hurry.'), 'ing': ('n', '')},
     'had better, would rather, would sooner, why not, rather than — без to.', 'ig-rather'),
    ('The car needs …', 'Вещь нуждается', {
        'to': ('p', 'needs to be repaired'), 'bare': ('n', ''), 'ing': ('y', 'The car needs repairing.')},
     'О предмете: needs <b>doing</b> = needs <b>to be done</b>. О человеке: <i>I need to repair it.</i>', 'ig-needs'),
    ('«чтобы» (цель)', 'Зачем?', {
        'to': ('y', 'I came to help.'), 'bare': ('n', ''), 'ing': ('p', 'Только о назначении вещи: a knife for cutting')},
     'Цель человека — <b>to do</b> (in order to, so as to). <i>for + -ing</i> — для чего служит предмет.', 'ig-purpose'),
]

# Строки-аккордеоны: (форма-цвет, заголовок, образец, якорь, примеры, заметка)
VERB_TO = [
    ('to', 'Желания и планы', 'want · would like · hope · plan · intend · expect', 'ig-want',
     ['I want to learn Japanese.', 'We’re planning to move in spring.', 'I hope to see you soon.', 'Would you like to join us?', '✗ I hope seeing you soon.'],
     'Сюда же: aim, wish, can’t wait, would love / prefer. <b>would like</b> — только to.'),
    ('to', 'Решения, обещания, отказ', 'decide · agree · refuse · promise · offer', 'ig-decide',
     ['They decided to sell the house.', 'She refused to answer.', 'He promised not to be late.', 'My brother offered to help.', 'We agreed to meet at six.'],
     'Также: choose, threaten, arrange, prepare, demand, ask (to do).'),
    ('to', 'Удалось или нет', 'manage · fail · afford · attempt · learn', 'ig-manage',
     ['Did you manage to find the hotel?', 'He failed to notice the sign.', 'We can’t afford to buy a car.', 'She learnt to swim at five.', 'Don’t hesitate to ask.'],
     'Также: deserve, tend, hesitate, struggle, can’t wait.'),
    ('to', 'Кажется, оказалось', 'seem · appear · pretend · happen · tend', 'ig-seem',
     ['She seems to know everyone.', 'He pretended to be asleep.', 'I happened to see her at the station.', 'Prices tend to rise in summer.', 'The plan turned out to be a disaster.'],
     'happen to do — «случайно сделать», pretend to do — «притворяться».'),
    ('to', 'Вопросительное слово + to', 'how to · what to · where to · whether to', 'ig-wh',
     ['I don’t know what to say.', 'Can you show me how to use it?', 'She couldn’t decide whether to stay.', 'Tell me where to put the box.'],
     'После know, learn, show, explain, wonder, decide: «как сделать», «что сказать».'),
]

VERB_ING = [
    ('ing', 'Нравится, не нравится', 'enjoy · don’t mind · can’t stand · fancy · feel like', 'ig-enjoy',
     ['I really enjoy cooking.', 'Do you mind waiting a minute?', 'He can’t stand queuing.', 'I don’t feel like going out tonight.', '✗ I enjoy to cook.'],
     'Также: dislike, detest, can’t bear (и с to), fancy (UK, «хотеть»).'),
    ('ing', 'Избегать, откладывать, рисковать', 'avoid · put off · postpone · delay · risk · miss', 'ig-avoid',
     ['She avoided looking at me.', 'Stop putting off calling the bank.', 'I miss living by the sea.', 'You risk losing everything.', 'I couldn’t help laughing.'],
     '<b>can’t help doing</b> — «не могу не…»: <i>I couldn’t help laughing</i>.'),
    ('ing', 'Закончить, продолжать', 'finish · give up · quit · keep (on) · carry on · practise', 'ig-finish',
     ['Have you finished packing?', 'He gave up eating sugar.', 'Keep trying — you’re nearly there!', 'They carried on talking.', 'You should practise speaking every day.'],
     ''),
    ('ing', 'Мысли и слова', 'admit · deny · suggest · consider · imagine · mention · involve', 'ig-admit',
     ['He admitted taking the money.', 'She denied breaking the vase.', 'I suggest leaving early.', 'Have you considered studying abroad?', 'The job involves travelling a lot.', '✗ I suggest to leave early.'],
     'Также: recommend (doing), report, describe, discuss, justify, resent, appreciate.'),
    ('ing', 'go + -ing и время', 'go swimming · spend time doing · be busy doing', 'ig-go',
     ['Let’s go skiing in March.', 'We went shopping on Saturday.', 'I spent the evening reading.', 'Don’t waste time worrying.', 'She’s busy writing her essay.'],
     'go + спорт и развлечения: go fishing, go camping, go dancing.'),
    ('ing', 'Готовые выражения', 'it’s no use · no point (in) · worth · have trouble (in)', 'ig-worth',
     ['It’s no use crying about it.', 'There’s no point (in) arguing.', 'The museum is worth visiting.', 'I had trouble finding the house.', 'We had difficulty (in) getting tickets.'],
     'Также: it’s no good, it’s a waste of time, can’t help, feel like.'),
]

PREP = [
    ('ing', 'Глагол + предлог', 'think of · insist on · succeed in · apologise for', 'ig-prep-verb',
     ['I’m thinking of changing jobs.', 'He insisted on paying.', 'She succeeded in passing the exam.', 'I apologise for being late.', 'It depends on getting the money.'],
     'Также: believe in, dream of, rely on, approve of, complain about, worry about, feel like.'),
    ('ing', 'Прилагательное + предлог', 'good at · interested in · tired of · afraid of · fond of', 'ig-prep-adj',
     ['She’s good at solving puzzles.', 'Are you interested in joining the club?', 'I’m tired of waiting.', 'He’s proud of winning.', 'They’re keen on hiking.'],
     'Также: capable of, responsible for, famous for, bored with, worried about, sorry for.'),
    ('ing', 'Глагол + sb + предлог', 'prevent sb from · accuse sb of · thank sb for', 'ig-prep-obj',
     ['The rain prevented us from going out.', 'They accused him of cheating.', 'Thank you for helping me.', 'She talked me into buying it.', 'Congratulations on passing your test!'],
     'Также: stop sb (from), blame sb for, warn sb about, discourage sb from, forgive sb for.'),
    ('ing', 'Свободные предлоги', 'before · after · without · instead of · by · on', 'ig-prep-free',
     ['Wash your hands before eating.', 'He left without saying goodbye.', 'Instead of complaining, help me.', 'You can save money by cooking at home.', 'On arriving, call me.', 'Despite feeling ill, she came.'],
     'Также: besides, apart from, in spite of, despite, as well as, since.'),
    ('ing', '«to» — предлог, а не частица', 'look forward to · be / get used to · object to', 'ig-to-prep',
     ['I look forward to hearing from you.', 'I’m used to getting up early.', 'You’ll soon get used to living here.', 'I object to being treated like a child.', 'I prefer walking to driving.', 'When it comes to cooking, he’s the best.', '✗ I look forward to see you.'],
     'Тест: можно ли после to поставить существительное? <i>look forward to the trip</i> — да, значит дальше -ing. Не путайте: <b>used to do</b> — «раньше делал», <b>be used to doing</b> — «привык».'),
]

BARE = [
    ('bare', 'Модальные глаголы', 'can · must · should · might · will', 'ig-modal',
     ['You must try this cake.', 'She can’t come today.', 'We might go to Rome.', '✗ You must to try it.'],
     'Также после do / does / did в вопросах и отрицаниях. Исключения с to: ought to, have to, be able to, need to.'),
    ('bare', 'make · let · have', 'make / let / have sb do', 'ig-make-let',
     ['The film made me cry.', 'Let me carry that.', 'I’ll have the porter bring your bags.', 'We were made to wait outside.', 'We weren’t allowed to leave.', '✗ They made me to wait.'],
     'Но <b>get sb to do</b> и <b>force sb to do</b> — с to: <i>I got him to fix it.</i>'),
    ('bare', 'help (to) do', 'help sb (to) do', 'ig-help',
     ['Can you help me (to) move the sofa?', 'This app helps you (to) learn words.'],
     'Обе формы верны. Без to чаще в разговоре.'),
    ('bare', 'see · hear · watch · feel + sb', 'do — целиком, doing — процесс', 'ig-senses',
     ['I saw her cross the road. — видел от начала до конца', 'I saw her crossing the road. — видел в процессе', 'I heard someone call my name.', 'We watched the kids playing.', 'He was seen to leave at ten.'],
     'В пассиве — to: <i>was seen to leave</i>, <i>was heard to say</i>.'),
    ('bare', 'Лучше, предпочитаю, почему бы не', 'had better · would rather · why not · rather than', 'ig-rather',
     ['You’d better take an umbrella.', 'I’d rather stay in tonight.', 'Why not ask the teacher?', 'Why wait? Book it now.', 'I’ll walk rather than take a taxi.', '✗ Why to wait?'],
     'Также: would sooner, cannot but (книжно), do nothing but: <i>He did nothing but complain.</i> Но <i>had no choice but <b>to</b> agree</i>.'),
]

PAIRS = [
    # глагол, (to: смысл, пример, перевод, порядок), (ing: …), якорь
    ('remember', ('не забыть сделать', 'Remember to lock the door.', 'Не забудь запереть дверь.', 'сначала помню → потом делаю'),
     ('помнить, как делал', 'I remember locking the door.', 'Помню, что запер дверь.', 'сначала сделал → потом помню'), 'ig-remember'),
    ('forget', ('забыть сделать', 'I forgot to call her.', 'Я забыл ей позвонить.', 'не сделал'),
     ('забыть то, что было', 'I’ll never forget seeing the sea for the first time.', 'Никогда не забуду, как впервые увидел море.', 'было → не забуду'), 'ig-forget'),
    ('stop', ('остановиться, чтобы…', 'We stopped to buy some water.', 'Мы остановились, чтобы купить воды.', 'остановились → потом купили'),
     ('перестать, бросить', 'He stopped smoking last year.', 'Он бросил курить в прошлом году.', 'делал → перестал'), 'ig-stop'),
    ('try', ('пытаться (трудно)', 'I tried to open the window, but it was stuck.', 'Я пытался открыть окно, но его заело.', 'усилие, может не получиться'),
     ('попробовать как способ', 'Try opening the window — it might help.', 'Попробуй открыть окно — может, поможет.', 'сделать легко, вопрос — поможет ли'), 'ig-try'),
    ('regret', ('с сожалением сообщаю', 'We regret to inform you that the flight is cancelled.', 'С сожалением сообщаем, что рейс отменён.', 'сейчас; inform, tell, say, announce'),
     ('жалеть о сделанном', 'I regret telling him the truth.', 'Жалею, что сказал ему правду.', 'было → жалею'), 'ig-regret'),
    ('go on', ('перейти к следующему', 'After school, she went on to study law.', 'После школы она пошла учиться на юриста.', 'одно → потом другое'),
     ('продолжать то же', 'He went on talking for an hour.', 'Он продолжал говорить ещё час.', 'то же самое дальше'), 'ig-go-on'),
    ('mean', ('собираться, намереваться', 'I meant to call you, but I forgot.', 'Я собирался тебе позвонить, но забыл.', 'намерение'),
     ('означать, влечь за собой', 'The new job means moving to Leeds.', 'Новая работа означает переезд в Лидс.', 'следствие'), 'ig-mean'),
    ('need', ('человеку нужно сделать', 'I need to wash the car.', 'Мне нужно помыть машину.', 'кто-то сделает'),
     ('вещь нуждается', 'The car needs washing.', 'Машину нужно помыть.', '= needs to be washed'), 'ig-need'),
    ('be afraid', ('боюсь и не решаюсь', 'She was afraid to ask.', 'Она боялась (не решалась) спросить.', 'зависит от меня'),
     ('боюсь, что случится', 'I’m afraid of falling.', 'Боюсь упасть.', 'может случиться само'), 'ig-afraid'),
    ('be sorry', ('сожалею сейчас', 'I’m sorry to hear that.', 'Жаль это слышать.', 'сейчас или сразу после'),
     ('извиняюсь за прошлое', 'I’m sorry for being late.', 'Извини, что опоздал.', 'было → извиняюсь'), 'ig-sorry'),
    ('be interested', ('интересно узнать', 'I’d be interested to hear your opinion.', 'Мне было бы интересно узнать ваше мнение.', 'hear, know, learn, see'),
     ('интересуюсь, хочу заниматься', 'I’m interested in learning Spanish.', 'Мне интересно изучать испанский.', 'занятие'), 'ig-interested'),
    ('like', ('предпочитаю так делать', 'I like to see the dentist twice a year.', 'Я стараюсь ходить к стоматологу дважды в год.', 'считаю правильным'),
     ('получаю удовольствие', 'I like swimming.', 'Я люблю плавать.', 'нравится само занятие'), 'ig-like'),
]

SAME = [
    ('both', 'Обе формы, смысл тот же', 'begin · start · continue · intend · bother', 'ig-same',
     ['It started to rain / raining.', 'She continued to work / working.', 'Don’t bother to call / calling.', 'It’s starting to rain. — не starting raining'],
     'Если сам главный глагол стоит в -ing, берите to, чтобы не было двух -ing подряд.'),
    ('both', 'love · hate · prefer · can’t bear', 'почти без разницы', 'ig-love',
     ['I love dancing / to dance.', 'She hates being late / to be late.', 'I prefer to walk / walking.', 'I’d love to come. — только to', 'I prefer walking to driving.', 'I’d rather walk than drive.'],
     'С would — только to: <i>would like / love / hate / prefer to do</i>. Сравнение: prefer <b>doing</b> X <b>to doing</b> Y.'),
    ('both', 'used to do · be used to doing', 'раньше делал · привык', 'ig-used',
     ['I used to live in Kazan. — раньше жил', 'I’m used to living alone. — привык', 'She’ll get used to working nights. — привыкнет'],
     ''),
]

OBJECT = [
    ('to', 'Глагол + sb + to do', 'want · ask · tell · advise · allow · expect · remind', 'ig-obj-to',
     ['I want you to listen.', 'She asked me to wait.', 'They told us not to worry.', 'Mum reminded me to call Grandma.', 'Nobody expected him to win.', '✗ I want that you listen.'],
     'Также: would like, invite, encourage, persuade, force, order, teach, warn (not to), get, enable, allow, permit.'),
    ('ing', 'Без объекта → -ing', 'allow · permit · advise · recommend · forbid + doing', 'ig-obj-ing',
     ['They don’t allow smoking here.', 'They don’t allow us to smoke here.', 'I’d advise booking early.', 'I’d advise you to book early.', 'Smoking is not allowed.', 'We aren’t allowed to smoke.'],
     'С человеком — <b>to do</b>, без человека — <b>-ing</b>.'),
    ('ing', 'suggest · recommend', 'suggest doing · suggest (that) sb do', 'ig-suggest',
     ['She suggested going by train.', 'She suggested (that) we go by train.', 'I recommend booking a table.', 'I recommend that you book a table.', '✗ She suggested me to go.'],
     'После suggest конструкция sb + to do невозможна. <i>Recommend sb to do</i> встречается в британском английском, но надёжнее <i>recommend that…</i> или <i>recommend doing</i>.'),
    ('ing', 'Запретить, помешать', 'forbid sb to do / from doing · prevent sb from doing', 'ig-forbid',
     ['Her parents forbade her to go out.', 'He forbade them from mentioning it.', 'Nothing can prevent us from leaving.', 'Stop him (from) eating the cake!'],
     'prevent / stop / discourage sb <b>from doing</b>.'),
    ('ing', 'Кто делает: my / me / Tom’s + -ing', 'Do you mind my opening…?', 'ig-poss',
     ['Do you mind my / me opening the window?', 'I don’t like him / his shouting at people.', 'We appreciate your helping us.', 'It’s important for us to be on time.'],
     'Притяжательное (my, his) — более официально, объектное (me, him) — разговорно. С инфинитивом исполнитель вводится через <b>for</b>.'),
    ('to', 'Считать человека кем-то: sb to be', 'consider / believe / find sb to be', 'ig-believe',
     ['We consider him to be the best candidate.', 'I found her to be very helpful.', 'He is said to be very rich.', 'She is believed to have left the country.'],
     'Это книжный стиль. В разговоре: <i>I think he’s the best.</i> Пассивные формы — в разделе 9.'),
]

ADJ = [
    ('to', 'Прилагательное + to do', 'easy · hard · nice · glad · ready · likely · sure', 'ig-adj-to',
     ['This book is easy to read.', 'I’m glad to hear that.', 'Are you ready to order?', 'He’s likely to be late.', 'She’s sure to win.', 'It’s kind of you to help.'],
     'Оценка человека: <i>It’s kind / silly / clever <b>of</b> you to…</i>; оценка действия: <i>It’s easy <b>for</b> me to…</i>'),
    ('to', 'too · enough', 'too + adj + to · adj + enough + to', 'ig-too',
     ['She’s too young to drive.', 'He’s old enough to vote.', 'It’s too cold for us to swim.', 'There isn’t enough time to finish.', '✗ He isn’t enough old.'],
     'enough стоит <b>после</b> прилагательного, но <b>перед</b> существительным: old enough, enough time.'),
    ('to', 'the first / last / only + to', 'the first to arrive', 'ig-first',
     ['She was the first to arrive.', 'He’s the only one to pass.', 'The last person to leave turns off the lights.'],
     'Также с порядковыми: the second / next to do.'),
    ('to', 'Существительное + to do', 'a chance to · time to · nothing to do · a book to read', 'ig-noun-to',
     ['It’s time to go.', 'I have nothing to wear.', 'We need somewhere to stay.', 'There’s no one to talk to.', 'Her decision to leave surprised us.'],
     'Но у части существительных — of + -ing: <i>the idea of moving</i>, <i>the chance of winning</i> (вероятность), <i>the thought of leaving</i>.'),
    ('to', 'Цель: чтобы', 'to · in order to · so as (not) to', 'ig-purpose',
     ['I went out to buy some bread.', 'She saved money in order to travel.', 'We left early so as not to miss the train.', 'This tool is for cutting glass.', '✗ I came here for learning English.'],
     'Цель человека — <b>to do</b>. <b>for + -ing</b> — назначение предмета. «Чтобы не» — <i>so as not to / in order not to</i>.'),
    ('ing', '-ing как подлежащее', 'Swimming is good for you.', 'ig-subject',
     ['Swimming is good for your back.', 'Learning a language takes time.', 'It’s nice to see you. — с it обычно to'],
     'В начале предложения как подлежащее — чаще -ing. После <i>It’s + прилагательное</i> — to.'),
]

# Конструктор форм: (ключ, подпись) по осям; ответы для каждого сочетания.
FORM_TABLE = {
    # (когда, залог, процесс): (инфинитив, герундий, пример инфинитива, пример герундия)
    ('same', 'act', 'no'): ('to do', 'doing', 'She seems to know him.', 'I enjoy cooking.'),
    ('same', 'act', 'yes'): ('to be doing', '—', 'He seems to be sleeping.', 'У -ing нет отдельной длительной формы.'),
    ('same', 'pas', 'no'): ('to be done', 'being done', 'I want to be told the truth.', 'I hate being interrupted.'),
    ('same', 'pas', 'yes'): ('to be being done', '—', 'Почти не встречается: лучше переформулировать.', '—'),
    ('before', 'act', 'no'): ('to have done', 'having done', 'He seems to have lost his keys.', 'He denied having taken the money.'),
    ('before', 'act', 'yes'): ('to have been doing', '—', 'She seems to have been crying.', '—'),
    ('before', 'pas', 'no'): ('to have been done', 'having been done', 'The car is said to have been stolen.', 'She was angry at having been ignored.'),
    ('before', 'pas', 'yes'): ('—', '—', 'Такой формы на практике нет.', '—'),
}

FORM_ROWS = [
    ('to', 'Раньше главного: to have done', 'seem · appear · is said to have done', 'ig-perf-inf',
     ['He seems to have forgotten.', 'She claims to have met the Queen.', 'They are said to have married in secret.', 'I’m glad to have met you.'],
     'Перфектный инфинитив показывает, что действие <b>было раньше</b> глагола-«хозяина».'),
    ('to', 'В процессе: to be doing', 'seem to be doing · pretend to be doing', 'ig-cont-inf',
     ['You seem to be enjoying yourself.', 'He pretended to be reading.', 'She is said to be writing a new book.'],
     ''),
    ('ing', 'Пассив: to be done · being done', 'expect to be promoted · hate being told', 'ig-pass',
     ['She expects to be promoted.', 'I hate being told what to do.', 'He avoided being seen.', 'The documents need to be signed.'],
     'Если с подлежащим что-то делают, нужна пассивная форма: <i>I don’t like being laughed at.</i>'),
    ('ing', 'Раньше: having done', 'deny having done · after having done', 'ig-perf-ger',
     ['He denied having seen her.', 'I regret not having studied harder.', 'I remember meeting her. — обычно без having', 'Thank you for helping me. — обычно без having'],
     'После remember, forget, regret, deny, thank, apologise for, after, on, without обычно хватает простого -ing, даже если действие было раньше.'),
    ('ing', 'needs doing · worth doing', '-ing с пассивным смыслом', 'ig-needs',
     ['The windows need cleaning. = need to be cleaned', 'This shirt wants ironing. — разговорное британское', 'The film is worth seeing.', 'He deserves to be promoted.', '✗ It’s worth to see.'],
     '<i>worth</i> — только -ing. О людях с deserve берите пассивный инфинитив: <i>deserves to be praised</i>.'),
    ('to', 'Несбывшееся в прошлом', 'meant / hoped / was to have done', 'ig-unreal',
     ['I meant to call you, but I forgot.', 'I would like to have seen her face!', 'He was to have arrived yesterday, but his flight was cancelled.'],
     'Перфектный инфинитив после meant, hoped, intended, was to, would like подчёркивает, что задуманное <b>не случилось</b>. Это книжный оттенок; в разговоре хватает <i>I meant to call you, but…</i>'),
    ('to', 'Отрицание', 'not to do · not doing', 'ig-neg',
     ['Try not to be late.', 'He promised not to tell anyone.', 'I regret not going.', 'She told me not to worry.'],
     '<b>not</b> ставится прямо перед формой: not to do, not doing.'),
]

# Фильтр «Какая форма?»: (форма, слово, пример)
FINDER = [
    ('to', 'afford', 'We can’t afford to wait.'), ('to', 'agree', 'She agreed to help.'), ('to', 'appear', 'He appears to be lost.'),
    ('to', 'arrange', 'We arranged to meet at five.'), ('to', 'ask', 'He asked to see the manager.'), ('to', 'choose', 'She chose to stay.'),
    ('to', 'claim', 'He claims to know her.'), ('to', 'decide', 'They decided to leave.'), ('to', 'demand', 'I demand to know the truth.'),
    ('to', 'deserve', 'You deserve to win.'), ('to', 'expect', 'I expect to be back by six.'), ('to', 'fail', 'The bus failed to arrive.'),
    ('to', 'hesitate', 'Don’t hesitate to call.'), ('to', 'hope', 'We hope to finish soon.'), ('to', 'intend', 'I intend to apply.'),
    ('to', 'learn', 'She learnt to drive.'), ('to', 'manage', 'I managed to fix it.'), ('to', 'offer', 'He offered to drive.'),
    ('to', 'plan', 'We plan to travel.'), ('to', 'prepare', 'Prepare to be amazed.'), ('to', 'pretend', 'She pretended to sleep.'),
    ('to', 'promise', 'I promise to write.'), ('to', 'refuse', 'He refused to pay.'), ('to', 'seem', 'You seem to be tired.'),
    ('to', 'tend', 'I tend to forget names.'), ('to', 'threaten', 'They threatened to leave.'), ('to', 'want', 'I want to rest.'),
    ('to', 'would like', 'I’d like to try.'),
    ('ing', 'admit', 'He admitted lying.'), ('ing', 'appreciate', 'I appreciate your helping.'), ('ing', 'avoid', 'Avoid eating late.'),
    ('ing', 'can’t help', 'I can’t help smiling.'), ('ing', 'can’t stand', 'I can’t stand waiting.'), ('ing', 'carry on', 'Carry on reading.'),
    ('ing', 'consider', 'We’re considering moving.'), ('ing', 'delay', 'Don’t delay replying.'), ('ing', 'deny', 'She denied knowing him.'),
    ('ing', 'dislike', 'I dislike flying.'), ('ing', 'enjoy', 'We enjoyed sailing.'), ('ing', 'fancy', 'Fancy going out?'),
    ('ing', 'feel like', 'I feel like dancing.'), ('ing', 'finish', 'Finish eating first.'), ('ing', 'give up', 'He gave up smoking.'),
    ('ing', 'imagine', 'Imagine living there!'), ('ing', 'involve', 'It involves travelling.'), ('ing', 'keep', 'Keep going!'),
    ('ing', 'mention', 'He mentioned seeing you.'), ('ing', 'mind', 'Do you mind waiting?'), ('ing', 'miss', 'I miss living there.'),
    ('ing', 'postpone', 'They postponed leaving.'), ('ing', 'practise', 'Practise speaking.'), ('ing', 'put off', 'Don’t put off studying.'),
    ('ing', 'quit', 'She quit drinking coffee.'), ('ing', 'recommend', 'I recommend trying it.'), ('ing', 'resist', 'I couldn’t resist buying it.'),
    ('ing', 'risk', 'Don’t risk losing it.'), ('ing', 'suggest', 'I suggest waiting.'),
    ('bare', 'can / must / should', 'You should rest.'), ('bare', 'make sb', 'It made me laugh.'), ('bare', 'let sb', 'Let me see.'),
    ('bare', 'had better', 'You’d better go.'), ('bare', 'would rather', 'I’d rather stay.'), ('bare', 'why not', 'Why not try?'),
    ('both', 'begin / start', 'It began to rain / raining.'), ('both', 'continue', 'He continued to talk / talking.'),
    ('both', 'love / hate / prefer', 'I love to dance / dancing.'), ('both', 'help (sb)', 'Help me (to) carry it.'),
    ('both', 'remember / forget', 'Смысл меняется: раздел 6.'), ('both', 'stop / try / regret', 'Смысл меняется: раздел 6.'),
]

TRAPS = [
    ('I enjoy to swim.', 'I enjoy swimming.', 'enjoy — только -ing.'),
    ('I’m looking forward to see you.', 'I’m looking forward to seeing you.', 'to здесь предлог.'),
    ('She suggested me to go.', 'She suggested (that) I go.', 'Или: She suggested going.'),
    ('They made me to wait.', 'They made me wait.', 'make sb do — без to.'),
    ('You must to go.', 'You must go.', 'После модальных — без to.'),
    ('I want that you come.', 'I want you to come.', 'want sb to do.'),
    ('I’m used to get up early.', 'I’m used to getting up early.', 'be used to + -ing — «привык».'),
    ('He came here for learning English.', 'He came here to learn English.', 'Цель человека — to do.'),
    ('Why to wait?', 'Why wait?', 'why / why not + глагол без to.'),
    ('The museum is worth to visit.', 'The museum is worth visiting.', 'worth — только -ing.'),
    ('You’d better to hurry.', 'You’d better hurry.', 'had better — без to.'),
    ('He isn’t enough old to drive.', 'He isn’t old enough to drive.', 'enough — после прилагательного.'),
    ('I’d like going with you.', 'I’d like to go with you.', 'would like — только to.'),
    ('The room needs clean.', 'The room needs cleaning.', 'Или: needs to be cleaned.'),
    ('Let me to explain.', 'Let me explain.', 'let sb do — без to.'),
    ('I stopped to smoke last year.', 'I stopped smoking last year.', 'Бросил — stop doing.'),
]

QUIZ = [
    ('We decided ___ a taxi.', ['to take', 'take', 'taking', 'to taking'], 0, 'decide + to do.'),
    ('Do you mind ___ the window?', ['to open', 'open', 'opening', 'to opening'], 2, 'mind + -ing.'),
    ('The teacher made us ___ the text again.', ['to read', 'read', 'reading', 'to reading'], 1, 'make sb do — без to.'),
    ('I’m looking forward to ___ my cousins.', ['to see', 'see', 'seeing', 'saw'], 2, 'look forward to + -ing.'),
    ('Remember ___ the plants while I’m away!', ['to water', 'water', 'watering', 'to watering'], 0, 'Не забудь сделать — remember to do.'),
    ('I’ll never forget ___ the Northern Lights.', ['to see', 'see', 'seeing', 'to seeing'], 2, 'Воспоминание о прошлом — forget doing.'),
    ('He left without ___ a word.', ['to say', 'say', 'saying', 'said'], 2, 'После предлога — -ing.'),
    ('You’d better ___ a coat.', ['to take', 'take', 'taking', 'took'], 1, 'had better + глагол без to.'),
    ('This film is worth ___.', ['to watch', 'watch', 'watching', 'to be watched'], 2, 'worth + -ing.'),
    ('The roof needs ___.', ['repair', 'to repair', 'repairing', 'repaired'], 2, 'Вещь нуждается: needs doing.'),
    ('He seems ___ his phone again.', ['to lose', 'to have lost', 'losing', 'having lost'], 1, 'Потерял раньше — to have done.'),
    ('I hate ___ when I’m working.', ['interrupting', 'to interrupt', 'being interrupted', 'interrupt'], 2, 'Меня прерывают — пассив: being interrupted.'),
]


def ftag(f, text=None):
    return '<span class="sv-v ig-%s">%s</span>' % (f, E(text or FORM_LABEL.get(f, 'to / -ing')))


def ex(x):
    if x.startswith('✗ '):
        return '<li class="sv-no"><s>%s</s></li>' % E(x[2:])
    if ' — ' in x:
        a, b = x.split(' — ', 1)
        return '<li>%s <span class="ig-gloss">— %s</span></li>' % (E(a), E(b))
    return '<li>%s</li>' % E(x)


def sec(n, sid, title, lead, body, anchors=()):
    spans = ''.join('<span id="%s"></span>' % a for a in anchors)
    return ('<section class="mv-sec" id="%s">%s<h2><span class="mv-num">%d</span>%s</h2><p class="mv-lead">%s</p>%s</section>\n'
            % (sid, spans, n, E(title), E(lead), body))


def lens():
    btns, panels = [], []
    for i, f in enumerate(FORMS):
        icon, word, focus, sub, pats, exs, note = LENS[f]
        btns.append('<button type="button" class="sv-lens ig-%s%s" data-v="%s" aria-pressed="%s">'
                    '<span class="sv-icon" aria-hidden="true">%s</span><span class="sv-word">%s</span>'
                    '<span class="sv-focus">%s</span></button>' % (f, ' on' if i == 0 else '', f, 'true' if i == 0 else 'false', E(icon), E(word), E(focus)))
        panels.append('<div class="sv-lp ig-%s" data-v="%s"%s><p class="sv-lp-h">%s <span>%s</span></p>'
                      '<div class="sv-pats">%s</div><ul class="sv-exs">%s</ul><p class="sv-lp-n">%s</p></div>' % (
                          f, f, '' if i == 0 else ' hidden', ftag(f), E(sub),
                          ''.join('<code>%s</code>' % p for p in pats), ''.join('<li>%s</li>' % x for x in exs), note))
    return '<div class="sv-lenses ig-lenses" role="group" aria-label="Три формы">%s</div><div class="sv-lpanels" aria-live="polite">%s</div>' % (''.join(btns), ''.join(panels))


def board():
    chips = ''.join('<button type="button" class="sv-slot%s" data-s="%d" aria-pressed="%s"><b>%s</b><small>%s</small></button>' % (
        ' on' if i == 0 else '', i, 'true' if i == 0 else 'false', E(label), E(hint)) for i, (label, hint, _, _, _) in enumerate(SLOTS))
    data = []
    for i, (label, hint, verdicts, note, anchor) in enumerate(SLOTS):
        lamps = ''.join('<div class="sv-lamp ig-%s sv-%s"><span class="sv-lamp-v">%s</span><span class="sv-lamp-s"></span><span class="sv-lamp-e">%s</span></div>' % (
            f, verdicts[f][0], FORM_LABEL[f], E(verdicts[f][1])) for f in FORMS)
        data.append('<div class="sv-sd" data-s="%d"%s><p class="sv-sd-h"><b>%s</b> + …</p><div class="sv-lamps ig-lamps">%s</div><p class="sv-sd-n">%s <a href="#%s">Подробнее →</a></p></div>' % (
            i, '' if i == 0 else ' hidden', E(label), lamps, note, anchor))
    legend = '<p class="sv-legend"><span class="sv-k sv-y">✓ подходит</span><span class="sv-k sv-p">✓ с условием</span><span class="sv-k sv-n">✗ нельзя</span></p>'
    return '<div class="sv-board"><div class="sv-slots" role="group" aria-label="Что стоит перед глаголом">%s</div><div class="sv-result" aria-live="polite">%s</div>%s</div>' % (chips, ''.join(data), legend)


def rows(items):
    out = []
    for f, title, sample, rid, exs, note in items:
        out.append('<details class="sv-row ig-%s" id="%s"><summary>%s<span class="sv-rt">%s<small>%s</small></span></summary>'
                   '<div class="sv-rb"><ul class="sv-exs">%s</ul>%s</div></details>' % (
                       f, rid, ftag(f), E(title), E(sample), ''.join(ex(x) for x in exs), ('<p class="sv-rn">%s</p>' % note) if note else ''))
    return '<div class="sv-rows">%s</div>' % ''.join(out)


def prep_formula():
    return ('<div class="ig-formula"><span class="ig-chip">предлог</span><span class="ig-plus">+</span>%s'
            '<p class="sv-f-n">Любой предлог: <i>in, on, at, of, for, about, with, without, before, after, by, instead of</i> — и <b>to</b>, если это предлог.</p></div>' % ftag('ing'))


def pairs():
    out = []
    for verb, to, ing, anchor in PAIRS:
        panels = []
        for key, (sense, sample, ru, order) in (('to', to), ('ing', ing)):
            panels.append('<div class="ig-pp ig-%s" data-k="%s"%s><p class="ig-sense">%s</p><p class="ig-sample">%s</p><p class="ig-ru">%s</p><p class="ig-order">%s</p></div>' % (
                key, key, '' if key == 'to' else ' hidden', E(sense), E(sample), E(ru), E(order)))
        out.append('<div class="ig-pair" id="%s"><div class="ig-ph"><b>%s</b><div class="ig-pbs" role="group" aria-label="%s + …">'
                   '<button type="button" class="ig-pb ig-to on" data-k="to" aria-pressed="true">+ to do</button>'
                   '<button type="button" class="ig-pb ig-ing" data-k="ing" aria-pressed="false">+ doing</button></div></div>%s</div>' % (
                       anchor, E(verb), E(verb), ''.join(panels)))
    return '<div class="ig-pairs" aria-live="polite">%s</div>' % ''.join(out)


def builder():
    axes = [
        ('when', 'Когда?', [('same', 'одновременно или позже'), ('before', 'раньше главного')]),
        ('voice', 'Кто действует?', [('act', 'сам (актив)'), ('pas', 'над ним (пассив)')]),
        ('cont', 'Процесс?', [('no', 'просто факт'), ('yes', 'в процессе')]),
    ]
    groups = ''.join('<div class="ig-axis" data-axis="%s"><span>%s</span>%s</div>' % (
        k, E(t), ''.join('<button type="button" class="ig-ax%s" data-val="%s" aria-pressed="%s">%s</button>' % (
            ' on' if j == 0 else '', v, 'true' if j == 0 else 'false', E(lbl)) for j, (v, lbl) in enumerate(opts))) for k, t, opts in axes)
    cells = ''.join('<div class="ig-fbr" data-key="%s-%s-%s"%s><div class="ig-fbc ig-to"><small>инфинитив</small><b>%s</b><i>%s</i></div><div class="ig-fbc ig-ing"><small>-ing</small><b>%s</b><i>%s</i></div></div>' % (
        w, v, c, '' if (w, v, c) == ('same', 'act', 'no') else ' hidden', E(a), E(ea), E(b), E(eb)) for (w, v, c), (a, b, ea, eb) in FORM_TABLE.items())
    table = ('<table class="ig-ftable"><thead><tr><th></th><th>Актив</th><th>Пассив</th></tr></thead><tbody>'
             '<tr><th>Инфинитив</th><td>to do<br>to be doing<br>to have done<br>to have been doing</td><td>to be done<br><br>to have been done</td></tr>'
             '<tr><th>-ing</th><td>doing<br><br>having done</td><td>being done<br><br>having been done</td></tr></tbody></table>')
    return '<div class="ig-builder">%s<div class="ig-fbout" aria-live="polite">%s</div></div><details class="ig-more"><summary>Все формы одной таблицей</summary>%s</details>' % (groups, cells, table)


def finder():
    kinds = [('all', 'Все'), ('to', 'to do'), ('ing', 'doing'), ('bare', 'do'), ('both', 'оба')]
    pills = '<div class="sv-filter ig-filter" role="group" aria-label="Какая форма">%s</div>' % ''.join(
        '<button type="button" class="ig-%s" data-f="%s" aria-pressed="%s">%s</button>' % (k if k != 'all' else 'all', k, 'true' if k == 'all' else 'false', E(t)) for k, t in kinds)
    search = '<label class="ig-search"><span>Найти слово</span><input type="search" placeholder="например, avoid" autocomplete="off" spellcheck="false"></label>'
    items = ''.join('<details class="sv-ph ig-%s" data-v="%s" data-w="%s"><summary><b>%s</b><span>%s</span></summary><p>%s</p></details>' % (
        f, f, E(w.lower()), E(w), FORM_LABEL.get(f, 'to / -ing'), E(x)) for f, w, x in FINDER)
    return pills + search + '<div class="sv-phs ig-finds" id="ig-list">%s</div><p class="ig-none" hidden>Такого слова в списке нет. Проверьте его в словаре: Oxford и Cambridge показывают схему [+ to infinitive] или [+ -ing].</p>' % items


def traps():
    return '<div class="sv-traps">%s</div>' % ''.join(
        '<button type="button" class="sv-trap" aria-expanded="false"><span class="sv-tr-bad">%s</span><span class="sv-tr-good">%s</span><small>%s</small></button>' % (
            E(b), E(g), E(n)) for b, g, n in TRAPS)


def quiz():
    out = []
    for q, opts, ok, why in QUIZ:
        b = ''.join('<button type="button" class="ig-q%d"%s>%s</button>' % (i, ' data-ok="1"' if i == ok else '', E(o)) for i, o in enumerate(opts))
        out.append('<div class="sv-q"><p class="sv-qs">%s</p><div class="sv-opts ig-opts">%s</div><p class="sv-why" hidden>%s</p></div>' % (
            E(q).replace('___', '<span class="sv-gap">___</span>'), b, E(why)))
    return '<div class="sv-quiz">%s</div>' % ''.join(out)


def build_html():
    P = ['<div class="mv sv ig" id="ig-root" lang="ru">\n']
    P.append('''<header class="mv-hero sv-hero" id="ig-map">
  <h1>to do · do · doing</h1>
  <p>Инфинитив и герундий. Какую форму взять, решает слово перед глаголом, а иногда смысл. Нажмите на форму.</p>
</header>
''')
    P.append(lens())
    P.append('<p class="sv-motto"><span class="ig-to">Впереди — to do.</span><span class="ig-ing">После предлога — doing.</span><span class="ig-bare">После can, make, let — do.</span><span class="ig-both">stop, try, remember — смотри на смысл.</span></p>\n')
    P.append('''<nav class="mv-nav" aria-label="Разделы правила">
  <a href="#ig-after">1 Что перед</a><a href="#ig-verb-to">2 + to do</a><a href="#ig-verb-ing">3 + doing</a><a href="#ig-prep">4 Предлог</a><a href="#ig-bare">5 Без to</a><a href="#ig-meaning">6 Смысл</a><a href="#ig-object">7 + sb</a><a href="#ig-adj">8 Прилаг. и цель</a><a href="#ig-forms">9 Формы</a><a href="#ig-finder">10 Список</a><a href="#ig-traps">11 Ловушки</a><a href="#ig-check">12 Проверка</a>
</nav>
''')
    P.append(sec(1, 'ig-after', 'Что стоит перед глаголом?', 'Выберите слово и посмотрите, какая форма подходит после него.', board()))
    P.append(sec(2, 'ig-verb-to', 'Глагол + to do', 'Чаще всего — действие впереди: хочу, решил, обещаю, удалось.', rows(VERB_TO)))
    P.append(sec(3, 'ig-verb-ing', 'Глагол + doing', 'Действие как занятие: нравится, избегаю, закончил, предлагаю.', rows(VERB_ING)))
    P.append(sec(4, 'ig-prep', 'Предлог + doing', 'Самое надёжное правило темы: после предлога — только -ing.', prep_formula() + rows(PREP)))
    P.append(sec(5, 'ig-bare', 'Инфинитив без to', 'Короткий закрытый список. Всё остальное — с to.', rows(BARE)))
    P.append(sec(6, 'ig-meaning', 'Обе формы, но смысл разный', 'Переключайте to do и doing и сравнивайте.', pairs() + rows(SAME)))
    P.append(sec(7, 'ig-object', 'Глагол + sb + …', 'Когда после глагола появляется человек, схема часто меняется.', rows(OBJECT)))
    P.append(sec(8, 'ig-adj', 'Прилагательные, существительные, цель', 'После прилагательного и существительного обычно to do.', rows(ADJ)))
    P.append(sec(9, 'ig-forms', 'Формы: раньше, в процессе, пассив', 'Выберите время, залог и процесс — конструктор покажет форму.', builder() + rows(FORM_ROWS)))
    P.append(sec(10, 'ig-finder', 'Список: какой глагол что любит', 'Отфильтруйте по форме или найдите слово.', finder()))
    P.append(sec(11, 'ig-traps', 'Ловушки', 'Нажмите на карточку, чтобы увидеть, как правильно.', traps()))
    P.append(sec(12, 'ig-check', 'Проверьте себя', 'Двенадцать коротких вопросов.', quiz()))
    P.append('</div>')
    return ''.join(P)


ANCHORS = ['ig-map', 'ig-after', 'ig-verb-to', 'ig-verb-ing', 'ig-prep', 'ig-bare', 'ig-meaning', 'ig-object', 'ig-adj', 'ig-forms', 'ig-finder', 'ig-traps', 'ig-check'] + \
    [r[3] for r in VERB_TO + VERB_ING + PREP + BARE + SAME + OBJECT + ADJ + FORM_ROWS] + [p[3] for p in PAIRS]

if __name__ == '__main__':
    print(build_html())
