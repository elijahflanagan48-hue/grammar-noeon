"""Replace open-ended production with finite, explicitly reviewed choices.

Historical snapshots keep their old grading semantics. New bank records contain
only choices or bounded gaps; no fuzzy semantic approval or manual review queue.
"""
import copy

from bank_versions import VERSIONS

# Each distractor is an explicit local edit, never generated from a generic tense
# swap. The requested original translation remains a meaning cue, not free input.
EDITS={
'src-u07-026': [('will be sitting','will be sit'),('will be sitting','will sitting')],
'src-u01-011': [('will be flying','will be fly'),('will be flying','will flying')],
'src-u01-044': [('will be cooking','will be cook'),('will be cooking','will cooking')],
'src-u01-096': [('will be sleeping','will be sleep'),('will be sleeping','will sleeping')],
'src-u01-098': [('will be waiting','will be wait'),('will be waiting','will waiting')],
'src-u03-051': [('will be reviewing','will be review'),('will be reviewing','will reviewing')],
'src-u03-070': [('will be solving','will be solve'),('will be solving','will solving')],
'new-translation-001': [('usually check','usually checks'),('usually check','am usually check')],
'new-translation-002': [('is sleeping','is sleep'),('is sleeping','are sleeping')],
'new-translation-003': [('have known','have knew'),('have known','am knowing')],
'new-translation-004': [('have been working','have being working'),('have been working','has been working')],
'new-translation-005': [('sent','have sent'),('sent','sended')],
'new-translation-006': [('was editing','was edit'),('was editing','were editing')],
'new-translation-007': [('had already left','had already leave'),('had already left','had already went')],
'new-translation-008': [('had been waiting','had being waiting'),('had been waiting','had been wait')],
'new-translation-009': [('will answer','will answers'),('will answer','will answering')],
'new-translation-010': [('are meeting','are meet'),('are meeting','is meeting')],
'new-translation-011': [('train leaves','train leave'),('train leaves','train leaving')],
'new-translation-012': [('will have completed','will has completed'),('will have completed','will have complete')],
'new-translation-013': [('will be flying','will be fly'),('will be flying','will being flying')],
'new-translation-014': [('will have been teaching','will have being teaching'),('will have been teaching','will has been teaching')],
'new-translation-015': [('is going to rain','is going rain'),('is going to rain','is going to raining')],
'new-translation-016': [('as soon as I get','as soon as I will get'),('I will call','I will calls')],
'new-translation-017': [('has gone','has went'),('has gone','has go')],
'new-translation-018': [('I read only one last week','I have read only one last week'),('I have read three','I have reading three')],
'new-translation-019': [('are always leaving','are always leave'),('are always leaving','is always leaving')],
'new-translation-020': [('used to work','used to working'),('do not do','do not does')],
'new-translation-021': [('have driven','have drove'),('have driven','has driven')],
'new-translation-022': [('has written','has wrote'),('has written','has writing')],
'new-translation-023': [('had dinner','haved dinner'),('watched','watching')],
'new-translation-024': [('Hardly had I sat','Hardly I had sat'),('when the lights','than the lights')],
'adv-translation-001': [('have written','have wrote'),('have written','has written')],
'adv-translation-002': [('have been writing','have being writing'),('is not finished','does not finished')],
'adv-translation-003': [('had been considering','had being considering'),('had been considering','had been consider')],
'adv-translation-004': [('did I realise','I did realise'),('did I realise','did I realised')],
'adv-translation-005': [('was about to leave','was about to leaving'),('was about to leave','was about leaving')],
'adv-translation-006': [('was due to open','was due to opening'),('was due to open','was due open')],
'adv-translation-007': [('will have known','will have knew'),('will have known','will has known')],
'adv-translation-008': [('will be presenting','will being presenting'),('will be presenting','will be present')],
'adv-translation-009': [('you finish','you will finish'),('will send','will sends')],
'adv-translation-010': [('will have been testing','will have being testing'),('will have been testing','will has been testing')],
'adv-translation-011': [('is being','is be'),('is being','does being')],
'adv-translation-012': [('am considering','am consider'),('I still think','I still thinking')],
'adv-translation-013': [('No sooner had we announced','No sooner we had announced'),('than the server','when the server')],
'adv-translation-014': [('Rarely have I seen','Rarely I have seen'),('have I seen','have I saw')],
'adv-translation-015': [('has been misleading','has being misleading'),('has been misleading','have been misleading')],
'adv-translation-016': [('will have received','will has received'),('will have received','will have receive')],
'new-error-001': [('I know','I knows'),('I know','I am know')],
'new-error-002': [('I saw','I have seen'),('I saw','I seen')],
'new-error-003': [('when she arrives','when she will arrive'),('I will call','I will calls')],
'new-error-004': [('has finished','has finish'),('has finished','have finished')],
'new-error-007': [('have read','have reading'),('have read','has read')],
'new-error-008': [('is working','is work'),('is working','does working')],
'new-error-009': [('was watching','was watch'),('was watching','were watching')],
'new-error-010': [('have lived','have live'),('have lived','am live')],
'new-error-011': [('Hardly had he sat','Hardly he had sat'),('when the phone','than the phone')],
'new-error-012': [('If it rains','If it will rain'),('If it rains','If it rain')],
'adv-edit-001': [('have completed','have complete'),('have completed','has completed')],
'adv-edit-002': [('I know','I knows'),('I know','I am know')],
'adv-edit-003': [('courier arrives','courier will arrive'),('courier arrives','courier arrive')],
'adv-edit-005': [('Hardly had the meeting begun','Hardly the meeting had begun'),('had the meeting begun','had the meeting began')],
'adv-edit-006': [('than analysts','when analysts'),('had we published the figures','we had published the figures')],
'adv-edit-008': [('appeared in 1928','has appeared in 1928'),('appeared in 1928','appear in 1928')],
'adv-edit-009': [('would send','will sent'),('would send','would sent')],
'adv-edit-010': [('soup tastes','soup taste'),('soup tastes','soup is taste')],
'adv-edit-011': [('will have reached','will have reach'),('By 5','Until 5')],
'adv-edit-012': [('Rarely have I seen','Rarely I have seen'),('have I seen','have I saw')],
'adv-transform-001': [('was due to arrive','was due to arriving'),('was due to arrive','was due arrive')],
'adv-transform-002': [('was about to reply','was about to replying'),('was about to reply','was about replying')],
'adv-transform-003': [('No sooner had we approved','No sooner we had approved'),('than three','when three')],
'adv-transform-004': [('Rarely have I encountered','Rarely I have encountered'),('have I encountered','have I encounter')],
'adv-transform-005': [('have been negotiating','have being negotiating'),('have been negotiating','has been negotiating')],
'adv-transform-009': [('Mira opens','Mira open'),('discovers','discover')],
'adv-transform-011': [('have just sent','have just send'),('have just sent','has just sent')],
'adv-transform-012': [('as soon as you receive','as soon as you will receive'),('will publish','will publishes')],
'cmp-0145': [('largest islands','largest island'),('largest islands','most largest islands')],
'cmp-0146': [('much easier','very easier'),('much easier','much more easier')],
'cmp-0157': [('superior to','superior than'),('superior to','more superior than')],
'cmp-0158': [('no more than 10','less than 10'),('no more than 10','more than 10')],
'cmp-0165': [('further information','farther information'),('further information','further informations')],
'cmp-0292': [('longer than','more longer than'),('longer than','longest than')],
'cmp-0293': [('not bright enough','not enough bright'),('not bright enough','not brighter enough')],
'cmp-0297': [('The quieter the room','The quietest the room'),('the easier it is','the easiest it is')],
}

