#!/usr/bin/env python3
"""Источник страницы правила Say · Tell · Speak · Talk.

Подача своя (не таблицы): четыре «линзы», переключатель «Что стоит после глагола?»,
шкала speak ↔ talk, фильтр выражений, карточки-ловушки и мини-тест.
Токены цвета и шрифта берутся из .mv (modal-verbs.css), всё остальное живёт под .sv.
"""
from html import escape as E

# цвет каждого глагола: say — синий, tell — фиолетовый, speak — бирюзовый, talk — янтарный
VERBS = ['say', 'tell', 'speak', 'talk']

LENS = {
    'say': ('“ ”', 'Слова', 'Что именно сказано',
            ['say <b>sth</b>', 'say <b>(that)</b> …', 'say sth <b>to sb</b>', 'say <b>“…”</b>'],
            ['He said nothing <b>to me</b>.', 'She said (that) she’d be late.', '“I’m ready,” he said.'],
            'Человек после say — только через <b>to</b>: <span class="mv-ok">say to me</span>, <span class="mv-x">say me</span>.'),
    'tell': ('→ ☺', 'Слушатель', 'Кому сообщили',
             ['tell <b>sb</b> sth', 'tell <b>sb</b> (that) …', 'tell <b>sb</b> about sth', 'tell <b>sb</b> to do'],
             ['She told <b>me</b> the news.', 'He told <b>me</b> to wait.', 'Tell <b>me</b> about your trip.'],
             'Человек стоит сразу после tell, без предлога: <span class="mv-ok">tell me</span>, <span class="mv-x">tell to me</span>.'),
    'speak': ('))) ', 'Голос и язык', 'Сам акт речи, манера, умение',
              ['speak <b>(to sb)</b> <b>(about sth)</b>', 'speak <b>+ язык</b>', 'speak <b>+ как?</b>', 'speak <b>at</b> a meeting'],
              ['Do you speak Chinese?', 'He was too shocked to speak.', 'Can I speak to Tom, please?'],
              'Чаще в одну сторону и официальнее: выступление, звонок, серьёзный разговор.'),
    'talk': ('⇄', 'Разговор', 'Обмен репликами, неформально',
             ['talk <b>(to / with sb)</b>', 'talk <b>about</b> sth', 'talk <b>+ тема</b>', 'talk sb <b>into</b> …'],
             ['We talked for hours.', 'They talked about work.', 'Stop talking!'],
             'Двое и больше, живая беседа. Языком не «владеют» через talk: <span class="mv-x">talk English</span>.'),
}

