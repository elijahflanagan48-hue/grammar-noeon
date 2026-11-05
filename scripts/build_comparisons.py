"""Build original comparison exercises using the shared exercise schema.

Source verification and provenance are kept in docs/review, outside public assets.
Reapply the versioned editorial pass to derived tense records only.
Never overwrite source materials or the learner's stored attempt snapshots.
"""
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
from automatic_practice import VERSIONS, revise as require_automatic
VERSION=VERSIONS['comparison']
ITEMS = []
RULES = {
    'forms': ('cmp_forms', 'формы-и-орфография', 'Выбор -er/-est или more/most зависит от формы прилагательного; два способа одновременно не используются.'),
    'variants': ('cmp_forms', 'два-слога-и-варианты', 'У ряда двухсложных прилагательных допустимы обе модели; выбранный вариант должен соответствовать контексту.'),
    'irregular': ('cmp_forms', 'неправильные-формы', 'Good, bad и far имеют неправильные сравнительные и превосходные формы.'),
    'elder': ('cmp_precision', 'older-и-elder', 'Older подходит для сравнения возраста с than; elder обычно стоит перед существительным и описывает семейные отношения.'),
    'far': ('cmp_precision', 'farther-и-further', 'Для расстояния допустимы farther и further; в значении «дополнительный» употребляется further.'),
    'than': ('cmp_equality', 'сравнительная-степень-и-than', 'Второй участник сравнения вводится than; при понятной точке отсчёта эту часть можно опустить.'),
    'group': ('cmp_superlatives', 'превосходная-степень-и-группа', 'Превосходная степень выделяет предмет внутри группы; формальное сравнение двух использует comparative.'),
    'articles': ('cmp_superlatives', 'артикли-и-определители', 'Обычно нужен the, но притяжательный определитель его заменяет; после one of нужно множественное число.'),
    'equal': ('cmp_equality', 'равенство-и-неравенство', 'В as … as используется положительная форма; not as … as показывает меньшую степень признака.'),
    'less': ('cmp_equality', 'less-и-least', 'Less обозначает меньшую степень, least — наименьшую в группе; это не утверждение об абсолютной величине.'),
    'modifiers': ('cmp_development', 'насколько-велика-разница', 'Much/far усиливают comparative; slightly/a little смягчают разницу; by far/easily усиливают superlative.'),
    'ratio': ('cmp_development', 'модификаторы-равенства-и-кратность', 'Twice as … as задаёт отношение 2:1; half as … as — 1:2. Almost, just и nowhere near передают разные степени сходства.'),
    'change': ('cmp_development', 'постепенное-изменение', 'Нарастание признака: -er and -er или more and more + adjective; than после этой модели не добавляется.'),
    'parallel': ('cmp_development', 'связанные-изменения', 'The + comparative …, the + comparative … связывает изменение двух признаков; вопросительная инверсия не нужна.'),
    'precision': ('cmp_precision', 'точность-сравнения-и-пропуски', 'Сравнивайте однотипные величины; that/those и притяжательные местоимения заменяют повторяющиеся существительные.'),
    'logic': ('cmp_precision', 'отрицание-и-логические-границы', 'Not taller than допускает равенство; shorter than требует меньшей высоты. Other исключает самого участника из сравнения.'),
    'scale': ('cmp_precision', 'пределы-шкалы-и-контекст', 'Возможность сравнения зависит от значения и контекста; у лексических моделей вроде superior to собственное управление.'),
    'compound': ('cmp_forms', 'составные-прилагательные', 'Составные прилагательные проверяются как целые слова: better-informed или more well-informed; нельзя удваивать comparative.'),
    'threshold': ('cmp_equality', 'too-и-enough', 'Too + положительная форма означает избыток; adjective + enough — достаточность, enough + noun — достаточное количество.'),
    'idioms': ('cmp_precision', 'устойчивые-сравнения', 'Устойчивые обороты изучаются целиком; the lesser of two evils означает меньший из двух нежелательных вариантов.'),
}

def item(level, kind, prompt, rule, reason):
    target, anchor, general = RULES[rule]
    result = dict(id=f'cmp-{len(ITEMS)+1:04d}', type=kind, prompt=prompt,
                  cefr_estimate=level, topic='comparison', content_version=VERSION,
                  practice_tenses=[target], tags=[target],
                  explanation_ru=reason + ' ' + general,
                  rule_refs=[f'content/comparison/06-comparison.md#{anchor}'])
    ITEMS.append(result)
    return result

