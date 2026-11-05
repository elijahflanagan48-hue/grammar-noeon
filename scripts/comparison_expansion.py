"""Original second comparison pack; concepts reviewed against the owner's sheets.

No source sentences are imported. Append after the first pack to retain its IDs.
"""
import re


# Each row supplies both degrees in distinct, fully specified contexts.
PARADIGMS = [
('A1','dark','darker','darkest','This photo is (dark) than the original.','Of the four photos, the one taken without a flash is the (dark).','forms'),
('A1','light','lighter','lightest','The empty bottle is (light) than the full one.','At 100 g, this is the (light) of the five bottles.','forms'),
('A1','clean','cleaner','cleanest','The washed plate is (clean) than the muddy one.','Of the three plates, the spotless one is the (clean).','forms'),
('A1','bright','brighter','brightest','The 800-lumen lamp is (bright) than the 400-lumen lamp.','Of the three lamps, the 1200-lumen lamp is the (bright).','forms'),
('A2','wet','wetter','wettest','After a second hour in the rain, my coat was (wet) than before.','Of the three coats, the one dripping with water was the (wet).','forms'),
('A2','dry','drier','driest','Use the form with -ier: This towel is (dry) than the one still soaking in water.','Use the form with -iest: Of these towels, the completely dry one is the (dry).','forms'),
('A2','lazy','lazier','laziest','In the story, the second dragon is (lazy) than the first: it refuses every task.','In the story, the dragon that never moves is the (lazy) of the five.','forms'),
('A2','cosy','cosier','cosiest','For me, the little reading room is (cosy) than the echoing hall.','I find the room with the fireplace the (cosy) of all four rooms.','forms'),
('A2','lovely','lovelier','loveliest','Use -ier: I find this melody (lovely) than the first one.','Use -iest: To me, the final melody is the (lovely) of the six.','forms'),
('A2','silly','sillier','silliest','Use -ier: I thought the second joke was (silly) than the first.','Use -iest: The judge called the last answer the (silly) of all ten.','forms'),
('B1','polite','politer|more polite','politest|most polite','The revised reply is (polite) than the abrupt first draft.','The host praised that reply as the (polite) of the five.','variants'),
('B1','pleasant','pleasanter|more pleasant','pleasantest|most pleasant','With the windows open, this room is (pleasant) than before.','In my opinion, this is the (pleasant) room in the guest house.','variants'),
('B1','common','commoner|more common','commonest|most common','This spelling error is (common) than the others in our sample.','This is the (common) spelling error in the sample: it occurs 40 times.','variants'),
('B1','unhappy','unhappier|more unhappy','unhappiest|most unhappy','In the novel, the prince is (unhappy) after the wedding than before it.','The narrator calls him the (unhappy) character in the novel.','variants'),
('B1','tired','more tired','most tired','After the second hike, I was (tired) than after the first.','Of the four walkers, I felt the (tired).','variants'),
('B1','bored','more bored','most bored','The narrator says she was (bored) during the second talk than the first.','Of the four listeners, the narrator felt the (bored).','variants'),
('B2','well-informed','better-informed|more well-informed','best-informed|most well-informed','We need a (well-informed) committee than the present one.','The report describes this as the (well-informed) committee in the network.','compound'),
('B2','well-educated','better-educated|more well-educated','best-educated|most well-educated','The novel describes a (well-educated) population than in its opening chapter.','The narrator calls her the (well-educated) person in the village.','compound'),
('B2','good-looking','better-looking|more good-looking','best-looking|most good-looking','The designer considers this a (good-looking) prototype than the first.','In the designer’s view, this is the (good-looking) prototype of the six.','compound'),
('B2','ill-informed','more ill-informed','most ill-informed','The reviewer called this a (ill-informed) article than the previous one. Use MORE.','The reviewer called this the (ill-informed) article in the series. Use MOST.','compound'),
('C1','cost-effective','more cost-effective','most cost-effective','The audit identifies a (cost-effective) approach than the current one.','The audit calls this the (cost-effective) approach of the four tested.','compound'),
('C1','time-consuming','more time-consuming','most time-consuming','Manual checking is (time-consuming) than the automated procedure.','Of the five stages, manual checking is the (time-consuming).','compound'),
('C1','well-designed','better-designed|more well-designed','best-designed|most well-designed','The panel asked for a (well-designed) study than the preliminary one.','The panel called this the (well-designed) study of the eight submitted.','compound'),
('C1','well-read','better-read|more well-read','best-read|most well-read','The novel introduces a (well-read) narrator than the earlier volume.','The critic calls her the (well-read) narrator in the trilogy.','compound'),
]