# Переключатель: что стоит после глагола. Состояние: y — да, p — да, но с условием, n — нет.
SLOTS = [
    ('me / Anna', 'Человек сразу после глагола', {
        'say': ('n', 'He said me… → said to me'),
        'tell': ('y', 'She told me everything.'),
        'speak': ('n', 'speak to me'),
        'talk': ('n', 'talk to me'),
    }, 'Без предлога человек стоит только после <b>tell</b>.'),
    ('to me', 'Человек через to', {
        'say': ('y', 'What did he say to you?'),
        'tell': ('n', 'He told to me… → told me'),
        'speak': ('y', 'I’ll speak to the manager.'),
        'talk': ('y', 'Who were you talking to?'),
    }, 'С <b>to</b> работают say, speak и talk. У tell предлога нет.'),
    ('“Hello!”', 'Прямая речь', {
        'say': ('y', '“Hello!” she said.'),
        'tell': ('n', 'He told, “Hello.” → said'),
        'speak': ('n', ''),
        'talk': ('n', ''),
    }, 'Реплику в кавычках вводит <b>say</b>. После приказа бывает и tell с человеком: <i>“Wait here,” he told me.</i>'),
    ('that …', 'Пересказ: что сказали', {
        'say': ('y', 'He said (that) he was tired.'),
        'tell': ('p', 'He told me (that) he was tired.'),
        'speak': ('n', ''),
        'talk': ('n', ''),
    }, 'say that — без человека, <b>tell sb that</b> — с человеком.'),
    ('to do', 'Просьба, приказ', {
        'say': ('n', 'She said me to wait. → told me'),
        'tell': ('p', 'She told me to wait.'),
        'speak': ('n', ''),
        'talk': ('n', ''),
    }, 'Приказ и просьба: <b>tell sb (not) to do</b>.'),
    ('English', 'Язык', {
        'say': ('n', 'Но: say it in English'),
        'tell': ('n', ''),
        'speak': ('y', 'She speaks three languages.'),
        'talk': ('n', 'talk English → speak'),
    }, 'Владеть языком — только <b>speak</b>. <i>Say it in English</i> — это про слова, а не про язык.'),
    ('about the trip', 'О чём речь', {
        'say': ('n', 'He said about… → talked about'),
        'tell': ('p', 'Tell me about the trip.'),
        'speak': ('y', 'He spoke about climate change.'),
        'talk': ('y', 'We talked about the trip.'),
    }, '«Сказал о…» — не <span class="mv-x">said about</span>: talked / spoke about, told sb about, mentioned.'),
    ('the truth · a lie', 'Правда, ложь, история, шутка', {
        'say': ('n', 'say the truth → tell'),
        'tell': ('y', 'Always tell the truth.'),
        'speak': ('p', 'speak the truth — книжно'),
        'talk': ('n', ''),
    }, 'truth, lie, story, joke, secret — с <b>tell</b>, человек не нужен.'),
    ('a word · yes · sorry', 'Отдельные слова', {
        'say': ('y', 'He didn’t say a word.'),
        'tell': ('n', ''),
        'speak': ('n', ''),
        'talk': ('n', ''),
    }, 'say a word, yes / no, hello, sorry, thank you, a prayer.'),
    ('politics · shop', 'Тема без предлога', {
        'say': ('n', ''),
        'tell': ('n', ''),
        'speak': ('n', ''),
        'talk': ('y', 'They were talking football.'),
    }, 'talk politics, business, football, <b>shop</b> (о работе).'),
    ('sense · nonsense', 'Дело или чушь', {
        'say': ('n', ''),
        'tell': ('n', ''),
        'speak': ('n', 'speaking nonsense → talking'),
        'talk': ('y', 'Don’t talk nonsense!'),
    }, 'talk sense — говорить дело, talk nonsense — нести чушь.'),
    ('slowly · loudly', 'Как говорят', {
        'say': ('n', ''),
        'tell': ('n', ''),
        'speak': ('y', 'Please speak more slowly.'),
        'talk': ('y', 'He talks too fast.'),
    }, 'Манера: speak и talk. В просьбах к собеседнику чаще speak.'),
    ('with my boss', 'Вдвоём, с кем-то', {
        'say': ('n', ''),
        'tell': ('n', ''),
        'speak': ('y', 'I spoke with her yesterday.'),
        'talk': ('y', 'I need to talk with my boss.'),
    }, 'speak / talk <b>with</b> sb. В британском чаще to, в американском обе формы.'),
]

SAY_TELL = [
    ('say', 'Пересказ', 'said (that) · told sb (that)', 'sv-reported',
     ['He said (that) he was busy.', 'He told me (that) he was busy.', 'He said to me that he was busy.', '✗ He said me that he was busy.'],
     'Слушателя можно не называть — тогда say. Назвали — tell sb или say to sb.'),
    ('tell', 'Просьбы и приказы', 'tell sb (not) to do', 'sv-orders',
     ['Tom’s mum told him to clean his room.', 'He told me not to make a noise.', '✗ She said me to wait.'],
     'В разговоре встречается <i>She said to wait</i>, но с человеком — только tell.'),
    ('say', 'Прямая речь', 'say, “…”', 'sv-direct',
     ['He said, “I’ll come on Friday.”', '“I’ll come on Friday,” he said.', '✗ He told, “Good morning.”'],
     ''),
    ('tell', 'Без слушателя', 'tell the truth, a lie, a story…', 'sv-tell-fixed',
     ['tell the truth', 'tell a lie / lies', 'tell a story / a joke', 'tell a secret', 'tell the time', 'tell sb’s fortune'],
     'Короткий закрытый список: с этими словами tell обходится без человека.'),
    ('tell', 'Различать, понимать', 'tell A from B · tell apart · can tell', 'sv-tell-distinguish',
     ['I can’t tell them apart.', 'He can’t tell a good book from a bad one.', 'Can you tell the difference?', 'I could tell she was upset.'],
     ''),
    ('say', 'Готовые слова', 'say yes, sorry, hello…', 'sv-say-objects',
     ['say a word / nothing', 'say yes / no', 'say hello / goodbye', 'say sorry / thank you', 'say a prayer', 'Say hello to Jo for me.'],
     ''),
    ('say', 'Когда «говорит» вещь', 'the sign says · my watch says', 'sv-things-say',
     ['The sign says “No parking”.', 'My watch says ten thirty.', 'The rules say we need a majority.', 'It says on the box that…'],
     'Текст, табличка, правило, часы «говорят» через says. Но <b>tell the time</b> — уметь определять время по часам.'),
    ('say', 'Слухи', 'they say · it is said · sb is said to', 'sv-hearsay',
     ['They say laughter is the best medicine.', 'It is said that he was a spy.', 'She is said to be very talented.'],
     ''),
]

