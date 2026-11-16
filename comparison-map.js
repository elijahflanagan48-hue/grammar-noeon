"use strict";
/* Карта правила Degrees of Comparison: «Стадион сравнений» на движке noeon-canvas.js.
   Беговая дорожка: каждое прилагательное бежит забег старт (big) → than (bigger) → финиш (the biggest),
   дорожки — способы образования. Вокруг — Зал славы (неправильные), пьедестал, фотофиниш, табло, планка… */
const CM_HEAD = { // заголовки разделов правила, к которым ведут ссылки «Подробно в правиле»
  forms: 'Формы и орфография', two: 'Два слога и варианты', irr: 'Неправильные формы', compound: 'Составные прилагательные',
  older: 'Older и elder', further: 'Farther и further', than: 'Сравнительная степень и than', sup: 'Превосходная степень и группа',
  art: 'Артикли и определители', eq: 'Равенство и неравенство', too: 'Too и enough', less: 'Less и least', diff: 'Насколько велика разница',
  mult: 'Модификаторы равенства и кратность', grad: 'Постепенное изменение', link: 'Связанные изменения', fixed: 'Устойчивые сравнения',
  prec: 'Точность сравнения и пропуски', limit: 'Отрицание и логические границы', scale: 'Пределы шкалы и контекст',
};
// Лестница: [positive, comparative, superlative, перевод, пример comparative, перевод, пример superlative, перевод, проверка, заметка?]
const CM_STAIRS = [
  ['er', '+ er / + est', 'один слог: прибавляем -er и -est', 'forms', [
    ['tall', 'taller', 'tallest', 'высокий', 'Tom is taller than his dad.', 'Том выше папы.', 'He’s the tallest boy in the class.', 'Он самый высокий мальчик в классе.', 'My brother is [taller|more tall|tallest] than me.'],
    ['cheap', 'cheaper', 'cheapest', 'дешёвый', 'The bus is cheaper than the train.', 'Автобус дешевле поезда.', 'This is the cheapest hotel in town.', 'Это самый дешёвый отель в городе.', 'It’s the [cheapest|most cheap|cheaper] option.'],
    ['fast', 'faster', 'fastest', 'быстрый', 'A plane is faster than a train.', 'Самолёт быстрее поезда.', 'Usain Bolt was the fastest man in the world.', 'Усэйн Болт был самым быстрым человеком в мире.', 'Who is [the fastest|the most fast|fastest of] runner?'],
    ['old', 'older', 'oldest', 'старый', 'My car is older than yours.', 'Моя машина старше твоей.', 'It’s the oldest building in London.', 'Это самое старое здание в Лондоне.', 'She is two years [older|elder|more old] than me.', 'Elder — только о членах семьи перед существительным: my elder brother. С than — всегда older.'],
    ['long', 'longer', 'longest', 'длинный', 'The Nile is longer than the Volga.', 'Нил длиннее Волги.', 'What’s the longest river in Europe?', 'Какая самая длинная река в Европе?', 'Winter nights are [longer|more long|longest].'],
    ['young', 'younger', 'youngest', 'молодой', 'I’m younger than my sister.', 'Я младше сестры.', 'She’s the youngest player in the team.', 'Она самая юная в команде.', 'He is the [youngest|most young|younger] of five children.'],
  ]],
  ['e', '+ r / + st', 'кончается на -e: только -r и -st', 'forms', [
    ['nice', 'nicer', 'nicest', 'приятный', 'This café is nicer than the last one.', 'Это кафе приятнее прошлого.', 'She’s the nicest person I know.', 'Она самый милый человек из всех, кого я знаю.', 'The weather is [nicer|niceer|more nice] today.'],
    ['large', 'larger', 'largest', 'большой', 'Russia is larger than Canada.', 'Россия больше Канады.', 'It’s the largest country in the world.', 'Это самая большая страна в мире.', 'We need a [larger|largeer|more large] room.'],
    ['safe', 'safer', 'safest', 'безопасный', 'Trains are safer than cars.', 'Поезда безопаснее машин.', 'It’s the safest way to travel.', 'Это самый безопасный способ путешествовать.', 'This road is [safer|safeer|more safe] at night.'],
    ['late', 'later', 'latest', 'поздний', 'Let’s meet later.', 'Давай встретимся позже.', 'Have you seen the latest news?', 'Ты видел последние новости?', 'I’ll call you [later|lateer|more late].', 'Latest — «самый новый, последний на сегодня», last — «последний по порядку».'],
    ['wide', 'wider', 'widest', 'широкий', 'This road is wider than ours.', 'Эта дорога шире нашей.', 'It’s the widest street in the city.', 'Это самая широкая улица в городе.', 'Make the door [wider|wideer|more wide].'],
  ]],
  ['dbl', 'удвоение', 'гласная + согласная: удваиваем последнюю', 'forms', [
    ['big', 'bigger', 'biggest', 'большой', 'Your bag is bigger than mine.', 'Твоя сумка больше моей.', 'It’s the biggest city in Spain.', 'Это самый большой город Испании.', 'I need a [bigger|biger|more big] box.', 'Одна гласная + одна согласная в конце → удваиваем: big — bigger.'],
    ['hot', 'hotter', 'hottest', 'жаркий', 'July is hotter than June.', 'Июль жарче июня.', 'It was the hottest day of the year.', 'Это был самый жаркий день года.', 'Today is [hotter|hoter|more hot] than yesterday.'],
    ['thin', 'thinner', 'thinnest', 'тонкий, худой', 'This book is thinner than that one.', 'Эта книга тоньше той.', 'It’s the thinnest phone on the market.', 'Это самый тонкий телефон на рынке.', 'He looks [thinner|thiner|more thin] now.'],
    ['sad', 'sadder', 'saddest', 'грустный', 'The film was sadder than the book.', 'Фильм был грустнее книги.', 'It’s the saddest song I know.', 'Это самая грустная песня, которую я знаю.', 'She felt [sadder|sader|more sad] than ever.'],
    ['wet', 'wetter', 'wettest', 'мокрый, дождливый', 'This year was wetter than last year.', 'Этот год был дождливее прошлого.', 'It was the wettest summer on record.', 'Это было самое дождливое лето за всю историю наблюдений.', 'The grass is [wetter|weter|more wet] here.'],
    ['slow', 'slower', 'slowest', 'медленный', 'My laptop is slower than yours.', 'Мой ноутбук медленнее твоего.', 'It’s the slowest train.', 'Это самый медленный поезд.', 'Can you speak [slower|slowwer|more slower]?', 'Без удвоения: в конце w, x, y или две гласные — slow, new, cheap.'],
  ]],
  ['y', 'y → i', 'согласная + y: меняем на i', 'forms', [
    ['happy', 'happier', 'happiest', 'счастливый', 'She looks happier now.', 'Она выглядит счастливее.', 'It was the happiest day of my life.', 'Это был самый счастливый день в моей жизни.', 'I’ve never been [happier|happyer|more happier].'],
    ['easy', 'easier', 'easiest', 'лёгкий', 'Maths is easier than physics.', 'Математика легче физики.', 'This is the easiest exercise.', 'Это самое лёгкое упражнение.', 'The test was [easier|more easier|easyer] than I expected.', 'Только один способ: easier, а не *more easier*.'],
    ['busy', 'busier', 'busiest', 'занятой, оживлённый', 'Mondays are busier than Fridays.', 'Понедельники загруженнее пятниц.', 'It’s the busiest station in Europe.', 'Это самая загруженная станция Европы.', 'This road is [busier|busyer|more busy] in the morning.'],
    ['heavy', 'heavier', 'heaviest', 'тяжёлый', 'Your case is heavier than mine.', 'Твой чемодан тяжелее моего.', 'It’s the heaviest animal on Earth.', 'Это самое тяжёлое животное на Земле.', 'The box is [heavier|heavyer|more heavy] than it looks.'],
    ['early', 'earlier', 'earliest', 'ранний', 'Can we meet earlier?', 'Можем встретиться пораньше?', 'What’s the earliest train?', 'Какой самый ранний поезд?', 'I got up [earlier|more early|earlyer] than usual.'],
    ['funny', 'funnier', 'funniest', 'смешной', 'His new film is funnier.', 'Его новый фильм смешнее.', 'She’s the funniest person I know.', 'Она самый смешной человек, кого я знаю.', 'This joke is [funnier|funnyer|more funny].'],
  ]],
  ['more', 'more / most', 'длинные слова: more и most перед словом', 'forms', [
    ['expensive', 'more expensive', 'most expensive', 'дорогой', 'Taxis are more expensive than buses.', 'Такси дороже автобусов.', 'It’s the most expensive restaurant here.', 'Это самый дорогой ресторан здесь.', 'This phone is [more expensive|expensiver|most expensive] than mine.'],
    ['interesting', 'more interesting', 'most interesting', 'интересный', 'The book is more interesting than the film.', 'Книга интереснее фильма.', 'It was the most interesting lesson.', 'Это был самый интересный урок.', 'History is [more interesting|interestinger|more interestinger] than I thought.'],
    ['beautiful', 'more beautiful', 'most beautiful', 'красивый', 'Paris is more beautiful in spring.', 'Весной Париж красивее.', 'It’s the most beautiful place I’ve seen.', 'Это самое красивое место, что я видел.', 'She is [the most beautiful|the beautifullest|the more beautiful] actress.'],
    ['important', 'more important', 'most important', 'важный', 'Health is more important than money.', 'Здоровье важнее денег.', 'What’s the most important thing?', 'Что самое важное?', 'Nothing is [more important|importanter|most important] than family.'],
    ['careful', 'more careful', 'most careful', 'осторожный', 'Be more careful next time.', 'В следующий раз будь осторожнее.', 'He’s the most careful driver I know.', 'Он самый аккуратный водитель из всех, кого я знаю.', 'You should be [more careful|carefuller|most careful].', 'Два слога на -ful, -less, -ing, -ed, -ous — обычно с more / most.'],
    ['tired', 'more tired', 'most tired', 'уставший', 'I’m more tired than yesterday.', 'Я устал сильнее, чем вчера.', 'That was the most tired I’ve ever felt.', 'Никогда я так не уставал.', 'I feel [more tired|tireder|most tired] than usual.'],
  ]],
  ['both', 'и так, и так', 'двусложные: можно -er или more', 'two', [
    ['clever', 'cleverer / more clever', 'cleverest / most clever', 'умный', 'She’s cleverer than her brother.', 'Она умнее брата.', 'He’s the cleverest student in the group.', 'Он самый умный студент в группе.', 'Ann is [cleverer|more cleverer|cleverier] than Kate.', 'Оба варианта верны; -er звучит естественнее.'],
    ['quiet', 'quieter / more quiet', 'quietest / most quiet', 'тихий', 'The library is quieter than the café.', 'В библиотеке тише, чем в кафе.', 'It’s the quietest room in the house.', 'Это самая тихая комната в доме.', 'Can we find a [quieter|more quieter|quietter] place?'],
    ['simple', 'simpler / more simple', 'simplest / most simple', 'простой', 'This way is simpler.', 'Так проще.', 'It’s the simplest solution.', 'Это самое простое решение.', 'Make the text [simpler|simpleer|more simpler].'],
    ['narrow', 'narrower / more narrow', 'narrowest / most narrow', 'узкий', 'The street is narrower here.', 'Здесь улица уже.', 'It’s the narrowest bridge in the city.', 'Это самый узкий мост в городе.', 'The road gets [narrower|narrowwer|more narrower] after the bridge.'],
    ['polite', 'politer / more polite', 'politest / most polite', 'вежливый', 'Be more polite to your teacher.', 'Будь вежливее с учителем.', 'He’s the most polite child I know.', 'Он самый вежливый ребёнок из всех, кого я знаю.', 'You could be a bit [more polite|more politer|politter].'],
  ]],
];
// Лифт: неправильные формы
const CM_LIFT = [
  ['good', 'better', 'best', 'хороший', 'This pizza is better than that one.', 'Эта пицца лучше той.', 'She’s my best friend.', 'Она моя лучшая подруга.', 'Your English is [better|gooder|more good] than mine.', 'Well (хорошо) — тоже better / best: She sings better than me.'],
  ['bad', 'worse', 'worst', 'плохой', 'The traffic is worse today.', 'Сегодня пробки хуже.', 'It was the worst day of my life.', 'Это был худший день в моей жизни.', 'My cold is [worse|badder|more bad] today.', 'Badly (плохо) и ill (больной) — тоже worse / worst.'],
  ['far', 'farther / further', 'farthest / furthest', 'далёкий', 'My school is further than yours.', 'Моя школа дальше твоей.', 'It’s the farthest point of the island.', 'Это самая дальняя точка острова.', 'For [further|farer|more far] information, call us.', 'О расстоянии — farther или further. В значении «дополнительный» — только further: further details.'],
  ['little', 'less', 'least', 'мало (неисчисл.)', 'I have less time than you.', 'У меня меньше времени, чем у тебя.', 'It’s the least I can do.', 'Это меньшее, что я могу сделать.', 'You should eat [less|littler|fewer] sugar.', 'Little о размере («маленький») — smaller: a smaller house.'],
  ['many / much', 'more', 'most', 'много', 'She earns more money than me.', 'Она зарабатывает больше меня.', 'Who has the most points?', 'У кого больше всего очков?', 'We need [more|mucher|manier] chairs.'],
  ['few', 'fewer', 'fewest', 'мало (исчисл.)', 'There are fewer cars on Sundays.', 'По воскресеньям машин меньше.', 'He made the fewest mistakes.', 'Он сделал меньше всех ошибок.', 'There were [fewer|less|littler] people than last year.', 'Fewer — с исчисляемыми (fewer cars), less — с неисчисляемыми (less traffic).'],
];
// Особые двери: составные и пары со смыслом
const CM_SPECIAL = [
  ['well-known', 'better-known', 'best-known', 'известный', 'He is better-known in Europe.', 'Он более известен в Европе.', 'It’s her best-known song.', 'Это её самая известная песня.', 'It’s the [best-known|most well-known of|well-knownest] painting in the museum.', 'Можно и more well-known, но better-known звучит естественнее.', 'compound'],
  ['good-looking', 'better-looking', 'best-looking', 'симпатичный', 'He’s better-looking than his brother.', 'Он симпатичнее брата.', 'The best-looking car at the show.', 'Самая красивая машина на выставке.', 'He’s [better-looking|gooder-looking|good-lookinger] than in his photos.', '', 'compound'],
  ['well off', 'better off', 'best off', 'обеспеченный, в лучшем положении', 'We’re better off without a car.', 'Нам лучше без машины.', 'Who will be best off after the change?', 'Кому от перемены будет лучше всего?', 'You’d be [better off|more well off|weller off] taking the train.', 'Better off — «в более выгодном положении», не обязательно про деньги.', 'compound'],
  ['old (семья)', 'older / elder', 'oldest / eldest', 'старший', 'my elder sister · She’s older than me.', 'моя старшая сестра · Она старше меня.', 'their eldest son', 'их старший сын', 'My brother is three years [older|elder|more old] than me.', 'Elder и eldest — только о семье и только перед существительным. С than — older.', 'older'],
];
// Площадка конструкций: [зона, ключ правила, [[название, смысл, пример, перевод, проверка, заметка?]]]
const CM_TOOLS = [
  ['than', 'Сравниваем двоих', 'than', [
    ['… than …', 'больше / лучше чем', 'A tram is quieter than a motorbike.', 'Трамвай тише мотоцикла.', 'Cats are [cleaner than|cleaner as|more clean that] dogs.'],
    ['than me / than I am', 'чем я', 'She’s taller than me. · She’s taller than I am.', 'Она выше меня.', 'He runs faster than [me|my|mine I].', 'В разговоре — than me; в полной форме — than I am. Неверно: *than I*. '],
    ['the … of the two', 'из двух', 'Take the cheaper of the two.', 'Бери тот, что дешевле из двух.', 'She’s the [taller|tallest|more tall] of the two sisters.'],
  ]],
  ['sup', 'Подиум: самый', 'sup', [
    ['the … in', 'самый в месте / группе', 'the tallest building in the city', 'самое высокое здание в городе', 'It’s the oldest café [in|of|from] Paris.', 'In — с местом и организацией: in the world, in my class.'],
    ['the … of', 'самый из / за период', 'the best day of my life', 'лучший день в моей жизни', 'It was the best day [of|in|from] the year.', 'Of — с перечнем и периодом: of the three, of the year.'],
    ['one of the …', 'один из самых', 'one of the safest cities', 'один из самых безопасных городов', 'It’s one of the [best films|best film|better films] ever.', 'После one of the — существительное во множественном.'],
    ['the second-largest', 'второй по величине', 'the second-largest city', 'второй по величине город', 'It’s the [second-largest|second most largest|second larger] island.'],
    ['… ever', 'самый за всё время', 'the best film I’ve ever seen', 'лучший фильм, что я видел', 'That was the worst meal I’ve [ever had|never had|ever have].', 'После суперлатива — Present Perfect с ever.'],
    ['my best friend', 'без the', 'my best friend · our biggest problem', 'мой лучший друг · наша главная проблема', 'He’s [my best|the my best|my the best] friend.', 'Притяжательное слово заменяет the.'],
  ]],
  ['eq', 'Весы: так же', 'eq', [
    ['as … as', 'такой же, как', 'He’s as tall as his father.', 'Он такой же высокий, как отец.', 'This bag is [as heavy as|as heavier as|so heavy than] that one.', 'Между as … as — обычная форма: as tall as, не *as taller as*.'],
    ['not as … as', 'не такой, как; менее', 'Tea isn’t as strong as coffee.', 'Чай не такой крепкий, как кофе.', 'The sequel is [not as good as|not as better as|not good as] the first film.'],
    ['twice as … as', 'вдвое', 'This flat is twice as big as ours.', 'Эта квартира вдвое больше нашей.', 'It’s [three times as expensive|three times expensive as|three times as more expensive] as last year.'],
    ['the same as', 'такой же, тот же', 'Your phone is the same as mine.', 'Твой телефон такой же, как мой.', 'My answer is [the same as|the same like|same as] yours.', 'The same … as: the same age as me.'],
  ]],
  ['diff', 'Линейка разницы', 'diff', [
    ['much / far / a lot', 'намного', 'This one is much better.', 'Этот намного лучше.', 'The new phone is [much faster|very faster|more faster].', 'Перед comparative нельзя very: не *very bigger*, а much bigger.'],
    ['a bit / slightly', 'немного', 'Can you speak a bit louder?', 'Можно чуть громче?', 'It’s [slightly cheaper|slight cheaper|very cheaper] online.'],
    ['even', 'даже ещё', 'It’s even colder today.', 'Сегодня ещё холоднее.', 'The second test was [even harder|more even harder|even hardest].'],
    ['by far the …', 'безусловно самый', 'She’s by far the best player.', 'Она безусловно лучший игрок.', 'This is [by far the best|by far best|far the better] option.'],
  ]],
  ['grad', 'Эскалатор', 'grad', [
    ['… and …', 'всё больше и больше', 'It’s getting colder and colder.', 'Становится всё холоднее.', 'The city is getting [bigger and bigger|more and more big|big and bigger].'],
    ['more and more …', 'всё более', 'Phones are more and more expensive.', 'Телефоны всё дороже.', 'English is becoming [more and more popular|popularer and popularer|more popular and popular].'],
  ]],
  ['link', 'Качели «чем…, тем…»', 'link', [
    ['the …, the …', 'чем…, тем…', 'The sooner, the better.', 'Чем раньше, тем лучше.', '[The more|More|The most] you practise, the better you get.'],
    ['the more …, the more …', 'чем больше…, тем больше…', 'The more you read, the more you know.', 'Чем больше читаешь, тем больше знаешь.', 'The older I get, [the happier|happier|the more happy] I am.'],
  ]],
  ['too', 'Окно нормы', 'too', [
    ['too …', 'слишком', 'It’s too hot to sleep.', 'Слишком жарко, чтобы спать.', 'This coffee is [too hot|too much hot|very too hot] to drink.', 'Too — «больше нормы», обычно с отрицательным смыслом.'],
    ['… enough', 'достаточно', 'Is it warm enough to swim?', 'Достаточно ли тепло, чтобы купаться?', 'He isn’t [old enough|enough old|enough older] to drive.', 'Enough — после прилагательного (old enough), но перед существительным (enough money).'],
    ['enough + noun', 'достаточно чего-то', 'We have enough time.', 'У нас достаточно времени.', 'Do we have [enough chairs|chairs enough|enough of chairs]?'],
    ['not … enough', 'недостаточно', 'The room isn’t big enough.', 'Комната недостаточно большая.', 'The rope isn’t [long enough|enough long|too long enough].'],
  ]],
  ['less', 'В хвосте забега', 'less', [
    ['less …', 'менее', 'This film is less violent.', 'Этот фильм менее жестокий.', 'It’s [less expensive|lesser expensive|more cheap] than I thought.', 'Чаще говорят not as … as: not as expensive as.'],
    ['the least …', 'наименее', 'the least popular song', 'наименее популярная песня', 'It’s the [least interesting|less interesting|littlest interesting] book.'],
  ]],
  ['trap', 'Ловушки', 'forms', [
    ['more easier', 'двойная степень', '✗ more easier → ✓ easier', '✗ → ✓', 'This way is [easier|more easier|most easier].', 'Только один способ: либо -er, либо more.', true],
    ['very bigger', 'very с comparative', '✗ very bigger → ✓ much bigger', '✗ → ✓', 'The new house is [much bigger|very bigger|more bigger].', 'Very — с обычной формой (very big), much — с comparative.', true],
    ['the most tallest', 'двойная превосходная', '✗ the most tallest → ✓ the tallest', '✗ → ✓', 'He’s [the tallest|the most tallest|most tallest] boy here.', '', true],
    ['than / that / as', 'после сравнения', '✗ bigger that / as → ✓ bigger than', '✗ → ✓', 'Moscow is bigger [than|that|as] Kazan.', 'По-русски «чем» и «что» похожи, но после comparative только than.', true],
    ['the best of / in', 'предлог группы', '✗ the best of the world → ✓ in the world', '✗ → ✓', 'It’s the longest river [in|of|from] the world.', '', true],
  ]],
];

