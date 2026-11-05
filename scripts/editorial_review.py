"""Reviewed item-level corrections and acceptable readings, 2026-10-26.

Edits apply to the derived bank. Never guess verb morphology or erase meaning.
"""
import re

VERSION = '2026-10-26.2'
REFS = {
 'present_simple':'02-present.md#present-simple', 'present_continuous':'02-present.md#present-continuous',
 'present_perfect':'02-present.md#present-perfect-simple', 'present_perfect_continuous':'02-present.md#present-perfect-continuous',
 'past_simple':'03-past.md#past-simple', 'past_continuous':'03-past.md#past-continuous',
 'past_perfect':'03-past.md#past-perfect-simple', 'past_perfect_continuous':'03-past.md#past-perfect-continuous',
 'future_simple':'04-future.md#future-simple-will--v1','future_continuous':'04-future.md#future-continuous-will-be--v-ing',
 'future_perfect':'04-future.md#future-perfect-simple-will-have--v3','future_perfect_continuous':'04-future.md#future-perfect-continuous-will-have-been--v-ing',
 'future_in_past':'04-future.md#future-in-the-past','going_to':'04-future.md#be-going-to',
}
EXPLANATIONS = {
 'present_simple':'Present Simple описывает факт, состояние или регулярное действие. Для расписания и придаточного будущего оно также возможно; выбор определяется всей фразой, а не одним маркером.',
 'present_continuous':'Present Continuous показывает действие в процессе, временную ситуацию или организованный будущий план. Сравните значение с контекстом предложения.',
 'present_perfect':'Present Perfect Simple связывает прошлое с настоящим: результат, опыт или ситуацию в периоде до настоящего. Эта форма не используется с указанием законченного времени вроде yesterday.',
 'present_perfect_continuous':'Present Perfect Continuous подчёркивает деятельность, продолжавшуюся до настоящего, или её недавний след. Simple тоже может быть верным, если контекст допускает акцент на факте или результате.',
 'past_simple':'Past Simple описывает событие, состояние или привычку в завершённом прошлом. В последовательности событий это обычная форма повествования.',
 'past_continuous':'Past Continuous показывает действие в процессе в рассматриваемый момент прошлого или фон для другого события.',
 'past_perfect':'Past Perfect показывает, что действие завершилось до другой прошлой точки. Если порядок уже выражен before или after, Past Simple также может быть допустим.',
 'past_perfect_continuous':'Past Perfect Continuous подчёркивает длительность деятельности до рассматриваемого момента прошлого.',
 'future_simple':'Will + начальная форма выражает прогноз, обещание, решение или нейтральное сообщение о будущем. План и расписание могут допускать другие формы.',
 'future_continuous':'Future Continuous выделяет действие в процессе в будущий момент или ожидаемый ход событий.',
 'future_perfect':'Future Perfect представляет результат как достигнутый не позднее будущего срока. Will + начальная форма также возможна, если речь просто об обещании закончить к сроку.',
 'future_perfect_continuous':'Future Perfect Continuous показывает длительность деятельности до будущей точки.',
 'going_to':'Be going to выражает намерение или прогноз по имеющимся признакам.',
 'future_in_past':'Будущее из прошлой точки может выражаться would, was/were going to, was/were to или was/were due to — в зависимости от смысла плана.',
}
# Complete prompts avoid contradictory time anchors and mismatches with keys.
PROMPTS = {
 'src-u01-016':"16. When I came in, the students (to take) an important test. They (to do) it for two hours already and looked completely drained.",
 'src-u01-029':"29. She can't meet me today because she (to have) a series of important back-to-back online meetings.",
 'src-u01-032':"32. I understand it clearly now because I (to learn) the rule and practised using it thoroughly.",
 'src-u02-039':"39. He (to finish) all his homework by 8 tomorrow evening. At 8 he (to watch) his favourite series as a reward.",
 'src-u06-096':"96. By 7 this evening we (to send) all the client emails, and at 7 we (to play) table tennis in the company break room.",
 'src-u01-001':"1. Bob (to watch) a gripping new thriller series for the past two hours — he's been glued to the screen all evening.",
 'src-u01-009':"9. He (to speak) both English and Spanish fluently. Now he (to speak) Spanish on a call with the Madrid office.",
 'src-u01-084':"84. We (to have) a wonderful time together last year travelling around Europe.",
 'src-u01-099':"99. The lesson (to finish) by 2 o'clock, so we can grab something to eat afterwards.",
 'src-u02-036':"36. Tom (to leave) for Rome tomorrow morning on a very early flight — he has already packed all his bags.",
 'src-u02-079':"79. Bob and Bill (to get) the official confirmation message a moment ago and are absolutely delighted with the news.",
 'src-u03-040':"40. Emma (to smile) broadly now because she is so glad to see you after such a long time.",
 'src-u03-082':"82. Last night I (to read) the fascinating e-book which I (to download) from the library app earlier that day.",
 'src-u03-092':"92. I (to choose) this playlist for our upcoming road trip. I will share it with Bill before we set off.",
 'src-u04-004':"4. It (to rain) steadily for hours before I left the house. That's why I took my umbrella.",
 'src-u04-021':"21. He could not type because the keyboard (to break) during the office move.",
 'src-u04-030':"30. The builders (to build) these co-working spaces three years ago. They are already fully booked every day.",
 'src-u04-032':"32. I (to finish) my breakfast smoothie bowl a moment ago and am feeling ready for the day.",
 'src-u05-061':"61. The water in this pan (to boil) at 100 degrees Celsius at normal atmospheric pressure.",
 'src-u05-064':"64. I (to call) you as soon as I (to find out) the results of the interview next week — I promise.",
 'src-u05-085':"85. The caretaker (to live) on the premises throughout the busy summer season.",
 'src-u05-097':"97. There's no coffee left in the pot. We (to drink) it all before nine this morning; it's noon now.",
 'src-u06-019':"19. At present almost everyone in our team (to have) a smartphone with mobile internet access.",
 'src-u06-031':"31. The CEO (to become) head of the company in 2015 after years of steadily climbing the corporate ladder.",
 'src-u06-090':"90. Where on earth is the marketing budget? I (to spend) it all on the campaign already — every last penny.",
 'src-u07-006':"6. Several generations of this family (to live) in the same village since the eighteenth century.",
 'src-u07-008':"8. People (to immigrate) to various countries for centuries in search of better opportunities. Many migrations in my family's history (to be) in the mid-twentieth century.",
 'src-u07-010':"10. On the 1st of January many people (to make) New Year's resolutions and try to keep them throughout the year.",
 'src-u07-020':"20. The local council (to build) this library almost a century ago, and it still serves the community today.",
 'src-u07-023':"23. A lack of sleep often (to cause) me to lose concentration during long meetings.",
 'src-u07-037':"37. We are running late. The film (already / to start) by the time we finally (to get) to the cinema.",
 'src-u07-039':"39. Yesterday afternoon Sharon (to go) to the airport to pick up Paul. When she (to get) there, Paul (already / to wait) for her. His flight (to arrive) early.",
 'src-u07-051':"51. As soon as I (to find out) the exam results tomorrow morning I (to message) you — I promise.",
 'src-u07-072':"72. Nowadays, most households in our building (to consist) of just one or two people.",
 'src-u08-024':"24. They (to publish) a lot of insightful articles over the past twelve months.",
 'src-u08-047':"This director is arguably the most influential filmmaker I (ever / to study).",
 'src-u08-100':"100. At present almost everyone in my class (to have) a smartphone with dozens of apps installed.",
 'src-u09-018':"18. The CEO (to become) head of the company in 2020 after a long selection process.",
 'src-u09-053':"53. Every time I (to call) her, she (to be) away from home — I am starting to wonder what's going on.",
 'src-u09-068':"68. I have no idea what time it is right now. My phone (to run) completely out of battery.",
 'src-u09-070':"70. I know what the forecast says about tomorrow because I (already / to check) the weather app.",
 'src-u10-014':"14. Nobody in our team (to know) exactly what (to cause) the server failure last night.",
 'src-u10-016':"16. The Library of Congress (to contain) a vast collection of books, manuscripts and other materials.",
 'src-u10-024':"24. British colonisation of Australia (to begin) in 1788 when the First Fleet arrived.",
 'src-u10-025':"25. Many British people (to celebrate) Guy Fawkes Night on the 5th of November with fireworks and bonfires. They (to celebrate) it for centuries.",
 'src-u10-037':"37. It was very quiet in the office. Everyone (already / to go) home. Only the clock on the desk (to tick).",
 'src-u10-079':"79. John Milton (to publish) Paradise Lost in 1667. He (already / to go) completely blind when he (to write) it.",
 'src-u10-088':"88. László Bíró (to develop) a practical ballpoint pen in the twentieth century, transforming everyday writing.",
 'src-u10-089':"89. Mozart (to compose) many symphonies during his short but productive lifetime.",
 'new-choice-008':"Choose the prediction based on visible evidence: Look at the fuel gauge. We ___ petrol.",
 'adv-choice-005':"Look! The chef ___ the sauce right now to see whether it needs more salt.",
 'new-error-005':"Используйте Future Perfect, чтобы явно показать результат к сроку: By Friday I finish the project.",
 'new-error-006':"Покажите с помощью Past Perfect, что уход предшествовал приезду: When I arrived, they already left.",
 'new-error-007':"Все три книги уже прочитаны. Исправьте английское предложение: I have been reading three books this month.",
 'new-error-009':"Опишите процесс, уже шедший в восемь: At eight yesterday, I watched the presentation.",
 'adv-edit-001':"Все шесть интервью завершены. Исправьте английское предложение: I have been completing six interviews so far this week.",
 'adv-edit-007':"First she had opened the attachment, had read the first paragraph and had called security.",
 'adv-edit-009':"Last year she said she will send the revised draft the following morning.",
 'adv-transform-007':"Use Future Perfect: The team expects to complete all twelve interviews by Friday.",
 'adv-discourse-003':"Which sentence presents a completed period of residence in Paris, rather than a period continuing up to now?",
}
# Field numbers are one-based. A replacement key resets stale accepted answers.
KEYS = {
 'src-u01-016':{1:('were taking','past_continuous','take')},
 'src-u01-009':{1:('speaks','present_simple','speak')},
 'src-u01-084':{1:('had','past_simple','have')},
 'src-u01-099':{1:('will have finished','future_perfect','finish')},
 'src-u02-079':{1:('got','past_simple','get')},
 'src-u03-011':{1:('will get','future_simple','get')},
 'src-u04-021':{1:('had broken','past_perfect','break')},
 'src-u04-030':{1:('built','past_simple','build')},
 'src-u04-032':{1:('finished','past_simple','finish')},
 'src-u05-064':{2:('find out','present_simple','find out')},
 'src-u05-097':{1:('drank','past_simple','drink')},
 'src-u07-037':{1:('will have already started','future_perfect','start')},
 'src-u07-039':{3:('was already waiting','past_continuous','wait')},
 'src-u07-051':{1:('find out','present_simple','find out')},
 'src-u09-070':{1:('have already checked','present_perfect','check')},
 'src-u10-079':{1:('published','past_simple','publish')},
 'src-u10-088':{1:('developed','past_simple','develop')},
}
ITEM_KEYS = {
 'adv-edit-007':'First she opened the attachment, read the first paragraph and called security.',
 'adv-edit-009':'Last year she said she would send the revised draft the following morning.',
}
# Different choices can be grammatical. Keep a model answer, accept all reviewed readings.
CHOICES = {
 'new-choice-002':[0,1], 'new-choice-004':[0,1], 'new-choice-006':[0,1],
 'new-choice-007':[0,1], 'new-choice-009':[0,1], 'new-choice-010':[0,1], 'new-choice-011':[0,1],
 'adv-choice-001':[0,2], 'adv-choice-003':[2,3], 'adv-choice-004':[0,1],
 'adv-choice-006':[0,1,2], 'adv-choice-009':[0,1],
}
# Explicit alternatives are tied to the reviewed sentence, never global tense substitution.
ALTERNATIVES = {
 'new-error-004':{0:['He finished the report, so you can send it now.']},
 'new-error-007':{0:['I read three books this month.']},
 'new-error-011':{0:['He had hardly sat down when the phone rang.']},
 'adv-edit-004':{0:['By next Friday, we will have worked on the migration for three months.']},
 'adv-edit-005':{0:['The meeting had hardly begun when the fire alarm sounded.']},
 'adv-edit-008':{0:['The manuscript appeared in 1928 and has changed the field.']},
 'adv-edit-012':{0:['I have rarely seen an argument collapse so quickly under scrutiny.']},
 'src-u01-015':{2:['is waiting']}, 'src-u01-025':{2:['am preparing']},
 'src-u01-029':{1:['has']}, 'src-u01-037':{1:['has worked']},
 'src-u01-042':{1:['was reading','read']}, 'src-u01-046':{1:['will arrive','will be arriving','is going to arrive']},
 'src-u01-049':{1:['is looking']}, 'src-u01-064':{1:['are consulting','are going to consult']},
 'src-u01-065':{1:['is going to buy']}, 'src-u01-078':{1:['have learned','have learnt']},
 'src-u01-079':{1:['had learned','had learnt']}, 'src-u01-080':{2:['will learn']},
 'src-u01-086':{1:['have gone']}, 'src-u01-099':{1:['will finish','finishes']}, 'src-u01-089':{1:['will have worked']},
 'src-u02-002':{1:['submitted']}, 'src-u02-008':{1:['will take','will be taking','are going to take']},
 'src-u02-010':{1:['looked']}, 'src-u02-025':{1:['am going to visit']},
 'src-u02-039':{1:['will finish']}, 'src-u02-046':{1:['is talking']},
 'src-u02-049':{1:['was waiting']}, 'src-u02-053':{1:['have been making']},
 'src-u02-061':{1:['cooked']}, 'src-u02-062':{1:['will clean','am going to clean','am cleaning']},
 'src-u02-066':{1:['worked']}, 'src-u02-071':{1:['will be working','is working']},
 'src-u02-072':{2:['got']}, 'src-u02-082':{2:['have gone']},
 'src-u02-085':{1:['have fallen']}, 'src-u02-086':{1:['had learned','had learnt']},
 'src-u02-087':{1:['has learned','has learnt']}, 'src-u02-096':{2:['will start','is starting']},
 'src-u03-001':{1:['has lived']}, 'src-u03-003':{1:['will move','is going to move']},
 'src-u03-011':{1:['is going to get']}, 'src-u03-012':{1:['was working']},
 'src-u03-016':{1:['have lived']}, 'src-u03-018':{1:['has gone']},
 'src-u03-031':{1:['has explored']}, 'src-u03-033':{1:['will leave','is going to leave']},
 'src-u03-041':{1:['was smiling']}, 'src-u03-045':{1:['was waiting']},
 'src-u03-052':{1:['is still practising']}, 'src-u03-057':{2:['are learning','have learned','have learnt']},
 'src-u03-060':{2:['are moving','are going to move']}, 'src-u03-063':{1:['has been speaking']},
 'src-u03-067':{2:['is still working']}, 'src-u03-076':{2:['was still reading']},
 'src-u03-081':{1:['have downloaded']}, 'src-u03-082':{2:['had downloaded']},
 'src-u03-083':{1:['am completing','am going to complete']}, 'src-u03-094':{1:['were snowboarding']},
 'src-u04-016':{1:['has written']}, 'src-u04-043':{1:['am looking']},
 'src-u04-048':{2:['prepared']}, 'src-u04-050':{2:['has told']},
 'src-u04-068':{2:['have worked']}, 'src-u04-074':{1:['have lived']},
 'src-u04-076':{1:['worked']}, 'src-u04-077':{1:['have worked']},
 'src-u04-091':{1:['was sleeping']}, 'src-u04-099':{2:['slept','have been sleeping']},
 'src-u05-006':{2:['is feeling']}, 'src-u05-019':{1:['was feeling']},
 'src-u05-026':{1:['know']}, 'src-u05-028':{1:['were getting','got']},
 'src-u05-042':{1:['am telling']},
 'src-u05-046':{1:['were lying']}, 'src-u05-050':{1:['has practised','has practiced']},
 'src-u05-051':{1:['has worked']}, 'src-u05-058':{1:['am getting up','will get up']},
 'src-u05-065':{1:['came','has come']}, 'src-u05-073':{2:['has been raining']},
 'src-u05-074':{1:['has sat']}, 'src-u05-078':{1:['was raining']},
 'src-u05-079':{1:['have completed']}, 'src-u05-083':{1:['opened']},
 'src-u05-084':{1:['finished']}, 'src-u05-092':{1:['have downloaded']},
 'src-u06-017':{2:['am telling']}, 'src-u06-028':{1:['has designed and made']},
 'src-u06-036':{1:['is getting']}, 'src-u06-048':{1:['has been rising']},
 'src-u06-059':{1:['is meeting','is going to meet']}, 'src-u06-071':{1:['was sitting']},
 'src-u06-082':{1:['are']}, 'src-u06-089':{1:['have used']},
 'src-u06-097':{2:['splashed']}, 'src-u06-099':{1:['scrolled']},
 'src-u07-002':{1:['have become']}, 'src-u07-006':{1:['have been living']},
 'src-u07-008':{1:['have been immigrating']}, 'src-u07-013':{1:['went']},
 'src-u07-014':{1:['stopped']}, 'src-u07-016':{2:['will have finished']},
 'src-u07-039':{4:['arrived']}, 'src-u07-047':{1:['prepared']},
 'src-u07-048':{1:['will prepare']}, 'src-u07-049':{1:['am going to go']},
 'src-u07-060':{1:['has aired']}, 'src-u07-063':{1:['has played']},
 'src-u07-071':{1:['combine']}, 'src-u07-081':{1:['was waiting']},
 'src-u07-088':{1:['has done']}, 'src-u07-089':{1:['had done']},
 'src-u08-001':{1:['fell']}, 'src-u08-002':{1:['finished']}, 'src-u08-004':{1:['had lived']},
 'src-u08-005':{1:['is working']}, 'src-u08-013':{1:['did']},
 'src-u08-024':{1:['have been publishing']}, 'src-u08-030':{2:['have lived']},
 'src-u08-045':{1:['told']}, 'src-u08-050':{1:['read']},
 'src-u08-056':{1:['have put']}, 'src-u08-066':{1:['am playing','am going to play']},
 'src-u08-067':{1:['is having','will have']}, 'src-u08-079':{1:['has been getting']},
 'src-u08-086':{1:['completed']}, 'src-u08-090':{1:['heard']},
 'src-u08-091':{1:['read']}, 'src-u08-092':{1:['opened']},
 'src-u08-095':{1:['are still living']}, 'src-u09-003':{1:['have taught']},
 'src-u09-006':{1:['bought']}, 'src-u09-016':{1:['opened']}, 'src-u09-022':{1:['was having']},
 'src-u09-029':{1:['appeared']}, 'src-u09-030':{1:['finished']},
 'src-u09-031':{1:['enjoyed']}, 'src-u09-034':{1:['talked']},
 'src-u09-040':{2:['were using']}, 'src-u09-054':{2:['has studied']},
 'src-u09-055':{1:['got']}, 'src-u09-067':{1:['waited','was waiting']},
 'src-u09-076':{1:['are working']}, 'src-u09-093':{1:['fell']},
 'src-u10-010':{1:['has run']}, 'src-u10-021':{1:['have been celebrating']},
 'src-u10-025':{2:['have been celebrating']}, 'src-u10-026':{1:['have met']},
 'src-u10-032':{1:['finished']}, 'src-u10-033':{1:['have run into']},
 'src-u10-034':{1:['sent']}, 'src-u10-041':{2:['had put']},
 'src-u10-044':{1:['has written']}, 'src-u10-054':{1:['discussed']},
 'src-u10-055':{1:['had crashed']}, 'src-u10-056':{1:['sketched']},
 'src-u10-058':{1:['was working']}, 'src-u10-059':{1:['have been travelling','have been traveling']},
 'src-u10-063':{1:['develop']}, 'src-u10-068':{1:['stood']},
 'src-u10-073':{1:['have been cloning']}, 'src-u10-074':{1:['has been increasing']},
 'src-u10-085':{1:['was waiting']}, 'src-u10-096':{1:['is delivering','has been delivering']},
 'src-u10-097':{1:['finished']}, 'src-u10-098':{1:['have written']},
 'new-cloze-001':{3:['has prepared'],8:['will start','is starting']},
 'new-cloze-002':{3:['saved'],5:['searched']},
 'new-cloze-003':{1:['will begin','is beginning'],2:['are welcoming'],3:['will give'],4:['will have worked'],5:['will be meeting'],7:['are going to sign']},
 'new-cloze-004':{1:['have worked'],3:['did not meet'],5:['have been feeling']},
 'adv-cloze-001':{3:['expected','were expecting'],4:['planned','were planning'],8:['were preparing']},
 'adv-cloze-002':{1:['will open','is opening'],2:['will have collected'],3:['will complete'],5:['will be meeting'],7:['are going to give']},
 'adv-cloze-003':{2:['removed'],5:['catalogued'],8:['had looked']},
 'adv-cloze-004':{3:['have worked'],8:['omitted']},
 'adv-cloze-005':{1:['was going to close','was to close','was due to close'],2:['would begin','were going to begin','were due to begin'],3:['would start','was going to start','was to start'],4:['would visit','was going to visit','was to visit','was due to visit'],5:['would use','were going to use'],6:['anticipated']},
 'adv-cloze-006':{1:['have resolved'],2:['have reduced'],4:['argue','are arguing'],6:['will have used']},

 'new-error-010':{0:['I have been living here since 2020.']},
}

