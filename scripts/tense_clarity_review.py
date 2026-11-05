"""Second, reproducible clarity pass on every derived tense record.

Never edit source materials or stored attempts. Alternatives below are reviewed
per item, not global interchangeability rules for English tenses.
"""
import copy
import re

VERSION = 'tenses-2026-10-28.2'

# One correct response to a stated meaning, not several interchangeable fillers.
CHOICES = {
'new-choice-002': ('Maya normally works in the office. Today she has a temporary home-working arrangement. Which sentence foregrounds that temporary situation?', ['Maya is working from home today.','Maya worked from home last year.','Maya works from home every Friday.'], 'Временная ситуация сегодня противопоставлена прошлому событию и постоянному распорядку.'),
'new-choice-004': ('The invoice has been paid and the order can be shipped now. Which version presents the payment as a present result, rather than narrating a dated past event?', ['I have paid the invoice, so the order can be shipped now.','I paid an invoice last Tuesday.','I have been paying the invoice, but the payment is not complete.'], 'Связь завершённой оплаты с нынешним разрешением на отправку выражена как текущий результат; незавершённая оплата не подходит.'),
'new-choice-006': ('She began the report this morning and is still only halfway through it. Which version foregrounds the activity continuing up to now?', ['She has been writing the report all morning.','She has written the whole report.','She will start writing the report tomorrow.'], 'Проверяется продолжающаяся деятельность, а не готовый отчёт или ещё не начатая работа.'),
'new-choice-007': ('The meeting began before our arrival. Which version explicitly looks back from our arrival to that earlier start?', ['When we arrived, the meeting had already started.','When we arrived, the meeting was just starting.','The meeting will start after we arrive.'], 'Более раннее начало отделено от одновременного начала и будущего события.'),
'new-choice-009': ('Which sentence presents the workshop start as a published timetable, not a personal arrangement or a past event?', ['According to the published timetable, the workshop starts at nine.','I am meeting the instructor at nine; we arranged it yesterday.','The workshop started at nine yesterday.'], 'Расписание, личная договорённость и завершённое прошлое — разные ситуации; не нужно объявлять форму is starting неграмматичной во всех контекстах.'),
'new-choice-010': ('A workshop runs from eight to ten tomorrow. Which version places the speaker in the middle of leading it at nine?', ['At nine tomorrow, I will be leading the workshop.','I will start leading the workshop at nine tomorrow.','I finished leading the workshop yesterday.'], 'В девять работа уже идёт, а не только начинается.'),
'new-choice-011': ('Which version looks back from nine tomorrow at slides already finished by then?', ['By nine tomorrow, I will have finished the slides.','At nine tomorrow, I will still be preparing the slides.','I finished the slides at nine yesterday.'], 'Смысловая задача — уже достигнутый результат из будущей точки. Обычное will finish by nine в свободном высказывании также возможно, поэтому оно не служит ложным дистрактором.'),
'adv-choice-001': ('The entire report is finished and the speaker can assess it now. Which sentence foregrounds that present result?', ['I have read the whole report, so I can give you a complete assessment now.','I have been reading the report, but I am only halfway through.','I will begin reading the report tomorrow.'], 'Уточнены полный объём и нынешний результат; прежний Past Simple мог быть грамматически правильным.'),
'adv-choice-003': ('Mara lived in Lisbon from 2018 until 2024 and now lives in Porto. Which sentence reports that finished period as the main past fact?', ['Mara lived in Lisbon for six years before moving to Porto in 2024.','Mara has lived in Lisbon since 2018 and still lives there.','Mara is moving to Lisbon next year.'], 'Закрытый период проживания противопоставлен продолжающемуся состоянию и будущему плану.'),
'adv-choice-004': ('Which sentence presents repeated printer failures as an irritating background pattern during a past audit?', ['During the audit, the printer was always jamming when we needed it most.','The printer jammed once at noon during the audit.','The printer has never jammed during any audit.'], 'Повторяющийся раздражающий фон не равен одному сбою или отсутствию сбоев.'),
'adv-choice-006': ('She had formed a personal intention to resign, but changed her mind before doing it. Which report preserves that unrealised intention?', ['She was going to resign, but the board persuaded her to stay.','She resigned and then the board persuaded her to stay.','She has resigned and is no longer employed there.'], 'План не был осуществлён; варианты с состоявшимся уходом меняют факт.'),
'adv-choice-009': ('Which sentence gives a grammatical sequence of two main actions in a completed past discussion?', ['The chair checked the revised figures and then reopened the discussion.','The chair has checked the figures yesterday and then reopened the discussion.','The chair had check the figures and then reopened the discussion.'], 'Проверяются явно завершённая последовательность, несовместимость yesterday с Present Perfect и правильная форма после had; допустимые checked/had checked после after больше не противопоставлены как верное и неверное.'),
'new-error-006': ('Everyone left before my arrival. Which version explicitly marks the departure as earlier than that past arrival?', ['When I arrived, they had already left.','When I arrived, they were still getting ready to leave.','They will leave after I arrive.'], 'Ранний уход противопоставлен ещё не состоявшемуся уходу; название требуемого времени в вопрос не включено.'),
'adv-transform-006': ('His eyes were sore at midnight after hours of screen work. Which version looks back from that past condition and foregrounds the preceding prolonged activity?', ['His eyes were sore because he had been working at the screen for hours.','His eyes were sore before he started work at the screen.','His eyes are sore because he will work at the screen tomorrow.'], 'Причина — длительная деятельность до состояния в прошлом, а не последующее или будущее действие.'),
'adv-transform-008': ('Which question neutrally asks about an expected attendance plan, rather than ordering attendance or asking whether a past briefing is over?', ['Will you be attending the briefing tomorrow?','Attend the briefing tomorrow without fail.','Have you finished attending the briefing?'], 'Варианты различаются коммуникативной задачей; нужная грамматическая формула не названа в инструкции.'),
'adv-transform-010': ('Daniel is usually impatient, but is behaving patiently in this conversation. Which version highlights his current behaviour rather than his general character?', ['Daniel is being unusually patient today.','Daniel is always a patient person.','Daniel used to be patient, but no longer is.'], 'Сопоставлены поведение сейчас, постоянный характер и прекратившееся качество.'),
'adv-edit-004': ('Work began three months before next Friday and will still be under way then. Which version foregrounds its duration up to that future point?', ['By next Friday, we will have been working on the migration for three months.','We will start working on the migration next Friday.','We completed the migration three months ago.'], 'Говорящий измеряет накопившуюся длительность из будущей точки. Прежнее will work не объявляется безусловной грамматической ошибкой.'),
'adv-edit-007': ('An incident report first lists the main events in order, without stepping back to an earlier past. Which version follows that organisation?', ['First she opened the attachment, read the first paragraph and called security.','Before she opened the attachment, she had already called security.','She will open the attachment after security arrives.'], 'Выбрана последовательность главных событий; другой вариант меняет их порядок, а не просто грамматический акцент.'),
'adv-discourse-004': ('A minister was officially scheduled to address a conference, but the visit was cancelled and no speech took place. Which sentence preserves that unfulfilled schedule?', ['The minister was to address the conference, but the visit was cancelled.','The minister addressed the conference before the visit was cancelled.','The minister is addressing the conference now.'], 'План выступления не равен факту состоявшейся речи.'),
'adv-discourse-006': ('Which sentence draws a conclusion about a delivery already made, rather than predicting a future delivery?', ["The courier will have delivered the parcel by now; the tracking page shows the recipient's signature.",'By Friday, the courier will have delivered the parcel.','The courier will be delivering the parcel at noon tomorrow.'], 'Первая фраза передаёт вывод о настоящем результате по свидетельству, остальные — будущее событие. Название формы не выдаёт решение.'),
'new-meaning-007': ('A colleague says that a box is too heavy to lift alone. You immediately reply: I will help you. What is the function of that reply?', ['An offer made at the moment of speaking.','A description of a regular daily habit.','A report that the help was completed yesterday.'], 'Добавлен диалог: will передаёт немедленное предложение помощи, не гипотетически единственное значение will вне контекста.'),
}