// Дополнительные конструкции: [название, смысл, пример, перевод, проверка, заметка?, ловушка?, раздел правила?]
const CM_MORE = {
  than: [
    ['than expected', 'чем ожидалось', 'The exam was easier than expected.', 'Экзамен был легче, чем ожидалось.', 'The trip was longer [than we expected|than we expected it|that we expected].', 'После than можно сократить предсказуемую часть: than (we) expected.', false, 'prec'],
    ['than any other', 'чем любой другой', 'Ann is taller than any other girl in the class.', 'Анна выше любой другой девочки в классе.', 'Tom is faster than [any other runner|any runner of|other any runner].', 'Other обязательно: Ann тоже девочка в классе.', false, 'limit'],
    ['than that of / those of', 'чем у (тот / те)', 'The population of Tokyo is larger than that of London.', 'Население Токио больше, чем население Лондона.', 'The streets here are wider than [those|that|them] in my town.', 'Сравниваем население с населением, а не с Лондоном. Those — для множественного.', false, 'prec'],
    ['than I am / than I do', 'полная часть после than', 'She is more careful than I am. · He drives faster than I do.', 'Она осторожнее меня. · Он водит быстрее меня.', 'She speaks French better than [I do|I am|I does].', 'С be — than I am, с другим глаголом — than I do.', false, 'prec'],
    ['more X than Y', 'скорее X, чем Y', 'He was more tired than angry.', 'Он был скорее уставшим, чем злым.', 'The film was [more sad than|sadder than|more sadder than] funny.', 'Два качества одного предмета — только more: more sad than funny.', false, 'scale'],
  ],
  sup: [
    ['… of the week / year', 'самый за период', 'Monday is the busiest day of the week.', 'Понедельник — самый загруженный день недели.', 'It was the hottest day [of|in|from] the summer.', '', false, 'sup'],
    ['the joint …', 'делят первое место', 'They were the joint fastest in the race.', 'Они разделили первое место в забеге.', 'Two teams were [the joint best|the both best|joint the best] this year.', '', false, 'sup'],
    ['at its best', 'в лучшей форме', 'The city is at its most beautiful in May.', 'Город особенно красив в мае.', 'The garden is [at its best|at the best|in its best] in June.', 'Тот же предмет в разное время — без сравнения с другими.', false, 'art'],
    ['Which is (the) best?', 'the можно опустить', 'Which route is (the) safest?', 'Какой маршрут самый безопасный?', 'Of all the routes, this one is [safest|the safer|most safe of].', 'После глагола-связки the иногда опускают.', false, 'art'],
    ['a most + adj', 'очень (официально)', 'It was a most helpful reply.', 'Это был очень полезный ответ.', 'Thank you for [a most|the most a|a more] interesting talk.', 'A most — не «самый», а «весьма». Most + noun — «большинство»: most people.', false, 'art'],
  ],
  eq: [
    ['just / exactly as … as', 'точно такой же', 'This box is exactly as wide as that one.', 'Эта коробка точно такой же ширины, как та.', 'My bag is [just as heavy as|just heavy as|as just heavy as] yours.', '', false, 'mult'],
    ['almost / nearly as … as', 'почти такой же', 'He’s almost as tall as his father.', 'Он почти такого же роста, как отец.', 'The copy is [nearly as good as|nearly good as|as nearly better as] the original.', '', false, 'mult'],
    ['not quite as … as', 'не совсем такой', 'The flat isn’t quite as big as the photos suggest.', 'Квартира не совсем такая большая, как на фото.', 'It’s [not quite as cheap as|not quite cheaper as|quite not as cheap as] I hoped.', '', false, 'mult'],
    ['nowhere near as … as', 'далеко не такой', 'The sequel is nowhere near as good as the first film.', 'Продолжение и близко не такое хорошее, как первый фильм.', 'My English is [nowhere near as good as|nowhere as good near|not near as better as] yours.', '', false, 'mult'],
    ['half as … as', 'вдвое меньше', 'The new phone is half as heavy as the old one.', 'Новый телефон вдвое легче старого.', 'This ticket is [half as expensive as|half expensive as|as half expensive as] that one.', 'Twice as … as — вдвое больше; half as … as — вдвое меньше.', false, 'mult'],
    ['as + adj + a + noun + as', 'такой же … как', 'It isn’t as good a plan as yours.', 'Это не такой хороший план, как твой.', 'It’s [as practical a solution as|as a practical solution as|a as practical solution as] yours.', 'Порядок: as + прилагательное + a + существительное.', false, 'fixed'],
  ],
  diff: [
    ['considerably / substantially', 'значительно', 'Prices are considerably higher this year.', 'Цены в этом году значительно выше.', 'The new model is [considerably faster|considerable faster|very faster].'],
    ['still', 'ещё (сильнее)', 'The second test was hard, but the third was still harder.', 'Второй тест был трудным, а третий — ещё труднее.', 'Good — but this one is [still better|still more better|still best].'],
    ['2 years older', 'точная разница', 'My sister is two years older than me.', 'Сестра старше меня на два года.', 'The bridge is [ten metres longer|longer ten metres|ten metres more long] than the old one.', 'Число + единица + comparative: ten centimetres taller.'],
    ['marginally / a little', 'чуть-чуть', 'This route is marginally shorter.', 'Этот маршрут чуть-чуть короче.', 'Could you speak [a little louder|a little more loud|little louder]?'],
  ],
  too: [
    ['too … to', 'слишком, чтобы', 'He’s too young to drive.', 'Он слишком молод, чтобы водить.', 'The box is [too heavy to lift|too heavy for lift|very heavy to lift].'],
    ['… enough to', 'достаточно, чтобы', 'She’s old enough to vote.', 'Она достаточно взрослая, чтобы голосовать.', 'Is the water [warm enough to swim|enough warm to swim|warm enough for swim]?'],
    ['… enough for', 'достаточно для', 'The door is wide enough for the piano.', 'Дверь достаточно широка для пианино.', 'The room is [big enough for|big enough to|enough big for] ten people.'],
    ['sufficiently', 'достаточно (официально)', 'The results are sufficiently clear.', 'Результаты достаточно ясны.', 'The plan is not [sufficiently detailed|detailed sufficiently enough|sufficient detailed].'],
    ['so … that / such a … that', 'так …, что', 'It was so cold that we stayed in. · It was such a cold day that we stayed in.', 'Было так холодно, что мы остались дома.', 'It was [such a long film|so long film|such long a film] that I fell asleep.', 'So + прилагательное, such a + прилагательное + существительное.', false, 'fixed'],
  ],
  grad: [
    ['less and less', 'всё менее', 'The bus is less and less reliable.', 'Автобус всё менее надёжен.', 'I find the series [less and less interesting|lesser and lesser interesting|less and more interesting].'],
  ],
  link: [
    ['the more …, the less …', 'чем больше…, тем меньше…', 'The more I read, the less I understand.', 'Чем больше читаю, тем меньше понимаю.', 'The more you spend, [the less you save|less you save|the fewer you save].'],
    ['the sooner, the better', 'чем раньше, тем лучше', 'Call me back — the sooner, the better.', 'Перезвони — чем раньше, тем лучше.', 'Send it [the sooner, the better|sooner, better|the soon, the good].'],
  ],
  less: [
    ['less than + amount', 'меньше чем', 'It takes less than ten minutes.', 'Это занимает меньше десяти минут.', 'It costs [less than|fewer than|lesser than] five pounds.', 'Время, деньги, расстояние — как одно целое: less than ten minutes.'],
    ['the least … of', 'наименее из', 'It’s the least expensive of the three.', 'Это самый недорогой из трёх.', 'This is the [least difficult|less difficult|lesser difficult] of the tasks.'],
  ],
};
const CM_EXTRA_ZONES = [
  ['limit', 'Судейская: границы', 'limit', [
    ['not taller than', 'не выше (≤)', 'He’s not taller than me — maybe the same.', 'Он не выше меня — может, такой же.', 'If A is not taller than B, A is [shorter or the same|always shorter|always taller].', 'Not taller = ниже или такой же. Shorter = строго ниже.'],
    ['no more expensive than', 'не дороже', 'The new model is no more expensive than the old one.', 'Новая модель не дороже старой.', 'This hotel is [no more expensive than|no expensiver than|not more expensiver than] ours.'],
    ['no less … than', 'не менее', 'Trains are no less reliable than planes.', 'Поезда не менее надёжны, чем самолёты.', 'She is [no less talented than|no less talented as|not less talented that] her sister.'],
    ['at least / no less than', 'не меньше (≥)', 'You need at least 30 points to pass.', 'Нужно не меньше 30 баллов, чтобы сдать.', 'Bring [at least|at less|at the least of] two pens.', '30 входит: at least 30 = 30 и больше.'],
    ['at most / no more than', 'не больше (≤)', 'The bag can weigh at most 10 kg.', 'Сумка может весить не больше 10 кг.', 'We have [at most|at the most of|at more] an hour.'],
    ['not any + comparative', 'ничуть не', 'The instructions aren’t any clearer now.', 'Инструкция ничуть не стала понятнее.', 'The traffic isn’t [any better|any best|no better] today.', 'Не двойное отрицание: not any better или no better.'],
  ]],
  ['idiom', 'Крылатые фразы', 'fixed', [
    ['the lesser of two evils', 'меньшее из двух зол', 'Staying at home was the lesser of two evils.', 'Остаться дома было меньшим злом.', 'We chose [the lesser|the less|the least] of two evils.'],
    ['the more, the merrier', 'чем больше, тем веселее', 'Bring your friends — the more, the merrier!', 'Бери друзей — чем больше, тем веселее!', 'Come along! [The more, the merrier|More, merrier|The most, the merriest].'],
    ['as fit as a fiddle', 'здоров как бык', 'At 80, my grandad is as fit as a fiddle.', 'В 80 лет дедушка здоров как бык.', 'Without glasses I’m as blind as [a bat|a bird|the bat].', 'Ещё: as busy as a bee, as cool as a cucumber, as light as a feather.'],
    ['none the wiser', 'ничуть не лучше понимать', 'I read the instructions but I’m none the wiser.', 'Прочитал инструкцию, но понятнее не стало.', 'After his talk we were [none the wiser|none wiser|not the wiser].'],
    ['all the more', 'тем более', 'That makes it all the more important.', 'Тем более это важно.', 'Her success is [all the more impressive|all more impressive|the all more impressive] because she started late.'],
    ['not so much … as', 'не столько …, сколько', 'He wasn’t so much angry as disappointed.', 'Он был не столько зол, сколько разочарован.', 'It’s [not so much a job as|not so much job than|not as much a job than] a hobby.'],
    ['more of a … than', 'скорее …, чем', 'It’s more of a problem than a solution.', 'Это скорее проблема, чем решение.', 'He’s [more of a friend than|more a friend of than|more of friend as] a teacher.'],
    ['superior / preferable to', 'лучше, чем (с to)', 'The new model is superior to the old one.', 'Новая модель лучше старой.', 'Walking is preferable [to|than|from] driving in the city.', 'Senior, junior, superior, inferior, preferable — с to, не с than.', false, 'scale'],
  ]],
];
CM_TOOLS.forEach(t => t[3].push(...(CM_MORE[t[0]] || [])));
CM_TOOLS.splice(CM_TOOLS.length - 1, 0, ...CM_EXTRA_ZONES);