def choice(level, prompt, options, rule, reason, correct=0):
    result=item(level,'meaning_choice' if rule in ('logic','scale','ratio','precision') else 'multiple_choice',prompt,rule,reason)
    # Rotate the key deterministically: the right answer is not always first.
    offset=len(ITEMS)%len(options)
    ordered=options[offset:]+options[:offset]
    index=(correct-offset)%len(options)
    result.update(options=ordered,correct_option_index=index,answer=ordered[index])

def written(level, kind, prompt, answers, rule, reason):
    result=item(level,kind,prompt,rule,reason)
    result.update(answer=answers[0],accepted_answers=answers,answer_text=answers[0])

# Unique, contextualised morphology practice. The article and comparison partner
# are visible; learners supply only the adjective form, never an invented noun.
PARADIGMS = [
('A1','tall','taller','tallest','At 180 cm, Leo is (tall) than Tom, who is 170 cm.','Of the four players, Leo is the (tall).'),
('A1','short','shorter','shortest','The blue rope is 2 m long; the red one is 3 m. The blue rope is (short).','These ropes measure 1, 2 and 3 m. The 1 m rope is the (short).'),
('A1','small','smaller','smallest','The travel bag is (small) than the suitcase.','Of the three bags, the tiny green one is the (small).'),
('A1','long','longer','longest','Route A is 8 km and route B is 5 km. Route A is (long).','The paths are 2, 4 and 9 km long. The 9 km path is the (long).'),
('A1','old','older','oldest','Mia is 12 and Kim is 10. Mia is (old) than Kim.','The children are 6, 8 and 11. The eleven-year-old is the (old).'),
('A1','young','younger','youngest','My brother is 9 and I am 13. He is (young) than me.','Of the five cousins, the baby is the (young).'),
('A1','cheap','cheaper','cheapest','This pen costs £1; that one costs £3. This one is (cheap).','The notebooks cost £2, £4 and £6. The £2 notebook is the (cheap).'),
('A1','cold','colder','coldest','Today it is 2°C; yesterday it was 8°C. Today is (cold).','Of the three days, the day with a temperature of −5°C was the (cold).'),
('A1','warm','warmer','warmest','It is 20°C in this room and 16°C outside. This room is (warm).','The rooms are 18°C, 20°C and 23°C. The 23°C room is the (warm).'),
('A1','fast','faster','fastest','This train takes one hour; the bus takes two. The train is (fast).','Of the four runners, the winner was the (fast).'),
('A1','slow','slower','slowest','The old lift takes a minute; the new one takes thirty seconds. The old lift is (slow).','Of the three lifts, the one taking two minutes is the (slow).'),
('A1','new','newer','newest','This model came out this year; that one came out last year. This model is (new).','Of these three editions, the one published this morning is the (new).'),
('A2','large','larger','largest','This hall holds 300 people; that one holds 100. This hall is (large).','Of the four halls, the 500-seat hall is the (large).'),
('A2','nice','nicer','nicest','The second host was (nice) than the first: she greeted everyone warmly.','Of all the hosts we met, Jo was the (nice).'),
('A2','wide','wider','widest','This door is 90 cm wide; that one is 70 cm. This door is (wide).','The gates are 1, 2 and 3 m wide. The 3 m gate is the (wide).'),
('A2','safe','safer','safest','The fenced path is (safe) than the busy road for children.','Of the three routes, the pedestrian path is the (safe).'),
('A2','big','bigger','biggest','The family tent is (big) than the one-person tent.','Of the tents on display, the eight-person one is the (big).'),
('A2','hot','hotter','hottest','Today it is 30°C and yesterday it was 25°C. Today is (hot).','At 35°C, Friday was the (hot) day of that week. Only the temperature is being compared.'),
('A2','thin','thinner','thinnest','This sheet is 1 mm thick and that one is 3 mm. This sheet is (thin).','Of the five sheets, the 0.5 mm one is the (thin).'),
('A2','heavy','heavier','heaviest','The grey box weighs 12 kg and the white one weighs 7 kg. The grey box is (heavy).','At 20 kg, this is the (heavy) of the four boxes.'),
('A2','easy','easier','easiest','The first puzzle needed five steps; this one needs only one. This one is (easy).','Of the six puzzles, the one labelled beginner is the (easy).'),
('A2','happy','happier','happiest','After hearing the good news, Nina felt (happy) than before.','Nina says the day she adopted her cat was the (happy) day of her childhood.'),
('A2','busy','busier','busiest','The café served 200 people today and 50 yesterday. Today it was (busy).','With 400 customers, Saturday was the (busy) day of that week.'),
('A2','good','better','best','My second mark was 90%; my first was 60%. My second result was (good).','Of my five scores, 98% was the (good).'),
('A2','bad','worse','worst','The new leak is (bad) than the old one: the whole floor is wet.','Of the four leaks, the one in the kitchen is the (bad).'),
('B1','expensive','more expensive','most expensive','The leather case costs £80 and the cloth one costs £20. The leather one is (expensive).','Of the five cases, the £120 case is the (expensive).'),
('B1','comfortable','more comfortable','most comfortable','This padded chair is (comfortable) than the hard stool.','Of the three chairs I tested, the padded armchair was the (comfortable).'),
('B1','interesting','more interesting','most interesting','To me, the chapter about space was (interesting) than the chapter about filing.','For our reading group, this was the (interesting) of the five chapters.'),
('B1','careful','more careful','most careful','After the accident, the driver became (careful) than before.','Of the four drivers, Jo is the (careful), according to their instructor.'),
('B1','useful','more useful','most useful','For finding this address, a street map is (useful) than a weather chart.','Of the tools in this kit, the torch is the (useful) during a power cut.'),
('B1','reliable','more reliable','most reliable','After repairs, this printer is (reliable) than before.','Of the six printers tested, this was the (reliable).'),
('B1','quiet','quieter|more quiet','quietest|most quiet','After midnight the street is (quiet) than at noon.','Of the rooms we visited, the room at the back was the (quiet).'),
('B1','narrow','narrower|more narrow','narrowest|most narrow','At 2 m, this lane is (narrow) than the 4 m lane.','Of the lanes on this map, the 1 m lane is the (narrow).'),
('B1','simple','simpler|more simple','simplest|most simple','The one-button design is (simple) than the version with twenty controls.','Of the three designs, the one-button version is the (simple).'),
('B1','clever','cleverer|more clever','cleverest|most clever','The second solution is (clever) than the first: it solves two problems at once.','The judges called this the (clever) of the five solutions.'),
('B1','far','farther|further','farthest|furthest','The next village is (far) away than the farm.','Of the three villages, the one beyond the hills is the (far) away.'),
]