# Explicit, local alternatives. Positions are one-based and refer to old slots.
EXTRAS = {
'src-u01-005':{5:['will do']}, 'src-u01-017':{1:['will finish']},
'src-u01-059':{1:['will paint']}, 'src-u01-060':{1:['will write']},
'src-u02-001':{1:['will finish']}, 'src-u02-012':{4:['will check']},
'src-u02-018':{5:['will complete']}, 'src-u02-040':{2:['will finish']},
'src-u02-050':{4:['will finish']}, 'src-u02-060':{1:['will receive']},
'src-u02-098':{2:['will finish']}, 'src-u03-005':{1:['will finish']},
'src-u03-007':{4:['will finish']}, 'src-u03-058':{1:['will master']},
'src-u03-066':{2:['will finish']}, 'src-u03-072':{1:['will draft']},
'src-u04-010':{2:['will pass']}, 'src-u04-066':{1:['will tidy']},
'src-u04-068':{1:['will renovate']}, 'src-u05-003':{1:['will look']},
'src-u06-065':{1:['will finish']},
'src-u06-092':{1:['will finish']}, 'src-u06-096':{1:['will send']},
'src-u07-030':{2:['will finish']},
'src-u07-052':{1:['will spend']}, 'src-u07-077':{1:['will release']},
'src-u08-012':{2:['will finish']}, 'src-u08-072':{1:['will reach']},
'src-u08-085':{1:['will complete']}, 'src-u09-046':{1:['will do']},
'src-u10-023':{1:['will develop']},
'src-u01-006':{2:['is coming','is going to come','will be coming']},
'src-u01-035':{1:['are going to talk','are talking','will be talking']},
'src-u01-075':{1:['are going to discuss','are discussing','will be discussing']},
'src-u02-032':{1:['have','are going to have']},
'src-u02-038':{3:['are going to finish','are finishing','will have finished']},
'src-u02-057':{1:['is going to send','will be sending']},
'src-u02-078':{1:['is going to receive','will be receiving']},
'src-u02-082':{1:['am going','am going to go','will be going']},
'src-u03-025':{3:['will have fixed','is going to fix']},
'src-u03-100':{1:['is going to transfer','will be transferring']},
'src-u04-033':{2:['is going to study','will be studying','is studying']},
'src-u04-070':{1:['are graduating','are going to graduate','will be graduating']},
'src-u05-011':{2:['is going to win']}, 'src-u05-066':{1:['are going to release','will be releasing']},
'src-u05-069':{2:['is going to be']},
'src-u06-023':{1:['is arriving','is going to arrive','will be arriving']},
'src-u06-084':{1:['begin','are beginning','are going to begin']},
'src-u06-085':{1:['am going to do']},
'src-u07-022':{2:['is going to be']}, 'src-u07-073':{2:['are going to arrive','will be arriving']},
'src-u07-075':{1:['are going to see','will be seeing']},
'src-u08-015':{1:['is arriving','is going to arrive','will be arriving']},
'src-u08-019':{2:['is going to mark','will be marking']},
'src-u08-029':{1:['is going to work','will be working','is working']},
'src-u08-083':{1:['is flying','is going to fly','will be flying']},
'src-u08-088':{1:['is going to inform','will be informing']},
'src-u09-085':{1:['are going to release','will be releasing']},
'src-u09-086':{2:['is going to update','will be updating']},
'src-u10-007':{2:['am going to do']}, 'src-u10-008':{2:['is going to be']},
'src-u10-031':{1:['am going to get','will be getting']},
'src-u10-049':{1:['are going to give']},
'src-u01-019':{1:['failed']}, 'src-u01-020':{1:['already read','read']},
'src-u01-048':{1:['lost']}, 'src-u01-051':{1:['already began','began']},
'src-u02-020':{1:['already translated','translated']},
'src-u02-074':{1:['already typed','typed']},
'src-u04-021':{1:['broke']}, 'src-u04-022':{1:['repaired']},
'src-u05-004':{1:['looked']}, 'src-u05-030':{1:['fell']},
'src-u05-034':{1:['had']}, 'src-u07-083':{1:['drained']},
'src-u07-091':{1:['brought']}, 'src-u07-096':{1:['left']},
'src-u09-069':{1:['ran']}, 'src-u10-076':{1:['already made','made']},
'src-u10-092':{1:['watched']},
'src-u01-001':{1:['has watched']}, 'src-u01-092':{1:['has corrected']},
'src-u02-008':{3:['have revised']},
'src-u02-073':{1:['has typed']}, 'src-u03-043':{1:['has scrolled']},
'src-u03-064':{1:['have tried']}, 'src-u04-009':{2:['have argued']},
'src-u04-083':{1:['has explained']},
'src-u05-009':{1:['have tried']},
'src-u05-021':{1:['have done']}, 'src-u05-032':{2:['has rained']},
'src-u05-037':{1:['has trained']}, 'src-u06-003':{1:['has scrolled']},
'src-u06-012':{1:['have tried']}, 'src-u07-025':{1:['have argued']},
'src-u07-067':{1:['have tried']}, 'src-u07-089':{1:['did']},
'src-u09-013':{1:['has scrolled']}, 'src-u09-017':{1:['has fallen']},
'src-u09-032':{1:['have looked']},
'new-cloze-002':{2:['looked'],4:['moved']},
'new-cloze-003':{2:['will welcome'],5:['am going to meet'],8:['am going to send']},
'adv-cloze-001':{2:['did not deliver'],5:['had worked']},
'adv-cloze-002':{4:['are using'],5:['is going to meet'],6:['have arrived']},
'adv-cloze-003':{1:['had searched','was searching']},
'adv-cloze-004':{8:['had omitted']},
'adv-cloze-006':{3:['has tested','have been testing','have tested'],6:['will have been using','will have used'],7:['will process'],8:['are going to continue','will be continuing']},
}