/* ---------- раскладка: стадион ---------- */
// Беговая дорожка: каждая дорожка — способ образования; в ряду — слово на старте (positive),
// на отметке than (comparative) и на финише (superlative). Вокруг — пьедестал, фотофиниш, табло, планка…
const CM_ROW = 100, CM_CHIP_W = 500, CM_CHIP_H = 70;
const CM_ZONE_META = { // название зоны стадиона, эмодзи
  than: ['Забег двоих', '🏃'], sup: ['Пьедестал', '🏅'], eq: ['Фотофиниш', '📸'], diff: ['Табло', '📟'],
  too: ['Прыжок в высоту', '🤸'], limit: ['Судейская: границы', '⚖️'], idiom: ['Крылатые фразы', '📣'], grad: ['Эстафета', '🔁'], link: ['Тренировка', '🏋️'], less: ['В хвосте забега', '🐢'], trap: ['Фальстарт', '🚩'],
};
function cmLayout() {
  const items = [], zones = [], lanes = [];
  const push = it => { it.id = 'c' + items.length; items.push(it); return it; };
  const LX = 120, TOP = 330, GAP = 90, LABEL = 560;
  const SX = LX + LABEL, CX = SX + CM_CHIP_W + 300, FL = CX + CM_CHIP_W + 120, FX = FL + 60, TW = FX + CM_CHIP_W + 100 - LX;
  // дорожка
  let y = TOP + 130;
  CM_STAIRS.forEach(([key, title, how, head, words], li) => {
    const h = Math.max(words.length * CM_ROW + 40, 260);
    lanes.push({ n: li + 1, key, title, how, y, h });
    words.forEach((w, i) => push({ kind: 'stair', lane: li + 1, group: key, groupTitle: title, how, head, x: LX + LABEL - 20, y: y + 20 + i * CM_ROW, w: TW - LABEL + 20, h: CM_ROW, f: w.slice(0, 3), ru: w[3], exC: w[4], exCRu: w[5], exS: w[6], exSRu: w[7], check: w[8], note: w[9] || '' }));
    y += h;
  });
  const track = { x: LX, y: TOP, w: TW, h: y - TOP + 30, SX, CX, FL, FX };
  // зал славы: под дорожкой
  let hy = y + 30 + GAP; const hallY = hy; hy += 170;
  const cellW = (TW - 60) / CM_LIFT.length;
  CM_LIFT.forEach((w, i) => push({ kind: 'lift', head: 'irr', x: LX + 30 + i * cellW, y: hy, w: cellW - 20, h: 470, f: w.slice(0, 3), ru: w[3], exC: w[4], exCRu: w[5], exS: w[6], exSRu: w[7], check: w[8], note: w[9] || '', groupTitle: 'Зал славы' }));
  hy += 500;
  const spW = (TW - 80) / 2;
  CM_SPECIAL.forEach((w, i) => push({ kind: 'special', head: w[11], x: LX + 30 + (i % 2) * (spW + 20), y: hy + Math.floor(i / 2) * 140, w: spW, h: 120, f: w.slice(0, 3), ru: w[3], exC: w[4], exCRu: w[5], exS: w[6], exSRu: w[7], check: w[8], note: w[9] || '', groupTitle: w[11] === 'older' ? 'Older и elder' : 'Составные' }));
  hy += Math.ceil(CM_SPECIAL.length / 2) * 140 + 20;
  zones.push({ kind: 'hall', title: 'Зал славы', sub: 'неправильные формы и особые случаи', icon: '🏆', x: LX, y: hallY, w: TW, h: hy - hallY });
  // приборы стадиона
  const tool = (key, zx, zy, zw) => {
    const [, , head, rows] = CM_TOOLS.find(t => t[0] === key), [title, icon] = CM_ZONE_META[key];
    const deco = key === 'sup' ? 330 : key === 'too' ? 250 : key === 'eq' ? 230 : 0;
    let iy = zy + 170 + deco;
    rows.forEach(r => { push({ kind: 'tool', tool: key, head: r[7] || head, x: zx + 30, y: iy, w: zw - 60, h: 92, name: r[0], ru: r[1], ex: r[2], exRu: r[3], check: r[4], note: r[5] || '', trap: !!r[6], groupTitle: title }); iy += 108; });
    const z = { kind: 'tool', tool: key, title, icon, x: zx, y: zy, w: zw, h: iy - zy + 20, deco }; zones.push(z); return z.h;
  };
  const MX = LX + TW + GAP, NC = 3, cw = 1000, cols = Array(NC).fill(TOP);
  ['sup', 'eq', 'diff', 'than', 'too', 'limit', 'idiom', 'link', 'less', 'grad', 'trap'].forEach(k => { const c = cols.indexOf(Math.min(...cols)); cols[c] += tool(k, MX + c * (cw + 40), cols[c], cw) + 50; });
  const W = MX + NC * cw + (NC - 1) * 40 + 120, H = Math.max(hy, ...cols) + 100;
  return { items, zones, lanes, track, W, H, cols: { LX, MX } };
}
const CM = cmLayout();