def morphology():
    for level, adjective, comparative, superlative, first, second in PARADIGMS:
        rule='irregular' if adjective in ('good','bad','far') else 'variants' if '|' in comparative else 'forms'
        for prompt, forms, degree in [(first,comparative,'сравнительная'),(second,superlative,'превосходная')]:
            answers=forms.split('|')
            if rule == 'forms' and not comparative.startswith('more '):
                prompt = 'Используйте форму с -er или -est: ' + prompt
            result=item(level,'open_brackets',prompt,rule,f'Здесь нужна {degree} степень слова {adjective}: {" / ".join(answers)}. Вводится только форма, слова вне скобок уже даны.')
            result['blanks']=[dict(id=result['id']+'-b1',base_adjective=adjective,answer=answers[0],accepted_answers=answers,rule_refs=result['rule_refs'],explanation_ru=result['explanation_ru'])]
            result['answer_text']=re.sub(r'\([^)]*\)',answers[0],prompt)

CHOICES = [
('A1','I am 15; my sister is 12. I am ___ than my sister.',['older','oldest','youngest'],'than','Сравнивается возраст: 15 больше 12.'),
('A1','The table is ___ than the shelf. Choose the standard comparative of big.',['bigger','more bigger','biggest'],'forms','Big удваивает g и получает -er.'),
('A1','The three bags cost £5, £10 and £20. The £5 bag is the ___.',['cheapest','cheaper','cheap'],'group','Нужно выделить один предмет среди трёх.'),
('A1','This is a ___ room than ours.',['smaller','smallest','more smaller'],'forms','Сравнительная форма small — smaller.'),
('A1','The blue pencil is longer ___ the red one.',['than','then','as'],'than','Для второго участника требуется than, не then.'),
('A1','Choose the superlative of long.',['longest','longer','more long'],'forms','Превосходная форма — longest; артикль добавляется в предложении.'),
('A2','This lesson is ___ than yesterday\'s. Use good.',['better','gooder','best'],'irregular','Сравнительная степень good — better.'),
('A2','My bag is as ___ as yours.',['heavy','heavier','heaviest'],'equal','Рамка as … as требует heavy, а не heavier.'),
('A2','Choose the complete phrase.',['my best friend','my the best friend','the my best friend'],'articles','My заменяет the в позиции определителя.'),
('A2','This is one of the nicest ___ in the town.',['cafés','café','a café'],'articles','После one of нужно множественное число.'),
('A2','There are four rooms. This is the ___ comfortable one.',['most','more','much'],'group','Выделяется самый комфортный из четырёх.'),
('A2','The red bag weighs 3 kg; the blue one weighs 6 kg. The red one is ___.',['lighter','heavier','the heaviest'],'than','Меньшая масса означает lighter.'),
('B1','The ticket is £30 instead of £100. It is ___ cheaper.',['much','very','many'],'modifiers','Much усиливает cheaper; very перед comparative не подходит.'),
('B1','The station is 4 km away; the park is 2 km away. The station is ___. Choose the answer accepting both distance forms.',['farther or further away','only further away; farther is always wrong','only farther away; further is always wrong'],'far','Для физического расстояния обе формы нормативны.'),
('B1','Please contact us for ___ information.',['further','farther','farthest'],'far','Значение «дополнительный», не физическое расстояние.'),
('B1','My sister is two years ___ than me.',['older','elder','eldest'],'elder','Перед than в таком сравнении возраста требуется older.'),
('B1','Of all the routes, this is the least ___.',['dangerous','more dangerous','most dangerous'],'less','Least уже образует превосходную модель.'),
('B1','Choose the standard sentence.',['The city is becoming more and more crowded.','The city is becoming more crowded and crowded than.','The city is becoming more and more crowdeder.'],'change','Для crowded используется more and more.'),
('B2','The test was ___ as difficult as I expected: I finished only a minute earlier. Choose the near-equality marker.',['almost','nowhere near','twice'],'ratio','Almost передаёт близость, соответствующую небольшому отличию в контексте.'),
('B2','The ___ the instructions are, the ___ questions people ask.',['clearer / fewer','clearest / fewest','clearer / fewest'],'parallel','В обеих частях нужны comparative; questions — исчисляемое существительное.'),
('B2','Choose the emphatic superlative.',['by far the most practical','very the most practical','much practicalest'],'modifiers','By far усиливает superlative.'),
('B2','This lens costs £201; the other costs £200. Choose the small-difference description.',['slightly more expensive','far more expensive','by far the most expensive'],'modifiers','Один фунт в данном сравнении обозначен как небольшое отличие.'),
('B2','The room was much less crowded than yesterday. What is certain?',['It had a lower degree of crowding than yesterday.','It was completely empty.','It was the emptiest room in the building.'],'less','Сравнение не задаёт абсолютную заполненность и группу других комнат.'),
('B2','The old shelf is 80 cm wide. The new shelf is twice as wide. How wide is it?',['160 cm','82 cm','40 cm'],'ratio','Коэффициент 2 умножает исходные 80 см.'),
('C1','The fee here is lower than ___ at the other school.',['that','those','the other school'],'precision','That заменяет единственное число the fee: сравниваются две цены.'),
('C1','The results in May were better than ___ in April.',['those','that','April'],'precision','Those заменяет множественное число results.'),
('C1','Choose the traditional formal phrasing for exactly two candidates.',['the more experienced of the two','the most experienced of the two','the more experienced of all five'],'group','Условие специально ограничивает выбор традиционной формальной моделью для двух.'),
('C1','Choose the formal noun phrase.',['as effective a method as the old one','as an effective method as the old one','as effective method as the old one'],'ratio','Прилагательное следует после as, затем a + noun.'),
('C1','A most thoughtful gesture means ___.',['a very thoughtful gesture','the single most thoughtful gesture in a specified group','a gesture that is not thoughtful'],'articles','Без the формальное a most … имеет усилительное значение.'),
('C1','The account is more complete than the summary. Must more complete be rejected?',['No: completeness can be assessed by how much detail is included.','Yes: complete can never be compared in any context.','Yes: it must always be completerer.'],'scale','В этом контексте рассматривается степень полноты описания.'),
('C2','A rod is not longer than 10 cm. Which measurement remains possible?',['10 cm','11 cm','12 cm'],'logic','Верхняя граница допускает ровно 10 см.'),
('C2','A rod is shorter than 10 cm. Which statement follows?',['Its length is strictly below 10 cm.','It may be exactly 10 cm.','It is at least 10 cm long.'],'logic','Shorter задаёт строгое неравенство, а не включённую границу.'),
('C2','Nora is taller than any other member of the team. Why is other useful?',['It excludes Nora herself from the comparison group.','It makes the adjective superlative.','It means Nora is not a team member.'],'logic','Участник не должен сравниваться сам с собой.'),
('C2','Mina likes Alex more than Jo. Which judgement is sound without context?',['It may compare Mina\'s liking for Jo or Jo\'s liking for Alex.','It can only mean that Mina likes Jo less.','It can only mean that Jo likes Alex less.'],'precision','Сокращённая вторая часть оставляет две разные синтаксические связи.'),
('C2','In an evaluation, The reply was more evasive than inaccurate most naturally ___.',['contrasts two descriptions of the reply','compares two replies of equal accuracy','states that the reply had no inaccuracies'],'scale','Сопоставляются характеристики; отсутствие неточностей из этого не следует.'),
('C2','Both offers are costly. Offer A is less expensive than B. What follows?',['A costs less than B; A need not be cheap.','A is cheap in absolute terms.','A is the cheapest offer on the market.'],'less','Сравнительная оценка не определяет абсолютную дешевизну или весь рынок.'),
('C2','The risk is no greater than before. Which reading preserves the logical upper bound?',['It has not increased; equality remains possible.','It has definitely decreased.','It is now zero.'],'logic','Верхняя граница не исключает сохранения прежнего риска.'),
('C2','The text says the northern route is safer than the southern one. Which addition needs separate evidence?',['It is the safest route anywhere in the region.','It is safer than that southern route.','The southern route is not as safe as the northern one.'],'group','Двустороннее сравнение не ранжирует все маршруты региона.'),
('C2','The new device is superior ___ the old one. Choose the standard lexical pattern.',['to','than','as'],'scale','Superior обычно связывается с to.'),
('C2','The authors call the sample more representative, but give no comparison group. What should an editor request?',['The baseline and the population the sample represents.','A second more before representative.','Replacement with most, without any further context.'],'precision','Точность сравнения требует понятной базы и измеряемого свойства.'),
]