CHOICES = [
('A2','The soup burns my mouth. It is ___ hot to eat now.',['too','enough','hotter'],'threshold','Too hot обозначает превышение удобной температуры.'),
('A2','This ladder reaches the window. It is tall ___ for the job.',['enough','too','than'],'threshold','Enough после tall сообщает о достаточной высоте.'),
('A2','Complete the neutral comparison of size: a little pouch and a ___ pouch. Use SMALL.',['smaller','less','least'],'irregular','Размер выражается smaller, не less.'),
('B1','Among these five weeks, this was the busiest ___ the month.',['of','than','as'],'group','Сравниваются недели внутри заданного месяца.'),
('B1','Choose the complete place phrase: the quietest desk ___ this office.',['in','than','as'],'group','Office задаёт место, внутри которого сравниваются столы.'),
('B1','He is not ___ more confident than he was yesterday.',['any','no','very'],'logic','После not перед comparative возможно any; not no здесь не требуется.'),
('B1','The cable is 4 m long; the old cable is 1 m long. It is ___.',['four times as long as the old cable','four centimetres longer than the old cable','half as long as the old cable'],'ratio','4:1 передаётся four times as long as.'),
('B1','The tray is too ___ to fit in this drawer.',['wide','wider','widest'],'threshold','После too нужна положительная форма wide.'),
('B1','The door is ___ enough for the trolley.',['wide','wider','widest'],'threshold','Перед enough остаётся положительная форма wide.'),
('B1','You look well today, and you say you feel ___ than yesterday.',['better','gooder','more weller'],'irregular','Прилагательное well о самочувствии даёт better.'),
('B2','In this financial context, we are better off than last year. This means ___.',['Our financial position has improved.','We are physically farther away.','We must be the richest people in town.'],'compound','Better off может описывать улучшение материального положения без абсолютного богатства.'),
('B2','Which phrase describes two unattractive options, one of them less harmful?',['the lesser of two evils','the least of two happier','the littlest of two goods'],'idioms','Устойчивое lesser of two evils — выбор меньшего вреда, не хорошего варианта.'),
('B2','The judge said the exhibit was at its best under soft light. What is compared?',['The same exhibit under different conditions.','Only two different exhibits.','Its monetary value in all countries.'],'articles','At its best описывает лучшее состояние того же объекта.'),
('B2','The dimensions must be precise. Which wording unambiguously gives a 3:1 width ratio?',['three times as wide as the original','three times wider than the original','rather wider than the original'],'ratio','As … as задаёт коэффициент явно; times wider может пониматься непоследовательно.'),
('B2','Two seats cost exactly the same. Which upper-bound statement is compatible with that fact?',['Seat A is no more expensive than seat B.','Seat A is cheaper than seat B.','Seat A is twice as expensive as seat B.'],'logic','No more expensive допускает равенство цены.'),
('B2','Which construction describes a decreasing degree of certainty?',['less and less certain','more and more certainer','the least and less certain'],'change','Убывание признака выражает less and less + положительная форма.'),
('C1','The formal compliment These were most helpful comments means ___.',['The comments were very helpful.','They were necessarily the most helpful comments in a group.','Most of the comments were unhelpful.'],'articles','Most без the может быть формальным усилителем very.'),
('C1','Choose the phrase comparing exactly two devices in traditional formal usage.',['the more reliable of the two','the most reliable of all six','the more reliable in all'],'group','Условие явно задаёт традиционный comparative для двух.'),
('C1','The ranking has ten entries. Which phrase identifies rank number 2 by size?',['the second-largest entry','the two larger entry','the second most largest entry'],'articles','Порядковое числительное предшествует superlative; двойная модель не нужна.'),
('C1','The course was at its most useful during the practical sessions. What does this describe?',['When this course was most useful.','The least useful course of all.','A comparison with every other course in existence.'],'articles','Сравниваются этапы одного курса, не обязательно разные курсы.'),
('C1','The assessor asks for a less time-consuming process. What must decrease?',['The amount of time the process takes.','The quality must fall to zero.','The process must become cheaper in money.'],'compound','Time-consuming относится к затратам времени; цена из этого не следует.'),
('C1','The room is sufficiently quiet for recording. Which paraphrase keeps the threshold?',['quiet enough for recording','the quietest room ever','too quiet for recording'],'threshold','Sufficiently quiet и quiet enough выражают достаточность для цели.'),
('C1','We have three large tubes, but need six. Which phrase describes the shortage in number?',['not enough large tubes','not large enough tubes','the least large tubes'],'threshold','Enough перед группой large tubes относится к количеству.'),
('C1','We have six tubes, but each is too narrow. Which statement describes the size problem?',['The tubes are not wide enough.','There are not enough wide tubes.','The tubes are too wide.'],'threshold','Enough после wide относится к ширине, не числу трубок.'),
('C2','The prototype is more robust than elegant. The main contrast concerns ___.',['two qualities of one prototype','the size of two prototypes','equal robustness and elegance'],'variants','More … than … может противопоставлять характеристики одного объекта.'),
('C2','The results are no less significant than the pilot results. Which lower bound is preserved?',['They are at least as significant as the pilot results.','They must be less significant.','They must be exactly twice as significant.'],'logic','No less задаёт нижнюю границу, не точный коэффициент.'),
('C2','The sample is better described as selective than representative. What should the reader avoid inferring?',['That it represents the entire population without bias.','That selective is the preferred description here.','That two descriptions are being contrasted.'],'variants','Предпочтение характеристики selective не подтверждает репрезентативность.'),
('C2','The figure is not quite as high as the estimate. Which paraphrase best retains the small shortfall?',['It is slightly lower than the estimate.','It is far higher than the estimate.','It is exactly equal to the estimate.'],'ratio','Not quite указывает на небольшой недостаток относительно ориентира.'),
('C2','The report calls A the joint safest design. What does joint permit?',['At least one other design shares the highest safety ranking.','A must be uniquely safest.','A must be less safe than every design.'],'group','Superlative допускает разделённое первое место; joint делает это явным.'),
('C2','Plan A is no cheaper than B. Under the literal price comparison, which is compatible?',['A costs the same as B or more.','A must cost less than B.','A must be free.'],'logic','No cheaper исключает меньшую цену, но допускает равенство.'),
('C2','There are two candidates. An informal speaker calls one the youngest. Must an editor call it universally ungrammatical?',['No; the traditional comparative is preferred in the specified formal convention.','Yes; no native speaker can use it.','Yes; it must always be replaced with youngerest.'],'group','Не следует превращать формальное предпочтение comparative для двух в абсолютный запрет.'),
('C2','The specification says at most 30 mm. Which equivalent upper bound includes 30 mm?',['no more than 30 mm','less than 30 mm','more than 30 mm'],'logic','At most и no more than включают предельное значение.'),
]