FRAMES={
'adv-edit-011':'Комиссия достигнет решения не позднее 17:00 завтра. Выберите предложение, передающее именно этот крайний срок.',
'adv-transform-001':'Делегация должна была прибыть в 18:20 согласно расписанию. Выберите корректное предложение.',
'adv-transform-002':'Я уже собирался ответить, когда соединение оборвалось. Выберите корректное предложение.',
'adv-transform-003':'Сразу после утверждения бюджета три отдела попросили ещё денег. Выберите корректную конструкцию с начальным отрицательным оборотом.',
'adv-transform-004':'Говорящий лишь изредка встречал столь согласованный набор данных. Выберите грамматически корректное предложение.',
'adv-transform-005':'Переговоры начались в марте и продолжаются сейчас. Выберите корректное предложение.',
'adv-transform-009':'Выберите грамматически корректный вариант живого пересказа сюжета, в котором события представлены как происходящие сейчас.',
'adv-transform-011':'Говорящий сообщает о только что отправленном счёте. Выберите грамматически корректное предложение.',
'adv-transform-012':'Публикация будет после получения одобрения. Выберите корректное предложение об этом будущем условии.',
'adv-translation-015':'В финальной сцене герой открывает письмо и понимает, что агент всё это время вводил его в заблуждение. Выберите грамматически корректный живой пересказ.',
'cmp-0158':'Допустимая длина — до 10 см включительно. Выберите предложение, которое сохраняет именно этот верхний предел.',
}