TRANSFORMS = [
('A1','Ann is 18. Ben is 15. Use OLDER: Ann is ___ Ben.',['older than'],'than','Направление сравнения возраста: Ann старше.'),
('A1','The red pen is £2. The black pen is £5. Use CHEAPER: The red pen is ___ the black pen.',['cheaper than'],'than','Красная ручка дешевле.'),
('A1','The blue line is 8 cm. The green line is 4 cm. Use LONGER: The blue line is ___ the green line.',['longer than'],'than','Сравнивается длина, не возраст.'),
('A1','There are three rooms. Room 3 is bigger than both others. Use BIG: Room 3 is the ___ room.',['biggest'],'group','Нужно выделить одну комнату из трёх.'),
('A2','Both ropes are 5 m long. Use LONG: This rope is ___ that one.',['as long as'],'equal','Задана одинаковая длина.'),
('A2','Our table is smaller than theirs. Use BIGGER or LARGER: Their table is ___ ours.',['bigger than','larger than'],'than','При перестановке участников меняется направление сравнения.'),
('A2','No bag in this set is cheaper than the green one. Use CHEAP: The green bag is the ___ in this set.',['cheapest'],'group','Суперлатив допускает совместное первое место; уникальность не утверждается.'),
('A2','Tom is not as tall as Eva. Use TALLER: Eva is ___ Tom.',['taller than'],'equal','Меньшая высота Tom соответствует большей высоте Eva.'),
('B1','This is a useful idea. No other idea in our list is more useful. Use USEFUL: It is the ___ idea in our list.',['most useful'],'group','Полезность выражается через most useful.'),
('B1','The first route is more dangerous than the second. Use LESS: The second route is ___ the first.',['less dangerous than'],'less','Сохраняется меньшая опасность второго маршрута.'),
('B1','The weather becomes colder each day. Use AND: It is getting ___.',['colder and colder'],'change','Повтор comparative обозначает изменение.'),
('B1','The task becomes more complicated each week. Use MORE AND MORE: It is getting ___.',['more and more complicated'],'change','Повторяется more, не окончание прилагательного.'),
('B2','A is 4 m wide. B is 2 m wide. Use TWICE: A is ___ B.',['twice as wide as'],'ratio','Ширина A в два раза больше.'),
('B2','A is 4 m long. B is 8 m long. Use HALF: A is ___ B.',['half as long as'],'ratio','Длина A составляет половину длины B.'),
('B2','Instructions become clearer; mistakes become fewer. Complete: The clearer the instructions, ___.',['the fewer the mistakes'],'parallel','Обе части используют comparative.'),
('B2','The improvement is small. Use SLIGHTLY: The new version is ___ than the old one.',['slightly better'],'modifiers','Slightly соответствует малому улучшению.'),
('C1','The hotel\'s prices are higher than the prices at the hostel. Replace only the repeated phrase: than ___ at the hostel.',['those'],'precision','Prices во множественном числе заменяется those.'),
('C1','The rent here is lower than the rent in the village. Replace only the repeated phrase: than ___ in the village.',['that'],'precision','Rent в единственном числе заменяется that.'),
('C1','Use the formal as … as noun pattern: This is just ___ the previous one. Include EFFECTIVE and METHOD.',['as effective a method as'],'ratio','Порядок: as + adjective + a + noun + as.'),
('C1','Compare exactly two in traditional formal style: Of the two reports, this is the ___ one. Use DETAILED.',['more detailed'],'group','Условие задаёт comparative для двух объектов.'),
('C2','A maximum height of 2 m is allowed. Use TALLER: The structure must be ___ 2 m.',['no taller than','not taller than'],'logic','Предел 2 м включён; строгое shorter неравнозначно.'),
('C2','Make clear that Jo is the object of Mina\'s liking: Mina likes Alex more than ___.',['she likes Jo'],'precision','Полный глагол устраняет неоднозначность сравнительного оборота.'),
('C2','Make clear that Jo is the other person doing the liking: Mina likes Alex more than ___.',['Jo does','Jo likes Alex'],'precision','Во второй части Jo выступает подлежащим.'),
('C2','Exclude the winner from the comparison set. Complete: Ada scored higher than ___ player in the tournament. Include ANY.',['any other'],'logic','Other исключает саму Ada из группы сравнения.'),
('C2','Retain the possibility of equal cost. Use MORE: Plan A is ___ expensive than plan B.',['not more','no more'],'logic','Not more допускает равенство и более низкую цену.'),
('C2','The account covers all six stages; the brief notice covers only two. Compare coverage using COMPLETE: It is a ___ account than the brief notice.',['more complete'],'scale','В контексте полнота рассматривается как степень раскрытия материала; явно задано большее покрытие.'),
]

