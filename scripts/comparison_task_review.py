"""Replace answer-revealing scaffolds with explicit, reviewed decisions.

Run after both comparison packs, retaining IDs and each item's rule links.
The first option in each editorial row is correct; published positions rotate.
"""
import re

VERSION = 'comparison-2026-10-28.1'
REPLACEMENTS = {
113: ('Ann is 18 and Ben is 15. Which sentence gives their age relationship?', ['Ann is older than Ben.','Ann is younger than Ben.','Ann is the older than Ben.']),
114: ('The red pen costs £2 and the black pen £5. Which sentence matches the prices?', ['The red pen is cheaper than the black pen.','The red pen is more expensive than the black pen.','The red pen is as expensive as the black pen.']),
115: ('The blue line is 8 cm and the green line 4 cm. Which comparison is correct?', ['The blue line is longer than the green line.','The blue line is shorter than the green line.','The blue line is as long as the green line.']),
116: ('Room 3 is bigger than rooms 1 and 2. There are no other rooms. Which conclusion follows?', ['Room 3 is the biggest of the three rooms.','Room 3 is the smallest of the three rooms.','Room 3 is bigger than every room in the city.']),
117: ('Both ropes are exactly 5 m long. Which sentence matches?', ['This rope is as long as that one.','This rope is longer than that one.','This rope is not as long as that one.']),
118: ('Our table is smaller than theirs. Which sentence keeps the same relationship?', ['Their table is bigger than ours.','Their table is smaller than ours.','Their table is as big as ours.']),
119: ('No bag in this set costs less than the green bag. Which conclusion is justified?', ['The green bag is one of the cheapest bags in this set.','The green bag must be the only cheapest bag in this set.','The green bag is cheaper than every bag sold anywhere.']),
120: ('Tom is not as tall as Eva. Which sentence preserves the comparison?', ['Eva is taller than Tom.','Eva is shorter than Tom.','Eva is not taller than Tom.']),
121: ('No other idea in our list is more useful than this one. Which conclusion is justified?', ['This is one of the most useful ideas in our list.','This is the least useful idea in our list.','This must be the only useful idea in our list.']),
122: ('The first route is more dangerous than the second. Which sentence preserves the meaning?', ['The second route is less dangerous than the first.','The second route is more dangerous than the first.','The second route is the least dangerous route in the region.']),
123: ('The temperature falls each day. Which sentence describes this continuing change?', ['The weather is getting colder and colder.','The weather is getting more and more colder.','The weather is getting coldest and coldest.']),
124: ('A task becomes more complicated each week. Which sentence describes the trend?', ['The task is getting more and more complicated.','The task is getting more and more complicateder.','The task is getting most and most complicated.']),
125: ('A is 4 m wide and B is 2 m wide. Which statement gives the exact ratio?', ['A is twice as wide as B.','A is half as wide as B.','A is two metres wide.']),
126: ('A is 4 m long and B is 8 m long. Which statement gives the exact ratio?', ['A is half as long as B.','A is twice as long as B.','A is four times as long as B.']),
128: ('The new version is better, but the improvement is small. Which wording best keeps that qualification?', ['The new version is slightly better than the old one.','The new version is vastly better than the old one.','The new version is no better than the old one.']),
131: ('Which sentence uses the formal noun-phrase pattern correctly?', ['This is just as effective a method as the previous one.','This is just as an effective method as the previous one.','This is just as effective method as the previous one.']),
132: ('Two reports are compared in traditional formal written style. Which sentence follows that convention?', ['Of the two reports, this is the more detailed one.','Of the two reports, this is the most detailed than the other.','Of the two reports, this is the detailedest one.']),
133: ('A rule allows structures up to and including 2 m in height. Which sentence states exactly that rule?', ['The structure must be no taller than 2 m.','The structure must be shorter than 2 m.','The structure must be taller than 2 m.']),
136: ('Ada has the highest score in the tournament. Which sentence excludes a meaningless comparison with Ada herself?', ['Ada scored higher than every other player in the tournament.','Ada scored higher than every player, including herself, in the tournament.','Ada scored lower than every other player in the tournament.']),
137: ('Plan A may cost the same as B or less, but cannot cost more. Which sentence states that upper bound?', ['Plan A is no more expensive than plan B.','Plan A is less expensive than plan B.','Plan A is no less expensive than plan B.']),
138: ('An account describes all six stages; a brief notice describes only two. Which wording compares coverage rather than legal status?', ['The account is more complete than the brief notice.','The account is less complete than the brief notice.','The account is no more complete than the brief notice.']),
151: ('Which sentence follows the standard written pattern for linked changes and countable mistakes?', ['The clearer the map is, the fewer mistakes we make.','The clearest the map is, the fewest mistakes we make.','The clearer is the map, the fewer mistakes we make.']),
154: ('Two salaries, not a salary and a company, are being compared. Which sentence makes that comparison correctly?', ['The salary here is higher than that at the other company.','The salary here is higher than the other company.','The salary here is higher than those at the other company.']),
155: ('Which sentence has the correct article position in this formal comparison?', ['It is as reliable a device as the old one.','It is as a reliable device as the old one.','It is as reliable device as the old one.']),
160: ('Eva is a member of the team. Which sentence states that she exceeds all her teammates in height without comparing her with herself?', ['Eva is taller than every other member of the team.','Eva is taller than every member of the team, including herself.','Every other member of the team is taller than Eva.']),
172: ('Цены сравниваются у двух поставщиков. Какое предложение корректно передаёт «Цена здесь ниже, чем у другого поставщика»?', ['The price here is lower than that at the other supplier.','The price here is lower than the other supplier.','The price here is higher than that at the other supplier.']),
259: ('Ria is 16 and Max is 14. Which sentence states their age relationship correctly?', ['Max is younger than Ria.','Max is older than Ria.','Max is as old as Ria.']),
260: ('A cup costs £3 and a plate £8. Which sentence is accurate?', ['The plate is more expensive than the cup.','The cup is more expensive than the plate.','The plate is as expensive as the cup.']),
261: ('Two chairs have identical comfort ratings. Which sentence matches those ratings?', ['This chair is as comfortable as that one.','This chair is more comfortable than that one.','This chair is not as comfortable as that one.']),
262: ('The yellow box is heavier than the white box. Which sentence states the same relationship?', ['The white box is not as heavy as the yellow box.','The yellow box is not as heavy as the white box.','The white box is as heavy as the yellow box.']),
263: ('The old bag weighs 4 kg and the new one 3 kg. Which sentence gives the correct difference?', ['The new bag is one kilogram lighter than the old one.','The new bag is one kilogram heavier than the old one.','The new bag is four kilograms lighter than the old one.']),
264: ('The water exceeds the safe temperature for bathing. Which sentence explains why it cannot be used now?', ['The water is too hot to bathe in.','The water is hot enough to bathe in safely.','The water is too hotter to bathe in.']),
265: ('A shelf safely supports all the books placed on it. Which sentence describes its suitability?', ['The shelf is strong enough for the books.','The shelf is not strong enough for the books.','The shelf is enough strong for the books.']),
266: ('A route becomes less predictable each winter. Which sentence describes the trend?', ['The route is becoming less and less predictable.','The route is becoming more and more predictable.','The route is becoming less and less more predictable.']),
267: ('The old strap is 120 cm long and the new one 40 cm. Which statement gives the exact ratio?', ['The new strap is a third as long as the old one.','The new strap is three times as long as the old one.','The new strap is a third longer than the old one.']),
268: ('Each additional test increases the reliability of an estimate. Which sentence expresses this relationship correctly?', ['The more tests we run, the more reliable the estimate becomes.','The more tests we run, the less reliable the estimate becomes.','The most tests we run, the most reliable the estimate becomes.']),
269: ('A lake is 2 m deeper than a pool. Which sentence preserves both the direction and the size of the difference?', ['The pool is two metres shallower than the lake.','The pool is two metres deeper than the lake.','The pool is half as deep as the lake.']),
270: ('Both plans cause harm, but A causes less harm than B. Which description fits that choice?', ['Plan A is the lesser of two evils.','Plan A is necessarily a good option.','Plan A is the more harmful of the two plans.']),
271: ('Which sentence compares costs with costs using a grammatical substitute for the repeated noun?', ['The costs here are lower than those overseas.','The costs here are lower than that overseas.','The costs here are lower than overseas companies.']),
272: ('A formal writer wants to call a consultation very useful, without ranking it against others. Which sentence does that?', ['It was a most useful consultation.','It was the most useful consultation of all.','It was a consultation most useful than the others.']),
273: ('A family’s financial position has improved, but it need not be wealthy. Which sentence expresses only that improvement?', ['The family is better off now than before.','The family is the best off of all families.','The family is worse off now than before.']),
274: ('Which sentence uses the formal noun-phrase comparison correctly?', ['This is as difficult a choice as the earlier one.','This is as a difficult choice as the earlier one.','This is as difficult choice as the earlier one.']),
275: ('A panel must be at least 6 mm thick, with exactly 6 mm allowed. Which statement gives the same limit?', ['The panel must be no less than 6 mm thick.','The panel must be more than 6 mm thick.','The panel must be less than 6 mm thick.']),
276: ('Bid A cannot be cheaper than B, but their prices may be equal. Which statement preserves that lower price bound?', ['Bid A is no cheaper than bid B.','Bid A is more expensive than bid B.','Bid A is no more expensive than bid B.']),
277: ('Which sentence unambiguously says that Sam trusts Lee more than Pat trusts Lee?', ['Sam trusts Lee more than Pat does.','Sam trusts Lee more than he trusts Pat.','Sam trusts Pat more than Lee does.']),
278: ('Two items share the highest price in a set. Which sentence explicitly describes the shared first place?', ['This is the joint most expensive item in the set.','This is the uniquely most expensive item in the set.','This is the second most expensive item in the set.']),
282: ('Which phrase conventionally identifies a peak within a named period?', ['the busiest morning of the week','the busiest morning than the week','the busiest morning as the week']),
283: ('Which sentence describes a comparatively better-informed audience without double comparison?', ['We now need a better-informed audience.','We now need a more better-informed audience.','We now need a most better-informed audience.']),
284: ('Both options are undesirable. Which conventional expression describes choosing the less harmful one?', ['We chose the lesser of two evils.','We chose the more harmful of the two options.','We chose the best possible option in every respect.']),
285: ('A tank is exactly three times the width of another tank. Which sentence states that ratio unambiguously?', ['This tank is three times as wide as that one.','This tank is three metres wider than that one.','This tank is a third as wide as that one.']),
287: ('Which sentence has a correct formal comparison of two solutions?', ['The new design is as practical a solution as the old one.','The new design is as a practical solution as the old one.','The new design is as practical solution as the old one.']),
288: ('A room ranks second by size in a building. Which sentence expresses that ranking correctly?', ['It was the second-largest room in the building.','It was the second most largest room in the building.','It was the second larger than room in the building.']),
289: ('Five charts are ranked by usefulness. Which sentence identifies the chart with the highest usefulness rating?', ['This is the most useful of the five charts.','This is a most useful chart, but it is not the most useful of the five.','This is the least useful of the five charts.']),
290: ('Which sentence states an improved financial position without a double comparative?', ['We are better off than last year.','We are more better off than last year.','We are most better off than last year.']),
291: ('A sheet has a minimum thickness of 8 mm, including exactly 8 mm. Which requirement matches?', ['The sheet must be no less than 8 mm thick.','The sheet must be less than 8 mm thick.','The sheet must be more than 8 mm thick.']),
294: ('Два маршрута сравниваются по цене в традиционном формальном стиле. Выберите грамматически правильное предложение.', ['This is the cheaper of the two routes.','This is the cheapest than the two routes.','This is the cheaperer of the two routes.']),
295: ('После ремонта комната стала гораздо уютнее. Какое предложение передаёт именно большое улучшение?', ['After the renovation, this room became much cosier.','After the renovation, this room became slightly cosier.','After the renovation, this room became no cosier.']),
296: ('Первая лента имеет длину 90 см, вторая — 30 см. Какое предложение точно передаёт соотношение длин?', ['This ribbon is three times as long as that one.','This ribbon is a third as long as that one.','This ribbon is three centimetres longer than that one.']),
298: ('Формальный отзыв называет консультацию весьма полезной, не утверждая, что она лучше остальных. Выберите подходящее предложение.', ['It was a most useful consultation.','It was the most useful consultation of all.','It was a more useful consultation than every other one.']),
299: ('Совет уже информирован, но для решения задачи ему нужно знать больше. Выберите корректное сравнительное описание.', ['We need a better-informed council.','We need a more better-informed council.','We need a best-informed than council.']),
300: ('Панели достаточно широкие, но их только три, а нужно шесть. Какое предложение описывает именно нехватку количества?', ['We do not have enough wide panels.','Our panels are not wide enough.','Our panels are too wide.']),
301: ('Новый вариант может быть столь же надёжным, как исходный, или надёжнее, но не менее надёжным. Что передаёт ровно эту границу?', ['This option is no less reliable than the original.','This option is more reliable than the original.','This option is no more reliable than the original.']),
302: ('Допустимая толщина — до 12 мм включительно. Какое предложение точно передаёт требование?', ['The thickness must be no more than 12 mm.','The thickness must be less than 12 mm.','The thickness must be at least 12 mm.']),
303: ('Оба варианта плохи, но этот причиняет меньше вреда. Какое предложение не превращает относительный выбор в абсолютное одобрение?', ['This is the lesser of two evils, not a good option.','This is a good option with no disadvantages.','This is the more harmful of the two options.']),
178: ('A width of exactly 20 mm is allowed; greater widths are not. Which pair correctly contrasts the permitted upper bound with a strict inequality?', ['The width must be no more than 20 mm; a width strictly below 20 mm is less than 20 mm.','The width must be less than 20 mm; exactly 20 mm is therefore allowed.','The width must be at least 20 mm; greater widths are therefore forbidden.']),
305: ('Two straps measure 40 cm and 20 cm. Which pair gives both ratios correctly?', ['The 40 cm strap is twice as long as the 20 cm strap; the 20 cm strap is half as long as the 40 cm strap.','The 40 cm strap is half as long as the 20 cm strap; the 20 cm strap is twice as long as the 40 cm strap.','The 40 cm strap is twice as long as the 20 cm strap; the 20 cm strap is twice as long as the 40 cm strap.']),
307: ('Which sentence uses noun substitutes with the correct number in both comparisons?', ['The rent here is lower than that nearby; the bills are higher than those in our old flat.','The rent here is lower than those nearby; the bills are higher than that in our old flat.','The rent here is lower than nearby; the bills are higher than our old flat.']),
308: ('A width specification permits every value from 4 mm to 7 mm, including both endpoints. Which sentence defines exactly that interval?', ['The width must be no less than 4 mm and no more than 7 mm.','The width must be more than 4 mm and less than 7 mm.','The width must be no more than 4 mm and no less than 7 mm.']),
}