/* ---------- отрисовка ---------- */
function cmEsc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); }
function cmSolved(t) { return cmEsc(t).replace(/\[([^|\]]+)(?:\|[^\]]*)?\]/g, '<b>$1</b>'); }
const cmFirst = s => s.split(' / ')[0];
const cmFs = (t, big = 30) => t.length > 22 ? big - 8 : t.length > 16 ? big - 4 : big;
function cmTrack() {
  const t = CM.track, x2 = t.x + t.w;
  const lanes = CM.lanes.map((l, i) => `<g class="cm-lane cm-g-${l.key}">${i ? `<line class="cm-lline" x1="${t.x}" x2="${x2}" y1="${l.y}" y2="${l.y}"/>` : ''}
    <circle class="cm-lnum" cx="${t.x + 76}" cy="${l.y + 82}" r="54"/><text class="cm-lnum-t" x="${t.x + 76}" y="${l.y + 104}" text-anchor="middle">${l.n}</text>
    <text class="cm-ltitle" x="${t.x + 146}" y="${l.y + 100}">${cmEsc(l.title)}</text>
    ${cmWrap(l.how, 20).map((s, k) => `<text class="cm-lhow" x="${t.x + 30}" y="${l.y + 180 + k * 40}">${cmEsc(s)}</text>`).join('')}</g>`).join('');
  const checker = Array.from({ length: Math.ceil((t.h - 130) / 24) }, (_, i) => `<rect x="${t.FL + (i % 2) * 12}" y="${t.y + 130 + i * 24}" width="12" height="24"/><rect x="${t.FL + 24 + ((i + 1) % 2) * 12}" y="${t.y + 130 + i * 24}" width="12" height="24"/>`).join('');
  const head = (x, a, b, cls) => `<text class="cm-th ${cls}" x="${x + CM_CHIP_W / 2}" y="${t.y + 66}" text-anchor="middle">${a}</text><text class="cm-th2" x="${x + CM_CHIP_W / 2}" y="${t.y + 104}" text-anchor="middle">${b}</text>`;
  return `<g class="cm-track"><rect class="cm-tartan" x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" rx="40"/>
    <rect class="cm-trackhead" x="${t.x}" y="${t.y}" width="${t.w}" height="130" rx="40"/><rect class="cm-trackhead" x="${t.x}" y="${t.y + 60}" width="${t.w}" height="70"/>
    <text class="cm-th cm-th-l" x="${t.x + 40}" y="${t.y + 84}">Беговая дорожка</text>
    ${head(t.SX, 'СТАРТ', 'positive', '')}${head(t.CX, '… THAN', 'comparative', '')}${head(t.FX, 'ФИНИШ', 'the … superlative', '')}
    <line class="cm-startline" x1="${t.SX - 30}" x2="${t.SX - 30}" y1="${t.y + 130}" y2="${t.y + t.h}"/>
    <line class="cm-thanline" x1="${t.CX - 40}" x2="${t.CX - 40}" y1="${t.y + 130}" y2="${t.y + t.h}"/>
    <g class="cm-checker">${checker}</g>${lanes}</g>`;
}
function cmWrap(s, n) { const out = []; let cur = ''; s.split(' ').forEach(w => { if ((cur + ' ' + w).trim().length > n && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }); if (cur) out.push(cur); return out; }
function cmStair(it) {
  const t = CM.track, [p, c, s] = it.f, cy = it.y + (CM_ROW - CM_CHIP_H) / 2, my = cy + CM_CHIP_H / 2;
  const chip = (x, txt, i) => `<rect class="cm-step cm-s${i}" x="${x}" y="${cy}" width="${CM_CHIP_W}" height="${CM_CHIP_H}" rx="35"/><text class="cm-w cm-w${i}" x="${x + CM_CHIP_W / 2}" y="${cy + 46}" text-anchor="middle" font-size="${cmFs(txt)}">${cmEsc(txt)}</text>`;
  return `<g class="cm-st cm-g-${it.group}" data-st="${it.id}"><rect class="cm-hit" x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}"/>
    <path class="cm-run" d="M${t.SX + CM_CHIP_W} ${my}H${t.CX}M${t.CX + CM_CHIP_W} ${my}H${t.FX}"/>
    ${chip(t.SX, p, 0)}${chip(t.CX, cmFirst(c), 1)}${chip(t.FX, 'the ' + cmFirst(s), 2)}
    <text class="cm-ru" x="${t.SX + CM_CHIP_W + 30}" y="${my - 14}">${cmEsc(it.ru)}</text><text class="cm-runner" x="${it.x + it.w - 24}" y="${my + 14}" text-anchor="end">🏃</text></g>`;
}
function cmLift(it) {
  const [p, c, s] = it.f, x = it.x, y = it.y, w = it.w, cx = x + w / 2;
  const cup = `<path class="cm-cup" d="M${cx - 70} ${y + 40}h140v40a70 70 0 0 1-140 0z"/><path class="cm-cup-h" d="M${cx - 70} ${y + 56}h-26a26 26 0 0 0 30 44M${cx + 70} ${y + 56}h26a26 26 0 0 1-30 44"/><rect class="cm-cup" x="${cx - 14}" y="${y + 148}" width="28" height="28"/><rect class="cm-cup" x="${cx - 50}" y="${y + 172}" width="100" height="20" rx="6"/>`;
  const rows = [[cmFirst(s), 2, 'the'], [cmFirst(c), 1, ''], [p.split(' / ')[0], 0, '']].map(([txt, i, pre], n) => `<rect class="cm-floor cm-s${i}" x="${x + 16}" y="${y + 214 + n * 80}" width="${w - 32}" height="66" rx="33"/><text class="cm-w cm-w${i}" x="${cx}" y="${y + 214 + n * 80 + 44}" text-anchor="middle" font-size="${txt.length > 9 ? 26 : 30}">${pre ? pre + ' ' : ''}${cmEsc(txt)}</text>`).join('');
  return `<g class="cm-st cm-lift" data-st="${it.id}"><rect class="cm-shaft" x="${x}" y="${y}" width="${w}" height="${it.h}" rx="26"/>${cup}<text class="cm-cup-t" x="${cx}" y="${y + 98}" text-anchor="middle">${cmEsc(p.split(' / ')[0])}</text>${rows}</g>`;
}
function cmSpecial(it) {
  const [p, c, s] = it.f, x = it.x, y = it.y;
  return `<g class="cm-st cm-special" data-st="${it.id}"><rect class="cm-door" x="${x}" y="${y}" width="${it.w}" height="${it.h}" rx="22"/><text class="cm-medal-i" x="${x + 34}" y="${y + 76}">🎖</text>
    <text class="cm-sp-w" x="${x + 100}" y="${y + 54}">${cmEsc(p)} <tspan class="cm-arrow">→</tspan> ${cmEsc(c)} <tspan class="cm-arrow">→</tspan> ${cmEsc(s)}</text>
    <text class="cm-ru" x="${x + 100}" y="${y + 94}">${cmEsc(it.ru)}</text></g>`;
}
function cmTool(it) {
  const ex0 = it.ex.split(' · ')[0], lim = it.w > 1100 ? 56 : 44, ex = ex0.length > lim ? ex0.slice(0, lim - 1).replace(/\s+\S*$/, '') + ' …' : ex0;
  return `<g class="cm-st cm-tool cm-t-${it.tool}${it.trap ? ' cm-trap' : ''}" data-st="${it.id}"><rect class="cm-tag" x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" rx="18"/><rect class="cm-stripe" x="${it.x}" y="${it.y}" width="10" height="${it.h}" rx="5"/>
    <text class="cm-tn" x="${it.x + 32}" y="${it.y + 42}">${cmEsc(it.name)}</text><text class="cm-tr" x="${it.x + 32}" y="${it.y + 74}">${cmEsc(it.ru)}</text>${it.w > 780 ? `<text class="cm-tx" x="${it.x + it.w * 0.46}" y="${it.y + 56}">${cmEsc(ex)}</text>` : ''}</g>`;
}
function cmDeco(z) {
  const x = z.x, y = z.y + 160, w = z.w, cx = x + w / 2;
  if (z.tool === 'sup') {
    const blk = (bx, bh, n, medal, lab) => `<rect class="cm-pod cm-pod${n}" x="${bx}" y="${y + 300 - bh}" width="300" height="${bh}" rx="10"/><text class="cm-pod-n" x="${bx + 150}" y="${y + 300 - bh + 70}" text-anchor="middle">${n}</text><text class="cm-pod-m" x="${bx + 150}" y="${y + 300 - bh - 70}" text-anchor="middle">${medal}</text><text class="cm-pod-l" x="${bx + 150}" y="${y + 300 - bh - 18}" text-anchor="middle">${lab}</text>`;
    return blk(cx - 470, 140, 2, '🥈', 'the second-fastest') + blk(cx - 150, 200, 1, '🥇', 'the fastest') + blk(cx + 170, 100, 3, '🥉', 'one of the fastest');
  }
  if (z.tool === 'eq') return `<rect class="cm-photo" x="${x + 30}" y="${y}" width="${w - 60}" height="200" rx="16"/><line class="cm-photo-l" x1="${cx}" x2="${cx}" y1="${y + 14}" y2="${y + 128}"/>
    <text class="cm-photo-r cm-flip" x="${cx - 100}" y="${y + 96}">🏃</text><text class="cm-photo-r" x="${cx + 4}" y="${y + 96}">🏃</text>
    <text class="cm-photo-t" x="${cx}" y="${y + 170}" text-anchor="middle">Tom is as fast as Ben.</text><text class="cm-photo-s" x="${x + 56}" y="${y + 44}">1/1000 s · photo finish</text>`;
  if (z.tool === 'too') return `<line class="cm-post" x1="${x + 120}" x2="${x + 120}" y1="${y + 20}" y2="${y + 220}"/><line class="cm-post" x1="${x + w - 120}" x2="${x + w - 120}" y1="${y + 20}" y2="${y + 220}"/>
    <line class="cm-bar" x1="${x + 120}" x2="${x + w - 120}" y1="${y + 110}" y2="${y + 110}"/>
    <text class="cm-bar-t cm-bad" x="${cx}" y="${y + 70}" text-anchor="middle">✗ The bar is too high.</text><text class="cm-bar-t cm-good" x="${cx}" y="${y + 170}" text-anchor="middle">✓ She jumps high enough.</text>`;
  return '';
}
function cmZone(z) {
  const head = z.icon ? `<text class="cm-zi" x="${z.x + 34}" y="${z.y + 112}">${z.icon}</text>` : '';
  return `<g class="cm-zone cm-z-${z.kind}${z.tool ? ' cm-t-' + z.tool : ''}"><rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="34"/>${head}<text class="cm-zt" x="${z.x + (z.icon ? 128 : 34)}" y="${z.y + 112}">${cmEsc(z.title)}</text>${z.sub ? `<text class="cm-zs" x="${z.x + z.w - 34}" y="${z.y + 76}" text-anchor="end">${cmEsc(z.sub)}</text>` : ''}<g class="cm-deco">${cmDeco(z)}</g></g>`;
}
function comparisonMapSvg() {
  const { W, H, cols } = CM;
  const fascia = `<g class="cm-fascia"><rect x="${cols.LX}" y="60" width="${W - 2 * cols.LX}" height="200" rx="40"/>
    <text class="cm-fa-ic" x="${cols.LX + 50}" y="196">🏟</text>
    <text class="cm-fa-h" x="${cols.LX + 190}" y="186">Стадион сравнений</text>
    <text class="cm-fa-t" x="${W - cols.LX - 60}" y="142" text-anchor="end">Каждое слово бежит свой забег: старт → than → финиш.</text>
    <text class="cm-fa-t" x="${W - cols.LX - 60}" y="186" text-anchor="end">Неправильные — в Зале славы, вокруг — пьедестал, фотофиниш и табло.</text></g>`;
  const body = CM.items.map(it => it.kind === 'stair' ? cmStair(it) : it.kind === 'lift' ? cmLift(it) : it.kind === 'special' ? cmSpecial(it) : cmTool(it)).join('');
  return `<svg class="cm-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Карта правила: стадион степеней сравнения">${fascia}${cmTrack()}${CM.zones.map(cmZone).join('')}${body}</svg>`;
}
function comparisonMapHtml() {
  const modes = `<span class="cm-modes" role="group" aria-label="Режим карты">${[["all", "👁", "Всё"], ["hide", "🙈", "Закрыть финиш"], ["trap", "🚩", "Фальстарт"], ["game", "🎮", "Игры"]].map(([m, i, t], n) => `<button type="button" data-cm-mode="${m}" aria-pressed="${!n}" title="${t}"><i aria-hidden="true">${i}</i><span>${t}</span></button>`).join("")}</span>`;
  const search = `<label class="cm-search"><span class="sr-only">Найти слово на карте</span><i class="cm-s-ic" aria-hidden="true">🔍</i><input type="search" placeholder="Найти: good, дешёвый, as … as…" autocomplete="off" spellcheck="false"><span class="nc-results cm-results" hidden></span></label>`;
  return `<section class="cm-wrap" id="comparison-stadium" aria-labelledby="cm-title">
    <div class="cm-head"><div><p class="eyebrow">Карта правила</p><h2 id="cm-title">Стадион сравнений</h2><p>Каждое прилагательное бежит забег: со старта (big) через отметку than (bigger) к финишу (the biggest). Нажмите на забег, чтобы увидеть примеры и проверить себя.</p></div>
      <ul class="cm-key"><li class="cm-k0">старт · positive</li><li class="cm-k1">than · comparative</li><li class="cm-k2">финиш · superlative</li></ul></div>
    ${noeonCanvasShell('cm-canvas', 'Карта правила «Стадион сравнений». Перетаскивайте, масштабируйте колесом или щипком', search + modes, 'Тяните карту · колесо или щипок — масштаб · нажмите на забег')}
  </section>`;
}

/* ---------- карточка ---------- */
function cmShuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function cmCheck(text) {
  const m = text && text.match(/\[([^\]]+)\]/); if (!m) return '';
  const opts = m[1].split('|');
  return `<div class="cm-check"><p class="cm-ch-h">Проверьте себя</p><p class="cm-ch-q">${cmEsc(text.replace(m[0], '___')).replace('___', '<span class="cm-gap">___</span>')}</p><div class="cm-ch-o">${cmShuffle(opts).map(o => `<button type="button"${o === opts[0] ? ' data-ok' : ''}>${cmEsc(o)}</button>`).join('')}</div></div>`;
}
function cmPanelHtml(id) {
  const it = CM.items[+id.slice(1)];
  const rule = `<a class="cm-rule" href="#theory/comparison" data-cm-rule="${cmEsc(CM_HEAD[it.head] || '')}">Подробно в правиле →</a>`;
  const note = it.note ? `<p class="${it.trap ? 'cm-trapnote' : 'cm-note'}">${it.trap ? '<b>Ловушка.</b> ' : ''}${cmEsc(it.note).replace(/\*([^*]+)\*/g, '<s>$1</s>')}</p>` : '';
  const ex = (e, r) => `<li><span class="cm-ex">${cmSolved(e)}</span><span class="cm-ru2">${cmEsc(r)}</span></li>`;
  if (it.kind === 'tool') {
    return `<header><span class="cm-badge cm-t-${it.tool}">${cmEsc(it.groupTitle)}</span><h3>${cmEsc(it.name)}</h3><p class="cm-pat">${cmEsc(it.ru)}</p></header><ul class="cm-exs">${ex(it.ex, it.exRu)}</ul>${note}${cmCheck(it.check)}${rule}`;
  }
  const [p, c, s] = it.f;
  const ladder = `<ol class="cm-ladder"><li class="cm-k0"><small>старт · positive</small><b>${cmEsc(p)}</b></li><li class="cm-k1"><small>than · comparative</small><b>${cmEsc(c)}</b></li><li class="cm-k2"><small>финиш · superlative</small><b>the ${cmEsc(s)}</b></li></ol>`;
  const how = it.kind === 'stair' ? `<p class="cm-how"><b>Дорожка ${it.lane} · ${cmEsc(it.groupTitle)}</b> — ${cmEsc(it.how)}</p>` : it.kind === 'lift' ? '<p class="cm-how"><b>Зал славы</b> — неправильная форма, её нужно запомнить.</p>' : '';
  return `<header><span class="cm-badge cm-b-${it.kind}">${it.kind === 'stair' ? `дорожка ${it.lane}` : it.kind === 'lift' ? '🏆 зал славы' : '🎖 особый случай'}</span><h3>${cmEsc(p)}</h3><p class="cm-pat">${cmEsc(it.ru)}</p></header>${ladder}${how}<ul class="cm-exs">${ex(it.exC, it.exCRu)}${ex(it.exS, it.exSRu)}</ul>${note}${cmCheck(it.check)}${rule}`;
}