GAPS = [
('A1','Ria is 16 and Max is 14. Use YOUNGER: Max is ___ Ria.',['younger than'],'than','Возраст Max меньше; сохраняется направление.'),
('A1','The cup is £3 and the plate is £8. Use EXPENSIVE: The plate is ___ the cup.',['more expensive than'],'forms','Сравнение цены требует more expensive.'),
('A2','The two chairs have equal comfort ratings. Use COMFORTABLE: This chair is ___ that one.',['as comfortable as'],'equal','Равные оценки передаются as comfortable as.'),
('A2','The yellow box is heavier than the white one. Use HEAVY: The white box is ___ the yellow one.',['not as heavy as','not so heavy as'],'equal','При перестановке участников меньшая масса выражается отрицательным равенством.'),
('B1','The old bag was 4 kg; the new bag is 3 kg. Use LIGHTER: The new bag is ___ the old one.',['one kilogram lighter than','1 kilogram lighter than','1 kg lighter than'],'modifiers','Разница составляет один килограмм.'),
('B1','The water exceeds the safe temperature for bathing. Use HOT: It is ___ to bathe in.',['too hot'],'threshold','Too hot описывает превышение допустимой температуры.'),
('B1','The shelf can safely support the books. Use STRONG: It is ___ for the books.',['strong enough'],'threshold','Strong enough означает достаточную прочность.'),
('B1','The route becomes less predictable each winter. Use LESS AND LESS: It is becoming ___.',['less and less predictable'],'change','Положительная форма predictable после less and less.'),
('B2','The old strap is 120 cm and the new strap is 40 cm. Use THIRD: The new strap is ___ the old one.',['a third as long as','one third as long as','one-third as long as'],'ratio','40/120 составляет одну треть.'),
('B2','Every additional test makes the estimate more reliable. Complete with RELIABLE: The more tests we run, ___ the estimate becomes.',['the more reliable'],'parallel','Во второй части нужна the + comparative.'),
('B2','The lake is 2 m deeper than the pool. Use SHALLOWER: The pool is ___ the lake.',['two metres shallower than','2 metres shallower than','two meters shallower than','2 meters shallower than','2 m shallower than'],'modifiers','Меняется направление, но сохраняется разница два метра.'),
('B2','Both plans are bad, but A causes less harm. Complete the idiom: A is the ___ of two evils.',['lesser'],'idioms','Фиксированный оборот lesser of two evils.'),
('C1','Replace only the repeated noun group: The costs here are lower than the costs overseas. Use THOSE: than ___ overseas.',['those'],'precision','Costs — множественное число; замена those.'),
('C1','Use the formal intensifier MOST, not a ranking: It was ___ useful consultation.',['a most'],'articles','Неопределённый артикль и most дают усилительное значение.'),
('C1','In a financial comparison, use BETTER: The family is ___ now than before.',['better off'],'compound','Предикативное better off пишется без обязательного дефиса.'),
('C1','Keep the formal as … as noun structure. Use DIFFICULT and CHOICE: This is ___ the earlier one.',['as difficult a choice as'],'ratio','Порядок as + adjective + a + noun + as.'),
('C2','Preserve the inclusive lower limit. Use LESS: The panel must be ___ 6 mm thick.',['no less than','not less than'],'logic','Нижний предел включает ровно 6 мм.'),
('C2','The two bids may have equal prices, but A cannot be cheaper. Use CHEAPER: A is ___ B.',['no cheaper than','not cheaper than'],'logic','Отрицание cheaper сохраняет равенство и большую цену.'),
('C2','Disambiguate the subject of comparison: Sam trusts Lee more than Pat trusts Lee. Complete using DOES: Sam trusts Lee more than ___.',['Pat does'],'precision','Does замещает trusts Lee, сохраняя Pat как подлежащее.'),
('C2','State shared first place explicitly. Use JOINT and EXPENSIVE: This is the ___ item in the set.',['joint most expensive','joint-most-expensive'],'group','Joint показывает, что первое место по цене разделено.'),
]

