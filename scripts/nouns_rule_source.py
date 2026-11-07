#!/usr/bin/env python3
"""Источник страницы правила Nouns: без широких таблиц, только аккордеоны и плитки (удобно на телефоне)."""
from html import escape as E

T = {'s': 'ab', 'es': 'ad', 'ies': 'of', 'ves': 'pr', 'zz': 'du', 'sp': 'pe'}


def tag(kind, text):
    return '<span class="mv-tag mv-t-%s">%s</span>' % (T.get(kind, kind), E(text))


def chip(x):
    if ' → ' in x:
        a, b = x.split(' → ', 1)
        return '<span class="nr-ch">%s → <b>%s</b></span>' % (E(a), E(b))
    if x.startswith('✗ '):
        return '<span class="nr-ch nr-bad"><s>%s</s></span>' % E(x[2:])
    if x.startswith('✓ '):
        return '<span class="nr-ch nr-good">%s</span>' % E(x[2:])
    return '<span class="nr-ch">%s</span>' % E(x)


def chips(items):
    return '<div class="nr-chips">%s</div>' % ''.join(chip(x) for x in items)


def note(text, warn=False):
    return '<div class="mv-note%s">%s</div>' % (' mv-warn' if warn else '', text)


def row(kind, label, title, sample, items=(), text='', rid=None, extra=''):
    head = '<summary><span class="nr-tg">%s</span><span class="nr-t">%s%s</span></summary>' % (
        tag(kind, label) if label else '', E(title), ('<small>%s</small>' % E(sample)) if sample else '')
    body = '<div class="nr-rb">%s%s%s</div>' % (chips(items) if items else '', ('<p>%s</p>' % text) if text else '', extra)
    return '<details class="nr-row"%s>%s%s</details>' % ((' id="%s"' % rid) if rid else '', head, body)


def rows(*r):
    return '<div class="nr-rows">%s</div>' % ''.join(r)


def tiles(items, first=0):
    """items: (kind, label, title, [chips], note_text)"""
    grid, panels = [], []
    for i, (kind, label, title, ex, nt) in enumerate(items):
        grid.append('<button type="button" class="nr-tile%s" data-i="%d"><span class="nr-tg">%s</span><span class="nr-te">%s</span></button>' % (
            ' on' if i == first else '', i, tag(kind, label), E(title)))
        panels.append('<div class="nr-tp" data-i="%d" hidden><p class="nr-ptitle">%s %s</p>%s%s</div>' % (
            i, E(title), tag(kind, label), chips(ex) if ex else '', ('<p class="nr-pn">%s</p>' % nt) if nt else ''))
    return '<div class="nr-tiles"><div class="nr-grid">%s</div><div class="nr-panel" aria-live="polite"></div><div class="nr-tps" hidden>%s</div></div>' % (''.join(grid), ''.join(panels))


def cases(pairs):
    return '<ul class="nr-cases">%s</ul>' % ''.join('<li><b>%s</b><span>%s</span></li>' % (E(a), E(b)) for a, b in pairs)


def tiles_cases(items, first=0):
    """items: (kind, label, title, [(situation, example)], note)"""
    grid, panels = [], []
    for i, (kind, label, title, cs, nt) in enumerate(items):
        grid.append('<button type="button" class="nr-tile%s" data-i="%d"><span class="nr-tg">%s</span><span class="nr-te">%s</span></button>' % (
            ' on' if i == first else '', i, tag(kind, label), E(title)))
        panels.append('<div class="nr-tp" data-i="%d" hidden><p class="nr-ptitle">%s %s</p>%s%s</div>' % (
            i, E(title), tag(kind, label), cases(cs), ('<p class="nr-pn">%s</p>' % nt) if nt else ''))
    return '<div class="nr-tiles"><div class="nr-grid">%s</div><div class="nr-panel" aria-live="polite"></div><div class="nr-tps" hidden>%s</div></div>' % (''.join(grid), ''.join(panels))


def more(summary, body, rid=None, open_=False):
    return '<details class="nr-more"%s%s><summary>%s</summary>%s</details>' % (
        (' id="%s"' % rid) if rid else '', ' open' if open_ else '', E(summary), body)


def quiz(title, qs):
    out = []
    for q, opts, ok in qs:
        b = ''.join('<button type="button"%s>%s</button>' % (' data-ok="1"' if i == ok else '', E(o)) for i, o in enumerate(opts))
        out.append('<div class="nr-q"><span class="nr-qs">%s</span><div class="nr-opts">%s</div></div>' % (E(q), b))
    return '<h3 class="nr-h3">%s</h3><div class="nr-quiz">%s</div>' % (E(title), ''.join(out))


def sec(n, anchors, title, lead, body, summary=''):
    spans = ''.join('<span id="%s"></span>' % a for a in anchors)
    return ('<section class="mv-sec" id="nr-%d">%s<h2><span class="mv-num">%d</span>%s</h2><p class="mv-lead">%s</p>%s%s</section>\n'
            % (n, spans, n, E(title), E(lead), ('<div class="nr-sum">%s</div>' % summary) if summary else '', body))


def h3(title, hid=None, anchors=()):
    spans = ''.join('<span id="%s"></span>' % a for a in anchors)
    return '<h3 class="nr-h3"%s>%s%s</h3>' % ((' id="%s"' % hid) if hid else '', spans, E(title))


