"""Curated contextual adjective-form tasks; stable IDs, no guessed missing words."""
import re

VERSION = 'comparison-2026-10-28.2'

# ID | rule | complete visible frame | keys per gap (;), alternatives (~) | reason
ROWS = '''
73|forms|I am 15 and my sister is 12. I am (old) than my sister.|older|Сравнивается возраст двух людей.
74|forms|The table top measures 180 by 80 cm; the shelf surface measures 60 by 20 cm. The table top is (big) than the shelf surface.|bigger|Перед than требуется сравнительная форма; конечная g удваивается.
75|group|The three bags cost £5, £10 and £20. The £5 bag is the (cheap).|cheapest|Выделена минимальная цена среди трёх.
76|forms|Our room has an area of 20 square metres; this room has only 12. This is a (small) room than ours.|smaller|Площадь второго помещения меньше.
78|group|The ropes measure 2, 5 and 8 metres. The eight-metre rope is the (long).|longest|Указан максимум длины в группе.
79|irregular|I understood much more in this lesson than yesterday. For me, this lesson was (good) than yesterday's.|better|Good имеет неправильную сравнительную форму.
80|equal|Both bags weigh exactly 5 kg. My bag is as (heavy) as yours.|heavy|Равная масса: между as и as положительная форма.
81|irregular|I have many friends, but I trust Nina more than any of them. She is my (good) friend.|best|Превосходная степень good; my уже заменяет артикль.
83|group|Four rooms were rated for comfort. Room 2 received the highest rating: it is the (comfortable) room of the four.|most comfortable|Максимальный показатель в группе; most + длинное прилагательное.
84|forms|The red bag weighs 3 kg and the blue bag 6 kg. The red bag is (light) than the blue one.|lighter|Сравнение массы: 3 кг меньше 6 кг.
86|far|The station is 4 km away and the park 2 km away. The station is (far) away than the park.|farther~further|Для физического расстояния допустимы обе формы.
87|far|The brochure does not answer my question. Please send me (far) information about the course.|further|В значении дополнительной информации используется further.
88|elder|My sister is 18 and I am 16. She is two years (old) than me.|older|Перед than используется older, не elder.
89|less|Of all the routes, the fenced path has the lowest risk rating. It is the least (dangerous).|dangerous|После least остаётся положительная форма.
90|change|The population rises every month. The city is becoming (crowded) and (crowded).|more crowded;more crowded|Повтор сравнительной формы показывает постепенное увеличение.
92|parallel|Clear instructions reduce the number of questions. The (clear) the instructions are, the (few) questions people ask.|clearer;fewer|Связанные изменения; questions — исчисляемое множественное.
93|modifiers|Of the five proposals, this one is far ahead in practicality. It is by far the (practical) proposal.|most practical|By far усиливает превосходную степень.
94|modifiers|One lens costs £201 and the other £200. The first is slightly (expensive) than the second.|more expensive|Slightly обозначает малую разницу перед comparative.
99|group|Exactly two candidates are compared in traditional formal style. One has ten years of experience, the other two. The first is the (experienced) of the two.|more experienced|В заданной формальной модели для двух используется comparative.
100|ratio|Both methods achieve the same success rate. In formal written English: this is as (effective) a method as the old one.|effective|В модели as + adjective + a + noun + as нужна положительная форма.
102|scale|The full account covers all six stages; the summary covers only two. In coverage, the account is (complete) than the summary.|more complete|Полнота рассматривается как степень охвата деталей.
107|scale|The reply avoids the question, though its few factual claims are accurate. It is more (evasive) than inaccurate.|evasive|Сопоставляются два описания одного ответа; после more остаётся основа.
108|less|Both offers are costly. A costs £900 and B £1200. A is less (expensive) than B.|expensive|Less выражает меньшую степень, но не абсолютную дешевизну.
109|logic|The assessment rules out any increase in risk but permits equality. The risk is no (great) than before.|greater|No greater задаёт верхнюю границу и допускает равенство.
113|forms|Ann is 18 and Ben is 15. Ann is (old) than Ben.|older|Возраст Ann больше.
114|forms|The red pen costs £2 and the black pen £5. The red pen is (cheap) than the black pen.|cheaper|Цена красной ручки ниже.
115|forms|The blue line is 8 cm and the green line 4 cm. The blue line is (long) than the green line.|longer|Сравниваются длины двух линий.
116|group|Room 3 is larger than rooms 1 and 2; these are the only rooms. Room 3 is the (big) of the three.|biggest|Максимум размера в полной группе из трёх.
117|equal|Both ropes are exactly 5 m long. This rope is as (long) as that one.|long|Равенство длин требует положительной формы.
118|forms|Our table is smaller than theirs. Their table is (big) than ours.|bigger|При смене направления сравнения smaller заменяется bigger.
119|group|No bag in this set costs less than the green one; another bag may share its price. It is one of the (cheap) bags in the set.|cheapest|One of допускает общее минимальное место и требует superlative.
120|forms|Tom is not as tall as Eva. Eva is (tall) than Tom.|taller|Условие задаёт превосходство Eva по росту.
121|group|No other idea in our list is more useful than this one. It is one of the (useful) ideas in the list.|most useful|Одна из идей с максимальной полезностью, без требования уникального первого места.
122|less|The first route has more hazards than the second. The second route is less (dangerous) than the first.|dangerous|После less нужна основа прилагательного.
123|change|The temperature falls each day. The weather is getting (cold) and (cold).|colder;colder|Повтор comparative обозначает нарастание признака.
124|change|New requirements are added every week. The task is getting (complicated) and (complicated).|more complicated;more complicated|Повтор more complicated передаёт постепенное усложнение.
125|ratio|A is 4 m wide and B is 2 m wide. A is twice as (wide) as B.|wide|Кратность 2:1: twice as + положительная форма + as.
126|ratio|A is 4 m long and B is 8 m long. A is half as (long) as B.|long|Отношение 1:2 выражается half as long as.
127|parallel|Clearer instructions lead to fewer mistakes. The (clear) the instructions, the (few) the mistakes.|clearer;fewer|Две согласованные сравнительные формы; mistakes исчисляемо.
128|modifiers|The new version improves the rating by only one point. It is slightly (good) than the old one.|better|Небольшое улучшение: slightly + better.
131|ratio|The two methods have identical success rates. This is just as (effective) a method as the previous one.|effective|В формальной именной модели артикль уже стоит после прилагательного.
132|group|Exactly two reports are compared in traditional formal written style. This report covers twenty issues; the other covers five. This is the (detailed) of the two.|more detailed|Формальный comparative для двух отчётов.
133|logic|Structures may be up to 2 m high, including exactly 2 m. A structure must be no (tall) than 2 m.|taller|No taller than включает равенство предельной высоте.
136|group|Ada scored more points than all her opponents. She had the (high) score in the tournament.|highest|Максимум в названной группе.
137|logic|Plan A may cost the same as B or less, but not more. A is no more (expensive) than B.|expensive|More уже напечатано; вводится основа expensive.
138|scale|The account covers all six stages; the brief notice covers two. The account is (complete) than the notice in its coverage.|more complete|Контекст задаёт шкалу полноты, а не абсолютный юридический статус.
139|forms|The blue box has twice the volume of mine. It is (big) than mine.|bigger|Не нужны одновременно more и суффикс -er.
140|forms|This road is 12 km and that road 8 km. This road is (long) than that road.|longer|Than уже напечатано; требуется только сравнительная форма.
141|group|The three bags have capacities of 5, 10 and 20 litres. The five-litre bag is the (small).|smallest|Выделяется минимум в группе из трёх.
142|irregular|Her score was 95 and mine 70; a higher score is better. Her result was (good) than mine.|better|Неправильная форма good — better.
143|equal|Both bags weigh 4 kg. This bag is as (heavy) as that one.|heavy|В сравнении равенства не используются heavier/more heavy.
144|irregular|Of all my drawings, this received the highest rating. This is my (good) drawing.|best|После my ставится best без дополнительного the.
147|group|My car has the lowest price of the four. It is the (cheap) of the four.|cheapest|Не сочетаются most и cheapest.
148|elder|My cousin is 30 and I am 25. My cousin is (old) than me.|older|Для сравнения с than нужна older.
149|far|The leaflet leaves several questions unanswered. We need (far) information about the course.|further|Дополнительная информация — further information.
150|change|Traffic increases each week. The street is getting (noisy) and (noisy).|noisier;noisier|Повтор comparative, без лишнего than в конце.
151|parallel|A clear map helps us avoid mistakes. The (clear) the map is, the (few) mistakes we make.|clearer;fewer|Порядок слов обычный; fewer относится к исчисляемым mistakes.
152|modifiers|Among all four solutions, this one is far ahead on practicality. It is by far the (practical) solution.|most practical|By far усиливает superlative в группе.
153|parallel|Good instructions make the task easy. The (good) the instructions are, the (easy) the task is.|better;easier|Неправильный comparative better и форма easier.
155|ratio|Both devices have the same reliability rating. It is as (reliable) a device as the old one.|reliable|Формальная именная модель с положительной формой.
156|group|She has presented ten arguments; these three are rated above all the others. These are her (convincing) arguments.|most convincing|Притяжательное her уже занимает позицию определителя.
159|equal|The two widths are identical. A is as (wide) as B.|wide|Равные значения выражаются as wide as.
160|group|Eva exceeds all her teammates in height. She is (tall) than every other member of the team.|taller|Other уже исключает Eva из сравнения с собой.
161|forms|My bag holds 20 litres; this bag holds 10. This bag is (small) than mine.|smaller|Контекст однозначно задаёт направление сравнения.
162|forms|Tom is 32 and I am 28. Tom is (old) than me.|older|Сравнение возраста с than.
163|irregular|I took ten photos. This one received the highest rating. It is my (good) photo.|best|Good — best для максимума в группе.
164|equal|The two rooms have identical floor areas. My room is as (big) as yours.|big|Равенство площади: положительная форма big.
166|modifiers|I found that book dull, but read this one eagerly all night. This book is much (interesting) than that one.|more interesting|Much усиливает comparative more interesting.
167|change|Each day another complication appears. The task is becoming (difficult) and (difficult).|more difficult;more difficult|Повтор сравнительной формы передаёт постепенное изменение.
168|ratio|This table is 160 cm wide and that one 80 cm wide. This table is twice as (wide) as that one.|wide|Для кратности вводится положительная форма, не wider.
169|articles|I rated all the explanations I have read for persuasiveness. This one shares the highest rating. It is one of the (convincing) explanations I have read.|most convincing|One of the + superlative + множественное существительное.
170|parallel|A precise map reduces our errors. The (accurate) the map is, the (few) mistakes we make.|more accurate;fewer|Связанные изменения и исчисляемые ошибки.
171|logic|The new risk cannot exceed the old risk; equality is allowed. It is no (great) than before.|greater|Отрицательная верхняя граница допускает равенство.
173|forms|The three bags weigh 2, 4 and 6 kg. The 6 kg bag is (heavy) than the 4 kg bag. It is the (heavy) of the three.|heavier;heaviest|Сначала сравнение двух, затем максимум среди трёх.
174|equal|Our rooms are each 3 m wide; the hall is 5 m wide. This room is as (wide) as yours. The hall is (wide) than both rooms.|wide;wider|Равенство комнат и превосходство ширины зала.
175|change|Customers rate the service more highly each month. It is getting (good) and (good).|better;better|Устойчивая повторная сравнительная модель better and better.
176|parallel|A clear guide reduces errors. The (clear) the guide, the (few) errors we make.|clearer;fewer|Исчисляемые errors требуют fewer в стандартной письменной норме.
229|forms|The first pouch holds one litre and the second half a litre. The second is a (small) pouch than the first.|smaller|Comparative ставится и перед существительным.
233|ratio|The cable is 4 m long and the old cable 1 m long. It is four times as (long) as the old cable.|long|Кратность не требует longer после as.
234|threshold|The tray is 60 cm wide and the drawer only 50 cm wide. The tray is too (wide) to fit.|wide|После too нужна положительная форма.
235|threshold|The doorway is 100 cm wide and the trolley 80 cm wide. The door is (wide) enough for the trolley.|wide|Enough уже напечатано после прилагательного.
236|irregular|You felt ill yesterday but are recovering today. You feel (well) than yesterday.|better|В значении состояния здоровья well имеет comparative better.
237|compound|Our income has risen while costs are unchanged. Financially, we are (well) off than last year.|better|Сравнительная форма в предикативном better off.
238|idioms|Both options cause harm, but A causes less. It is the (little) of two evils.|lesser|Фиксированная модель lesser of two evils, не обычное less.
240|ratio|The new tank is 6 m wide and the old one 2 m wide. It is three times as (wide) as the old tank.|wide|Явно задано отношение 3:1.
241|logic|Two seats have exactly the same price. Seat A is no more (expensive) than seat B.|expensive|Отрицательное сравнение допускает равенство; more уже напечатано.
242|change|Each new report introduces another doubt. The conclusion is becoming less and less (certain).|certain|После less and less остаётся положительная форма.
244|group|Exactly two devices are compared in traditional formal style. A fails less often than B. A is the (reliable) of the two.|more reliable|Comparative для двух в заданном формальном регистре.
245|articles|Ten entries are ranked by size. This entry ranks number two: it is the second-(large) entry.|largest|После порядкового числительного используется superlative; дефис уже напечатан.
247|compound|The old process takes two hours, the new one one hour. The new process is less (time-consuming) than the old one.|time-consuming|Less уже задаёт сравнительную степень составного прилагательного.
248|threshold|The measured noise level is low enough for recording. The room is (quiet) enough for recording.|quiet|После прилагательного стоит enough; comparative не нужен.
250|threshold|The tubes must each be 8 cm wide, but are only 5 cm wide. They are not (wide) enough.|wide|Описана недостаточность ширины, не количества.
251|scale|The prototype withstands severe stress, but its styling is clumsy. It is more (robust) than elegant.|robust|Сравниваются два качества одного объекта, more уже напечатано.
252|logic|The results may be equally significant or more significant, but not less. They are no less (significant) than the pilot results.|significant|После no less используется основа; допускается равенство.
254|equal|The figure is just below the estimate. It is not quite as (high) as the estimate.|high|Not quite as ... as выражает небольшой недостаток признака.
255|group|Two designs share the highest safety rating. A is the joint (safe) design in the set.|safest|Joint допускает общее первое место с superlative.
256|logic|A cannot cost less than B, but equal prices are allowed. A is no (cheap) than B.|cheaper|No cheaper задаёт нижнюю границу цены, включая равенство.
259|forms|Ria is 16 and Max is 14. Max is (young) than Ria.|younger|Меньший возраст Max задаёт сравнительную форму younger.
260|forms|The cup costs £3 and the plate £8. The plate is (expensive) than the cup.|more expensive|Сравнение стоимости двух предметов.
261|equal|The chairs have identical comfort ratings. This chair is as (comfortable) as that one.|comfortable|Положительная форма в модели равенства.
262|equal|The yellow box is heavier than the white one. The white box is not as (heavy) as the yellow box.|heavy|Отрицательное равенство выражает меньшую массу.
263|modifiers|The old bag weighs 4 kg and the new one 3 kg. The new bag is one kilogram (light) than the old one.|lighter|Указанная разница ставится перед comparative.
264|threshold|The water exceeds the safe bathing temperature. It is too (hot) to bathe in.|hot|Too требует положительной формы, не hotter.
265|threshold|The shelf can safely hold all these books. It is (strong) enough for them.|strong|Достаточность: adjective + enough.
266|change|The route becomes harder to predict each winter. It is becoming less and less (predictable).|predictable|Повтор less не требует comparative прилагательного.
267|ratio|The old strap is 120 cm long and the new one 40 cm long. The new strap is a third as (long) as the old one.|long|Длина нового ремня составляет одну треть.
268|parallel|Each extra test increases reliability. The more tests we run, the (reliable) the estimate becomes.|more reliable|Во второй части связанного сравнения требуется comparative.
269|modifiers|The lake is 2 m deeper than the pool. The pool is two metres (shallow) than the lake.|shallower|Изменено направление сравнения с сохранением разницы.
270|idioms|A and B both cause harm, but A causes less. A is the (little) of two evils.|lesser|Лексически закреплённая форма lesser.
273|compound|The family's income has increased without any increase in its expenses. It is (well) off now than before.|better|Better off описывает относительное улучшение финансов.
274|ratio|Both choices are equally difficult. In formal written English: this is as (difficult) a choice as the earlier one.|difficult|Модель as + adjective + a + noun + as.
275|logic|The minimum thickness is 6 mm, with exactly 6 mm allowed. The panel must be no less (thick) than 6 mm.|thick|Less уже напечатано; основа thick сохраняет включённый минимум.
276|logic|A may equal B in price or cost more, but may not cost less. A is no (cheap) than B.|cheaper|Отрицание comparative не исключает равенство цен.
278|group|Two items share the highest price in the set. This is the joint (expensive) item in the set.|most expensive|Общее первое место: joint + superlative.
279|threshold|The bath exceeds the safe temperature for a baby. It is too (hot) for the baby.|hot|После too нужна положительная форма.
280|threshold|The screen meets the minimum brightness for reading. It is (bright) enough to read by.|bright|Enough относится к предшествующему прилагательному.
281|change|Signal strength declines minute by minute. The signal is getting (weak) and (weak).|weaker;weaker|Повтор comparative без двойного more weaker.
283|compound|The audience now knows more than before. We have a (well-informed) audience than last time.|better-informed~more well-informed|Обе нормативные сравнительные формы составного прилагательного.
284|idioms|Both alternatives are harmful, but this one is less harmful. We chose the (little) of two evils.|lesser|Устойчивый оборот требует lesser.
285|ratio|This tank is 9 m wide and that one 3 m wide. This tank is three times as (wide) as that one.|wide|Ровно 3:1, положительная форма между as.
286|parallel|Less noise makes concentration easy. The (quiet) the room is, the (easy) it is to concentrate.|quieter;easier|Обычный порядок слов и comparative в обеих частях.
287|ratio|Both solutions are equally practical. In formal written English: the new design is as (practical) a solution as the old one.|practical|В именной модели нужна основа, не more practical.
288|articles|The room ranks second by size in the building. It is the second-(large) room in the building.|largest|Порядковое числительное + superlative; дефис дан в условии.
289|group|Five charts are ranked by usefulness; this one ranks first. This is the (useful) of the five charts.|most useful|Максимальная полезность в явной группе из пяти.
290|compound|Our disposable income is higher now. We are (well) off than last year.|better|Предикативная сравнительная модель better off.
291|logic|The minimum thickness is 8 mm, including exactly 8 mm. The sheet must be no less (thick) than 8 mm.|thick|Включённая нижняя граница; less уже напечатано.
294|group|Exactly two routes are compared in traditional formal style. This one costs £5 and the other £8. This is the (cheap) of the two.|cheaper|Comparative для двух в заданной формальной модели.
295|modifiers|After renovation, the comfort rating rose from 2 to 9 out of 10. The room is much (cosy) than before.|cosier~cozier|Much усиливает comparative; принимаются обе орфографии.
296|ratio|This ribbon is 90 cm long and the other 30 cm long. This ribbon is three times as (long) as that one.|long|Соотношение длин 3:1.
299|compound|The council needs to know more than it does now. We need a (well-informed) council than the current one.|better-informed~more well-informed|Обе сравнительные модели нормативны; more better-informed не допускается.
'''