def revise(items):
    changed = []
    for item in items:
        number = int(item['id'].split('-')[1])
        before = item['prompt']
        if number in REPLACEMENTS:
            prompt, options = REPLACEMENTS[number]
            # Strip old response shapes, so student APIs cannot expose stale keys.
            for field in ('blanks','answer_text','accepted_answers','accepted_option_indices','options','correct_option_index'):
                item.pop(field, None)
            shift = number % len(options)
            item.update(type='meaning_choice',prompt=prompt,options=options[shift:]+options[:shift],correct_option_index=(-shift)%len(options),answer=options[0])
            item['explanation_ru'] = 'Верный вариант: '+options[0]+' '+item['explanation_ru']
        else:
            # A supplied base adjective is legitimate. Supplied suffixes and
            # ready-made comparative forms are not part of the task.
            prompt = re.sub(r'^Используйте форму с -er или -est: ', '', before)
            prompt = re.sub(r'^Use (?:the form with )?-(?:ier|iest): ', '', prompt)
            prompt = re.sub(r' Use (?:MORE|MOST)\.$', '', prompt)
            item['prompt'] = prompt
            if item['type'] == 'open_brackets':
                answers = iter(field['answer'] for field in item['blanks'])
                item['answer_text'] = re.sub(r'\([^)]*\)',lambda _:next(answers),prompt)
                base = item['blanks'][0].get('base_adjective')
                if base in ('dry','lovely','silly'):
                    field = item['blanks'][0]
                    if field['answer']=='drier': field['accepted_answers'].append('dryer')
                    elif base in ('lovely','silly'):
                        field['accepted_answers'].append(('most ' if field['answer'].endswith('iest') else 'more ')+base)
        item['content_version'] = VERSION
        if before != item['prompt']: changed.append(item['id'])
    return changed