TRANSLATIONS = {
 'new-translation-001':['I usually check my mail after breakfast.','I normally check my email after breakfast.','I generally check my email after breakfast.','Usually I check my email after breakfast.'],
 'new-translation-002':['Shh! The baby is sleeping.','Keep quiet! The baby is asleep.','Be quiet! The baby is asleep.','Quiet! The child is sleeping.'],
 'new-translation-003':['I have known Anna since the year 2019.'],
 'new-translation-004':['We have been working on this project since this morning.','We have worked on this project since early this morning.','We have worked on this project since this morning.'],
 'new-translation-005':['Yesterday I sent the report to the client.','I sent the client the report yesterday.','Yesterday I sent the client the report.','I sent the report to the customer yesterday.'],
 'new-translation-006':['I was editing the presentation when you called.','When you phoned I was editing the presentation.','I was editing the presentation when you phoned.','When you called I was working on the presentation.'],
 'new-translation-007':['The train had already left when we arrived at the station.','When we got to the station the train had already left.','The train had already departed when we arrived at the station.','When we arrived at the station the train had already departed.'],
 'new-translation-008':['By then they had been waiting for two hours.','They had already been waiting for two hours by then.','By that time they had been waiting for two hours.','By that point they had already been waiting for two hours.'],
 'new-translation-009':['The phone is ringing. I will get it.','The phone is ringing. I will answer.','The telephone is ringing. I will answer it.'],
 'new-translation-010':['We are meeting a new client on Tuesday.','On Tuesday we are meeting the new client.','We will be meeting the new client on Tuesday.','We are going to meet the new client on Tuesday.'],
 'new-translation-011':['The train leaves at 6:40 tomorrow.','The train departs tomorrow at 6:40.','Tomorrow the train leaves at 6:40.','The train is leaving tomorrow at 6:40.'],
 'new-translation-012':['She will have finished all the calculations by Friday.','By Friday she will have completed all the calculations.','She will finish all the calculations by Friday.','She will complete all the calculations by Friday.'],
 'new-translation-013':['At this time tomorrow we will be flying over the Atlantic.','We will be flying over the Atlantic at this time tomorrow.','Tomorrow at this time we will be flying over the Atlantic.'],
 'new-translation-014':['By June he will have taught here for ten years.','He will have been teaching here for ten years by June.'],
 'new-translation-015':['Look at those clouds! It is going to start raining.','Look at these clouds! It is going to rain.','Look at those clouds! It is about to rain.'],
 'new-translation-016':['As soon as I get the results I will call you.','I will phone you as soon as I get the results.','I will call you as soon as I receive the results.','As soon as I receive the results I will call you.','I will call you as soon as I have received the results.'],
 'new-translation-017':['Tom is not home: he has gone to the gym.','Tom is not at home. He has gone to the gym.','Tom is not at home; he has gone to the gym.','Tom is not at home because he has gone to the gym.'],
 'new-translation-018':['This week I have read three reports but last week I read only one.','I have read three reports this week but only one last week.','I have read three reports this week whereas I read only one last week.'],
 'new-translation-019':['You are always leaving dirty mugs on the table!','You always leave dirty cups on the table!','You are constantly leaving dirty cups on the table!'],
 'new-translation-020':['I used to work nights but I do not any more.','I used to work at night but I no longer do.','I used to work nights but I no longer do.','I used to work at night but I do not do that anymore.'],
 'new-translation-021':['It is the first time I have driven in snow.','This is my first time driving in the snow.','I am driving in the snow for the first time.'],
 'new-translation-022':['She has written two chapters this morning.','Since this morning she has written two chapters.'],
 'new-translation-023':['We had dinner then watched a film.','We had dinner and afterwards watched a film.','We had dinner and then we watched a film.','We had dinner and then watched a movie.'],
 'new-translation-024':['I had hardly sat down when the lights went out.','Scarcely had I sat down when the lights went out.','As soon as I sat down the lights went out.','No sooner had I sat down than the lights went out.'],
 'adv-translation-001':['Since the start of the week I have written three sections of the report.','I have written three sections of the report since the start of the week.'],
 'adv-translation-002':['I have been working on this report since Monday but it is not ready yet.','I have been writing this report since Monday but it is still not finished.','I have been writing this report since Monday but it is not ready yet.'],
 'adv-translation-003':['By the time the committee finally reached a decision it had been considering the application for nearly a year.','By the time the committee finally made a decision it had been considering the application for almost a year.'],
 'adv-translation-004':['It was only when I restored the backup that I realised I had deleted the wrong file.','Only after restoring the backup did I realise that I had deleted the wrong file.','Only when I restored the backup did I realise I had deleted the wrong file.'],
 'adv-translation-005':['I was just about to leave when the flight cancellation message arrived.','I was about to leave when I received a message saying the flight had been cancelled.','I was about to leave when a message arrived saying the flight had been cancelled.'],
 'adv-translation-006':['The museum was supposed to open in May but the building work took longer than expected.','The museum was meant to open in May but the construction work overran.','The museum was due to open in May but construction was delayed.'],
 'adv-translation-007':['I will have known her for ten years by July.'],
 'adv-translation-008':['At this time tomorrow I will be presenting the results to the board of directors.','Tomorrow at this time I will be presenting the results to the board.','I will be presenting the results to the board this time tomorrow.'],
 'adv-translation-009':['I will send the final version as soon as you finish the review.','As soon as you have finished the review I will send the final version.','Once you finish checking it I will send the final version.'],
 'adv-translation-010':['The team will have been testing the system for twelve weeks by the end of the month.','By the end of the month the team will have tested the system for twelve weeks.'],
 'adv-translation-011':['He is being unusually restrained today.','Today he is being unusually reserved.','He is unusually reserved today.'],
 'adv-translation-012':['I am thinking about your offer but I still think the price is too high.','I am considering your offer but I still consider the price too high.','I am considering your proposal but for now I think the price is too high.'],
 'adv-translation-013':['We had no sooner announced the results than the server went down again.','Hardly had we announced the results when the server went down again.','No sooner had we announced the results than the server crashed again.'],
 'adv-translation-014':['I have rarely seen such a convincing rebuttal.','Rarely have I seen such a persuasive rebuttal.','Seldom have I seen such a convincing refutation.'],
 'adv-translation-015':['Then the hero opens the letter and realises that he has been deceived all this time.','And then the protagonist opens the letter and realises that he has been deceived all this time.','Then the hero opens the letter and realises that he has been lied to all along.'],
 'adv-translation-016':['He has probably already received our letter — his assistant confirmed delivery.','He will probably have received our letter by now — his assistant confirmed delivery.','He has probably received our letter already — his assistant confirmed the delivery.'],
}