# Some old frames did not identify a reference point at all.
PROMPTS = {
'src-u01-005': 'It is four in the afternoon. Bill (to do) his homework at his desk right now. He started at two and has not stopped: he (to do) it for two hours and he (to do) it since 2 p.m. He expects to finish in another two hours: he (to finish) it in two hours and he (to do) it by 6 p.m. Usually he (to do) his homework for about four hours every evening.',
'src-u01-042': 'It is ten this evening. He started reading news at eight and is still reading without a break. He (to read) news articles online for two hours now.',
'src-u04-039': 'Yesterday Sam (to give) up smoking and switched to running instead. He told me about the decision last night.',
'src-u05-094': 'I (to bake) these cookies from scratch yesterday afternoon. Do you like them?',
'src-u04-016': 'He started a new thriller novel last month and is only halfway through the draft. He (to write) it at the moment; publication is still a long way off.',
'src-u03-053': 'The app started collecting data last month and is still doing so. It (to collect) user data since then without clearly informing users.',
'src-u07-089': 'He retired from competitive sport in 2020. Before retiring, he (to do) sport regularly for many years. That training explained his fitness at the time.',
'src-u10-061': 'Bob (to be) a journalist by profession. As a regular part of his job, he (to work) with several online publications each month.',
'src-u06-087': 'They (to offer) me a very exciting fully remote position. I need to decide whether to accept it.',
}