/* ---------- запуск ---------- */
// Подписи-ориентиры поверх карты: видны при отдалении, нажатие — перелёт к зоне.
function cmLabels() {
  const t = CM.track, out = [
    { x: t.x + t.w / 2, y: t.y + t.h / 2, text: '🏃 Беговая дорожка', maxK: 0.13, fx: t.x + t.w / 2, fy: t.y + 900, k: 0.2, cls: 'cm-lab-big' },
    { x: CM.cols.MX + 1540, y: (CM.track.y + CM.H) / 2, text: '🏟 Конструкции', maxK: 0.13, fx: CM.cols.MX + 1540, fy: t.y + 1000, k: 0.2, cls: 'cm-lab-big' },
  ];
  out.push({ x: CM.track.x + CM.track.w / 2, y: CM.track.y + CM.track.h + 300, text: '🏆 Зал славы', maxK: 0.1, fx: CM.track.x + CM.track.w / 2, fy: CM.track.y + CM.track.h + 400, k: 0.3, fitW: CM.track.w + 60, cls: 'cm-lab-hall cm-lab-big' });
  return out;
}
let comparisonMapAbort = null;
function initialiseComparisonMap(root) {
  const box = root.querySelector('#cm-canvas'); if (!box) return;
  comparisonMapAbort?.abort(); comparisonMapAbort = new AbortController(); const signal = comparisonMapAbort.signal;
  window.addEventListener('hashchange', () => { if (!box.isConnected) comparisonMapAbort?.abort(); }, { signal });
  const world = box.querySelector('.nc-world'); world.innerHTML = comparisonMapSvg();
  box.querySelector('.nc-mini-art').innerHTML = `<svg viewBox="0 0 ${CM.W} ${CM.H}"><rect class="cm-mini cm-mini-track" x="${CM.track.x}" y="${CM.track.y}" width="${CM.track.w}" height="${CM.track.h}" rx="40"/>${CM.zones.map(z => `<rect class="cm-mini cm-z-${z.kind}${z.tool ? ' cm-t-' + z.tool : ''}" x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="40"/>`).join('')}</svg>`;
  const panel = document.createElement('aside'); panel.className = 'nc-panel cm-panel'; panel.hidden = true; panel.setAttribute('aria-live', 'polite'); box.append(panel);
  const game = document.createElement('div'); game.className = 'nc-ui cm-game'; game.hidden = true; box.append(game);
  const svg = world.querySelector('svg');
  const mobile = () => box.clientWidth < 700;
  const panelSpace = () => panel.hidden ? {} : mobile() ? { bottom: panel.offsetHeight } : { right: panel.offsetWidth + 16 };
  const bump = el => { if (!el) return; el.classList.remove('cm-jump'); void el.getBBox(); el.classList.add('cm-jump'); };
  const open = (id, fly = true) => {
    svg.querySelectorAll('.cm-st.is-on').forEach(n => n.classList.remove('is-on'));
    const el = svg.querySelector(`[data-st="${id}"]`); el?.classList.add('is-on'); bump(el);
    panel.innerHTML = `<button type="button" class="cm-close" aria-label="Закрыть">✕</button>${cmPanelHtml(id)}`; panel.hidden = false; panel.scrollTop = 0;
    if (fly) { const it = CM.items[+id.slice(1)], wide = it.kind === 'stair'; api.flyTo(it.x + it.w / 2, it.y + it.h / 2, wide ? (mobile() ? 0.24 : 0.4) : Math.min(Math.max(api.v.k, mobile() ? 0.55 : 0.7), (box.clientWidth - 16) / (it.w + 40)), panelSpace()); }
  };
  const close = () => { panel.hidden = true; svg.querySelectorAll('.cm-st.is-on').forEach(n => n.classList.remove('is-on')); };
  const game$ = { on: false, kind: null, answered: false };
  let lodT = 0, lodT0 = 0;
  const api = initialiseNoeonCanvas(box, {
    W: CM.W, H: CM.H, signal, minK: 0.05, maxK: 1.6, labels: cmLabels(),
    // Уровень детализации меняем после остановки жеста: переключение во время щипка вызывает пересчёт всей карты.
    onZoom: k => { clearTimeout(lodT); lodT = setTimeout(() => { const lo = k < 0.3, ti = k < 0.16; if (box.classList.contains('lod-low') !== lo) box.classList.toggle('lod-low', lo); if (box.classList.contains('lod-tiny') !== ti) box.classList.toggle('lod-tiny', ti); }, lodT0 ? 220 : 0); lodT0 = 1; },
    onTap: e => {
      const st = e.target?.closest?.('[data-st]');
      if (st) { if (game$.on && game$.kind && !game$.answered) return;
        // В режиме «Закрыть формы» первое нажатие на ступень открывает её, как карточку-флешкарту.
        const step = e.target?.closest?.('.cm-step,.cm-floor');
        if (box.classList.contains('cm-mode-hide') && !st.classList.contains('cm-shown')) { st.classList.add('cm-shown'); bump(st); return; }
        open(st.dataset.st); }
      else if (!panel.hidden) close();
    },
    start: ({ v, apply, fit, box: b }) => { if (b.clientWidth < 700) { v.k = 0.14; v.x = -CM.cols.LX * 0.14 + 8; v.y = 60 - CM.track.y * 0.14; apply(); } else fit(); },
  });
  panel.addEventListener('click', e => {
    if (e.target.closest('.cm-close')) { close(); return; }
    const opt = e.target.closest('.cm-ch-o button');
    if (opt) { const c = opt.closest('.cm-check'); if (c.classList.contains('done')) return; const ok = opt.hasAttribute('data-ok'); c.classList.add('done', ok ? 'ok' : 'bad');
      c.querySelectorAll('button').forEach(b => { b.disabled = true; if (b.hasAttribute('data-ok')) b.classList.add('right'); }); if (!ok) opt.classList.add('wrong');
      c.querySelector('.cm-gap').textContent = c.querySelector('[data-ok]').textContent; return; }
    const rule = e.target.closest('[data-cm-rule]');
    if (rule) { e.preventDefault(); if (api.isFull()) box.querySelector('[data-nc-full]').click();
      const h = [...document.querySelectorAll('.theory-content h2')].find(x => x.textContent.trim() === rule.dataset.cmRule);
      (h || document.querySelector('.theory-content article'))?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }, { signal });
  // поиск
  const input = box.querySelector('.cm-search input'), results = box.querySelector('.cm-results');
  const norm = s => String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/[’']/g, '\'').replace(/…/g, '...').trim();
  const label = it => it.kind === 'tool' ? it.name : it.f[0];
  const words = it => it.kind === 'tool' ? [it.name, it.ru] : [...it.f, it.ru];
  input.addEventListener('input', () => {
    const q = norm(input.value).replace(/\.\.\./g, ''); if (!q) { results.hidden = true; return; }
    const hits = CM.items.filter(it => words(it).some(w => norm(w).replace(/\.\.\./g, '').includes(q))).slice(0, 9);
    results.innerHTML = hits.length ? hits.map(h => `<button type="button" data-go="${h.id}"><b>${cmEsc(label(h))}</b><small>${cmEsc(h.kind === 'tool' ? h.groupTitle : h.f.slice(1).join(' · '))}</small></button>`).join('') : '<span class="cm-none">Нет на карте</span>';
    results.hidden = false;
  }, { signal });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') results.querySelector('[data-go]')?.click(); if (e.key === 'Escape') { input.value = ''; results.hidden = true; } }, { signal });
  results.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (!b) return; results.hidden = true; input.blur(); open(b.dataset.go); }, { signal });

  /* ---------- игры ---------- */
  // «Забег»: вы против бота. Верный ответ — шаг вперёд; бот бежит сам. «Табло»: выбрать конструкцию.
  const stairs = CM.items.filter(it => it.kind === 'stair' || it.kind === 'lift');
  const tools = CM.items.filter(it => it.kind === 'tool');
  const wrongForms = (it, deg) => {
    const p = it.f[0].split(' / ')[0], right = cmFirst(it.f[deg]);
    const pool = deg === 1 ? [p + 'er', 'more ' + p, 'more ' + right, p + 'r', right + 'er', 'most ' + p] : ['most ' + p, p + 'est', 'most ' + right, 'more ' + p, right + 'est', cmFirst(it.f[1])];
    return cmShuffle([...new Set(pool.filter(w => w !== right && !it.f[deg].split(' / ').includes(w)))]).slice(0, 2);
  };
  const GAMES = {
    race: { title: 'Забег', icon: '🏃', about: 'обгоните соперника: 10 вопросов', pool: () => stairs,
      ask: it => { const deg = Math.random() < .5 ? 1 : 2, right = cmFirst(it.f[deg]); const word = it.f[0].split(' / ')[0];
        return { q: deg === 1 ? `<b>${cmEsc(word)}</b> → сравнительная?` : `<b>${cmEsc(word)}</b> → превосходная? <small>the …</small>`, opts: cmShuffle([right, ...wrongForms(it, deg)]), right, why: `${it.f[0]} → ${it.f[1]} → the ${it.f[2]}`, open: it.id }; } },
    board: { title: 'Табло', icon: '📟', about: 'than, as … as, too, enough…', pool: () => tools,
      ask: it => { const m = it.check.match(/\[([^\]]+)\]/), opts = m[1].split('|');
        return { q: cmEsc(it.check.replace(m[0], '___')).replace('___', '<span class="cm-gap">___</span>'), opts: cmShuffle(opts), right: opts[0], why: `${it.name} — ${it.ru}`, open: it.id }; } },
  };
  const best = { get: k => { try { return +localStorage.getItem('cm-best-' + k) || 0; } catch { return 0; } }, set: (k, v) => { try { localStorage.setItem('cm-best-' + k, v); } catch {} } };
  const menu = () => { game$.kind = null; close();
    game.innerHTML = `<p class="cm-g-h">Игры на стадионе</p><div class="cm-g-menu">${Object.entries(GAMES).map(([k, g]) => `<button type="button" data-game="${k}"><span class="cm-g-ic" aria-hidden="true">${g.icon}</span><span><b>${g.title}</b><small>${g.about}${best.get(k) ? ` · рекорд ${best.get(k)}/10` : ''}</small></span></button>`).join('')}</div><button type="button" class="cm-g-end">Выйти из игр</button>`; };
  const okN = () => game$.log.filter(r => r.ok).length;
  const race = () => `<div class="cm-race" aria-hidden="true"><div class="cm-rl"><span>Вы</span><i><b style="left:${okN() * 10}%">🏃</b></i></div><div class="cm-rl cm-bot"><span>Бот</span><i><b style="left:${game$.bot * 10}%">🤖</b></i></div></div>`;
  const ask = () => { const G = GAMES[game$.kind], it = game$.list[game$.i], q = G.ask(it); game$.q = q; game$.answered = false;
    game.innerHTML = `<div class="cm-g-top"><p class="cm-g-h">${G.icon} ${G.title}</p><p class="cm-g-n">${game$.i + 1} / ${game$.list.length}</p></div>${game$.kind === 'race' ? race() : `<div class="cm-g-bar"><i style="width:${game$.i * 10}%"></i></div>`}<p class="cm-g-q">${q.q}</p><div class="cm-g-o">${q.opts.map(o => `<button type="button" data-g="${cmEsc(o)}">${cmEsc(o)}</button>`).join('')}</div>`;
    game.classList.remove('cm-shake', 'cm-pop'); };
  const finish = () => { const G = GAMES[game$.kind], ok = game$.log.filter(r => r.ok).length, rec = ok > best.get(game$.kind); if (rec) best.set(game$.kind, ok);
    const place = game$.kind !== 'race' ? (ok >= 9 ? 1 : ok >= 7 ? 2 : ok >= 5 ? 3 : 4) : ok > game$.bot ? 1 : ok === game$.bot ? 2 : 3;
    const medal = ['', '🥇', '🥈', '🥉', '🏁'][place];
    const verdict = game$.kind === 'race' ? (place === 1 ? `Вы первый! Бот: ${game$.bot}.` : place === 2 ? `Фотофиниш: ${ok} — ${game$.bot}. Вы as fast as бот!` : `Бот был faster: ${game$.bot}. Реванш?`) : (place === 1 ? 'Чемпион табло!' : place <= 3 ? 'Вы на пьедестале.' : 'Ещё один забег — и на пьедестал.');
    game.innerHTML = `<div class="cm-podium"><p class="cm-medal">${medal}</p><p class="cm-score"><b>${ok}</b> из 10</p><p>${rec ? 'Новый рекорд! ' : ''}${verdict}</p>${game$.log.filter(r => !r.ok).map(r => `<p class="cm-miss">✗ ${cmEsc(r.why)}</p>`).join('')}</div><div class="cm-g-o"><button type="button" class="cm-g-again">Ещё раз</button><button type="button" class="cm-g-menu-b">Другая игра</button></div>`; };
  const startGame = k => { game$.kind = k; game$.list = cmShuffle(GAMES[k].pool()).slice(0, 10); game$.i = 0; game$.log = []; game$.bot = 0; close(); ask(); };
  game.addEventListener('click', e => {
    if (e.target.closest('.cm-g-end')) { setMode('all'); return; }
    const pick = e.target.closest('[data-game]'); if (pick) { startGame(pick.dataset.game); return; }
    if (e.target.closest('.cm-g-again')) { startGame(game$.kind); return; }
    if (e.target.closest('.cm-g-menu-b')) { menu(); return; }
    if (e.target.closest('.cm-g-next')) { game$.i++; close(); if (game$.i >= game$.list.length) finish(); else ask(); return; }
    const b = e.target.closest('[data-g]'); if (!b || game$.answered) return;
    const q = game$.q, ok = b.dataset.g === q.right; game$.answered = true; game$.log.push({ ok, why: q.why });
    game.querySelectorAll('[data-g]').forEach(x => { x.disabled = true; if (x.dataset.g === q.right) x.classList.add('right'); });
    if (ok) { b.classList.add('right'); game.classList.add('cm-pop'); } else { b.classList.add('wrong'); game.classList.add('cm-shake'); try { navigator.vibrate?.(30); } catch {} }
    if (game$.kind === 'race') { if (Math.random() < 0.72) game$.bot++; const l = game.querySelector('.cm-race'); if (l) l.outerHTML = race(); }
    game.insertAdjacentHTML('beforeend', `<p class="cm-g-r ${ok ? 'ok' : 'bad'}">${ok ? '✓ Верно' : '✗ Нет'}: ${cmEsc(q.why)}</p><button type="button" class="cm-g-next">${game$.i + 1 < game$.list.length ? 'Дальше →' : 'Итог'}</button>`);
    open(q.open);
  }, { signal });
  const setMode = m => {
    box.querySelectorAll('[data-cm-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cmMode === m)));
    box.classList.toggle('cm-mode-hide', m === 'hide'); box.classList.toggle('cm-mode-trap', m === 'trap');
    svg.querySelectorAll('.cm-shown').forEach(n => n.classList.remove('cm-shown'));
    game$.on = m === 'game'; game.hidden = !game$.on; box.classList.toggle('cm-mode-game', game$.on);
    if (game$.on) menu(); else game$.answered = false;
    if (m === 'hide') api.say('Нажмите на забег, чтобы открыть финиш');
  };
  box.addEventListener('click', e => { const m = e.target.closest('[data-cm-mode]'); if (m) setMode(m.dataset.cmMode); }, { signal });
  box.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { e.stopPropagation(); close(); } }, { signal, capture: true });
  return api;
}