# BrE/AmE spelling and conventional irregular variants; no arbitrary fuzzy distance.
SPELLINGS = [('learned','learnt'),('burned','burnt'),('spilled','spilt'),('dreamed','dreamt'),('spelled','spelt'),('smelled','smelt'),('travelled','traveled'),('travelling','traveling'),('practise','practice'),('practises','practices'),('practised','practiced'),('practising','practicing'),('realise','realize'),('realises','realizes'),('realised','realized'),('memorise','memorize'),('memorised','memorized'),('catalogued','cataloged'),('organised','organized'),('colour','color')]


def spelling_variants(answers):
    values = set(answers)
    for british, american in SPELLINGS:
        for value in tuple(values):
            for a,b in [(british,american),(american,british)]:
                if re.search(r'\b'+a+r'\b',value):
                    values.add(re.sub(r'\b'+a+r'\b',b,value))
    return sorted(values)


def infer_tense(answer):
    a = re.sub(r'\b(already|just|ever|never|still|always)\s+', '', answer.lower())
    for pattern,tag in [
        (r'^will have been .*ing$','future_perfect_continuous'),(r'^will have ','future_perfect'),
        (r'^will be .*ing$','future_continuous'),(r'^will ','future_simple'),
        (r'^(have|has) been .*ing$','present_perfect_continuous'),(r'^(have|has) ','present_perfect'),
        (r'^had been .*ing$','past_perfect_continuous'),(r'^had ','past_perfect'),
        (r'^(am|is|are) going to ','going_to'),(r'^(am|is|are) .*ing$','present_continuous'),
        (r'^(was|were) .*ing$','past_continuous'),(r'^(would |was (about|due|going) to |were (going|due) to |were to |was to )','future_in_past')]:
        if re.search(pattern,a):return tag
    return None