BOUNDED={
'cmp-0129':("The hotel's prices are higher than those at the hostel. What does THOSE replace?",['the prices','the hotel','the guests'],'Those заменяет множественное prices, а не название отеля.'),
'cmp-0130':('The rent here is lower than that in the village. What does THAT replace?',['the rent','the village','the buildings'],'That заменяет неисчисляемое rent.'),
'cmp-0134':("Mina likes Alex more than she likes Jo. Who is the object in both clauses?",['Alex in the first clause and Jo in the second.','Mina in both clauses.','Jo in the first clause and Alex in the second.'],'Mina остаётся подлежащим; сравнивается её отношение к двум людям.'),
'cmp-0135':('Sam trusts Lee more than Pat does. Who is doing the trusting in the second clause?',['Pat','Lee','Sam'],'Pat — подлежащее второй части; does замещает trusts Lee.'),
}

def revise(item):
    ident=item['id']
    if ident in EDITS:
        item.pop('review_note_ru',None)
        if ident=='adv-edit-006':
            item['explanation_ru']='После начального no sooner используется инверсия had we published; вторая часть вводится than. Все глаголы здесь в активном залоге.'
            for key in ('answer','answer_text'):
                if key in item:item[key]=item[key].replace('had the figures been published','had we published the figures').replace('the figures had been published','we had published the figures')
            if item.get('options'):item['options']=[v.replace('had the figures been published','had we published the figures').replace('the figures had been published','we had published the figures') for v in item['options']]
    if ident in EDITS:
        # Idempotent post-pass: later runs must not mutate the new choice answer.
        if item.get('response_contract')=='bounded-v1' and item.get('options'):
            if ident in FRAMES:item['prompt']=FRAMES[ident]
            elif not item['prompt'].startswith('Выберите грамматически корректное предложение, передающее смысл:'):item['prompt']='Выберите грамматически корректное предложение.'
            item['content_version']=VERSIONS['comparison' if ident.startswith('cmp-') else 'tenses']
            return item
        correct=item.get('answer') or item['answer_text']
        if ident=='adv-translation-015':
            correct='In the final scene, the protagonist opens the letter and realises that the agent has been misleading him all along.'
            item['explanation_ru']='Живой пересказ: opens/realises. Has been misleading описывает длительный обман до момента осознания; пассивная конструкция больше не требуется.'
            item['rule_refs']=['content/tenses/05-contrasts-and-pitfalls.md#18-маркированные-и-продвинутые-употребления','content/tenses/02-present.md#present-perfect-continuous']
        options=[correct]
        for old,new in EDITS[ident]:
            assert old in correct,(ident,old)
            options.append(correct.replace(old,new,1))
        prompt=FRAMES.get(ident)
        if prompt is None:
            prompt=('Выберите грамматически корректное предложение, передающее смысл: '+item['prompt']) if item['type']=='translation_ru_en' else 'Выберите грамматически корректное предложение.'
        if ident!='adv-edit-006':item['explanation_ru']+=' Проверяется выбор среди показанных вариантов; писать или перефразировать предложение не требуется.'
    elif ident in BOUNDED:
        prompt,options,reason=BOUNDED[ident]
        item['explanation_ru']=reason
    else:
        assert item.get('options') or item.get('blanks'),(ident,'Unbounded response not reviewed')
        prompt=options=None
    if options:
        assert len(set(options))==3,ident
        for field in ('blanks','accepted_answers','answer_text','accepted_option_indices'):
            item.pop(field,None)
        shift=sum(map(ord,ident))%3
        item.update(type='multiple_choice',prompt=prompt,options=options[shift:]+options[:shift],correct_option_index=(-shift)%3,answer=options[0])
    item['response_contract']='bounded-v1'
    item['content_version']=VERSIONS['comparison' if ident.startswith('cmp-') else 'tenses']
    return item

def reviewed_copy(item):return revise(copy.deepcopy(item))