def two(word, u, c, extra=''):
    return row('sp', '', word, '', [], '', extra=('<p class="nr-two"><span class="mv-tag mv-t-ad">Uncountable</span> %s</p><p class="nr-two"><span class="mv-tag mv-t-ab">Countable</span> %s</p>' % (u, c)) + extra).replace(
        '<span class="nr-t">%s</span>' % E(word), '<span class="nr-t">%s</span>' % E(word))


def twosum(word, short, u, c):
    r = two(word, u, c)
    return r.replace('<span class="nr-t">%s</span>' % E(word), '<span class="nr-t">%s<small>%s</small></span>' % (E(word), E(short)))


FINDER = '''<div class="nr-finder"><div class="nr-inp"><input type="text" placeholder="Введите слово, например city" autocomplete="off" autocapitalize="none" aria-label="Существительное в единственном числе"><button type="button" class="nr-go">Показать</button></div>
<div class="nr-q2"><button type="button" data-w="city">city</button><button type="button" data-w="box">box</button><button type="button" data-w="knife">knife</button><button type="button" data-w="tomato">tomato</button><button type="button" data-w="day">day</button><button type="button" data-w="child">child</button><button type="button" data-w="quiz">quiz</button></div>
<div class="nr-res" aria-live="polite"><p>Введите существительное или нажмите на пример.</p></div></div>'''

WORDS = [
    ('c', 'book', 'a book · two books · many books', 'much books'),
    ('c', 'idea', 'an idea · ideas · few ideas', 'a little idea'),
    ('u', 'advice', 'some advice · a piece of advice · much advice', 'an advice · advices'),
    ('u', 'news', 'some news · a piece of news · The news is good.', 'a news · The news are good.'),
    ('u', 'information', 'some information · two pieces of information', 'informations · two informations'),
    ('u', 'furniture', 'some furniture · a piece of furniture', 'furnitures · a furniture'),
    ('u', 'luggage', 'luggage · a suitcase · two bags of luggage', 'luggages · a luggage'),
    ('u', 'money', 'money · little money · a coin / a note', 'moneys · a money'),
    ('u', 'homework', 'homework · a piece of homework', 'homeworks · a homework'),
    ('u', 'weather', 'weather · nice weather · What awful weather!', 'a weather · weathers'),
    ('c', 'job', 'a job · two jobs', 'a work (работа)'),
    ('u', 'work', 'work · a lot of work', 'works (работа) · a work'),
]