ERRORS = [
('A2','The bath is too hotter for the baby.',['The bath is too hot for the baby.'],'threshold','После too не нужен comparative.'),
('A2','This screen is enough bright to read.',['This screen is bright enough to read.'],'threshold','Enough ставится после прилагательного.'),
('B1','The signal is getting more and more weaker.',['The signal is getting weaker and weaker.'],'change','Повтор comparative weaker не соединяется с more.'),
('B1','This is the busiest morning in the week. Replace only IN with the conventional period phrase.',['This is the busiest morning of the week.'],'group','Условие требует обычное сочетание of the week, не объявляет всякое in the week невозможным.'),
('B2','We now need a more better-informed audience. Remove only the redundant MORE.',['We now need a better-informed audience.'],'compound','Better-informed уже является сравнительной формой.'),
('B2','We chose the least of two evils. Use the conventional idiom with LESSER.',['We chose the lesser of two evils.'],'idioms','Требуется лексически закреплённая модель lesser of two evils.'),
('B2','This tank is three times wider than that one. Express exactly a 3:1 ratio using AS WIDE AS.',['This tank is three times as wide as that one.'],'ratio','Уточняется коэффициент, а не объявляются все times wider безусловно неграмматичными.'),
('B2','The quieter is the room, the easier it is to concentrate.',['The quieter the room is, the easier it is to concentrate.'],'parallel','В первой части обычный порядок подлежащего и связки.'),
('C1','The new design is as practical solution as the old one. Keep the formal noun structure.',['The new design is as practical a solution as the old one.'],'ratio','Восстанавливается a после practical.'),
('C1','It was the second most largest room in the building. Delete only MOST.',['It was the second largest room in the building.','It was the second-largest room in the building.'],'articles','Не соединяются most и -est.'),
('C1','This is a most useful of the five charts. Change only the article to give a ranking.',['This is the most useful of the five charts.'],'articles','Для крайней позиции в заданной группе требуется the most.'),
('C1','We are more better off than last year. Remove only MORE.',['We are better off than last year.'],'compound','Better off уже выражает сравнительную степень.'),
('C2','The minimum is 8 mm, so the sheet must be less than 8 mm thick. Replace LESS THAN with an inclusive lower bound using LESS.',['The minimum is 8 mm, so the sheet must be no less than 8 mm thick.','The minimum is 8 mm, so the sheet must be not less than 8 mm thick.'],'logic','Минимум включает 8; less than задаёт противоположное ограничение.'),
]

