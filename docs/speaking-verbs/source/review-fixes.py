import json,re,glob
A=[json.loads(l) for l in open('part-A-raw.jsonl')]
B=[json.loads(l) for f in sorted(glob.glob('part-B-0*.jsonl')) for l in open(f)]
I={i['id']:i for i in A+B}
def S(id,**kw): I[id].update(kw)
# --- Gemini (A)
S('sv-0140',prompt="They (say / tell) that eating carrots helps you see in the dark, although doctors doubt it.")
S('sv-0202',prompt="Both delegations have arrived in Geneva for a new round of peace (speak / talk) aimed at ending the border dispute.",answer="talks",accept=["talks"])
S('sv-0218',prompt="For the first time in months, the rival factions agreed to sit down for informal peace (speak / talk) in Oslo.",answer="talks",accept=["talks"])
S('sv-0265',prompt="Without a microphone in the vaulted chapel, the officiant had to (speak / talk) slowly and clearly to be heard at the back.")
S('sv-0185',prompt="“Is that Dr Evans?” — “(speak / talk). How can I help you?”")
S('sv-0285',prompt="(say / tell / speak / talk) of holidays, have you renewed your passport for our trip to Morocco yet?")
S('sv-0059',prompt="At the press conference, the architect (say / tell) very little to the journalists about the structural flaws in the foundation.",answer="said",accept=["said"],why_ru="Схема say sth to sb (very little to the journalists) — said.")
S('sv-0169',options=["told","said me","told to","said"])
S('sv-0177',prompt="The sunken galleon off the coast is ___ to have carried a cargo of seventeenth-century silver coins.",why_ru="Конструкция is said to have done (говорят, что…).")
S('sv-0239',prompt="Anyone who dismisses the surgeon's warning as mere nerves is ___ utter nonsense.")
S('sv-0291',prompt="We could meet outside the cinema at, let's ___, quarter past seven.")
S('sv-0253',prompt="After throat surgery, patients are told not to (speak / talk) above a whisper for a week.",accept=["speak","talk"],why_ru="Пользоваться голосом после операции — speak (talk здесь тоже возможно).")
S('sv-0288',accept=["talking","speaking"],why_ru="talk down to sb — говорить свысока (реже speak down to).")
# --- Codex (B)
S('sv-0312',prompt="You missed the last bus again? I (say / tell / speak / talk) you so!",why_ru="Фраза I told you so — «я же говорил».")
S('sv-0352',prompt="Your plan failed? Well, I ___ you so.",options=["said","told","spoke","talked"],answer_index=1,why_ru="I told you so — «я же говорил».")
S('sv-0371',options=["talked","said","told","says"])
S('sv-0331',accept=["talk","speak"],why_ru="talk down to sb — говорить свысока (реже speak down to).")
S('sv-0488',prompt="Передай Анне привет от меня.")
# --- переписанные тексты Codex (меньше одинаковых схем)
T=lambda p,b: {'prompt':p,'blanks':[{'options':'say / tell / speak / talk','answer':a,'accept':acc,'why_ru':w,'ref':r} for a,acc,w,r in b]}
S('sv-0442',**T("Our football coach is strict about phones. At Monday's training, two players were sitting on the bench {{1}} shop about their part-time jobs instead of warming up. “Save it for later,” the coach {{2}}. Then she {{3}} them a story about a team that lost a final because nobody was listening.",[
 ("talking",["talking"],"Говорить о работе — talk shop.","sv-talk-topic"),("said",["said"],"Прямая речь без слушателя — said.","sv-direct"),("told",["told"],"Рассказать историю — tell sb a story.","sv-tell-fixed")]))
S('sv-0444',**T("Our class recorded a podcast last week. At first nobody wanted to {{1}} anything into the microphone. Then Mina {{2}} a joke about our school canteen, and everyone relaxed. By the end, even our quietest classmate was {{3}} sense about the new timetable.",[
 ("say",["say"],"say anything — сказать что-нибудь, слушателя нет.","sv-say-objects"),("told",["told"],"Рассказать шутку — tell a joke.","sv-tell-fixed"),("talking",["talking"],"talk sense — говорить дело.","sv-talk-sense")]))