ERRORS = [
('A1','The blue box is more bigger than mine.',['The blue box is bigger than mine.'],'forms','Уберите двойное образование comparative.'),
('A1','This road is longer then that road.',['This road is longer than that road.'],'than','Than вводит сравнение; then обозначает последовательность.'),
('A1','Of the three bags, this is the small.',['Of the three bags, this is the smallest.'],'group','Для крайнего положения в группе нужна превосходная степень.'),
('A2','Her result is gooder than mine.',['Her result is better than mine.'],'irregular','Правильная форма good — better.'),
('A2','This bag is as heavier as that one.',['This bag is as heavy as that one.'],'equal','Между as … as нужна положительная степень.'),
('A2','This is my the best drawing.',['This is my best drawing.'],'articles','После my не нужен the.'),
('A2','It is one of the largest island in this lake.',['It is one of the largest islands in this lake.'],'articles','После one of требуется islands.'),
('B1','This test is very easier than the first.',['This test is much easier than the first.','This test is a lot easier than the first.','This test is far easier than the first.','This test is a great deal easier than the first.','This test is considerably easier than the first.','This test is substantially easier than the first.'],'modifiers','Замените very подходящим усилителем comparative.'),
('B1','My car is the most cheapest of the four.',['My car is the cheapest of the four.'],'forms','Не объединяйте most и -est.'),
('B1','My cousin is elder than me.',['My cousin is older than me.','My cousin is older than I am.'],'elder','Для предикативного возраста с than нужна older.'),
('B1','We need farther information about the course.',['We need further information about the course.','We need more information about the course.','We need additional information about the course.'],'far','Речь о дополнительной информации.'),
('B2','The street is getting noisier and noisier than.',['The street is getting noisier and noisier.'],'change','Удалите than: второй участник здесь не вводится.'),
('B2','The more clear the map is, the less mistakes we make. Use CLEARER and the standard countable form.',['The clearer the map is, the fewer mistakes we make.'],'parallel','Обе части comparative; mistakes требует fewer в заданной письменной норме.'),
('B2','This is by far more practical solution of all four.',['This is by far the most practical solution of all four.'],'modifiers','Выделяется решение среди четырёх: the most.'),
('B2','The better are the instructions, the easier the task is.',['The better the instructions are, the easier the task is.'],'parallel','Уберите вопросительную инверсию из первой части.'),
('C1','The salary here is higher than the other company. Use THAT and keep the comparison.',['The salary here is higher than that at the other company.','The salary here is higher than that in the other company.'],'precision','Сопоставляются зарплаты, а не зарплата и компания.'),
('C1','It is as reliable device as the old one. Keep DEVICE and the as … as construction.',['It is as reliable a device as the old one.'],'ratio','Артикль a стоит после прилагательного.'),
('C1','These are her the most convincing arguments.',['These are her most convincing arguments.'],'articles','Притяжательное her исключает the в этой позиции.'),
('C1','This device is superior than the old one.',['This device is superior to the old one.'],'scale','Нормативная лексическая связка superior to.'),
('C2','The length must be less than 10 cm, including exactly 10 cm. Replace LESS THAN to remove the contradiction.',['The length must be no more than 10 cm, including exactly 10 cm.','The length must be not more than 10 cm, including exactly 10 cm.','The length must be at most 10 cm, including exactly 10 cm.'],'logic','Включённая верхняя граница передаётся no/not more than или at most.'),
('C2','Both widths are equal, so A is wider than B. Replace only WIDER THAN.',['Both widths are equal, so A is as wide as B.'],'equal','Равные ширины несовместимы со строгим wider than.'),
('C2','Of all the team members, including Eva, Eva is taller than every member. Add OTHER where needed.',['Of all the team members, including Eva, Eva is taller than every other member.'],'logic','Слово other устраняет сравнение Eva с самой собой.'),
]