def build_html():
    P = []
    P.append('<div class="mv nr" id="nr-root" lang="ru">\n')
    P.append('''<header class="mv-hero" id="карта-раздела">
  <h1>Nouns</h1>
  <p>Существительные: считаем, ставим во множественное число, показываем принадлежность, выбираем артикль и определитель. Главное — в карточках и плитках. Всё остальное раскрывается по нажатию.</p>
  <div class="mv-chips"><span class="mv-chip">countable</span><span class="mv-chip">plural</span><span class="mv-chip">a piece of</span><span class="mv-chip">’s / of</span><span class="mv-chip">a / the / —</span><span class="mv-chip">many / much</span></div>
</header>

<nav class="mv-nav" aria-label="Разделы правила">
  <a href="#nr-1">1 Типы</a><a href="#nr-2">2 Партитивы</a><a href="#nr-3">3 Два значения</a><a href="#nr-4">4 Мн. число</a><a href="#nr-5">5 Особые формы</a><a href="#nr-6">6 ’s и of</a><a href="#nr-7">7 Составные</a><a href="#nr-8">8 Группы</a><a href="#nr-9">9 Артикли</a><a href="#nr-10">10 many / much</a><a href="#nr-11">11 Проверка</a>
</nav>
''')

    # 1
    words = '<div class="nr-words" role="group" aria-label="Слова для проверки">%s</div><div class="nr-verdict" aria-live="polite" hidden></div>' % ''.join(
        '<button type="button" data-k="%s" data-ok="%s" data-bad="%s">%s</button>' % (k, E(ok), E(bad), w) for k, w, ok, bad in WORDS)
    cmp_ = ('<div class="nr-cmp"><div class="nr-cmp-c nr-c1"><h4>Countable</h4><ul><li class="y">a book</li><li class="y">books, three books</li><li class="y">many · few · fewer</li><li class="y">are</li></ul></div>'
            '<div class="nr-cmp-c nr-c2"><h4>Uncountable</h4><ul><li class="n">a / an</li><li class="n">-s и числа</li><li class="y">much · little · less</li><li class="y">is · a piece of</li></ul></div></div>')
    grp = rows(
        row('ad', 'Вещества', 'Вещества и материалы', '', ['water', 'milk', 'bread', 'rice', 'sugar', 'salt', 'cheese', 'butter', 'oil', 'air', 'sand', 'gold', 'wood', 'paper', 'glass', 'iron']),
        row('pr', 'Абстракции', 'Абстрактные понятия', '', ['advice', 'information', 'knowledge', 'news', 'progress', 'research', 'work', 'homework', 'help', 'luck', 'music', 'health', 'fun']),
        row('of', 'Явления', 'Состояния и явления', '', ['weather', 'traffic', 'money', 'time', 'space', 'electricity', 'pollution', 'rubbish']),
        row('pe', 'Массы', 'Собирательные «массы»', '', ['furniture', 'luggage', 'baggage', 'equipment', 'jewellery', 'machinery', 'clothing', 'scenery', 'cutlery', 'mail']),
        row('ab', 'Науки', 'Науки и деятельность', '', ['mathematics', 'physics', 'economics', 'politics', 'athletics', 'gymnastics']))
    P.append(sec(1, ['исчисляемые-и-неисчисляемые-существительные'], 'Исчисляемое или нет?',
                 'Первый вопрос к любому существительному.',
                 cmp_ + '<h3 class="nr-h3">Проверьте слово</h3><p class="nr-sub">Нажмите на слово.</p>' + words +
                 note('<b>Русский подсказывает неверно.</b> Совет, новость, мебель, багаж, информация, деньги — в английском «масса»: <span class="mv-x">an advice</span>, <span class="mv-x">two informations</span>, <span class="mv-x">a furniture</span>.', True) +
                 more('Какие слова неисчисляемые', grp),
                 '<b>Можно посчитать</b> — a book, three books. <b>Нельзя</b> — some advice, a piece of advice.'))

    # 2
    part = tiles([
        ('ab', 'a piece of', 'Абстрактное', ['a piece of advice', 'a piece of news', 'a piece of furniture', 'a bit of luck', 'an item of clothing'], 'Для абстрактных слов универсален <b>a piece of</b>. a bit of — разговорное.'),
        ('ad', 'a cup of', 'Напитки', ['a cup of tea', 'a glass of water', 'a bottle of milk', 'a can of cola'], 'В заказе допустимо коротко: <i>Two coffees, please</i> — две порции.'),
        ('of', 'a loaf of', 'Еда', ['a loaf of bread', 'a slice of bread', 'a piece of cake', 'a bar of chocolate', 'a bowl of soup', 'a spoonful of sugar'], 'Партитив закреплён за словом: a loaf of bread, но a bar of chocolate.'),
        ('pr', 'a jar of', 'Упаковка', ['a carton of juice', 'a jar of honey', 'a tin of soup', 'a packet of rice', 'a bag of sugar', 'a tube of toothpaste'], ''),
        ('du', 'a pinch of', 'Малая доза', ['a pinch of salt', 'a drop of rain', 'a grain of rice', 'a sheet of paper'], ''),
        ('pe', 'a pair of', 'Парные вещи', ['a pair of scissors', 'a pair of jeans', 'two pairs of trousers'], 'Партитивы бывают и с исчисляемыми: a bag of apples, a bunch of grapes, a kilo of potatoes.'),
    ])
    P.append(sec(2, ['как-посчитать-неисчисляемое-партитивы'], 'Как посчитать неисчисляемое',
                 'Считаем порцию, упаковку или кусок, а не саму «массу».', part +
                 note('Число идёт на партитив, а слово после <b>of</b> остаётся без -s: <span class="mv-ok">three pieces of advice</span>, <span class="mv-ok">two cups of coffee</span>, <span class="mv-x">three piece of advices</span>.'),
                 '<b>a piece of</b> + масса. <b>two pieces of</b> advice: -s на партитиве.'))

    # 3
    p3 = rows(
        twosum('glass', 'стекло · стакан', 'made of glass — стекло', 'a glass — стакан; glasses — очки'),
        twosum('paper', 'бумага · газета', 'a sheet of paper — бумага', 'a paper — газета, доклад; papers — документы'),
        twosum('hair', 'волосы · волос', 'long hair — волосы', 'a hair — один волос'),
        twosum('room', 'место · комната', 'There is no room. — место', 'a room — комната'),
        twosum('time', 'время · раз', 'no time — время', 'a time — раз; times — эпоха'),
        twosum('experience', 'опыт · случай', 'a lot of experience — опыт', 'an experience — случай, событие'),
        twosum('coffee, tea', 'напиток · порция', 'I drink coffee. — напиток', 'Two coffees, please. — порции'),
        twosum('chicken', 'мясо · курица', 'We had chicken. — мясо', 'a chicken — живая курица'))
    p3m = rows(
        twosum('iron', 'металл · утюг', 'металл', 'an iron — утюг'),
        twosum('wood', 'древесина · лес', 'древесина', 'a wood / woods — лес'),
        twosum('light', 'свет · лампа', 'свет', 'a light — лампа; lights — светофор'),
        twosum('work', 'работа · произведение', 'работа, труд', 'a work — произведение; works — завод'),
        twosum('business', 'дело · предприятие', 'дело, торговля', 'a business — предприятие'),
        twosum('fish', 'еда · рыба', 'рыба как еда', 'a fish — рыба; fishes — виды рыб'),
        twosum('cheese, wine', 'продукт · сорт', 'продукт', 'a cheese, French wines — сорта'),
        twosum('chocolate', 'шоколад · конфета', 'шоколад', 'a chocolate — конфета'),
        twosum('noise', 'шум · звук', 'шум вообще', 'a noise — отдельный звук'))
    P.append(sec(3, ['слова-с-двумя-значениями-исчисляемое-неисчисляемое'], 'Одно слово — два значения',
                 'Нажмите на слово, чтобы увидеть оба значения.', p3 + more('Ещё слова с двумя значениями', p3m),
                 '<b>Материал, абстракция</b> — масса, без a/an и -s. <b>Предмет, порция, вид</b> — с a/an и -s.'))

    # 4
    pl = tiles([
        ('s', '+ s', 'Обычное слово', ['book → books', 'chair → chairs', 'house → houses'], ''),
        ('es', '+ es', '-s, -ss, -sh, -ch, -x, -z', ['bus → buses', 'class → classes', 'dish → dishes', 'watch → watches', 'box → boxes'], 'Нужен лишний слог.'),
        ('ies', 'y → ies', 'Согласная + y', ['city → cities', 'party → parties', 'baby → babies'], ''),
        ('s', '+ s', 'Гласная + y', ['day → days', 'boy → boys', 'key → keys'], 'y остаётся.'),
        ('es', '+ es', 'Согласная + o (частые)', ['tomato → tomatoes', 'potato → potatoes', 'hero → heroes', 'echo → echoes'], 'Слова на -o ориентируйтесь по списку: radio, zoo, video, piano, photo, kilo — просто + s.'),
        ('ves', 'f → ves', '-f, -fe', ['knife → knives', 'wife → wives', 'leaf → leaves', 'life → lives', 'half → halves', 'shelf → shelves', 'wolf → wolves', 'thief → thieves', 'loaf → loaves'], 'roof, chief, cliff, belief, safe, chef — просто + s.'),
        ('zz', 'zz + es', '-z после одной гласной', ['quiz → quizzes'], ''),
        ('s', '+ s', 'Имена, сокращения, цифры', ['two Marys', 'the Kennedys', 'MPs', 'CDs', 'the 1990s'], 'Написание не меняется.'),
    ], 2)
    ex4 = rows(
        row('ves', 'f / v', 'f не меняется на v', 'roof, chief, cliff…', ['roof → roofs', 'belief → beliefs', 'chief → chiefs', 'cliff → cliffs', 'proof → proofs', 'safe → safes', 'chef → chefs', 'reef → reefs']),
        row('sp', '2 формы', 'Допустимы оба варианта', 'scarf, volcano, zero…', ['scarf → scarves / scarfs', 'dwarf → dwarfs / dwarves', 'hoof → hooves / hoofs', 'handkerchief → handkerchiefs / handkerchieves', 'mosquito → mosquitoes / mosquitos', 'volcano → volcanoes / volcanos', 'tornado → tornadoes / tornados', 'zero → zeros / zeroes']),
        row('s', '+ s', 'Слова на -o только с + s', 'avocado, memo, logo', ['avocado → avocados', 'memo → memos', 'logo → logos']),
        row('s', '+ s', 'ch читается как /k/', 'stomach, monarch', ['stomach → stomachs', 'monarch → monarchs', 'epoch → epochs']),
        row('s', 'не -men', 'German, Roman, human', '', ['German → Germans', 'Roman → Romans', 'human → humans', 'Norman → Normans'], 'А вот policeman, fireman, postman → -men.'))
    P.append(sec(4, ['регулярное-образование-множественного-числа'], 'Множественное число: как образовать',
                 'Смотрим на конец слова. Нажмите на плитку, чтобы увидеть примеры.',
                 '<h3 class="nr-h3">Подберите форму</h3>' + FINDER + '<h3 class="nr-h3">Правила по окончанию</h3>' + pl +
                 quiz('Выберите форму', [('one party → two …', ['partys', 'parties', 'partyes'], 1), ('one wife → two …', ['wifes', 'wives', 'wifies'], 1),
                                         ('one boy → two …', ['boys', 'boies', 'boyes'], 0), ('one quiz → two …', ['quizes', 'quizs', 'quizzes'], 2)]) +
                 more('Исключения: -o, -f и другие', ex4 + note('Для слов на -o и -f ориентируйтесь на список и словарь: закономерности есть, исключений много.')),
                 '<b>+ s</b> по умолчанию. <b>+ es</b> после шипящих. <b>y → ies</b>, <b>f → ves</b> — особые случаи.'))

    # 5
    irr = '<div class="nr-pills">%s</div>' % ''.join('<div class="nr-pill"><b>%s</b><i>→</i><span>%s</span></div>' % (a, b) for a, b in
        [('man', 'men'), ('woman', 'women'), ('foot', 'feet'), ('tooth', 'teeth'), ('goose', 'geese'), ('mouse', 'mice'), ('child', 'children'), ('ox', 'oxen'), ('person', 'people')])
    one = rows(
        row('pe', 'sheep', 'Животные', 'sheep, deer, moose, bison', ['one sheep → two sheep', 'a deer → many deer']),
        row('pe', 'fish', 'Рыбы', 'fish, salmon, trout, cod', ['a fish → five fish', 'two salmon', 'several trout'], 'Fishes — разные виды рыб.'),
        row('pe', 'species', 'Слова на -s', 'species, series, means', ['this species → these species', 'a series → two series']),
        row('pe', 'aircraft', 'Техника и места', 'aircraft, crossroads, headquarters', ['one aircraft → ten aircraft', 'a crossroads → two crossroads']),
        row('pe', 'Chinese', 'Национальности', 'Chinese, Japanese, Swiss', ['two Chinese', 'three Swiss', 'two Portuguese']))
    loan = tiles([
        ('pr', '-is → -es', 'Окончание -is', ['analysis → analyses', 'crisis → crises', 'thesis → theses', 'basis → bases', 'hypothesis → hypotheses', 'diagnosis → diagnoses', 'oasis → oases'], '-es читается /iːz/.'),
        ('pr', '-on → -a', 'Окончание -on', ['criterion → criteria', 'phenomenon → phenomena'], ''),
        ('pr', '-um → -a', 'Окончание -um', ['bacterium → bacteria', 'curriculum → curricula / curriculums', 'medium → media / mediums'], 'Но: museum → museums, stadium → stadiums, album → albums.'),
        ('pr', '-us → -i', 'Окончание -us', ['stimulus → stimuli', 'nucleus → nuclei', 'alumnus → alumni', 'cactus → cacti / cactuses', 'radius → radii / radiuses', 'syllabus → syllabuses / syllabi'], 'Но: bus → buses, virus → viruses, campus → campuses.'),
        ('pr', '-ix → -ices', 'Окончания -ix, -ex', ['appendix → appendices / appendixes', 'matrix → matrices / matrixes', 'vertex → vertices', 'index → indexes / indices'], 'index: книги — indexes, математика — indices.'),
        ('pr', '-a → -ae', 'Окончание -a и -eau', ['larva → larvae', 'alga → algae', 'formula → formulae / formulas', 'bureau → bureaux / bureaus', 'plateau → plateaus / plateaux'], 'В быту обычно formulas.'),
    ])
    sing = rows(
        row('ad', 'Науки', 'Науки и предметы', 'mathematics, physics, politics', ['Physics is difficult.', 'Mathematics is my favourite subject.'], 'Слова: mathematics, physics, economics, politics, athletics, gymnastics, linguistics.'),
        row('ad', 'news', 'Новости', '', ['The news is good.']),
        row('ad', 'Болезни', 'Болезни', 'measles, mumps, diabetes', ['Measles is dangerous.']),
        row('ad', 'Игры', 'Игры', 'darts, billiards, dominoes', ['Darts is popular in pubs.']),
        row('ad', 'Мера', 'Сумма, время, расстояние', '', ['Ten pounds is a lot.', 'Three weeks is a long time.', 'Two miles is far.']),
        row('of', '2 роли', 'statistics · politics · economics', 'наука или цифры', ['Statistics is a hard subject.', 'The statistics are alarming.', 'Her politics are quite liberal.', 'the economics of the project are unclear']),
        row('of', 'форма одна', 'series, species, means', '', ['This species is rare.', 'These species are rare.'], 'Глагол по смыслу. headquarters — любой: The headquarters is / are in Leeds.'))
    plur = rows(
        row('du', 'Парные', 'Парные предметы', 'scissors, trousers, jeans', ['scissors', 'trousers', 'jeans', 'shorts', 'glasses', 'binoculars', 'pyjamas', 'tights', 'pliers', 'tweezers', 'scales'], 'Считаем через <b>a pair of</b>: a pair of scissors, two pairs of trousers. My glasses are on the table.'),
        row('du', 'Вещи', 'Одежда и вещи', 'clothes, goods, belongings', ['clothes', 'belongings', 'goods', 'surroundings']),
        row('du', 'Места', 'Места', 'stairs, outskirts, premises', ['stairs', 'outskirts', 'premises', 'the Alps']),
        row('du', 'Деньги', 'Деньги и вежливость', 'savings, earnings, thanks', ['savings', 'earnings', 'thanks', 'congratulations', 'regards']),
        row('du', 'Прочее', 'Прочее', 'contents, manners, police', ['contents', 'remains', 'manners', 'customs', 'arms', 'police', 'cattle', 'clergy'], 'Police, cattle, clergy, people всегда требуют мн. глагола: The police are coming. Один человек — a police officer.'))
    P.append(sec(5, ['неправильное-множественное-число'], 'Особые формы числа',
                 'Неправильные формы, слова без изменений и слова только в одном числе.',
                 h3('Смена гласной или -en', anchors=['смена-гласной-или-добавление-en']) + irr +
                 note('<b>people</b> — обычное мн. число от person: one person, two people. <i>Persons</i> — официальные тексты. <i>A people</i> (народ) → <i>peoples</i>.') +
                 h3('Одна форма для обоих чисел', anchors=['одна-форма-для-обоих-чисел']) + one +
                 h3('Заимствованные формы', anchors=['заимствованные-формы']) + loan +
                 note('<b>data</b> и <b>media</b>: в обычной речи и IT — масса (<i>The data is stored safely</i>), в науке часто мн. ч. (<i>The data show a clear trend</i>). Оба варианта допустимы.') +
                 h3('Только одно число', anchors=['только-единственное-или-только-множественное-число']) +
                 more('Только единственное число', sing, rid='только-единственное-число') +
                 more('Только множественное число', plur, rid='только-множественное-число')))

    # 6
    forms = tiles([
        ('s', '’s', 'Единственное число', ['the girl’s bag', 'John’s car', 'a child’s toy'], ''),
        ('ad', '’', 'Мн. число на -s', ['the girls’ bags', 'my parents’ house'], 'Только апостроф.'),
        ('s', '’s', 'Мн. число без -s', ['the children’s room', 'the men’s coats'], ''),
        ('of', '’s / ’', 'Имя на -s', ['James’s book', 'James’ book', 'Charles’s / Charles’'], 'Оба варианта верны.'),
        ('pr', 'the … ’', 'Семья', ['the Smiths’ house'], 'the + фамилия во мн. ч. + апостроф.'),
        ('pe', 'последнее слово', 'Составное существительное', ['my sister-in-law’s car'], '’s ставится у последнего слова.'),
        ('du', 'без апострофа', 'Местоимения', ['its', 'hers', 'ours', 'yours', 'theirs'], '<b>it’s</b> = it is / it has. <b>its</b> — притяжательное: The dog wagged its tail.'),
    ])
    sof = rows(
        row('s', '’s', 'Люди и животные', 'the teacher’s desk', ['the teacher’s desk', 'the dog’s bowl']),
        row('s', '’s', 'Время и расстояние', 'a week’s holiday', ['a week’s holiday', 'two hours’ walk', 'yesterday’s news', 'today’s lesson']),
        row('s', '’s', 'Организации, страны, города', 'the company’s policy', ['the company’s policy', 'London’s museums', 'the world’s population']),
        row('s', '’s', 'Магазин, дом, врач', 'at the dentist’s', ['the baker’s', 'at the dentist’s', 'at Anna’s'], '’s без существительного.'),
        row('ad', 'of', 'Предметы и части целого', 'the door of the room', ['the door of the room', 'the end of the street', 'the title of the book', 'the top of the mountain']),
        row('pr', 'noun + noun', 'Класс, назначение', 'a school bag', ['a school bag', '✗ a school’s bag']),
        row('of', 'устойчивые', 'Устойчивые обороты', '', ['for goodness’ sake', 'a pound’s worth', 'a day’s work']))
    dbl = rows(
        row('pr', 'of + ’s', 'Двойной родительный', 'a friend of my father’s', ['a friend of my father’s', 'a friend of mine', 'that car of his', 'an old school friend of John’s'], 'Нужен, когда перед словом уже стоит a, this, that, some: <span class="mv-x">a my friend</span> → <span class="mv-ok">a friend of mine</span>.', rid='двойной-родительный'),
        row('of', 'вместе', 'Совместное владение', 'John and Mary’s house', ['John and Mary’s house (один дом)', 'John’s and Mary’s houses (два дома)'], '’s у последнего имени — предмет общий; у каждого — разные.', rid='совместное-владение'))
    P.append(sec(6, ['притяжательный-падеж-s-и-of'], 'Принадлежность: ’s и of',
                 'Сначала форма, потом выбор между ’s и of.',
                 '<h3 class="nr-h3">Как образовать</h3>' + forms + '<h3 class="nr-h3">’s или of?</h3>' + sof +
                 quiz('Выберите форму', [('the bag of the girl →', ['the girl’s bag', 'the girls bag', 'the girl bag'], 0), ('the door … the room', ['the room’s door', 'the door of the room', 'the rooms door'], 1),
                                         ('The dog wagged … tail.', ['it’s', 'its', 'its’'], 1), ('a friend … (мой)', ['a my friend', 'a friend of mine', 'a friend of me'], 1)]) +
                 more('Двойной родительный и совместное владение', dbl),
                 '<b>’s</b> — люди, время, места. <b>of</b> — предметы. <b>its</b> без апострофа.'))

    # 7
    comp = rows(
        row('ab', 'bedrooms', 'Главное слово последнее', 'bedroom, traffic light', ['bedroom → bedrooms', 'traffic light → traffic lights', 'toothbrush → toothbrushes']),
        row('pr', 'mothers-in-law', 'Главное слово не последнее', 'mother-in-law, passer-by', ['mother-in-law → mothers-in-law', 'passer-by → passers-by', 'looker-on → lookers-on', 'runner-up → runners-up', 'commander-in-chief → commanders-in-chief', 'attorney general → attorneys general / attorney generals'], 'Главное слово — то, что называет предмет: <i>mother</i>-in-law.'),
        row('of', 'grown-ups', 'Нет существительного', 'grown-up, take-away', ['grown-up → grown-ups', 'take-away → take-aways', 'forget-me-not → forget-me-nots']),
        row('pe', 'spoonfuls', 'Слова на -ful', 'spoonful, handful', ['spoonful → spoonfuls', 'handful → handfuls', 'cupful → cupfuls']))
    models = rows(
        row('sp', 'noun + noun', 'Модели составных', 'bedroom, car door', ['bedroom', 'car door', 'coffee cup', 'bus stop']),
        row('sp', 'adj + noun', 'Прилагательное + существительное', '', ['greenhouse', 'blackboard', 'software', 'fast food']),
        row('sp', 'verb-ing', 'Глагол с -ing + существительное', '', ['washing machine', 'swimming pool', 'driving licence']),
        row('sp', 'другое', 'Другие модели', '', ['sunrise', 'rainfall', 'hairdryer', 'underwear', 'input', 'bystander', 'mother-in-law']))
    attr = rows(
        row('ab', 'ед. ч.', 'Определение стоит в ед. числе', 'a shoe shop', ['✓ a shoe shop', '✗ a shoes shop', '✓ a book shelf']),
        row('ab', 'дефис', 'Число + единица измерения', 'a two-hour delay', ['✓ a two-hour delay', '✗ a two-hours delay', '✓ a ten-minute walk', '✓ a five-pound note', '✓ a six-year-old girl']),
        row('du', 'без ’s', 'Неодушевлённое — без ’s', 'a car door', ['✓ a car door', '✗ a car’s door', '✓ a table leg']),
        row('pr', '’s', 'Для групп людей — ’s', 'a children’s book', ['a children’s book', 'a men’s shop', 'a women’s magazine', 'a girls’ school', 'a ladies’ room']))
    mp = rows(
        row('sp', 'мн. ч.', 'Определение постоянно во мн. ч.', '', ['a clothes shop', 'a goods train', 'a glasses case']),
        row('sp', 'с -s', 'Устойчивое сочетание с -s', '', ['a sports car', 'a savings account', 'a customs officer', 'an arms race', 'a sales manager', 'a careers adviser']),
        row('sp', 'news', 'news', '', ['a news agency', 'a news bulletin']),
        row('sp', 'noun + of', 'wine glass или glass of wine', '', ['a wine glass — для вина', 'a glass of wine — с вином']))
    P.append(sec(7, ['составные-существительные-compound-nouns'], 'Составные существительные',
                 '-s получает главное слово. Если существительного нет, -s в конце.',
                 comp + more('Модели составных слов', models + '<p class="nr-p">Написание закреплено словарём: слитно, через дефис или раздельно.</p>') +
                 h3('Существительное как определение', hid='существительное-в-роли-определения-noun-noun') + attr +
                 more('Когда определение во мн. числе', mp),
                 '<b>mothers</b>-in-law, <b>passers</b>-by. <b>a two-hour</b> delay: единица в ед. числе.'))

    # 8
    coll = rows(
        row('ad', 'ед. ч.', 'Группа как целое', 'The team is playing well.', ['The team is playing well.', 'The government has decided.']),
        row('du', 'мн. ч.', 'Люди внутри группы', 'The staff were very helpful.', ['The staff were very helpful.', 'The team are having a shower.', 'Liverpool are winning.']),
        row('du', 'мн. ч.', 'the police, cattle, clergy', 'всегда мн.', ['The police are here.', 'Cattle graze here.', 'The clergy were present.']),
        row('du', 'мн. ч.', 'the + прилагательное', 'the rich, the elderly', ['The rich are not always happy.', 'The elderly need help.']),
        row('du', 'мн. ч.', 'a number of + мн.', '', ['A number of students are absent.', 'A couple of friends are coming.']),
        row('ad', 'ед. ч.', 'the number of + мн.', '', ['The number of students is growing.']),
        row('ad', 'ед. ч.', 'each / every / either / neither', '', ['Every student has a book.']),
        row('of', 'по слову', 'a lot of / plenty of', 'глагол по существительному', ['A lot of money is wasted.', 'A lot of people are waiting.']))
    P.append(sec(8, ['собирательные-существительные-collective-nouns'], 'Группы людей: team, family, staff',
                 'team, family, staff, government, committee, company, audience, class, crew, jury, crowd.', coll +
                 note('<b>British и American.</b> Британский английский допускает оба числа (<i>The committee has / have decided</i>), американский обычно выбирает единственное. Согласуйте и местоимения: <b>its</b> — с целым, <b>their</b> — с людьми.'),
                 '<b>Группа как целое</b> — is. <b>Люди внутри</b> — are.'))

    # 9
    art = tiles_cases([
        ('ab', 'a / an', 'Неопределённый', [('Выбор по звуку', 'a university, an hour'), ('Гласный звук', 'an honest man, an MP, an X-ray, an 18-year-old'), ('Первое упоминание', 'I saw a dog.'), ('Профессия', 'She is a teacher.'),
                                            ('Частота, цена, скорость', 'twice a week, £5 a kilo, sixty miles an hour'), ('Восклицание', 'What a day! such a long day'), ('Дробь, число', 'half an hour, a hundred'), ('Один из многих', 'a friend of mine')], ''),
        ('ad', 'the', 'Определённый', [('Уже упомянуто', 'I bought a book. The book was boring.'), ('Понятно из ситуации', 'Open the window, please.'), ('Единственный', 'the sun, the world, the internet'), ('Превосходная степень, first, only, same', 'the best student, the only way'),
                                       ('the + прилагательное', 'the rich, the elderly'), ('Реки, моря, горы', 'the Thames, the Atlantic, the Alps'), ('Страны во мн. ч., the UK', 'the Netherlands, the USA'), ('Инструменты, кино, театр', 'play the piano, go to the cinema'),
                                       ('Семья', 'the Smiths'), ('Названия на the', 'the Eiffel Tower, the White House')], ''),
        ('of', '—', 'Без артикля', [('Общий смысл', 'Music helps people relax. Children need sleep.'), ('Приёмы пищи', 'have breakfast'), ('Языки', 'speak English'), ('Страны, города, улицы', 'in France, Oxford Street'),
                                    ('Вершины, озёра', 'Mount Everest, Lake Windermere'), ('Спорт, предметы', 'play football, study history'), ('Транспорт', 'by bus, on foot'), ('Дни, месяцы', 'on Monday, in July'),
                                    ('Устойчивые места', 'at school, in hospital, at work'), ('Звание + имя', 'Doctor Brown')], 'Одно слово — два артикля: <i>She is in hospital</i> (лечится), <i>went to the hospital</i> (в здание). at school — учится, at the school — в здании.'),
    ])
    first = rows(
        row('ab', 'первый раз', 'Первое упоминание', '', ['a book', 'some books / books', 'some water / water']),
        row('ad', 'известное', 'Известное, конкретное', '', ['the book', 'the books', 'the water']),
        row('of', 'в общем', 'Обобщение', '', ['A dog is friendly.', 'Dogs are friendly.', 'Water is essential.']))
    P.append(sec(9, ['артикли-и-определители-с-существительными', 'a-an', 'the', 'нулевой-артикль'], 'Артикли: a, the или ничего',
                 'Сначала тип слова, потом ситуация. Нажмите на плитку.', first + '<h3 class="nr-h3">Когда какой</h3>' + art +
                 quiz('Выберите артикль', [('She is … honest teacher.', ['a', 'an', 'the'], 1), ('I bought a book. … book was boring.', ['A', 'The', '—'], 1),
                                           ('… music helps people relax.', ['The', 'A', '— (без артикля)'], 2), ('She plays … piano.', ['the', 'a', '—'], 0)]),
                 '<b>a / an</b> — первый раз. <b>the</b> — известное. <b>—</b> — общий смысл.'))

    # 10
    q = tiles([
        ('ab', 'many', 'many и much', ['many books', 'much time', 'Do you have much time?', 'I don’t have many friends.', 'I have a lot of time.'], 'much, many — в вопросах и отрицаниях. В утверждениях: a lot of; too much, so many, how much допустимы.'),
        ('of', 'a few', 'a few / few', ['a few friends — немного, хватит', 'few chances — почти нет'], 'С исчисляемыми.'),
        ('ad', 'a little', 'a little / little', ['a little money — немного, хватит', 'little hope — почти нет'], 'С неисчисляемыми.'),
        ('pr', 'fewer', 'fewer и less', ['fewer mistakes', 'less noise'], '<b>fewer</b> — исчисляемое, <b>less</b> — неисчисляемое. <i>less than ten minutes</i>, <i>less than 20 items</i> допустимы: сумма, время, расстояние — как одно целое.'),
        ('s', 'a lot of', 'a lot of · plenty of · enough', ['a lot of books', 'a lot of water', 'enough chairs', 'enough time'], 'Подходят и к исчисляемым, и к неисчисляемым.'),
        ('sp', 'some', 'some · any · no', ['Would you like some tea?', 'Do you have any questions?', 'Any student can join.', 'There is no time.', 'There isn’t any time.'], 'some — утверждения и предложения; any — вопросы, отрицания, «любой».'),
        ('du', 'every', 'every · each · both · most · all', ['every student (ед. ч.)', 'both parents', 'most people', 'all water', 'several students', 'a great deal of work'], ''),
        ('of', 'hundred', 'hundred, thousand', ['three hundred people', 'two thousand pounds', 'hundreds of people'], 'После числа без -s; hundreds of — с -s.'),
    ])
    P.append(sec(10, ['количественные-определители-quantifiers'], 'many, much, few, little',
                 'Выбор зависит от того, исчисляемое слово или нет.', q +
                 quiz('Выберите слово', [('There isn’t … time.', ['many', 'much', 'few'], 1), ('She has … friends here.', ['a few', 'a little', 'much'], 0),
                                         ('We made … mistakes this time.', ['fewer', 'less', 'little'], 0), ('There is … noise in the street.', ['fewer', 'less', 'many'], 1)]),
                 '<b>many, few, fewer</b> — с исчисляемыми. <b>much, little, less</b> — с неисчисляемыми.'))

    # 11
    fixes = [('an advice', 'a piece of advice', 'неисчисляемое'), ('two informations', 'two pieces of information', 'неисчисляемое'), ('the news are', 'the news is', 'ед. число'),
             ('childs, mans', 'children, men', 'особая форма'), ('a scissor', 'a pair of scissors', 'только мн. ч.'), ('the police is', 'the police are', 'всегда мн. ч.'),
             ('much books', 'many books', 'much — с неисчисляемым'), ('few time', 'little time', 'little — с неисчисляемым'), ('a two-hours journey', 'a two-hour journey', 'определение — в ед. ч.'),
             ('Johns car', 'John’s car', 'нужен апостроф'), ('the girl bag', 'the girl’s bag', 'принадлежность человеку'), ('a my friend', 'a friend of mine', 'двойной родительный'),
             ('it’s tail', 'its tail', 'без апострофа'), ('a long hair', 'long hair', 'волосы — масса'), ('two mother-in-laws', 'two mothers-in-law', '-s у главного слова')]
    fx = '<ul class="nr-fixes">%s</ul>' % ''.join('<li><span class="mv-x">%s</span><span class="nr-arrow">→</span><span class="mv-ok">%s</span><small>%s</small></li>' % (E(a), E(b), E(c)) for a, b, c in fixes)
    steps = ('<ol class="nr-steps"><li><b>Тип слова</b>: исчисляемое, неисчисляемое или два значения.</li><li><b>Число</b>: -s, особая форма или без изменений.</li><li><b>Орфография</b>: -es, -ies, -ves, -os / -oes, заимствованные формы.</li>'
             '<li><b>Глагол</b>: по форме (news) или по смыслу (the team is); police — мн. ч.</li><li><b>Мера</b>: для неисчисляемого партитив.</li><li><b>Принадлежность</b>: ’s для людей, времени, мест; of для предметов.</li>'
             '<li><b>Артикль</b>: a/an по звуку, the при определённости, без артикля при общем смысле.</li><li><b>Определитель</b>: many / much, few / little, fewer / less.</li></ol>'
             + note('В упражнении следуйте инструкции: иногда нужна форма слова, иногда сочетание целиком. Уже напечатанные слова не повторяйте. Если допустимы два варианта (James’s и James’), принимаются оба.'))
    gender = rows(
        row('sp', 'нейтрально', 'Профессия, родство', 'teacher, doctor, friend', ['teacher', 'doctor', 'student', 'friend', 'neighbour']),
        row('sp', 'пары', 'Парные формы', 'actor / actress', ['actor / actress', 'waiter / waitress', 'hero / heroine', 'prince / princess']),
        row('sp', 'нейтральные', 'Вместо слов на -man', '', ['police officer', 'firefighter', 'chair', 'flight attendant', 'salesperson']),
        row('sp', 'животные', 'Животные', '', ['a bull / a cow', 'a cock / a hen', 'an animal'], 'Грамматического рода у существительных нет: он проявляется только в местоимениях he, she, it.'))
    P.append(sec(11, ['частые-ошибки'], 'Частые ошибки и проверка',
                 'Типичные промахи и вопросы перед ответом.', fx +
                 more('Проверка перед ответом', steps, rid='проверка-перед-ответом', open_=True) + more('Род и нейтральность', gender, rid='род-и-нейтральность')))
    P.append('</div>')
    return '\n'.join(P)