SPEAK_TALK = [
    ('speak', 'Язык и способность', 'speak English · learn to speak', 'sv-speak-ability',
     ['Do you speak Chinese?', 'The baby is learning to speak.', 'He was too shocked to speak.', '✗ He talks three languages.'],
     'Исключение: <i>Can your baby talk yet?</i>, <i>Can the parrot talk?</i> — первые слова и попугай.'),
    ('speak', 'Телефон', 'Can I speak to…? — Speaking.', 'sv-phone',
     ['Can I speak to Tom, please? — Speaking.', 'Who’s speaking? — This is Mark.'],
     '«Speaking» = «это я».'),
    ('speak', 'Выступление', 'speak at / to an audience', 'sv-speak-public',
     ['I have to speak at the meeting.', 'She spoke to an audience of 2,000.'],
     ''),
    ('talk', 'Тема без предлога', 'talk politics · talk shop', 'sv-talk-topic',
     ['The boys talked football.', 'Dad and his colleagues were talking shop.', 'He always wants to talk politics.'],
     ''),
    ('talk', 'Болтать и сплетничать', 'Stop talking · People will talk', 'sv-talk-chat',
     ['Everybody stopped talking.', 'You can’t stay here — the neighbours will talk.', 'peace talks — переговоры'],
     ''),
    ('talk', 'Дело и чушь', 'talk sense · talk nonsense', 'sv-talk-sense',
     ['He always talks sense.', 'Don’t listen — he’s talking nonsense.', '✗ He is speaking nonsense.', 'talk through one’s hat — говорить о том, чего не знаешь'],
     ''),
]

PHRASES = [
    # verb, expression, translation, example, anchor
    ('say', 'it goes without saying', 'само собой разумеется', 'It goes without saying that we’ll help.'),
    ('say', 'needless to say', 'излишне говорить', 'Needless to say, we missed the train.'),
    ('say', 'to say the least', 'мягко говоря', 'The flight was uncomfortable, to say the least.'),
    ('say', 'to say nothing of', 'не говоря уже о', 'It’s bad for the soil, to say nothing of wildlife.'),
    ('say', 'let’s say', 'скажем, допустим', 'Let’s meet at, let’s say, 10.45.'),
    ('say', 'that is to say', 'то есть', 'Next week — that is to say, on Monday.'),
    ('say', 'having said that', 'и всё же', 'It’s expensive. Having said that, it’s worth it.'),
    ('say', 'you can say that again', 'не то слово', '“It’s cold!” — “You can say that again.”'),
    ('tell', 'tell sb off', 'отругать', 'She told me off for being late.'),
    ('tell', 'tell on sb / sth', 'наябедничать; сказываться', 'The long trips are telling on his health.'),
    ('tell', 'to tell (you) the truth', 'по правде говоря', 'To tell the truth, I’ve never been there.'),
    ('tell', 'I told you so', 'я же говорил', 'You missed the bus? I told you so.'),
    ('speak', 'speak up', 'говорить громче', 'Speak up! I can’t hear you.'),
    ('speak', 'speak up for sb / sth', 'вступаться за', 'Nobody spoke up for her.'),
    ('speak', 'speak out (against)', 'открыто выступать (против)', 'Few dared to speak out against the war.'),
    ('speak', 'speak for sb', 'говорить от имени', 'I speak for the whole team.'),
    ('speak', 'speak one’s mind', 'говорить прямо, что думаешь', 'She always speaks her mind.'),
    ('speak', 'speak highly / ill of', 'хорошо / дурно отзываться', 'Everyone speaks highly of him.'),
    ('speak', 'speak volumes', 'говорить красноречивее слов', 'His silence speaks volumes.'),
    ('speak', 'speak for itself', 'говорить само за себя', 'Her success speaks for itself.'),
    ('speak', 'so to speak', 'так сказать', 'He’s our captain, so to speak.'),
    ('speak', 'frankly / generally speaking', 'откровенно / вообще говоря', 'Frankly speaking, I’m tired.'),
    ('speak', 'speaking of …', 'кстати о…', 'Speaking of money, did you pay the bill?'),
    ('talk', 'talk sb into (doing) sth', 'уговорить', 'I talked her into coming.'),
    ('talk', 'talk sb out of (doing) sth', 'отговорить', 'They talked me out of quitting.'),
    ('talk', 'talk sb round', 'переубедить', 'You’ll talk her round.'),
    ('talk', 'talk sth over / through', 'обсудить, разобрать', 'Let’s talk the plan through.'),
    ('talk', 'talk sth out', 'обсудить и уладить', 'Sit down and talk it out.'),
    ('talk', 'talk sb through sth', 'объяснить по шагам', 'He talked me through the setup.'),
    ('talk', 'talk back (to sb)', 'дерзить', 'Don’t talk back to your mother.'),
    ('talk', 'talk down to sb', 'говорить свысока', 'Don’t talk down to your students.'),
]