TRANSLATIONS = [
('A1','Эта сумка меньше моей.',['This bag is smaller than mine.','This bag is smaller than my bag.'],'than','Сравнение размеров: smaller than mine / my bag.'),
('A1','Том старше меня.',['Tom is older than me.','Tom is older than I am.'],'than','Сравнение возраста; обе модели местоимения допустимы.'),
('A2','Это моя лучшая фотография.',['This is my best photo.','This is my best photograph.'],'articles','Притяжательное my заменяет the.'),
('A2','Моя комната такая же большая, как твоя.',['My room is as big as yours.','My room is as large as yours.','My room is as big as your room.','My room is as large as your room.'],'equal','Рамка as + положительная степень + as; yours заменяет your room.'),
('B1','Мне нужна дополнительная информация.',['I need further information.','I need more information.','I need additional information.'],'far','В значении дополнительности further допустимо; farther — нет.'),
('B1','Эта книга гораздо интереснее той.',['This book is much more interesting than that one.','This book is far more interesting than that one.','This book is a lot more interesting than that one.'],'modifiers','Much, far и a lot совместимы с more interesting.'),
('B2','С каждым днём задача становится всё сложнее.',['The task is getting more and more difficult every day.','The task is becoming more and more difficult every day.'],'change','More and more передаёт постепенное изменение.'),
('B2','Этот стол вдвое шире того.',['This table is twice as wide as that one.','This table is twice as wide as that table.'],'ratio','Twice as wide as задаёт отношение ширины 2:1.'),
('C1','Это одно из самых убедительных объяснений, которые я читал.',['This is one of the most convincing explanations I have read.','This is one of the most convincing explanations that I have read.'],'articles','One of the most + множественное explanations.'),
('C1','Чем точнее карта, тем меньше ошибок мы делаем.',['The more accurate the map is, the fewer mistakes we make.','The more accurate the map, the fewer mistakes we make.'],'parallel','Связанные comparative; mistakes — исчисляемое множественное.'),
('C2','Этот риск не выше прежнего; он может быть таким же.',['This risk is no greater than before; it may be the same.','This risk is not greater than before; it may be the same.','This risk is no higher than before; it may be the same.'],'logic','Нужно сохранить возможность равенства, не утверждая обязательное снижение.'),
('C2','Цена здесь ниже, чем у другого поставщика. Используйте the price, lower и that.',['The price here is lower than that at the other supplier.','The price here is lower than that of the other supplier.'],'precision','That заменяет повтор цены и устраняет сравнение цены с человеком.'),
]