def review_item(item):
    ident=item['id']
    if ident in PROMPTS:item['prompt']=PROMPTS[ident]
    if ident == 'src-u03-060':item['prompt']=item['prompt'].replace('move) to it','move) into it')
    if ident == 'adv-cloze-005':
        item['prompt']=item['prompt'].replace('Engineers {{2:begin}}','According to the plan, engineers {{2:begin}}').replace('on opening day','on the first day of the works')
    if ident == 'adv-discourse-006':
        item['options'][1]="The courier will have delivered the parcel by now; the tracking page shows the recipient's signature."
        item['answer']=item['options'][1]
    if ident in KEYS:
        for number,(answer,tense,base) in KEYS[ident].items():
            blank=item['blanks'][number-1]
            blank.update(answer=answer,accepted_answers=[answer],base_verb=base,tense_or_construction=tense,rule_refs=['content/tenses/'+REFS[tense]],explanation_ru=EXPLANATIONS[tense])
    if ident in ITEM_KEYS:item.update(answer=ITEM_KEYS[ident],accepted_answers=[ITEM_KEYS[ident]])
    if ident in CHOICES:
        item['accepted_option_indices']=CHOICES[ident]
        item['explanation_ru']='Модельный ответ: '+item['options'][item['correct_option_index']]+'. В этом контексте грамматически возможны и другие варианты: '+ '; '.join(item['options'][n] for n in CHOICES[ident] if n!=item['correct_option_index'])+'. Они тоже засчитываются; формы различаются акцентом на процессе, результате или плане.'
    if ident == 'adv-transform-004':item['accepted_answers']=[item['answer']]
    for field,extra in ALTERNATIVES.get(ident,{}).items():
        target=item if field==0 else item['blanks'][field-1]
        target['accepted_answers']=list(dict.fromkeys([target['answer'],*target.get('accepted_answers',[]),*extra]))
    if ident in TRANSLATIONS:
        item['accepted_answers']=list(dict.fromkeys([item['answer'],*item.get('accepted_answers',[]),*TRANSLATIONS[ident]]))
        item['review_note_ru']='Приведён один из проверенных переводов. Принимаются также перечисленные редакцией варианты, сокращения и британское/американское написание. Список не охватывает все возможные переводы.'
    for blank in item.get('blanks',[]):
        tense=blank.get('tense_or_construction') or infer_tense(blank['answer'])
        if ident.startswith('src-'):
            # Remove automatically guessed markers: they often referred to a different clause.
            blank['explanation_ru']=re.sub(r' Маркер контекста:.*','',blank.get('explanation_ru',''))
        elif tense:
            blank.update(explanation_ru=EXPLANATIONS[tense],rule_refs=['content/tenses/'+REFS[tense]])
        if ident.startswith('src-') and 'После when, as soon as' in blank.get('explanation_ru',''):
            blank['explanation_ru']='В придаточном времени или реальном условии с будущим значением обычно используется Present Simple; для подчёркивания завершённости может быть допустим Present Perfect. Это правило не относится ко всем предложениям с when или if.'
    if item.get('blanks') and ident.startswith('src-'):
        item['tags']=sorted({b['tense_or_construction'] for b in item['blanks']})
        item['rule_refs']=list(dict.fromkeys(r for b in item['blanks'] for r in b.get('rule_refs',[])))
        item['explanation_ru']=' '.join(dict.fromkeys(b.get('explanation_ru','') for b in item['blanks']))
    if ident == 'adv-choice-005':item['explanation_ru']='Right now показывает текущее намеренное действие повара: is tasting. Tastes могло бы описывать привычку повара или вкус самого блюда в другом контексте.'
    if ident == 'adv-discourse-003':item['explanation_ru']='Past Simple представляет период как завершённый; Perfect-формы с for связывают его с настоящим. Само по себе lived не доказывает, что человек никогда не вернулся в Париж.'
    if ident == 'adv-edit-008':item['explanation_ru']='Дата 1928 требует Past Simple для appeared. Во второй части changed относит влияние к прошлому, а has changed подчёркивает его связь с настоящим; оба прочтения возможны.'
    if ident == 'adv-edit-007':item['explanation_ru']='First вводит последовательность основных событий. Здесь естественны opened, read и called; без более поздней прошлой точки нет необходимости ставить каждое действие в Past Perfect.'
    if ident == 'new-error-005':item['explanation_ru']='В этом задании прямо требуется Future Perfect: will have finished. Вне этого условия will finish by Friday тоже грамматически правильно.'
    if ident == 'adv-choice-012':item['explanation_ru']='Will have worked представляет продолжительность службы как факт к будущему сроку. В свободном ответе здесь было бы возможно will have been working, но вариант will have been knowing меняет глагол и неверен.'
    if ident == 'new-error-009':item['explanation_ru']='По условию требуется действие, уже шедшее в восемь: was watching. Watched может обозначать отдельное завершённое событие, но не выражает здесь заданный акцент на процессе.'
    if ident in CLOZE_TENSES:
        for blank,tense in zip(item['blanks'],CLOZE_TENSES[ident]):
            blank.update(tense_or_construction=tense,explanation_ru=EXPLANATIONS[tense],rule_refs=['content/tenses/'+REFS[tense]])
        if ident == 'adv-cloze-003':
            item['blanks'][6]['explanation_ru']='После начального Only later нужна инверсия: did I realise. Само событие относится к прошлому.'
            item['blanks'][6]['rule_refs'].append('content/tenses/05-contrasts-and-pitfalls.md#18-маркированные-и-продвинутые-употребления')
    if ident in TRANSLATION_EXPLANATIONS:item['explanation_ru']=TRANSLATION_EXPLANATIONS[ident]
    item['content_version']=VERSION
    from tense_task_review import revise as revise_task
    revise_task(item)
    return item