TRANSLATIONS = [
('A1','Этот коридор длиннее того.',['This corridor is longer than that one.'],'than','Longer than сравнивает длину.'),
('A2','Эта лампа недостаточно яркая для чтения.',['This lamp is not bright enough for reading.','This lamp is not bright enough to read by.','This lamp isn’t bright enough for reading.'], 'threshold','Not bright enough выражает недостаточность для цели.'),
('B1','Из этих двух маршрутов этот дешевле. Используйте традиционную конструкцию the cheaper of the two.',['This is the cheaper of the two routes.','Of the two routes, this is the cheaper.'],'group','Явно запрошен формальный comparative для двух.'),
('B1','После ремонта эта комната стала гораздо уютнее. Используйте much и cosier.',['After the renovation, this room became much cosier.','This room became much cosier after the renovation.'],'modifiers','Much усиливает сравнительную форму cosier.'),
('B2','Эта лента втрое длиннее той. Используйте three times as long as.',['This ribbon is three times as long as that one.','This strip is three times as long as that one.'],'ratio','Явно задана однозначная кратность 3:1.'),
('B2','Чем тише комната, тем легче сосредоточиться.',['The quieter the room, the easier it is to concentrate.','The quieter the room is, the easier it is to concentrate.'],'parallel','Связаны два comparative.'),
('C1','Это была весьма полезная консультация. Используйте a most и useful consultation.',['It was a most useful consultation.','This was a most useful consultation.'],'articles','Усилительное most не ранжирует консультации.'),
('C1','Нам нужен лучше информированный совет. Используйте a better-informed council.',['We need a better-informed council.'],'compound','В составном определении меняется well на better.'),
('C1','У нас достаточно широких панелей. Речь об их количестве. Используйте enough wide panels.',['We have enough wide panels.','We have got enough wide panels.'],'threshold','Enough относится к группе существительного.'),
('C2','Этот вариант не менее надёжен, чем исходный; он может быть надёжнее. Используйте no less reliable.',['This option is no less reliable than the original; it may be more reliable.','This option is no less reliable than the original one; it may be more reliable.'],'logic','Нижняя граница допускает равенство и превосходство.'),
('C2','Толщина должна быть не более 12 мм, включая ровно 12 мм. Используйте no more than.',['The thickness must be no more than 12 mm, including exactly 12 mm.','The thickness must be no more than 12 millimetres, including exactly 12 millimetres.'],'logic','Верхняя граница включает 12.'),
('C2','Это меньшее из двух зол, а не хороший вариант. Используйте the lesser of two evils.',['This is the lesser of two evils, not a good option.','It is the lesser of two evils, not a good option.'],'idioms','Идиома обозначает сравнительно меньший вред.'),
]