def revise(items, rules):
    specs={}
    for line in ROWS.strip().splitlines():
        number,rule,prompt,keys,reason=line.split('|')
        ident=f'cmp-{int(number):04d}'
        assert ident not in specs, ident
        specs[ident]=(rule,prompt,[key.split('~') for key in keys.split(';')],reason)
    assert len(specs)==130, len(specs)
    assert set(specs)<=set(i['id'] for i in items)
    for item in items:
        item['content_version']=VERSION
        if item['id'] not in specs:continue
        rule,prompt,keys,reason=specs[item['id']]
        bases=re.findall(r'\(([^)]+)\)',prompt)
        assert len(bases)==len(keys), item['id']
        target,anchor,general=rules[rule]
        refs=[f'content/comparison/06-comparison.md#{anchor}']
        for field in ('answer','accepted_answers','options','correct_option_index','accepted_option_indices'):
            item.pop(field,None)
        item.update(type='open_brackets',prompt=prompt,practice_tenses=[target],tags=[target],rule_refs=refs,explanation_ru=reason+' '+general)
        item['blanks']=[dict(id=item['id']+f'-b{n+1}',base_adjective=base,answer=answers[0],accepted_answers=answers,rule_refs=refs,explanation_ru=reason+' '+general) for n,(base,answers) in enumerate(zip(bases,keys))]
        index=iter(answers[0] for answers in keys)
        item['answer_text']=re.sub(r'\([^)]+\)',lambda _:next(index),prompt)
    return specs