# These durative activities admit a factual Perfect Simple reading as well.
# Bounded tasks (read a particular book, repair one device) are deliberately absent.
DURATIVE = {'work':'worked','live':'lived','study':'studied','teach':'taught','wait':'waited','sit':'sat','rain':'rained','snow':'snowed','play':'played','practise':'practised'}
SAFE_SUPPLIED = ('already','just','still','ever','always','often','usually','sometimes')


def finish_item(item):
    if item.get('type') == 'open_brackets':
        slot_pattern=re.compile(r'\([^)]*\)')
        slots=slot_pattern.findall(item['prompt'])
        pieces=slot_pattern.split(item['prompt'])
        for k,blank in enumerate(item['blanks']):
            values=[blank['answer'],*blank.get('accepted_answers',[])]
            # A word explicitly supplied in this slot can be repeated or omitted.
            words=[w for w in SAFE_SUPPLIED if re.search(r'\b'+w+r'\b', slots[k])]
            before=pieces[k].rsplit('.',1)[-1]
            after=re.split(r'[.!?—]',pieces[k+1])[0]
            words += [w for w in SAFE_SUPPLIED if re.search(r'\b'+w+r'\s*$',before,re.I) or re.match(r'^\s*'+w+r'\b',after,re.I)]
            if re.search(r'\balready\s*$',after,re.I):words.append('already')
            words=list(dict.fromkeys(words))
            for word in words:
                for answer in tuple(values):
                    if re.search(r'\b'+word+r'\b',answer):
                        values.append(re.sub(r'\s+',' ',re.sub(r'\b'+word+r'\s*','',answer)).strip())
                    else:
                        # Standard mid-position, never fuzzy deletion of a user's words.
                        tokens=answer.split()
                        index=1 if tokens[0].lower() in {'am','is','are','was','were','have','has','had','will','would','can','could','should','must'} else 0
                        tokens.insert(index,word)
                        values.append(' '.join(tokens))
            if words:blank['supplied_words']=words
            else:blank.pop('supplied_words',None)
            tense=blank.get('tense_or_construction','')
            base=blank.get('base_verb')
            if base in DURATIVE and 'perfect_continuous' in tense and re.search(r'\b(for|since)\b',after,re.I):
                for answer in tuple(values):
                    target=re.sub(r'been (?:\w+ing)', DURATIVE[base], answer, count=1)
                    if target!=answer:values.append(target)
            if (base or '').startswith('get'):
                values += [re.sub(r'\b((?:have|has|had)(?: (?:already|just|never|ever))?) got\b', r'\1 gotten', value) for value in tuple(values)]
            blank['accepted_answers']=spelling_variants(values)
        item['review_note_ru']='Вводите форму глагола. Наречия already, just, still и другие слова, уже явно данные в условии этого поля, можно повторить или опустить, если они отмечены как необязательные. Отрицание и остальные части формы сохраняйте.'
    for field in item.get('blanks') or [item]:
        if not item.get('options'):
            field['accepted_answers']=spelling_variants([field['answer'],*field.get('accepted_answers',[])])
    for target in [item,*item.get('blanks',[])]:
        target['rule_refs'] = list(dict.fromkeys(repair_ref(ref) for ref in target.get('rule_refs',[])))
    return item