TRAPS = [
    ('He said me the news.', 'He told me the news.', 'Человек без предлога — только после tell.'),
    ('He told to me the news.', 'He told me the news.', 'У tell нет предлога.'),
    ('She said me to wait.', 'She told me to wait.', 'Просьба, приказ: tell sb to do.'),
    ('He told, “Good morning.”', 'He said, “Good morning.”', 'Прямую речь вводит say.'),
    ('Tell about your day.', 'Tell me about your day.', 'tell почти всегда требует человека.'),
    ('He said about the problem.', 'He talked about the problem.', 'Или: mentioned the problem, told us about it.'),
    ('To say the truth, …', 'To tell the truth, …', 'truth — с tell.'),
    ('Do you talk English?', 'Do you speak English?', 'Язык — speak.'),
    ('He talks three languages.', 'He speaks three languages.', 'Владение языком — speak.'),
    ('He is speaking nonsense.', 'He is talking nonsense.', 'nonsense, sense, politics, shop — talk.'),
    ('Speak up your mind.', 'Speak your mind.', 'speak up — громче; speak one’s mind — прямо.'),
    ('My watch tells ten thirty.', 'My watch says ten thirty.', 'Вещи «говорят» через says.'),
]

QUIZ = [
    ('She ___ me the whole story.', ['said', 'told', 'spoke', 'talked'], 1, 'Человек + история: tell sb a story.'),
    ('“I’m exhausted,” he ___.', ['said', 'told', 'spoke', 'talked'], 0, 'Прямая речь — say.'),
    ('How many languages do you ___?', ['say', 'tell', 'speak', 'talk'], 2, 'Язык — speak.'),
    ('Dad and his friends were ___ football again.', ['saying', 'telling', 'speaking', 'talking'], 3, 'Тема без предлога: talk football.'),
    ('My watch ___ it’s half past six.', ['says', 'tells', 'speaks', 'talks'], 0, 'Часы и таблички — says.'),
    ('Don’t ___ lies to me!', ['say', 'tell', 'speak', 'talk'], 1, 'tell a lie / lies.'),
    ('What did he ___ to you?', ['say', 'tell', 'speak', 'talk'], 0, 'Что сказал + to sb — say.'),
    ('Could you ___ up? I can’t hear you.', ['say', 'tell', 'speak', 'talk'], 2, 'speak up — говорить громче.'),
    ('They ___ me into buying a new phone.', ['said', 'told', 'spoke', 'talked'], 3, 'talk sb into — уговорить.'),
    ('The twins look so alike I can’t ___ them apart.', ['say', 'tell', 'speak', 'talk'], 1, 'tell apart — различать.'),
]


def vtag(v, text=None):
    return '<span class="sv-v sv-%s">%s</span>' % (v, E(text or v))


def ex(x):
    if x.startswith('✗ '):
        return '<li class="sv-no"><s>%s</s></li>' % E(x[2:])
    return '<li>%s</li>' % E(x)


def sec(n, sid, title, lead, body, anchors=()):
    spans = ''.join('<span id="%s"></span>' % a for a in anchors)
    return ('<section class="mv-sec" id="%s">%s<h2><span class="mv-num">%d</span>%s</h2><p class="mv-lead">%s</p>%s</section>\n'
            % (sid, spans, n, E(title), E(lead), body))