# Frames whose facts permit a simple past account as well as a present result.
# These do NOT cover experience with ever/never, since/for states or open totals.
RESULT_PAST = {
'src-u01-013':{1:['passed']}, 'src-u01-047':{1:['lost']},
'src-u02-021':{1:['sent']}, 'src-u02-041':{1:['graduated']}, 'src-u02-055':{1:['passed']},
'src-u02-072':{1:['checked']}, 'src-u02-083':{1:['gave']},
'src-u03-006':{1:['took']}, 'src-u03-014':{1:['received']}, 'src-u03-024':{1:['crashed']}, 'src-u03-029':{1:['lost']}, 'src-u03-073':{1:['designed']},
'src-u04-008':{1:['found']}, 'src-u04-046':{1:['ordered']}, 'src-u04-052':{1:['memorised','memorized']}, 'src-u04-061':{1:['took']}, 'src-u04-086':{1:['made']},
'src-u05-010':{1:['won']}, 'src-u05-029':{1:['took']}, 'src-u05-059':{1:['switched']},
'src-u06-006':{1:['won']}, 'src-u06-014':{1:['ran out']}, 'src-u06-015':{1:['ran']}, 'src-u06-030':{1:['parked']}, 'src-u06-042':{1:['took']}, 'src-u06-045':{1:['did']}, 'src-u06-058':{1:['sent']}, 'src-u06-087':{1:['offered']},
'src-u07-082':{1:['drained']}, 'src-u07-095':{1:['left']},
'src-u08-006':{1:['brought']}, 'src-u08-008':{1:['sent']}, 'src-u08-033':{1:['brought']}, 'src-u08-035':{1:['put']}, 'src-u08-044':{1:['wrote']}, 'src-u08-048':{1:['stole']},
'src-u09-024':{1:['booked']}, 'src-u09-071':{1:['fell']}, 'src-u09-094':{1:['fell']},
'src-u10-005':{1:['broke']}, 'src-u10-028':{1:['lost']}, 'src-u10-041':{1:['found']}, 'src-u10-064':{1:['returned']}, 'src-u10-086':{1:['won']}, 'src-u10-093':{1:['lost']},
}