CLOZE_TENSES = {
 'new-cloze-001':['present_simple','present_continuous','present_perfect_continuous','present_perfect','present_continuous','present_continuous','present_perfect','present_simple'],
 'new-cloze-002':['past_simple','past_continuous','past_perfect','past_perfect','past_perfect_continuous','past_simple','past_simple','past_simple'],
 'new-cloze-003':['present_simple','future_continuous','future_perfect','future_perfect_continuous','present_continuous','present_simple','future_simple','future_simple'],
 'new-cloze-004':['present_perfect_continuous','past_simple','past_perfect','present_perfect','present_perfect','present_continuous','present_simple','present_continuous'],
 'adv-cloze-001':['past_simple','past_perfect','past_perfect','past_perfect','past_perfect_continuous','future_in_past','past_simple','past_continuous'],
 'adv-cloze-002':['present_simple','future_perfect_continuous','future_perfect','future_continuous','present_continuous','present_simple','future_simple','future_simple'],
 'adv-cloze-003':['past_perfect_continuous','past_perfect','past_simple','past_simple','past_perfect','past_simple','past_simple','past_perfect_continuous'],
 'adv-cloze-004':['present_simple','present_simple','present_perfect_continuous','present_perfect','present_perfect','present_simple','present_simple','present_perfect'],
 'adv-cloze-005':['future_in_past','future_in_past','future_in_past','future_in_past','future_in_past','past_perfect','future_in_past','future_in_past'],
 'adv-cloze-006':['present_perfect','present_perfect','present_perfect_continuous','present_perfect','past_simple','future_perfect_continuous','future_perfect','future_simple'],
}