S('sv-0446',**T("During our cycling trip, we stopped at a crossroads. The old signpost {{1}} “Lake 5 km”, but the map {{2}} something completely different. Our guide laughed. “Never trust that sign,” he {{3}}. “Locals {{4}} it was turned round years ago as a joke.”",[
 ("said",["said","says"],"Табличка «говорит» через say.","sv-things-say"),("said",["said","says"],"Карта «говорит» через say.","sv-things-say"),("said",["said"],"Прямая речь — said.","sv-direct"),("say",["say"],"Слухи: people say (that)…","sv-hearsay")]))
S('sv-0447',**T("We held a video call last night to plan the school fair. The connection was terrible. “Could you {{1}} up a bit?” I asked our treasurer. She repeated that we could afford two stalls. Then I tried to {{2}} my cousin into baking muffins. “To {{3}} you the truth, I've never baked anything,” she admitted.",[
 ("speak",["speak"],"speak up — говорить громче.","sv-phrasal"),("talk",["talk"],"talk sb into — уговорить.","sv-phrasal"),("tell",["tell"],"to tell you the truth — по правде говоря.","sv-phrasal")]))
S('sv-0449',**T("At the climbing centre, I froze halfway up the wall. My legs were shaking so much that I couldn't {{1}}. My friend shouted from below, “Don't look down!” I wanted to quit, but she {{2}} me out of it. When I reached the top, I couldn't stop {{3}} about it for the rest of the evening.",[
 ("speak",["speak"],"Не мочь вымолвить слово — can't speak.","sv-speak-ability"),("talked",["talked"],"talk sb out of — отговорить.","sv-phrasal"),("talking",["talking"],"Говорить без умолку о чём-то с друзьями — talk about.","sv-talk-chat")]))
S('sv-0450',**T("Our group chat was full of confusing messages about Saturday's picnic. Nobody had {{1}} the new members where we were meeting. I pinned a message that {{2}}, “Main gate, 11 a.m.” Then Leo asked me to {{3}} him through ordering the food online, because he had never used the app before.",[
 ("told",["told"],"Человек сразу после глагола (the new members) — told.","sv-reported"),("said",["said","says"],"Сообщение «говорит» через say.","sv-things-say"),("talk",["talk"],"talk sb through sth — объяснить по шагам.","sv-phrasal")]))
S('sv-0453',**T("My brother wanted to buy a huge gaming chair. “It won't fit under your desk,” I {{1}}. He ignored me, so I {{2}} him to measure the space first. It was twenty centimetres too small. Needless to {{3}}, he didn't order it, but he still won't admit I was right.",[
 ("said",["said"],"Прямая речь без слушателя — said.","sv-direct"),("told",["told"],"Указание человеку — tell sb to do.","sv-orders"),("say",["say"],"needless to say — излишне говорить.","sv-phrasal")]))
S('sv-0462',**T("Our running group meets before sunrise. Yesterday the organiser phoned me at 6 a.m. “Hello, is that Kate?” she asked. “{{1}},” I answered sleepily. She {{2}} me that the riverside path was flooded and we would use the park. Honestly, I was happy to {{3}} goodbye to the cold river wind for one morning.",[
 ("Speaking",["Speaking","speaking"],"Ответ по телефону «это я» — Speaking.","sv-phone"),("told",["told"],"Человек сразу после глагола (me) — told.","sv-reported"),("say",["say"],"say goodbye — прощаться.","sv-say-objects")]))
S('sv-0464',**T("We tested our new board game last night. My sister {{1}} us not to look at each other's cards, but Dad kept peeking. “I'm not cheating!” he {{2}}. Nobody believed him: his big smile {{3}} volumes. In the end we agreed that he should apologise and {{4}} sorry to everyone.",[
 ("told",["told"],"Запрет человеку — tell sb not to do.","sv-orders"),("said",["said"],"Прямая речь — said.","sv-direct"),("spoke",["spoke"],"speak volumes — говорить красноречивее слов.","sv-phrasal"),("say",["say"],"say sorry — извиниться.","sv-say-objects")]))
S('sv-0471',**T("We organised a surprise breakfast for Ana's birthday. Her flatmate had to {{1}} her into going for a walk while we decorated the kitchen. When she came back, she stood in the doorway and didn't {{2}} a word for almost a minute. Later she {{3}} us it was the best birthday she had ever had.",[
 ("talk",["talk"],"talk sb into — уговорить.","sv-phrasal"),("say",["say"],"say a word — сказать слово.","sv-say-objects"),("told",["told"],"Человек сразу после глагола (us) — told.","sv-reported")]))