CONTEXTS = [
('A2','The chair is too {{1:wide}} for this gap. The stool is narrow {{2:missing word}} to fit.',['wide','enough'],'threshold','После too нужна wide; после narrow стоит enough.'),
('B1','The straps measure 20, 40 and 60 cm. The 40 cm strap is {{1:use TWICE with LONG}} the 20 cm strap. The 20 cm strap is {{2:use HALF with LONG}} the 40 cm strap.',['twice as long as','half as long as'],'ratio','40:20 = 2:1; обратное отношение 1:2.'),
('B2','Complete the conventional group phrases. It is the quietest room {{1:one preposition}} this house and the quietest {{2:one preposition}} the four rooms we tested.',['in','of'],'group','Место задаётся in; явно перечисленный набор of.'),
('C1','Complete with THAT and THOSE. The rent here is lower than {{1:singular substitute}} nearby; the bills are higher than {{2:plural substitute}} in our old flat.',['that','those'],'precision','Число заменителя соответствует rent/bills.'),
('C2','A lower limit of 4 mm and an upper limit of 7 mm are both inclusive. Use LESS and MORE: the width must be {{1:two words ending in LESS}} than 4 mm and {{2:two words ending in MORE}} than 7 mm.',['no less','no more'],'logic','Обе предельные величины включены; no less/no more сохраняют интервал.'),
('C2','Distinguish strength from number. For the force required, we need strong {{1:missing word}} springs. For six machines, we need {{2:missing word}} strong springs.',['enough','enough'],'threshold','После strong оценивается сила; перед strong springs — количество.'),
]


def extend(item, choice, written):
    def blanked(level, kind, prompt, answers, rule, reason, base=None):
        result = item(level, kind, prompt, rule, reason)
        result['blanks'] = [dict(id=result['id']+'-b1', answer=answers[0], accepted_answers=answers,
                                 rule_refs=result['rule_refs'], explanation_ru=result['explanation_ru'])]
        if base:
            result['blanks'][0]['base_adjective'] = base
        result['answer_text'] = re.sub(r'\([^)]*\)', answers[0], prompt) if base else prompt.replace('___', answers[0])
    for level, base, comp, sup, first, second, rule in PARADIGMS:
        for prompt, forms in [(first, comp), (second, sup)]:
            blanked(level, 'open_brackets', prompt, forms.split('|'), rule,
                    f'Форма {base}: {forms.replace("|", " / ")}. Артикль и участники уже даны.', base)
    for row in CHOICES:
        choice(*row)
    for row in GAPS:
        blanked(row[0], 'transformation', *row[1:])
    for level, prompt, answers, rule, reason in ERRORS:
        written(level, 'error_correction', 'Исправьте только указанную конструкцию; сохраните остальные слова: '+prompt, answers, rule, reason)
    for level, prompt, answers, rule, reason in TRANSLATIONS:
        written(level, 'translation_ru_en', prompt, answers, rule, reason)
    for level, prompt, answers, rule, reason in CONTEXTS:
        result = item(level, 'context_cloze', prompt, rule, reason)
        result['blanks'] = [dict(id=result['id']+f'-b{k+1}', answer=a, accepted_answers=[a], rule_refs=result['rule_refs'], explanation_ru=result['explanation_ru']) for k,a in enumerate(answers)]
        if rule == 'logic':
            result['blanks'][0]['accepted_answers'].append('not less')
            result['blanks'][1]['accepted_answers'].append('not more')
        result['answer_text'] = re.sub(r'\{\{(\d+):[^}]+}}', lambda m: answers[int(m[1])-1], prompt)