def lens():
    btns, panels = [], []
    for i, v in enumerate(VERBS):
        icon, focus, sub, pats, exs, note = LENS[v]
        btns.append('<button type="button" class="sv-lens sv-%s%s" data-v="%s" aria-pressed="%s">'
                    '<span class="sv-icon" aria-hidden="true">%s</span><span class="sv-word">%s</span>'
                    '<span class="sv-focus">%s</span></button>' % (v, ' on' if i == 0 else '', v, 'true' if i == 0 else 'false', E(icon), v, E(focus)))
        panels.append('<div class="sv-lp sv-%s" data-v="%s"%s><p class="sv-lp-h">%s <span>%s</span></p>'
                      '<div class="sv-pats">%s</div><ul class="sv-exs">%s</ul><p class="sv-lp-n">%s</p></div>' % (
                          v, v, '' if i == 0 else ' hidden', vtag(v), E(sub),
                          ''.join('<code>%s</code>' % p for p in pats),
                          ''.join('<li>%s</li>' % x for x in exs), note))
    return '<div class="sv-lenses" role="group" aria-label="Четыре глагола">%s</div><div class="sv-lpanels" aria-live="polite">%s</div>' % (''.join(btns), ''.join(panels))


def board():
    chips = ''.join('<button type="button" class="sv-slot%s" data-s="%d" aria-pressed="%s"><b>%s</b><small>%s</small></button>' % (
        ' on' if i == 0 else '', i, 'true' if i == 0 else 'false', E(label), E(hint)) for i, (label, hint, _, _) in enumerate(SLOTS))
    data = []
    for i, (label, hint, verdicts, note) in enumerate(SLOTS):
        lamps = ''.join('<div class="sv-lamp sv-%s sv-%s"><span class="sv-lamp-v">%s</span><span class="sv-lamp-s"></span><span class="sv-lamp-e">%s</span></div>' % (
            v, verdicts[v][0], v, E(verdicts[v][1])) for v in VERBS)
        data.append('<div class="sv-sd" data-s="%d"%s><p class="sv-sd-h">… + <b>%s</b></p><div class="sv-lamps">%s</div><p class="sv-sd-n">%s</p></div>' % (
            i, '' if i == 0 else ' hidden', E(label), lamps, note))
    legend = '<p class="sv-legend"><span class="sv-k sv-y">✓ подходит</span><span class="sv-k sv-p">✓ с условием</span><span class="sv-k sv-n">✗ нельзя</span></p>'
    return '<div class="sv-board"><div class="sv-slots" role="group" aria-label="Что стоит после глагола">%s</div><div class="sv-result" aria-live="polite">%s</div>%s</div>' % (chips, ''.join(data), legend)


def rows(items):
    out = []
    for v, title, sample, rid, exs, note in items:
        out.append('<details class="sv-row sv-%s" id="%s"><summary>%s<span class="sv-rt">%s<small>%s</small></span></summary>'
                   '<div class="sv-rb"><ul class="sv-exs">%s</ul>%s</div></details>' % (
                       v, rid, vtag(v), E(title), E(sample), ''.join(ex(x) for x in exs), ('<p class="sv-rn">%s</p>' % note) if note else ''))
    return '<div class="sv-rows">%s</div>' % ''.join(out)


def formula():
    return ('<div class="sv-formula">'
            '<div class="sv-f sv-say"><span class="sv-f-v">say</span><span class="sv-f-s sv-f-main">что</span><span class="sv-f-s sv-f-opt">to кому</span></div>'
            '<div class="sv-f sv-tell"><span class="sv-f-v">tell</span><span class="sv-f-s sv-f-main">кому</span><span class="sv-f-s sv-f-opt">что</span></div>'
            '<p class="sv-f-n">В центре say — <b>слова</b>, в центре tell — <b>человек</b>.</p></div>')