TRANSLATION_EXPLANATIONS = {
 'new-translation-002':'Модельный перевод использует is sleeping для текущего процесса. Is asleep передаёт то же состояние другим способом и тоже принимается.',
 'new-translation-004':'Have been working подчёркивает длительность работы до настоящего. Have worked также возможно с акцентом на факте работы с утра.',
 'new-translation-006':'Was editing описывает процесс в момент звонка. Звонок не обязательно прервал работу: when только связывает события по времени.',
 'new-translation-012':'Will have completed подчёркивает готовый результат к пятнице. Обещание will finish / will complete by Friday также передаёт исходный смысл.',
 'new-translation-014':'Will have been teaching подчёркивает длительность преподавания к июню. Will have taught допустимо с акцентом на факте десятилетнего стажа.',
 'new-translation-016':'После as soon as в придаточном времени подходят get или receive; have received дополнительно подчёркивает завершённость. Will находится в главной части.',
 'new-translation-019':'Always с Continuous часто передаёт раздражение. Present Simple с always тоже может выражать повторяемость с эмоциональной оценкой.',
 'new-translation-021':'После This is the first time естественно have driven. Тот же смысл можно передать через for the first time и Present Continuous.',
 'new-translation-024':'Hardly / scarcely в начале требуют инверсии had I sat и when. Вариант с no sooner использует than; as soon as возможен без инверсии.',
 'adv-translation-009':'После as soon as в придаточном будущего времени используются finish или have finished, а не will finish.',
 'adv-translation-011':'Is being reserved подчёркивает временное поведение. Is reserved today также возможно, если необычность состояния уже выражена словами today и unusually.',
 'adv-translation-016':'Will have received by now выражает предположение о уже состоявшейся доставке. Has probably already received передаёт тот же вывод без Future Perfect.',
}


REF_ALIASES = {
 'future-simple-will--v1':'future-simple-will-v1',
 'future-continuous-will-be--v-ing':'future-continuous-will-be-v-ing',
 'future-perfect-simple-will-have--v3':'future-perfect-simple-will-have-v3',
 'future-perfect-continuous-will-have-been--v-ing':'future-perfect-continuous-will-have-been-v-ing',
 'инверсия-после-ограничительных-и-отрицательных-выражений':'18-маркированные-и-продвинутые-употребления',
 '7-by-и-untiltill':'7-by-и-until-till',
}

def repair_ref(ref):
    file,sep,anchor=ref.partition('#')
    return file + (sep + REF_ALIASES.get(anchor,anchor) if sep else '')