S('sv-0474',**T("Our head teacher asked me to read an announcement at the school concert. I was so nervous that I could hardly {{1}}. My partner whispered, “{{2}} up, the parents at the back can't hear!” Afterwards the head teacher {{3}} highly of our performance in her speech.",[
 ("speak",["speak"],"Еле мочь говорить от волнения — could hardly speak.","sv-speak-ability"),("Speak",["Speak","speak"],"speak up — говорить громче.","sv-phrasal"),("spoke",["spoke"],"speak highly of — хорошо отзываться.","sv-phrasal")]))
S('sv-0476',**T("The gym's booking app crashed again yesterday. The screen {{1}} that every class was full, although the studio was empty. The receptionist {{2}} us to wait while she restarted the system. Meanwhile two members started {{3}} politics so loudly that half the room joined in.",[
 ("said",["said"],"Экран «говорит» через say.","sv-things-say"),("told",["told"],"Указание человеку — tell sb to do.","sv-orders"),("talking",["talking"],"Тема без предлога: talk politics.","sv-talk-topic")]))

S('sv-0446',**T("During our cycling trip, we stopped at a crossroads. The old signpost {{1}} “Lake 5 km”, but our guide just laughed. “Never trust that sign,” he {{2}} us. “The locals turned it round years ago as a joke.” We couldn't stop {{3}} about it all the way to the lake.",[
 ("said",["said","says"],"Табличка «говорит» через say.","sv-things-say"),("told",["told"],"После прямой речи слушатель без предлога (us) — told.","sv-direct"),("talking",["talking"],"Болтать о чём-то всю дорогу — talk about.","sv-talk-chat")]))
S('sv-0449',**T("At the climbing centre, I froze halfway up the wall. I was so scared that I couldn't {{1}}. My friend shouted from below, “Don't look down!” I wanted to quit, but she {{2}} me out of it. At the top I finally {{3}} what I was thinking: “Never again!”",[
 ("speak",["speak"],"Не мочь вымолвить слово — can't speak.","sv-speak-ability"),("talked",["talked"],"talk sb out of — отговорить.","sv-phrasal"),("said",["said"],"Произнести слова (что думал) — said.","sv-say-objects")]))
S('sv-0453',**T("My brother wanted to buy a huge gaming chair. “It won't fit under your desk,” I {{1}}. He ignored me, so I {{2}} him to measure the space first. It was twenty centimetres too small. In the end he didn't order it, and he even let me {{3}} him through choosing a smaller one.",[
 ("said",["said"],"Прямая речь без слушателя — said.","sv-direct"),("told",["told"],"Указание человеку — tell sb to do.","sv-orders"),("talk",["talk"],"talk sb through sth — объяснить по шагам.","sv-phrasal")]))
S('sv-0474',**T("Our head teacher asked me to read an announcement at the school concert. I was so nervous that I could hardly {{1}}. My partner whispered that the parents at the back couldn't hear. “Just {{2}} the words slowly,” she added. Afterwards the head teacher {{3}} us that we had done a great job.",[
 ("speak",["speak"],"Еле мочь говорить от волнения — could hardly speak.","sv-speak-ability"),("say",["say"],"Произносить слова — say the words.","sv-say-objects"),("told",["told"],"Человек сразу после глагола (us) — told.","sv-reported")]))
# levels for Codex part by complexity
def words(p): return len(re.sub(r'\(.*?\)|\{\{\d+\}\}|___','x',p).split())+len(re.findall(r',|;|—| that | because | although | while | before | after | when | if ',p))*2
for grp in (['open_brackets','multiple_choice'],['context_cloze']):
    xs=sorted([i for i in B if i['type'] in grp],key=lambda i:(words(i['prompt'])+(3*len(i.get('blanks',[])) if i['type']=='context_cloze' else 0),i['id']))
    n=len(xs)
    for k,i in enumerate(xs): i['level']='basic' if k<n*.3 else 'medium' if k<n*.75 else 'advanced'
for name,part in [('A',A),('B',B)]:
    open(f'final-{name}.jsonl','w').write('\n'.join(json.dumps(I[i['id']],ensure_ascii=False) for i in part)+'\n')