def scale():
    left = ['speak at a conference', 'speak to an audience', 'I need to speak to you.', 'Can I speak to Tom?']
    right = ['talk to a friend', 'We talked for hours.', 'Stop talking!', 'talk shop']
    return ('<div class="sv-scale"><div class="sv-scale-bar"><span class="sv-speak">speak</span><i></i><span class="sv-talk">talk</span></div>'
            '<div class="sv-scale-ends"><div><b>Один говорит, официально</b><ul>%s</ul></div><div><b>Разговор, по-дружески</b><ul>%s</ul></div></div>'
            '<p class="sv-f-n">Часто подходят оба: <i>I spoke / talked to her yesterday.</i> Разница в тоне, а не в правильности.</p></div>' % (
                ''.join('<li>%s</li>' % E(x) for x in left), ''.join('<li>%s</li>' % E(x) for x in right)))


def phrases():
    pills = '<div class="sv-filter" role="group" aria-label="Фильтр по глаголу"><button type="button" data-f="all" aria-pressed="true">Все</button>%s</div>' % ''.join(
        '<button type="button" class="sv-%s" data-f="%s" aria-pressed="false">%s</button>' % (v, v, v) for v in VERBS)
    items = ''.join('<details class="sv-ph sv-%s" data-v="%s"><summary><b>%s</b><span>%s</span></summary><p>%s</p></details>' % (
        v, v, E(e), E(t), E(x)) for v, e, t, x in PHRASES)
    return pills + '<div class="sv-phs" id="sv-phrasal">%s</div>' % items


def traps():
    return '<div class="sv-traps">%s</div>' % ''.join(
        '<button type="button" class="sv-trap" aria-expanded="false"><span class="sv-tr-bad">%s</span><span class="sv-tr-good">%s</span><small>%s</small></button>' % (
            E(b), E(g), E(n)) for b, g, n in TRAPS)


def quiz():
    out = []
    for q, opts, ok, why in QUIZ:
        b = ''.join('<button type="button" class="sv-%s"%s>%s</button>' % (VERBS[i], ' data-ok="1"' if i == ok else '', E(o)) for i, o in enumerate(opts))
        out.append('<div class="sv-q"><p class="sv-qs">%s</p><div class="sv-opts">%s</div><p class="sv-why" hidden>%s</p></div>' % (
            E(q).replace('___', '<span class="sv-gap">___</span>'), b, E(why)))
    return '<div class="sv-quiz">%s</div>' % ''.join(out)


def build_html():
    P = ['<div class="mv sv" id="sv-root" lang="ru">\n']
    P.append('''<header class="mv-hero sv-hero" id="sv-map">
  <h1>Say · Tell · Speak · Talk</h1>
  <p>Четыре глагола «говорить». Каждый смотрит на своё: на слова, на слушателя, на голос или на разговор. Нажмите на глагол.</p>
</header>
''')
    P.append(lens())
    P.append('<p class="sv-motto"><span class="sv-say">Say words.</span><span class="sv-tell">Tell people.</span><span class="sv-speak">Speak a language.</span><span class="sv-talk">Talk to a friend.</span></p>\n')
    P.append('''<nav class="mv-nav" aria-label="Разделы правила">
  <a href="#sv-after">1 Что после</a><a href="#sv-say-tell">2 Say / tell</a><a href="#sv-speak-talk">3 Speak / talk</a><a href="#sv-phrases">4 Выражения</a><a href="#sv-traps">5 Ловушки</a><a href="#sv-check">6 Проверка</a>
</nav>
''')
    P.append(sec(1, 'sv-after', 'Что стоит после глагола?', 'Выберите, что идёт дальше, и посмотрите, какие глаголы подходят.', board()))
    P.append(sec(2, 'sv-say-tell', 'Say или tell', 'Главная пара. Решает, кого или что ставим в центр.',
                 formula() + rows(SAY_TELL), anchors=('sv-say', 'sv-tell')))
    P.append(sec(3, 'sv-speak-talk', 'Speak или talk', 'Оба — «разговаривать». Разница в тоне и в том, сколько людей говорит.',
                 scale() + rows(SPEAK_TALK), anchors=('sv-speak', 'sv-talk')))
    P.append(sec(4, 'sv-phrases', 'Выражения и фразовые глаголы', 'Выберите глагол. Нажмите на выражение, чтобы увидеть пример.', phrases()))
    P.append(sec(5, 'sv-traps', 'Ловушки', 'Нажмите на карточку, чтобы увидеть, как правильно.', traps()))
    P.append(sec(6, 'sv-check', 'Проверьте себя', 'Десять коротких вопросов.', quiz()))
    P.append('</div>')
    return ''.join(P)


if __name__ == '__main__':
    print(build_html())