CONTEXTS = [
('A1','There are three bags: 2, 4 and 6 kg. The 6 kg bag is {{1:heavy}} than the 4 kg bag. It is the {{2:heavy}} of the three.',['heavier','heaviest'],'forms','В первой позиции comparative, во второй — superlative.'),
('A2','Our two rooms have equal width. This room is as {{1:wide}} as yours. The hall is {{2:wide}} than both rooms.',['wide','wider'],'equal','As … as требует wide; сравнение с than — wider.'),
('B1','The service is improving each month: it is getting {{1:good}} and {{2:good}}.',['better','better'],'change','Good имеет форму better; повтор обозначает изменение.'),
('B2','As the guide becomes clearer, we make fewer errors. Complete: The {{1:clear}} the guide, the {{2:few}} errors we make.',['clearer','fewer'],'parallel','Две связанные сравнительные формы, ошибки исчисляемы.'),
('C1','Complete the noun substitutes. The fee is lower than {{1:singular substitute}} at the academy; the classrooms are larger than {{2:plural substitute}} there.',['that','those'],'precision','Fee — единственное число; classrooms — множественное.'),
('C2','A specification includes 20 mm but excludes anything above it. Complete using MORE in the first gap and LESS in the second: The width must be {{1:two words ending in more}} than 20 mm; a width strictly below 20 mm is {{2:one word}} than 20 mm.',['no more','less'],'logic','No more than включает 20; less than задаёт строгую нижнюю область.'),
]