def review(item):
    if item['id'].startswith('cmp-'):
        return item
    ident = item['id']
    if ident in CHOICES:
        prompt, options, explanation = CHOICES[ident]
        for field in ('blanks','accepted_answers','answer_text','accepted_option_indices'):
            item.pop(field,None)
        shift = sum(map(ord,ident)) % len(options)
        item.update(type='meaning_choice',prompt=prompt,options=options[shift:]+options[:shift],
                    correct_option_index=(-shift)%len(options),answer=options[0],explanation_ru=explanation)
    else:
        if ident in PROMPTS:
            item['prompt'] = PROMPTS[ident]
        for mapping in (EXTRAS, RESULT_PAST):
            for number, additions in mapping.get(ident,{}).items():
                field = item['blanks'][number-1]
                field['accepted_answers'] = list(dict.fromkeys([field['answer'],*field.get('accepted_answers',[]),*additions]))
                note = ' В данном контексте также принимаются: '+', '.join(additions)+'. Они допустимы по смыслу, но могут менять акцент; это не правило о свободной взаимозаменяемости времён.'
                if mapping is RESULT_PAST:
                    note = ' Также принимается '+', '.join(additions)+': факт завершённого события можно сообщить в Past Simple. Такой выбор особенно распространён в AmE; Present Perfect в образце выделяет нынешний результат. Это не разрешает Past Simple для продолжающихся состояний с since/for.'
                if note not in field.get('explanation_ru',''):
                    field['explanation_ru'] = field.get('explanation_ru','')+note
        if ident=='src-u04-039':
            item['blanks'][0].update(answer='gave',accepted_answers=['gave'],tense_or_construction='past_simple',rule_refs=['content/tenses/03-past.md#past-simple'],explanation_ru='Yesterday задаёт завершённое прошлое. Частица up уже напечатана после поля; вводится только gave.')
            item.update(tags=['past_simple'],practice_tenses=['past_simple'],rule_refs=['content/tenses/03-past.md#past-simple'])
        if ident=='src-u05-094':
            item['blanks'][0].update(answer='baked',accepted_answers=['baked'],tense_or_construction='past_simple',rule_refs=['content/tenses/03-past.md#past-simple'],explanation_ru='Указан завершённый период yesterday afternoon; настоящее мнение о печенье не меняет времени выпечки.')
            item.update(tags=['past_simple'],practice_tenses=['past_simple'],rule_refs=['content/tenses/03-past.md#past-simple'])
        if ident=='src-u01-042':
            item['blanks'][0].update(answer='has been reading',accepted_answers=['has been reading','has read'],explanation_ru='Чтение началось в восемь и продолжается сейчас, в десять. Has been reading подчёркивает процесс; has read допускает факт длительного чтения, не утверждая, что прочитаны все статьи.')
        if ident=='src-u04-016':
            item['blanks'][0].update(answer='is writing',accepted_answers=['is writing','has been writing'],tense_or_construction='present_continuous',rule_refs=['content/tenses/02-present.md#present-continuous'],explanation_ru='Роман ещё не закончен: описывается нынешняя работа над ним, не готовая книга.')
            item.update(tags=['present_continuous'],practice_tenses=['present_continuous'],rule_refs=['content/tenses/02-present.md#present-continuous'])
        if ident=='adv-cloze-003':
            item['prompt']=item['prompt'].replace('Only later {{7:I/realise}}','Only later {{7:do}} I realise')
            item['blanks'][6].update(answer='did',accepted_answers=['did'],base_verb='do',explanation_ru='После Only later вспомогательный did стоит перед подлежащим I. I и realise уже напечатаны в условии, их повторять не нужно.')
        if item.get('blanks') and item['type']=='open_brackets':
            pieces=re.split(r'\((?:to )?[^)]+\)',item['prompt'])
            for number, field in enumerate(item['blanks']):
                # A supplied adverb/particle must not be repeated inside the gap.
                following=re.match(r'\s*(still|just|already|up|out|off|back)\b',pieces[number+1],re.I)
                if following:
                    word=following[1].lower()
                    field['accepted_answers']=[a for a in field['accepted_answers'] if a.lower().split()[-1]!=word]
                    assert field['answer'] in field['accepted_answers'], (ident,'Canonical key repeats a supplied word')
            answers=iter(field['answer'] for field in item['blanks'])
            item['answer_text']=re.sub(r'\((?:to )?[^)]+\)',lambda _:next(answers),item['prompt'])
        elif item.get('blanks') and item['type']=='context_cloze':
            item['answer_text']=re.sub(r'\{\{(\d+):[^}]+}}',lambda m:item['blanks'][int(m[1])-1]['answer'],item['prompt'])
        if ident in EXTRAS or ident in RESULT_PAST or ident in PROMPTS:
            item['explanation_ru']=' '.join(dict.fromkeys(field.get('explanation_ru','') for field in item.get('blanks',[])))
    item['content_version']=VERSION
    return item


def reviewed_copy(item):
    return review(copy.deepcopy(item))