def build(output=ROOT):
    ITEMS.clear()
    morphology()
    for args in CHOICES: choice(*args)
    for level,prompt,answers,rule,reason in TRANSFORMS:
        result=item(level,'transformation',prompt,rule,reason)
        result['blanks']=[dict(id=result['id']+'-b1',answer=answers[0],accepted_answers=answers,rule_refs=result['rule_refs'],explanation_ru=result['explanation_ru'])]
        result['answer_text']=prompt.replace('___',answers[0])
    for level,prompt,answers,rule,reason in ERRORS:
        written(level,'error_correction','Исправьте предложение, сохранив его смысл и все не затронутые ошибкой слова: '+prompt,answers,rule,reason)
    for level,prompt,answers,rule,reason in TRANSLATIONS:
        written(level,'translation_ru_en',prompt,answers,rule,reason)
    for level,prompt,answers,rule,reason in CONTEXTS:
        result=item(level,'context_cloze',prompt,rule,reason)
        result['blanks']=[dict(id=result['id']+f'-b{k+1}',answer=a,accepted_answers=[a],rule_refs=result['rule_refs'],explanation_ru=result['explanation_ru']) for k,a in enumerate(answers)]
        if level=='C2': result['blanks'][0]['accepted_answers'].append('not more')
        result['answer_text']=re.sub(r'\{\{(\d+):[^}]+}}',lambda m:answers[int(m[1])-1],prompt)
    from comparison_expansion import extend
    extend(item, choice, written)
    from comparison_task_review import revise
    changed = revise(ITEMS)
    print('Comparison task review:',len(changed),'rewritten prompts.')
    from comparison_brackets import revise as revise_brackets
    print('Comparison brackets:',len(revise_brackets(ITEMS, RULES)),'converted records.')
    for entry in ITEMS:require_automatic(entry)
    destination=output/'data/exercises'
    destination.mkdir(parents=True,exist_ok=True)
    (destination/'part-13.json').write_text(json.dumps(ITEMS,ensure_ascii=False,indent=2)+'\n')
    parts=[p for p in sorted(destination.glob('part-*.json')) if p.name!='part-13.json']+[destination/'part-13.json']
    manifest=json.loads((destination/'index.json').read_text())
    bank=[]; descriptors=[]
    for path in parts:
        chunk=json.loads(path.read_text())
        if path.name != 'part-13.json':
            from tense_task_review import revise as revise_tense
            from tense_clarity_review import review as review_tense, VERSION as TENSE_VERSION
            before = json.dumps(chunk,ensure_ascii=False,sort_keys=True)
            for entry in chunk:
                revise_tense(entry)
                review_tense(entry)
                require_automatic(entry)
            if before != json.dumps(chunk,ensure_ascii=False,sort_keys=True):
                path.write_text(json.dumps(chunk,ensure_ascii=False,indent=2)+'\n')
        bank.extend(chunk)
        descriptors.append(dict(file='data/exercises/'+path.name,count=len(chunk),levels=dict(sorted(Counter(i['cefr_estimate'] for i in chunk).items())),types=dict(sorted(Counter(i['type'] for i in chunk).items()))))
    manifest.update(total_items=len(bank),answer_slots=sum(len(i.get('blanks',[])) or 1 for i in bank),parts=descriptors,
                    levels=dict(sorted(Counter(i['cefr_estimate'] for i in bank).items())),types=dict(sorted(Counter(i['type'] for i in bank).items())),
                    sections={'tenses':1115,'comparison':len(ITEMS)},
                    content_versions=VERSIONS,content_version=VERSIONS['tenses'])
    (destination/'index.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    index_path=output/'data/theory.json'
    theory=[entry for entry in json.loads(index_path.read_text()) if entry['id']!='comparison']
    theory.append(dict(id='comparison',file='content/theory/06-comparison.md',title='Степени сравнения прилагательных',description='От первых сравнений A1 до точных смысловых различий C1–C2: формы, равенство, усилители, группа и контекст.'))
    index_path.write_text(json.dumps(theory,ensure_ascii=False,indent=2)+'\n')
    print('Comparison:',len(ITEMS),'original exercises;',dict(Counter(i['cefr_estimate'] for i in ITEMS)))
    return ITEMS

if __name__=='__main__': build()
