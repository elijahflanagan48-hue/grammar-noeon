"use strict";
/* Карта правила Infinitive · -ing: «Метро трёх форм» на движке noeon-canvas.js.
   Станция: [имя, схема, пример с [верно|неверно|неверно], перевод, пример 2, перевод 2, заметка?, время?]
   время: a — действие впереди, p — уже было, n — вне времени (по умолчанию от линии). */
const IM_LINES = {
  to: { label: 'to do', title: 'Линия to do', sub: 'действие впереди: хочу, решил, чтобы' },
  ing: { label: 'doing', title: 'Линия doing', sub: 'занятие, опыт, факт' },
  bare: { label: 'do', title: 'Линия do', sub: 'без to' },
  ring: { label: 'предлог + doing', title: 'Кольцо предлогов', sub: 'после любого предлога — -ing' },
  same: { label: 'to do = doing', title: 'Без разницы', sub: 'обе формы, смысл тот же' },
  obj: { label: 'глагол + человек + to do', title: 'Ветка «глагол + человек + to do»', sub: 'want sb to do' },
  forms: { label: 'формы', title: 'Депо «Формы»', sub: 'раньше, процесс, пассив' },
  pair: { label: 'пересадка', title: 'Пересадки', sub: 'обе формы, смысл разный' },
};
const IM_ZONES = {
  to: [
    ['Желания и планы', 'ig-want', [
      ['want', 'want to do · want sb to do', 'I want [to learn|learning|learn] Japanese.', 'Я хочу выучить японский.', 'Do you want to come with us?', 'Хочешь пойти с нами?', 'С человеком: <i>I want you to come</i>, а не <s>want that you come</s>.'],
      ['would like', 'would like to do', 'I’d like [to book|booking|book] a table for two.', 'Я бы хотел заказать столик на двоих.', 'Would you like to try it?', 'Хотите попробовать?', 'С would — только to. <i>I like cooking</i> — люблю; <i>I’d like to cook</i> — хотел бы сейчас.'],
      ['hope', 'hope to do', 'We hope [to see|seeing|see] you at the party.', 'Надеемся увидеть тебя на вечеринке.', 'She hopes to get a place at university.', 'Она надеется поступить в университет.', 'С другим подлежащим — предложение: <i>I hope (that) you’re well.</i>'],
      ['plan', 'plan to do', 'They’re planning [to move|moving|move] to Spain.', 'Они планируют переехать в Испанию.', 'I didn’t plan to stay so long.', 'Я не планировал так задерживаться.'],
      ['intend', 'intend to do', 'I intend [to apply|applying|apply] for the job.', 'Я собираюсь подать заявку на эту работу.', 'What do you intend to do next?', 'Что вы собираетесь делать дальше?', 'Встречается и <i>intend doing</i>, но to do — основной вариант.'],
      ['expect', 'expect to do · expect sb to do', 'I expect [to be|being|be] back by six.', 'Я рассчитываю вернуться к шести.', 'Nobody expected him to win.', 'Никто не ожидал, что он победит.'],
      ['can’t wait', 'can’t wait to do', 'I can’t wait [to see|seeing|see] the new film!', 'Не терпится посмотреть новый фильм!', 'The kids can’t wait to open their presents.', 'Дети ждут не дождутся, когда откроют подарки.'],
    ]],
    ['Решения и обещания', 'ig-decide', [
      ['decide', 'decide to do', 'We decided [to take|taking|take] the train.', 'Мы решили поехать на поезде.', 'She decided not to tell anyone.', 'Она решила никому не говорить.', '✗ <s>decided taking</s>. Отрицание — перед to: <i>decided not to…</i>'],
      ['choose', 'choose to do', 'He chose [to stay|staying|stay] at home.', 'Он предпочёл остаться дома.', 'Many people now choose to work from home.', 'Многие теперь предпочитают работать из дома.'],
      ['agree', 'agree to do', 'She agreed [to help|helping|help] us.', 'Она согласилась нам помочь.', 'We agreed to meet at six.', 'Мы договорились встретиться в шесть.'],
      ['refuse', 'refuse to do', 'He refused [to answer|answering|answer] the question.', 'Он отказался отвечать на вопрос.', 'The car refused to start.', 'Машина никак не заводилась.'],
      ['promise', 'promise to do', 'I promise [to call|calling|call] you tomorrow.', 'Обещаю позвонить тебе завтра.', 'He promised not to be late.', 'Он обещал не опаздывать.'],
      ['offer', 'offer to do', 'My neighbour offered [to water|watering|water] my plants.', 'Сосед предложил полить мои цветы.', 'She offered to drive us home.', 'Она предложила отвезти нас домой.', '<b>offer</b> — предложить сделать самому. «Предложить пойти куда-то вместе» — <i>suggest going</i>.'],
      ['threaten', 'threaten to do', 'The workers threatened [to go|going|go] on strike.', 'Рабочие пригрозили забастовкой.', 'He threatened to call the police.', 'Он пригрозил вызвать полицию.'],
      ['arrange', 'arrange to do', 'We’ve arranged [to meet|meeting|meet] at the station.', 'Мы договорились встретиться на вокзале.', 'I’ve arranged to see the dentist on Friday.', 'Я записался к стоматологу на пятницу.'],
    ]],
    ['Удалось или нет', 'ig-manage', [
      ['manage', 'manage to do', 'Did you manage [to find|finding|find] the hotel?', 'Тебе удалось найти отель?', 'We managed to get the last tickets.', 'Нам удалось достать последние билеты.'],
      ['fail', 'fail to do', 'The bus failed [to arrive|arriving|arrive] on time.', 'Автобус не пришёл вовремя.', 'He failed to notice the sign.', 'Он не заметил знак.'],
      ['afford', 'can afford to do', 'We can’t afford [to buy|buying|buy] a new car.', 'Мы не можем позволить себе новую машину.', 'Can you afford to take a week off?', 'Можешь позволить себе неделю отдыха?'],
      ['attempt', 'attempt to do', 'She attempted [to climb|climbing|climb] the wall.', 'Она попыталась залезть на стену.', 'Don’t attempt to fix it yourself.', 'Не пытайтесь чинить это сами.'],
      ['learn', 'learn to do', 'She learnt [to swim|swimming|swim] at the age of five.', 'Она научилась плавать в пять лет.', 'You need to learn to say no.', 'Тебе нужно научиться говорить «нет».', 'О предмете или занятии как подлежащем — -ing: <i>Learning languages is fun.</i>'],
      ['deserve', 'deserve to do', 'You deserve [to win|winning|win] after all that work.', 'Ты заслуживаешь победы после такой работы.', 'He deserves to be promoted.', 'Он заслуживает повышения.', 'О человеке в пассиве — <i>deserves to be praised</i>.'],
      ['hesitate', 'hesitate to do', 'Don’t hesitate [to call|calling|call] me.', 'Не стесняйтесь звонить мне.', 'She hesitated to say no.', 'Она не решалась отказать.'],
    ]],
    ['Кажется, оказалось', 'ig-seem', [
      ['seem', 'seem to do · seem to have done', 'You seem [to be|being|be] tired.', 'Ты, кажется, устал.', 'He seems to have lost his keys.', 'Похоже, он потерял ключи.', 'Если было раньше — <i>to have done</i>.', 'n'],
      ['appear', 'appear to do', 'The shop appears [to be|being|be] closed.', 'Магазин, похоже, закрыт.', 'She appeared to know the answer.', 'Казалось, она знает ответ.', '', 'n'],
      ['pretend', 'pretend to do', 'He pretended [to be|being|be] asleep.', 'Он притворился спящим.', 'Stop pretending to read!', 'Хватит делать вид, что читаешь!', '', 'n'],
      ['happen', 'happen to do', 'I happened [to see|seeing|see] her at the airport.', 'Я случайно увидел её в аэропорту.', 'Do you happen to know his number?', 'Вы случайно не знаете его номер?', '', 'n'],
      ['tend', 'tend to do', 'Prices tend [to rise|rising|rise] in summer.', 'Летом цены обычно растут.', 'I tend to forget names.', 'Я часто забываю имена.', '', 'n'],
      ['claim', 'claim to do · claim to have done', 'He claims [to know|knowing|know] the president.', 'Он утверждает, что знаком с президентом.', 'She claims to have seen a ghost.', 'Она утверждает, что видела привидение.', '', 'n'],
    ]],
    ['Вопрос + to', 'ig-wh', [
      ['how to', 'how to do', 'Can you show me how [to use|using|use] this app?', 'Покажешь, как пользоваться этим приложением?', 'I don’t know how to say it in English.', 'Не знаю, как сказать это по-английски.'],
      ['what to', 'what to do', 'I don’t know what [to say|saying|say].', 'Не знаю, что сказать.', 'Tell me what to buy.', 'Скажи, что купить.'],
      ['where to', 'where to do', 'We couldn’t decide where [to go|going|go] on holiday.', 'Мы не могли решить, куда поехать в отпуск.', 'Ask the guide where to park.', 'Спроси у гида, где припарковаться.'],
      ['whether to', 'whether to do', 'She can’t decide whether [to stay|staying|stay] or leave.', 'Она не может решить, остаться или уйти.', 'I wonder whether to call him.', 'Думаю, позвонить ли ему.'],
    ]],
  ],
  adj: [
    ['Прилагательные и цель', 'ig-adj-to', [
      ['easy to', 'прилагательное + to do', 'This book is easy [to read|reading|read].', 'Эту книгу легко читать.', 'It’s hard to explain.', 'Это сложно объяснить.', '', 'n'],
      ['glad to', 'glad / happy / sorry to', 'I’m glad [to hear|hearing|hear] that.', 'Рад это слышать.', 'We were happy to help.', 'Мы были рады помочь.', '', 'n'],
      ['ready to', 'ready / willing / able to', 'Are you ready [to order|ordering|order]?', 'Готовы сделать заказ?', 'He’s always willing to help.', 'Он всегда готов помочь.'],
      ['likely to', 'likely / sure / certain to', 'It’s likely [to rain|raining|rain] tonight.', 'Вечером, вероятно, будет дождь.', 'She’s sure to win.', 'Она наверняка победит.'],
      ['kind of you to', 'It’s kind of you to do', 'It’s very kind of you [to help|helping|help].', 'Очень мило с вашей стороны помочь.', 'It was silly of me to forget.', 'Глупо было с моей стороны забыть.', 'Оценка человека — <b>of you</b>; оценка действия — <b>for me</b>: <i>It’s easy for me to…</i>', 'n'],
      ['too … to', 'too + прилагательное + to do', 'She’s too young [to drive|driving|drive].', 'Она слишком молода, чтобы водить.', 'It’s too cold for us to swim.', 'Слишком холодно, чтобы нам купаться.', '✗ <s>too young for driving</s>', 'n', 'ig-too'],
      ['… enough to', 'прилагательное + enough + to do', 'He’s old enough [to vote|voting|vote].', 'Он достаточно взрослый, чтобы голосовать.', 'Is the water warm enough to swim in?', 'Вода достаточно тёплая, чтобы купаться?', 'enough — <b>после</b> прилагательного, но <b>перед</b> существительным: <i>enough time</i>.', 'n', 'ig-too'],
      ['the first to', 'the first / last / only to do', 'Mira was the first [to arrive|arriving|arrive].', 'Мира пришла первой.', 'He was the only one to pass.', 'Он единственный сдал.', '', 'n', 'ig-first'],
      ['time to', 'существительное + to do', 'It’s time [to go|going|go].', 'Пора идти.', 'I have nothing to wear.', 'Мне нечего надеть.', 'Но у части слов — of + -ing: <i>the idea of moving</i>, <i>the chance of winning</i>.', 'n', 'ig-noun-to'],
      ['a chance to', 'a chance / decision / way to', 'This is your chance [to win|winning|win] a prize.', 'Это твой шанс выиграть приз.', 'Her decision to leave surprised us.', 'Её решение уйти нас удивило.', '', '', 'ig-noun-to'],
      ['чтобы: to', 'to / in order to', 'I went out [to buy|for buying|buying] some bread.', 'Я вышел, чтобы купить хлеба.', 'She saved money in order to travel.', 'Она копила, чтобы путешествовать.', '✗ <s>I came here for learning English.</s> <i>for + -ing</i> — только назначение вещи: <i>a tool for cutting glass</i>.', '', 'ig-purpose'],
      ['чтобы не', 'so as not to · in order not to', 'We left early so as not [to miss|missing|miss] the train.', 'Мы вышли рано, чтобы не опоздать на поезд.', 'Speak quietly so as not to wake the baby.', 'Говори тише, чтобы не разбудить малыша.', '', '', 'ig-purpose'],
    ]],
  ],
  obj: [
    ['Кого-то + to do', 'ig-obj-to', [
      ['want sb', 'want sb to do', 'I want you [to listen|listening|listen].', 'Я хочу, чтобы ты послушал.', 'Do you want me to help?', 'Хочешь, я помогу?', '✗ <s>I want that you listen.</s>'],
      ['would like sb', 'would like sb to do', 'I’d like you [to meet|meeting|meet] my sister.', 'Познакомься с моей сестрой.', 'We’d like everyone to be on time.', 'Мы бы хотели, чтобы все пришли вовремя.'],
      ['ask sb', 'ask sb to do', 'She asked me [to wait|waiting|wait] outside.', 'Она попросила меня подождать снаружи.', 'Ask him to call me back.', 'Попроси его перезвонить мне.'],
      ['tell sb', 'tell sb (not) to do', 'They told us [not to worry|not worrying|don’t worry].', 'Нам сказали не волноваться.', 'Tell her to bring an umbrella.', 'Скажи ей взять зонт.'],
      ['advise sb', 'advise sb to do', 'The doctor advised me [to rest|resting|rest].', 'Врач посоветовал мне отдохнуть.', 'I’d advise you to book early.', 'Советую забронировать заранее.', 'Без человека — -ing: <i>I’d advise booking early.</i>'],
      ['allow sb', 'allow / permit sb to do', 'My parents allowed me [to stay|staying|stay] up late.', 'Родители разрешили мне лечь поздно.', 'We aren’t allowed to use phones in class.', 'На уроке нам нельзя пользоваться телефонами.', 'Без человека — -ing: <i>They don’t allow smoking.</i>'],
      ['remind sb', 'remind sb to do', 'Remind me [to call|calling|call] Grandma.', 'Напомни мне позвонить бабушке.', 'The app reminds you to drink water.', 'Приложение напоминает пить воду.'],
      ['persuade sb', 'persuade sb to do', 'She persuaded him [to see|seeing|see] a doctor.', 'Она уговорила его сходить к врачу.', 'Nothing will persuade me to change my mind.', 'Ничто не заставит меня передумать.', 'Синоним: <i>talk sb into doing</i>.'],
      ['encourage sb', 'encourage sb to do', 'Our teacher encouraged us [to read|reading|read] in English.', 'Учитель советовал нам читать по-английски.', 'Parents should encourage kids to play outside.', 'Родителям стоит поощрять детей играть на улице.'],
      ['force sb', 'force sb to do', 'The rain forced us [to cancel|cancelling|cancel] the picnic.', 'Из-за дождя пришлось отменить пикник.', 'Nobody forced you to come.', 'Никто не заставлял тебя приходить.'],
      ['get sb', 'get sb to do', 'I got my brother [to fix|fixing|fix] my bike.', 'Я уговорил брата починить мне велосипед.', 'Can you get someone to help us?', 'Можешь найти кого-нибудь нам в помощь?', 'А вот <i>have sb do</i> и <i>make sb do</i> — без to.'],
      ['teach sb', 'teach sb to do', 'Dad taught me [to ride|riding|ride] a bike.', 'Папа научил меня кататься на велосипеде.', 'She teaches kids to code.', 'Она учит детей программировать.'],
      ['warn sb', 'warn sb not to do', 'They warned us [not to swim|not swimming|don’t swim] there.', 'Нас предупредили не купаться там.', 'I warned you not to touch it!', 'Я же предупреждал не трогать!'],
      ['consider sb', 'consider / believe / find sb to be', 'We consider him [to be|being|be] the best candidate.', 'Мы считаем его лучшим кандидатом.', 'I found her to be very helpful.', 'Она оказалась очень отзывчивой.', 'Книжный стиль. В разговоре: <i>I think he’s the best.</i>', 'n', 'ig-believe'],
    ]],
  ],
  ing: [
    ['Нравится и нет', 'ig-enjoy', [
      ['enjoy', 'enjoy doing', 'I really enjoy [cooking|to cook|cook] for friends.', 'Я очень люблю готовить для друзей.', 'Did you enjoy staying with them?', 'Тебе понравилось у них гостить?', '✗ <s>enjoy to cook</s>'],
      ['don’t mind', 'mind doing', 'I don’t mind [waiting|to wait|wait].', 'Я не против подождать.', 'Would you mind opening the window?', 'Не могли бы вы открыть окно?'],
      ['can’t stand', 'can’t stand doing', 'He can’t stand [queuing|to queue|queue].', 'Он терпеть не может стоять в очередях.', 'I can’t stand people talking in the cinema.', 'Терпеть не могу, когда в кино разговаривают.'],
      ['fancy', 'fancy doing', 'Do you fancy [going|to go|go] out tonight?', 'Не хочешь сходить куда-нибудь вечером?', 'I don’t fancy cooking.', 'Что-то не хочется готовить.', 'Британское разговорное «хотеть».'],
      ['feel like', 'feel like doing', 'I don’t feel like [cooking|to cook|cook] tonight.', 'Сегодня мне не хочется готовить.', 'Do you feel like watching a film?', 'Хочешь посмотреть фильм?', 'like здесь — предлог, поэтому -ing.'],
      ['dislike', 'dislike doing', 'Cats dislike [getting|to get|get] wet.', 'Кошки не любят мокнуть.', 'I dislike being late.', 'Не люблю опаздывать.'],
      ['Swimming is…', '-ing как подлежащее', '[Swimming|To swimming|Swim] is good for your back.', 'Плавание полезно для спины.', 'Learning a language takes time.', 'Изучение языка требует времени.', 'С <i>It’s + прилагательное</i> обычно to: <i>It’s nice to see you.</i>', 'n', 'ig-subject'],
    ]],
    ['Избегать, откладывать', 'ig-avoid', [
      ['avoid', 'avoid doing', 'She avoided [looking|to look|look] at me.', 'Она избегала смотреть на меня.', 'Try to avoid eating late.', 'Старайся не есть поздно.'],
      ['put off', 'put off doing', 'Stop putting off [calling|to call|call] the bank.', 'Хватит откладывать звонок в банк.', 'I put off going to the dentist for months.', 'Я месяцами откладывал поход к стоматологу.'],
      ['postpone', 'postpone doing', 'They postponed [leaving|to leave|leave] until Monday.', 'Они отложили отъезд до понедельника.', 'We had to postpone moving.', 'Нам пришлось отложить переезд.'],
      ['delay', 'delay doing', 'Don’t delay [replying|to reply|reply] to the email.', 'Не тяни с ответом на письмо.', 'They delayed opening the shop.', 'Они отложили открытие магазина.'],
      ['risk', 'risk doing', 'You risk [losing|to lose|lose] everything.', 'Ты рискуешь всё потерять.', 'I didn’t want to risk missing the flight.', 'Я не хотел рисковать опоздать на рейс.'],
      ['miss', 'miss doing', 'I miss [living|to live|live] by the sea.', 'Скучаю по жизни у моря.', 'She misses working with kids.', 'Она скучает по работе с детьми.'],
      ['resist', 'can’t resist doing', 'I couldn’t resist [buying|to buy|buy] it.', 'Я не удержался и купил.', 'He can’t resist checking his phone.', 'Он не может удержаться и не проверить телефон.'],
      ['can’t help', 'can’t help doing', 'I couldn’t help [laughing|to laugh|laugh].', 'Я не мог не рассмеяться.', 'She can’t help worrying about him.', 'Она не может не волноваться за него.'],
    ]],
    ['Закончить, продолжать', 'ig-finish', [
      ['finish', 'finish doing', 'Have you finished [packing|to pack|pack]?', 'Ты закончил собираться?', 'Finish eating before you play.', 'Доешь, прежде чем играть.'],
      ['give up', 'give up doing', 'He gave up [eating|to eat|eat] sugar.', 'Он отказался от сахара.', 'Don’t give up trying!', 'Не прекращай попытки!'],
      ['quit', 'quit doing', 'She quit [smoking|to smoke|smoke] last year.', 'Она бросила курить в прошлом году.', 'I quit drinking coffee.', 'Я перестал пить кофе.'],
      ['keep (on)', 'keep (on) doing', 'Keep [trying|to try|try] — you’re nearly there!', 'Не сдавайся — ты почти у цели!', 'He keeps losing his keys.', 'Он постоянно теряет ключи.', 'keep doing — продолжать или снова и снова.'],
      ['carry on', 'carry on doing', 'They carried on [talking|to talk|talk].', 'Они продолжали разговаривать.', 'Carry on reading, please.', 'Продолжайте читать, пожалуйста.'],
      ['practise', 'practise doing', 'You should practise [speaking|to speak|speak] every day.', 'Тебе стоит практиковать устную речь каждый день.', 'She practises playing scales.', 'Она отрабатывает гаммы.'],
    ]],
    ['Мысли и слова', 'ig-admit', [
      ['admit', 'admit (to) doing', 'He admitted [taking|to take|take] the money.', 'Он признался, что взял деньги.', 'She admits feeling nervous.', 'Она признаётся, что волнуется.', '', 'p'],
      ['deny', 'deny doing', 'She denied [breaking|to break|break] the vase.', 'Она отрицала, что разбила вазу.', 'He denies knowing her.', 'Он отрицает, что знаком с ней.', '', 'p'],
      ['suggest', 'suggest doing · suggest (that) sb do', 'I suggest [leaving|to leave|leave] early.', 'Предлагаю выйти пораньше.', 'She suggested (that) we go by train.', 'Она предложила поехать на поезде.', '✗ <s>She suggested me to go.</s>', 'n', 'ig-suggest'],
      ['recommend', 'recommend doing · recommend that', 'I recommend [booking|to book|book] a table.', 'Рекомендую забронировать столик.', 'I recommend that you book early.', 'Советую бронировать заранее.', '<i>recommend sb to do</i> встречается в британском, но надёжнее <i>recommend that…</i>', 'n', 'ig-suggest'],
      ['consider', 'consider doing', 'Have you considered [studying|to study|study] abroad?', 'Ты не думал учиться за границей?', 'We’re considering moving.', 'Мы подумываем о переезде.', 'consider sb to be — «считать кем-то»: ветка «Глагол + человек + to do».'],
      ['imagine', 'imagine doing', 'Imagine [living|to live|live] on a boat!', 'Представь, каково жить на лодке!', 'I can’t imagine working there.', 'Не представляю, как там работать.'],
      ['mention', 'mention doing', 'He mentioned [seeing|to see|see] you at the gym.', 'Он упомянул, что видел тебя в спортзале.', 'She never mentioned being married.', 'Она ни разу не упомянула, что замужем.', '', 'p'],
      ['involve', 'involve doing', 'The job involves [travelling|to travel|travel] a lot.', 'Работа связана с частыми поездками.', 'The plan involves selling the house.', 'План предполагает продажу дома.'],
      ['allow + -ing', 'allow / permit / advise doing (без человека)', 'They don’t allow [smoking|to smoke|smoke] here.', 'Здесь не разрешают курить.', 'They don’t allow us to smoke here.', 'Нам здесь не разрешают курить.', 'Человек есть — <b>to do</b>; человека нет — <b>-ing</b>.', 'n', 'ig-obj-ing'],
    ]],
    ['Занятия и время', 'ig-go', [
      ['go + -ing', 'go swimming · go shopping', 'Let’s go [skiing|to ski|ski] in March.', 'Давай съездим покататься на лыжах в марте.', 'We went shopping on Saturday.', 'В субботу мы ходили по магазинам.'],
      ['spend time', 'spend time doing', 'I spent the evening [reading|to read|read].', 'Я провёл вечер за чтением.', 'She spends hours practising.', 'Она часами занимается.'],
      ['waste time', 'waste time doing', 'Don’t waste time [worrying|to worry|worry].', 'Не трать время на волнения.', 'We wasted an hour looking for parking.', 'Мы потратили час на поиск парковки.'],
      ['be busy', 'be busy doing', 'She’s busy [writing|to write|write] her essay.', 'Она занята сочинением.', 'I was busy cooking when you called.', 'Я готовил, когда ты позвонил.'],
    ]],
    ['Готовые выражения', 'ig-worth', [
      ['it’s no use', 'it’s no use doing', 'It’s no use [crying|to cry|cry] about it.', 'Бесполезно об этом плакать.', 'It’s no good asking him.', 'Его бесполезно спрашивать.'],
      ['no point', 'there’s no point (in) doing', 'There’s no point in [arguing|to argue|argue].', 'Нет смысла спорить.', 'What’s the point of waiting?', 'Какой смысл ждать?'],
      ['worth', 'be worth doing', 'The museum is worth [visiting|to visit|visit].', 'Музей стоит посетить.', 'It’s not worth worrying about.', 'Из-за этого не стоит волноваться.', '✗ <s>worth to visit</s>'],
      ['have trouble', 'have trouble / difficulty (in) doing', 'I had trouble [finding|to find|find] the house.', 'Я с трудом нашёл дом.', 'She has difficulty sleeping.', 'Ей трудно заснуть.'],
    ]],
  ],
  ring: [
    ['in', 'interested in · succeed in · believe in', 'Are you interested in [joining|to join|join] the club?', 'Хочешь вступить в клуб?', 'She succeeded in passing the exam.', 'Ей удалось сдать экзамен.', '', 'ig-prep-adj'],
    ['on', 'insist on · keen on · on arriving', 'He insisted on [paying|to pay|pay].', 'Он настоял на том, чтобы заплатить.', 'On arriving, call me.', 'Как приедешь, позвони.', '', 'ig-prep-verb'],
    ['at', 'good at · bad at · brilliant at', 'She’s good at [solving|to solve|solve] puzzles.', 'Она хорошо решает головоломки.', 'I’m terrible at remembering names.', 'Я ужасно запоминаю имена.', '', 'ig-prep-adj'],
    ['of', 'tired of · afraid of · think of · accuse sb of', 'I’m tired of [waiting|to wait|wait].', 'Я устал ждать.', 'We’re thinking of buying a dog.', 'Мы подумываем завести собаку.', '', 'ig-prep-adj'],
    ['for', 'thank sb for · apologise for · famous for', 'Thank you for [helping|to help|help] me.', 'Спасибо, что помог мне.', 'I apologise for being late.', 'Прошу прощения за опоздание.', '', 'ig-prep-obj'],
    ['about', 'worry about · think about · complain about', 'Stop worrying about [failing|to fail|fail].', 'Перестань переживать, что провалишься.', 'He complained about having to wait.', 'Он жаловался, что приходится ждать.', '', 'ig-prep-verb'],
    ['with', 'bored with · fed up with', 'I’m fed up with [cleaning|to clean|clean] up after you.', 'Мне надоело за тобой убирать.', 'The kids got bored with waiting.', 'Детям надоело ждать.', '', 'ig-prep-adj'],
    ['without', 'without doing', 'He left without [saying|to say|say] goodbye.', 'Он ушёл, не попрощавшись.', 'Don’t sign it without reading it.', 'Не подписывай, не прочитав.', '', 'ig-prep-free'],
    ['before · after', 'before / after doing', 'Wash your hands before [eating|to eat|eat].', 'Мой руки перед едой.', 'After finishing school, he travelled.', 'Окончив школу, он путешествовал.', '', 'ig-prep-free'],
    ['instead of', 'instead of doing', 'Instead of [complaining|to complain|complain], help me.', 'Вместо того чтобы жаловаться, помоги мне.', 'Let’s walk instead of taking the bus.', 'Давай пешком, а не на автобусе.', '', 'ig-prep-free'],
    ['by', 'by doing — способ', 'You can save money by [cooking|to cook|cook] at home.', 'Можно экономить, готовя дома.', 'He learnt English by watching films.', 'Он выучил английский, смотря фильмы.', '', 'ig-prep-free'],
    ['from', 'prevent / stop / discourage sb from', 'The rain prevented us from [going|to go|go] out.', 'Дождь помешал нам выйти.', 'Nothing can stop her from trying.', 'Ничто не помешает ей пытаться.', '', 'ig-prep-obj'],
    ['despite', 'despite / in spite of doing', 'Despite [feeling|to feel|feel] ill, she came.', 'Несмотря на плохое самочувствие, она пришла.', 'In spite of training hard, he lost.', 'Несмотря на усердные тренировки, он проиграл.', '', 'ig-prep-free'],
  ],
  toprep: [
    ['look forward to', 'look forward to doing', 'I look forward to [hearing|hear|to hear] from you.', 'Жду вашего ответа.', 'We’re looking forward to seeing you.', 'Мы ждём встречи с тобой.'],
    ['be used to', 'be used to doing — привык', 'I’m used to [getting|get|got] up early.', 'Я привык рано вставать.', 'She isn’t used to driving on the left.', 'Она не привыкла ездить по левой стороне.', 'Не путать: <i>used to do</i> — «раньше делал».'],
    ['get used to', 'get used to doing — привыкнуть', 'You’ll soon get used to [living|live|to live] here.', 'Ты скоро привыкнешь здесь жить.', 'I can’t get used to working nights.', 'Не могу привыкнуть работать по ночам.'],
    ['object to', 'object to doing', 'I object to [being|be|to be] treated like a child.', 'Я против, чтобы со мной обращались как с ребёнком.', 'Do you object to working late?', 'Вы не против поработать допоздна?'],
    ['prefer … to', 'prefer doing X to doing Y', 'I prefer walking to [driving|drive|to drive].', 'Я предпочитаю ходить пешком, а не ездить.', 'She prefers reading to watching TV.', 'Она предпочитает чтение телевизору.'],
    ['when it comes to', 'when it comes to doing', 'When it comes to [cooking|cook|to cook], he’s the best.', 'Когда дело доходит до готовки, ему нет равных.', 'When it comes to saving money, I’m hopeless.', 'В экономии денег я безнадёжен.'],
  ],
  bare: [
    ['Без to', 'ig-bare', [
      ['can · must', 'модальный + do', 'You must [try|to try|trying] this cake.', 'Ты обязательно должен попробовать этот торт.', 'She can’t come today.', 'Она не может прийти сегодня.', 'С to: ought to, have to, be able to, need to.', '', 'ig-modal'],
      ['had better', 'had better do', 'You’d better [take|to take|taking] an umbrella.', 'Возьми-ка лучше зонт.', 'We’d better not be late.', 'Нам лучше не опаздывать.', '✗ <s>had better to go</s>', '', 'ig-rather'],
      ['would rather', 'would rather do (than do)', 'I’d rather [stay|to stay|staying] in tonight.', 'Я бы лучше остался дома сегодня.', 'I’d rather walk than take a taxi.', 'Я лучше пройдусь, чем поеду на такси.', '', '', 'ig-rather'],
      ['why not', 'why / why not + do', 'Why not [ask|to ask|asking] the teacher?', 'Почему бы не спросить учителя?', 'Why wait? Book it now.', 'Зачем ждать? Бронируй сейчас.', '✗ <s>Why to wait?</s>', '', 'ig-rather'],
      ['make sb', 'make sb do · be made to do', 'The film made me [cry|to cry|crying].', 'Фильм довёл меня до слёз.', 'We were made to wait outside.', 'Нас заставили ждать снаружи.', 'В пассиве to возвращается.', '', 'ig-make-let'],
      ['let sb', 'let sb do', 'Let me [carry|to carry|carrying] that.', 'Давай я понесу.', 'They let us park here.', 'Нам разрешили здесь парковаться.', 'Пассива у let нет: <i>We were allowed to park.</i>', '', 'ig-make-let'],
      ['have sb', 'have sb do', 'I’ll have the porter [bring|to bring|bringing] your bags.', 'Я попрошу носильщика принести ваши сумки.', 'She had the kids tidy their rooms.', 'Она велела детям убрать комнаты.', '', '', 'ig-make-let'],
      ['help sb (to)', 'help sb (to) do — оба верны', 'Can you help me [move|moving|moved] the sofa?', 'Поможешь мне передвинуть диван?', 'This app helps you to learn words.', 'Приложение помогает учить слова.', 'С to тоже правильно.', '', 'ig-help'],
      ['see · hear sb', 'see sb do — целиком · doing — в процессе', 'I saw her [cross|to cross|crossed] the road.', 'Я видел, как она перешла дорогу.', 'I heard them arguing all night.', 'Я слышал, как они спорили всю ночь.', 'В пассиве — to: <i>He was seen to leave.</i>', '', 'ig-senses'],
      ['do nothing but', 'do nothing but do', 'He did nothing but [complain|to complain|complaining] all day.', 'Он весь день только и делал, что жаловался.', 'Nobody dared move.', 'Никто не смел пошевелиться.', 'Но: <i>had no choice but <b>to</b> agree</i>.', '', 'ig-rather'],
    ]],
  ],
  same: [
    ['begin · start', 'begin / start to do · doing', 'It started to rain. = It started raining.', 'Начался дождь.', 'It’s starting to rain.', 'Начинается дождь.', 'Если сам глагол в -ing, берите to: <i>It’s starting to rain</i>.', 'ig-same'],
    ['continue', 'continue to do · doing', 'She continued to work. = She continued working.', 'Она продолжила работать.', 'Prices continue to rise.', 'Цены продолжают расти.', '', 'ig-same'],
    ['love · hate', 'love / hate to do · doing', 'I love dancing. = I love to dance.', 'Я люблю танцевать.', 'I’d love to come. — только to', 'С удовольствием приду.', 'С would — только to.', 'ig-love'],
    ['prefer', 'prefer to do · doing', 'I prefer to walk. = I prefer walking.', 'Я предпочитаю ходить пешком.', 'I’d prefer to stay. — только to', 'Я бы предпочёл остаться.', 'Сравнение: <i>prefer doing X to doing Y</i>.', 'ig-love'],
    ['can’t bear', 'can’t bear to do · doing', 'I can’t bear to see / seeing animals suffer.', 'Не могу видеть, как страдают животные.', 'She can’t bear being alone.', 'Она не выносит одиночества.', '', 'ig-love'],
    ['bother', 'bother to do · doing', 'Don’t bother to call. = Don’t bother calling.', 'Не утруждайся звонить.', 'He didn’t even bother to reply.', 'Он даже не потрудился ответить.', '', 'ig-same'],
  ],
  forms: [
    ['to have done', 'раньше главного', 'He seems [to have forgotten|to forget|forgetting] my name.', 'Похоже, он забыл моё имя.', 'She is said to have lived in Paris.', 'Говорят, она жила в Париже.', '', 'p', 'ig-perf-inf'],
    ['to be doing', 'в процессе', 'He pretended [to be reading|reading|to have read] when I came in.', 'Когда я вошёл, он делал вид, что читает.', 'You seem to be enjoying yourself.', 'Похоже, тебе весело.', '', 'n', 'ig-cont-inf'],
    ['to be done', 'пассив, впереди', 'She expects [to be promoted|to promote|promoting] soon.', 'Она рассчитывает скоро получить повышение.', 'The forms need to be signed.', 'Бланки нужно подписать.', '', 'a', 'ig-pass'],
    ['being done', 'пассив, -ing', 'I hate [being interrupted|interrupting|to interrupt].', 'Терпеть не могу, когда меня перебивают.', 'He avoided being seen.', 'Он старался, чтобы его не увидели.', '', 'n', 'ig-pass'],
    ['having done', '-ing, раньше', 'He denied [having seen|to have seen|have seen] her.', 'Он отрицал, что видел её.', 'I remember meeting her. — без having', 'Помню, как познакомился с ней.', 'После remember, deny, thank, after обычно хватает простого -ing.', 'p', 'ig-perf-ger'],
    ['needs doing', 'вещь нуждается', 'The windows need [cleaning|clean|cleaned].', 'Окна нужно помыть.', 'The windows need to be cleaned.', 'То же самое через пассив.', 'О человеке: <i>I need to clean them.</i>', 'n', 'ig-needs'],
    ['meant to have done', 'задумал, но не сделал', 'I meant [to have called|having called|calling] you, but I forgot.', 'Я собирался тебе позвонить, но забыл.', 'He was to have arrived yesterday.', 'Он должен был приехать вчера (но не приехал).', 'Книжный оттенок; в разговоре: <i>I meant to call you, but…</i>', 'p', 'ig-unreal'],
    ['not to do', 'отрицание', 'He promised [not to tell|not telling|to not telling] anyone.', 'Он обещал никому не говорить.', 'I regret not going.', 'Жалею, что не пошёл.', 'not — прямо перед формой.', 'a', 'ig-neg'],
  ],
};
const IM_PAIRS = [
  ['remember', 'ig-remember', ['не забыть сделать', 'Remember [to lock|locking] the door.', 'Не забудь запереть дверь.', 'сначала помню → потом делаю', 'a'],
    ['помнить, как делал', 'I remember [locking|to lock] the door last night.', 'Помню, что запер дверь вчера вечером.', 'сначала сделал → потом помню', 'p']],
  ['forget', 'ig-forget', ['забыть сделать', 'Sorry, I forgot [to call|calling] her.', 'Извини, я забыл ей позвонить.', 'не сделал', 'a'],
    ['забыть то, что было', 'I’ll never forget [seeing|to see] the sea for the first time.', 'Никогда не забуду, как впервые увидел море.', 'было → не забуду', 'p']],
  ['stop', 'ig-stop', ['остановиться, чтобы…', 'We stopped at a café [to buy|buying] water.', 'Мы остановились у кафе, чтобы купить воды.', 'остановились → потом сделали', 'a'],
    ['перестать, бросить', 'He stopped [smoking|to smoke] years ago.', 'Он бросил курить много лет назад.', 'делал → перестал', 'p']],
  ['try', 'ig-try', ['пытаться (трудно)', 'I tried [to open|opening] the window, but it was stuck.', 'Я пытался открыть окно, но его заело.', 'усилие, может не получиться', 'a'],
    ['попробовать как способ', 'Have you tried [restarting|to restart] it? That usually helps.', 'Пробовал перезагрузить? Обычно помогает.', 'сделать легко, вопрос — поможет ли', 'n']],
  ['regret', 'ig-regret', ['с сожалением сообщаю', 'We regret [to inform|informing] you that the flight is cancelled.', 'С сожалением сообщаем, что рейс отменён.', 'сейчас; inform, tell, say, announce', 'n'],
    ['жалеть о сделанном', 'I regret [telling|to tell] him the truth.', 'Жалею, что сказал ему правду.', 'было → жалею', 'p']],
  ['go on', 'ig-go-on', ['перейти к следующему', 'After school, she went on [to study|studying] law.', 'После школы она пошла учиться на юриста.', 'одно → потом другое', 'a'],
    ['продолжать то же', 'He went on [talking|to talk] for an hour.', 'Он продолжал говорить ещё час.', 'то же самое дальше', 'n']],
  ['mean', 'ig-mean', ['собираться', 'I meant [to call|calling] you, but I forgot.', 'Я собирался тебе позвонить, но забыл.', 'намерение', 'a'],
    ['означать, влечь', 'The new job means [moving|to move] to Leeds.', 'Новая работа означает переезд в Лидс.', 'следствие', 'n']],
  ['need', 'ig-need', ['человеку нужно', 'I need [to wash|washing] the car.', 'Мне нужно помыть машину.', 'кто-то сделает', 'a'],
    ['вещь нуждается', 'The car needs [washing|to wash].', 'Машину нужно помыть.', '= needs to be washed', 'n']],
  ['afraid', 'ig-afraid', ['боюсь и не решаюсь', 'She was afraid [to ask|of asking], so she said nothing.', 'Она побоялась спросить и промолчала.', 'зависит от меня', 'n'],
    ['боюсь, что случится', 'I’m afraid of [falling|to fall] on the ice.', 'Боюсь упасть на льду.', 'может случиться само', 'n']],
  ['sorry', 'ig-sorry', ['жаль сейчас', 'I’m sorry [to hear|for hearing] that.', 'Жаль это слышать.', 'сейчас или сразу после', 'n'],
    ['извиняюсь за прошлое', 'I’m sorry for [being|to be] late.', 'Извини, что опоздал.', 'было → извиняюсь', 'p']],
  ['interested', 'ig-interested', ['интересно узнать', 'I’d be interested [to hear|in hearing] your opinion.', 'Мне было бы интересно узнать ваше мнение.', 'hear, know, learn, see', 'n'],
    ['хочу заниматься', 'I’m interested in [learning|to learn] Spanish.', 'Мне интересно изучать испанский.', 'занятие', 'n']],
  ['like', 'ig-like', ['так правильно, привычка', 'I like [to see|seeing] the dentist twice a year.', 'Я стараюсь ходить к стоматологу дважды в год.', 'считаю нужным', 'n'],
    ['нравится', 'I like [swimming|to swim] in the sea.', 'Я люблю плавать в море.', 'удовольствие (часто подходят обе формы)', 'n']],
  ['used to', 'ig-used', ['раньше делал', 'I used [to live|living] in Kazan.', 'Раньше я жил в Казани.', 'привычка в прошлом', 'p'],
    ['привык (be used to)', 'I’m used to [living|live] alone.', 'Я привык жить один.', 'to здесь предлог', 'n']],
];

const IM_OFF = 240, IM_W = 3760 + IM_OFF, IM_H = 2780;
function imLayout() {
  const S = [], Z = [], L = []; // станции, районы, линии (path d + класс)
  const alt = {}; const flip = line => (alt[line] = !alt[line]) ? 't' : 'b';
  const add = (line, row, x, y, zone, ref, lab, extra = {}) => {
    if (lab === 'alt') lab = flip(line);
    const [name, pat, e1, r1, e2, r2, note = '', time = '', ref2 = ''] = row;
    const t = time || ({ to: 'a', obj: 'a', ing: 'n', ring: 'n', bare: 'n', same: 'n', forms: 'n' })[line] || 'n';
    S.push({ id: 's' + S.length, line, name, pat, ex: [[e1, r1], [e2, r2]], note, time: t, ref: ref2 || ref, zone, x, y, lab, ...extra });
  };
  // Линия to do: y = 640
  const TY = 640; let x = 260;
  L.push(['im-l-to', `M180 ${TY} H3420 Q3480 ${TY} 3480 ${TY + 60} V1380`]);
  IM_ZONES.to.forEach(([zn, ref, rows]) => {
    const x0 = x; rows.forEach((r, i) => { add('to', r, x, TY, zn, ref, 'alt'); x += 92; });
    Z.push({ name: zn, line: 'to', x: x0 - 40, y: TY - 200, w: x - x0 - 18, h: 350 }); x += 34;
  });
  // ветка прилагательных — вниз по правому краю
  let y = 760; const AX = 3480;
  IM_ZONES.adj[0][2].forEach(r => { add('to', r, AX, y, IM_ZONES.adj[0][0], IM_ZONES.adj[0][1], 'r'); y += 52; });
  Z.push({ name: 'Прилагательные и «чтобы»', line: 'to', x: AX - 50, y: 600, w: 290, h: y - 600 + 30, vertical: true });
  // ветка «глагол + человек + to do»: y = 300, от x=900
  const OY = 300; L.push(['im-l-obj', `M820 ${TY} V${OY + 60} Q820 ${OY} 880 ${OY} H2460`]);
  x = 920; IM_ZONES.obj[0][2].forEach((r, i) => { add('obj', r, x, OY, IM_ZONES.obj[0][0], IM_ZONES.obj[0][1], i % 2 ? 'b' : 't'); x += 108; });
  Z.push({ name: 'Глагол + человек + to do', line: 'obj', x: 880, y: OY - 160, w: x - 900, h: 290 });
  // Линия doing: y = 1640
  const GY = 1640; x = 260; L.push(['im-l-ing', `M180 ${GY} H3600`]);
  IM_ZONES.ing.forEach(([zn, ref, rows]) => {
    const x0 = x; rows.forEach((r, i) => { add('ing', r, x, GY, zn, ref, 'alt'); x += 82; });
    Z.push({ name: zn, line: 'ing', x: x0 - 36, y: GY - 200, w: x - x0 - 10, h: 350 }); x += 30;
  });
  // Пересадки: y = 1140, между линиями
  const PY = 1140; const pairs = [];
  IM_PAIRS.forEach(([name, ref, to, ing], i) => {
    const px = 300 + i * 172;
    pairs.push({ id: 'p' + i, name, ref, to, ing, x: px, y: PY });
    L.push(['im-l-link', `M${px} ${TY + 10} V${PY - 22}`], ['im-l-link', `M${px} ${PY + 22} V${GY - 10}`]);
  });
  Z.push({ name: 'Пересадки: смысл меняется', line: 'pair', x: 220, y: PY - 215, w: 13 * 172 - 10, h: 355 });
  // «Без разницы»: короткая фиолетовая линия справа от пересадок
  const SY = 1140; x = 2620; L.push(['im-l-same', `M2570 ${SY} H${2620 + 5 * 120 + 50}`]);
  IM_ZONES.same.forEach((r, i) => { add('same', r.slice(0, 7).concat(['n', r[7]]), x, SY, 'Без разницы', r[7], i % 2 ? 'b' : 't'); x += 120; });
  Z.push({ name: 'Без разницы', line: 'same', x: 2560, y: SY - 215, w: 760, h: 355 });
  // Кольцо предлогов: центр (640, 2330), r = 300; связь с линией doing
  const RC = [640, 2330], R = 300;
  L.push(['im-l-ring', `M${RC[0] - R} ${RC[1]} a${R} ${R} 0 1 0 ${2 * R} 0 a${R} ${R} 0 1 0 ${-2 * R} 0`], ['im-l-ing', `M${RC[0]} ${GY} V${RC[1] - R}`]);
  IM_ZONES.ring.forEach((r, i) => {
    const a = -Math.PI / 2 + (i + 0.5) * 2 * Math.PI / IM_ZONES.ring.length, sx = RC[0] + R * Math.cos(a), sy = RC[1] + R * Math.sin(a);
    add('ring', r.slice(0, 6).concat(['', 'n', r[7]]), sx, sy, 'Кольцо предлогов', r[7], Math.cos(a) > 0.2 ? 'r' : Math.cos(a) < -0.2 ? 'l' : Math.sin(a) < 0 ? 't' : 'b');
  });
  // Ветка to-предлога: от кольца вправо
  const TPY = 2330; L.push(['im-l-ring', `M${RC[0] + R} ${TPY} H${1100 + 6 * 130}`]);
  x = 1100; IM_ZONES.toprep.forEach((r, i) => { add('ring', r, x, TPY, '«to» — это предлог', 'ig-to-prep', i % 2 ? 'b' : 't'); x += 130; });
  Z.push({ name: '«to» — это предлог', line: 'ring', x: 1040, y: TPY - 175, w: 6 * 130 + 20, h: 315 });
  // Линия do: y = 2060, справа от кольца
  const BY = 2060; x = 2120; L.push(['im-l-bare', `M2060 ${BY} H${2100 + 10 * 128}`]);
  IM_ZONES.bare[0][2].forEach((r, i) => { add('bare', r, x, BY, 'Линия do', IM_ZONES.bare[0][1], i % 2 ? 'b' : 't'); x += 128; });
  Z.push({ name: 'Без to', line: 'bare', x: 2040, y: BY - 160, w: 10 * 128 + 40, h: 300 });
  // Депо «Формы»
  const DY = 2560; x = 2120; L.push(['im-l-forms', `M2060 ${DY} H${2120 + 8 * 160}`]);
  IM_ZONES.forms.forEach((r, i) => { add('forms', r, x, DY, 'Депо «Формы»', r[8], i % 2 ? 'b' : 't'); x += 160; });
  Z.push({ name: 'Депо «Формы»', line: 'forms', x: 2040, y: DY - 165, w: 8 * 160 + 40, h: 310 });
  return { S, Z, L, pairs };
}
const IM = imLayout();

function imEsc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); }
function imSolved(text) { return imEsc(text).replace(/\[([^|\]]+)(?:\|[^\]]*)?\]/g, '<b>$1</b>'); }
function imLabel(s) {
  const off = { t: [0, -26, 'middle'], b: [0, 44, 'middle'], r: [24, 8, 'start'], l: [-24, 8, 'end'] }[s.lab];
  return `<text class="im-name" x="${s.x + off[0]}" y="${s.y + off[1]}" text-anchor="${off[2]}">${imEsc(s.name)}</text>`;
}
const IM_PILL = { to: 'to do', ing: 'doing', obj: 'sb + to do', bare: 'do', ring: 'предлог + doing', same: 'to do = doing', pair: 'пересадка', forms: 'формы' };
function imZone(z) {
  const words = z.name.split(' '); let fs = 44, lines;
  const wrap = f => { const max = Math.max(6, Math.floor((z.w - 48) / (f * 0.56))), out = ['']; words.forEach(w => { const t = out.at(-1) ? out.at(-1) + ' ' + w : w; if (t.length > max && out.at(-1)) out.push(w); else out[out.length - 1] = t; }); return out; };
  lines = wrap(fs); while (lines.length > 2 && fs > 30) { fs -= 4; lines = wrap(fs); }
  const longest = Math.max(...lines.map(l => l.length)), fsl = Math.min(lines.length > 1 ? 56 : 84, Math.max(fs, (z.w - 48) / (longest * 0.56)));
  const pill = IM_PILL[z.line], pw = pill.length * 15.5 + 34, py = z.y + z.h - 52;
  return `<g class="im-zone im-z-${z.line}"><rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="28"/>`
    + `<text class="im-zname" x="${z.x + 24}" y="${z.y + 18}" style="--fs:${fs}px;--fsl:${fsl.toFixed(1)}px">${lines.map((l, i) => `<tspan x="${z.x + 24}" dy="${i ? 1.08 : 1}em">${imEsc(l)}</tspan>`).join('')}</text>`
    + `<g class="im-pill im-c-${z.line}"><rect x="${z.x + 20}" y="${py}" width="${pw}" height="36" rx="18"/><text x="${z.x + 20 + pw / 2}" y="${py + 26}" text-anchor="middle">${imEsc(pill)}</text></g></g>`;
}
function infinitiveMapSvg() {
  const zones = IM.Z.map(imZone).join('');
  const lines = IM.L.map(([c, d]) => `<path class="${c}" d="${d}"/>`).join('');
  const stations = IM.S.map(s => `<g class="im-st im-${s.line} im-t-${s.time}" data-st="${s.id}" tabindex="-1"><circle class="im-hit" cx="${s.x}" cy="${s.y}" r="34"/><circle class="im-dot" cx="${s.x}" cy="${s.y}" r="13"/>${imLabel(s)}</g>`).join('');
  const pairs = IM.pairs.map((p, i) => `<g class="im-st im-pairst" data-st="${p.id}" tabindex="-1"><circle class="im-hit" cx="${p.x}" cy="${p.y}" r="44"/><circle class="im-pair-o" cx="${p.x}" cy="${p.y}" r="22"/><path class="im-pair-a" d="M${p.x} ${p.y - 15} a15 15 0 0 0 0 30 z"/><path class="im-pair-b" d="M${p.x} ${p.y - 15} a15 15 0 0 1 0 30 z"/><text class="im-name im-pname" x="${p.x}" y="${p.y + (i % 2 ? -40 : 62)}" text-anchor="middle">${imEsc(p.name)}</text></g>`).join('');
  const titles = [['to', 24, 640], ['ing', 24, 1640], ['bare', 2050, 2060]].map(([l, x, y]) => `<g class="im-ltitle im-c-${l}"><rect x="${x}" y="${y - 62}" width="${l === 'bare' ? 170 : 380}" height="124" rx="62"/><text x="${x + (l === 'bare' ? 85 : 190)}" y="${y + 32}" text-anchor="middle">${IM_LINES[l].label}</text></g>`).join('')
    + `<g class="im-ringtitle"><text x="${IM_OFF + 640}" y="2310" text-anchor="middle">Кольцо</text><text x="${IM_OFF + 640}" y="2366" text-anchor="middle">предлогов</text><text class="im-rt-sub" x="${IM_OFF + 640}" y="2420" text-anchor="middle">предлог + doing</text></g>`;
  const legend = `<g class="im-legend"><rect x="3000" y="150" width="680" height="150" rx="24"/>
    <text class="im-lg-h" x="3030" y="202">Метро трёх форм</text>
    <text class="im-lg-t" x="3030" y="238">Слово перед глаголом — это станция. Её линия</text>
    <text class="im-lg-t" x="3030" y="270">показывает форму: to do, doing или do.</text></g>`;
  return `<svg class="im-svg" viewBox="0 0 ${IM_W} ${IM_H}" width="${IM_W}" height="${IM_H}" role="img" aria-label="Карта правила: инфинитив и герундий"><g transform="translate(${IM_OFF} 0)">${zones}${lines}${pairs}${stations}</g>${legend}${titles}</svg>`;
}
function infinitiveMapHtml() {
  const modes = `<span class="im-modes" role="group" aria-label="Режим карты"><button type="button" data-im-mode="all" aria-pressed="true">Линии</button><button type="button" data-im-mode="pair" aria-pressed="false">Пересадки</button><button type="button" data-im-mode="time" aria-pressed="false">Время</button><button type="button" data-im-mode="game" aria-pressed="false">Игра</button></span>`;
  const search = `<label class="im-search"><span class="sr-only">Найти слово на карте</span><input type="search" placeholder="Найти: avoid, stop…" autocomplete="off" spellcheck="false"><span class="nc-results im-results" hidden></span></label>`;
  return `<section class="im-wrap" id="ig-metro" aria-labelledby="im-title">
    <div class="im-head"><div><p class="eyebrow">Карта правила</p><h2 id="im-title">Метро трёх форм</h2><p>Найдите слово, которое стоит перед глаголом, и посмотрите, на какой оно линии. Пересадки — глаголы, у которых обе формы меняют смысл.</p></div>
      <ul class="im-key"><li class="im-c-to">to do</li><li class="im-c-ing">doing</li><li class="im-c-bare">do</li><li class="im-c-ring">предлог + doing</li><li class="im-c-same">обе без разницы</li><li class="im-c-pair">пересадка</li></ul></div>
    ${noeonCanvasShell('im-canvas', 'Карта правила «Метро трёх форм». Перетаскивайте, масштабируйте колесом или щипком', search + modes, 'Тяните карту · колесо или щипок — масштаб · клик по станции — подробности · 0 — вся карта')}
    <p class="im-time-key" hidden><span class="im-ta">впереди (план, цель)</span><span class="im-tp">уже было</span><span class="im-tn">вне времени</span></p>
  </section>`;
}
function imShuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function imCheck(text) {
  const m = text.match(/\[([^\]]+)\]/); if (!m) return '';
  const opts = m[1].split('|'), right = opts[0];
  return `<div class="im-check"><p class="im-ch-h">Проверьте себя</p><p class="im-ch-q">${imEsc(text.replace(m[0], '___')).replace('___', '<span class="im-gap">___</span>')}</p><div class="im-ch-o">${imShuffle(opts).map(o => `<button type="button"${o === right ? ' data-ok' : ''}>${imEsc(o)}</button>`).join('')}</div></div>`;
}
function imPanelHtml(id) {
  const ruleLink = ref => `<a class="im-rule" href="#theory/infinitive/${ref}" data-im-rule="${ref}">Подробно в правиле →</a>`;
  if (id[0] === 'p') {
    const p = IM.pairs[+id.slice(1)];
    const side = (k, d, lbl) => `<div class="im-side im-c-${k}"><p class="im-side-h"><b>${lbl}</b> ${imEsc(d[0])}</p><p class="im-ex">${imSolved(d[1])}</p><p class="im-ru">${imEsc(d[2])}</p><p class="im-order">⏱ ${imEsc(d[3])}</p>${imCheck(d[1])}</div>`;
    const lblTo = p.name === 'used to' ? 'used to do' : p.name === 'afraid' ? 'afraid to do' : p.name === 'sorry' ? 'sorry to do' : p.name === 'interested' ? 'interested to do' : p.name + ' + to do';
    const lblIng = p.name === 'used to' ? 'be used to doing' : p.name === 'afraid' ? 'afraid of doing' : p.name === 'sorry' ? 'sorry for doing' : p.name === 'interested' ? 'interested in doing' : p.name + ' + doing';
    return `<header><span class="im-badge im-c-pair">пересадка</span><h3>${imEsc(p.name)}</h3><p class="im-pat">Обе формы верны, но смысл разный.</p></header>${side('to', p.to, lblTo)}${side('ing', p.ing, lblIng)}${ruleLink(p.ref)}`;
  }
  const s = IM.S[+id.slice(1)], L = IM_LINES[s.line];
  const time = { a: 'действие впереди', p: 'действие уже было', n: '' }[s.time];
  return `<header><span class="im-badge im-c-${s.line}">${imEsc(L.label)}</span><span class="im-zone-n">${imEsc(s.zone)}</span><h3>${imEsc(s.name)}</h3><p class="im-pat">${imEsc(s.pat)}</p></header>
    <ul class="im-exs">${s.ex.map(([e, r]) => `<li><span class="im-ex">${imSolved(e)}</span><span class="im-ru">${imEsc(r)}</span></li>`).join('')}</ul>
    ${s.note ? `<p class="im-note">${s.note}</p>` : ''}${time ? `<p class="im-timeline im-t-${s.time}">⏱ ${time}</p>` : ''}
    ${s.line === 'same' ? '' : imCheck(s.ex[0][0])}${ruleLink(s.ref)}`;
}
let infinitiveMapAbort = null;
function initialiseInfinitiveMap(root) {
  const box = root.querySelector('#im-canvas'); if (!box) return;
  infinitiveMapAbort?.abort(); infinitiveMapAbort = new AbortController(); const signal = infinitiveMapAbort.signal;
  window.addEventListener('hashchange', () => { if (!box.isConnected && !document.body.contains(box)) infinitiveMapAbort?.abort(); }, { signal });
  const world = box.querySelector('.nc-world'); world.innerHTML = infinitiveMapSvg();
  box.querySelector('.nc-mini-art').innerHTML = `<svg viewBox="0 0 ${IM_W} ${IM_H}"><g transform="translate(${IM_OFF} 0)">${IM.L.map(([c, d]) => `<path class="${c}" d="${d}"/>`).join('')}</g></svg>`;
  const panel = document.createElement('aside'); panel.className = 'nc-panel im-panel'; panel.hidden = true; panel.setAttribute('aria-live', 'polite'); box.append(panel);
  const game = document.createElement('div'); game.className = 'nc-ui im-game'; game.hidden = true; box.append(game);
  const svg = world.querySelector('svg');
  const pos = id => { const p = id[0] === 'p' ? IM.pairs[+id.slice(1)] : IM.S[+id.slice(1)]; return { ...p, x: p.x + IM_OFF }; };
  const mobile = () => box.clientWidth < 700;
  const panelSpace = () => panel.hidden ? {} : mobile() ? { bottom: panel.offsetHeight } : { right: panel.offsetWidth + 16 };
  let current = null;
  const open = (id, fly = true) => {
    current = id; svg.querySelectorAll('.im-st.is-on').forEach(n => n.classList.remove('is-on'));
    svg.querySelector(`[data-st="${id}"]`)?.classList.add('is-on');
    panel.innerHTML = `<button type="button" class="im-close" aria-label="Закрыть">✕</button>${imPanelHtml(id)}`; panel.hidden = false; panel.scrollTop = 0;
    if (fly) { const p = pos(id); api.flyTo(p.x, p.y, Math.max(api.v.k, mobile() ? 0.75 : 0.85), panelSpace()); }
  };
  const close = () => { panel.hidden = true; current = null; svg.querySelectorAll('.im-st.is-on').forEach(n => n.classList.remove('is-on')); };
  const api = initialiseNoeonCanvas(box, {
    W: IM_W, H: IM_H, signal, minK: 0.1, maxK: 1.6,
    onZoom: k => { box.classList.toggle('lod-low', k < 0.32); box.classList.toggle('lod-mid', k >= 0.32 && k < 0.55); },
    onTap: e => { const st = e.target.closest('[data-st]'); if (st) { if (gameState.on) return; open(st.dataset.st); } else if (!e.target.closest('.nc-panel') && !mobile()) close(); },
    start: ({ v, apply, fit, box: b }) => { if (b.clientWidth < 700) { v.k = 0.4; v.x = 0; v.y = -40; apply(); } else fit(); },
  });
  // карточка
  panel.addEventListener('click', e => {
    if (e.target.closest('.im-close')) { close(); return; }
    const opt = e.target.closest('.im-ch-o button');
    if (opt) { const c = opt.closest('.im-check'); if (c.classList.contains('done')) return; const ok = opt.hasAttribute('data-ok'); c.classList.add('done', ok ? 'ok' : 'bad');
      c.querySelectorAll('button').forEach(b => { b.disabled = true; if (b.hasAttribute('data-ok')) b.classList.add('right'); }); if (!ok) opt.classList.add('wrong');
      c.querySelector('.im-gap').textContent = c.querySelector('[data-ok]').textContent; return; }
    const rule = e.target.closest('[data-im-rule]');
    if (rule && typeof revealInfinitiveGerundAnchor === 'function') { e.preventDefault(); if (api.isFull()) box.querySelector('[data-nc-full]').click(); revealInfinitiveGerundAnchor(document.querySelector('.theory-content'), rule.dataset.imRule); }
  }, { signal });
  // поиск
  const input = box.querySelector('.im-search input'), results = box.querySelector('.im-results');
  const all = IM.S.map(s => ({ id: s.id, name: s.name, sub: IM_LINES[s.line].label })).concat(IM.pairs.map(p => ({ id: p.id, name: p.name, sub: 'пересадка' })));
  const norm = s => s.toLowerCase().replace(/[’']/g, '\'').replace(/[^a-z' а-яё]/g, ' ').trim();
  input.addEventListener('input', () => {
    const q = norm(input.value); if (!q) { results.hidden = true; return; }
    const score = h => { const n = norm(h.name); return n === q ? 0 : n.startsWith(q) ? 1 : n.includes(q) ? 2 : 3; };
    const hits = all.filter(h => norm(h.name).includes(q) || IM.S.find(s => s.id === h.id && norm(s.pat).includes(q))).sort((a, b) => score(a) - score(b) || (a.id[0] === 'p' ? -1 : 1)).slice(0, 8);
    results.innerHTML = hits.length ? hits.map(h => `<button type="button" data-go="${h.id}"><b>${imEsc(h.name)}</b><small>${imEsc(h.sub)}</small></button>`).join('') : '<span class="im-none">Нет на карте</span>';
    results.hidden = false;
  }, { signal });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') results.querySelector('[data-go]')?.click(); if (e.key === 'Escape') { input.value = ''; results.hidden = true; } }, { signal });
  results.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (!b) return; results.hidden = true; input.blur(); open(b.dataset.go); }, { signal });
  // режимы
  const gameState = { on: false, score: 0, total: 0, id: null };
  const pool = IM.S.filter(s => ['to', 'ing', 'bare', 'obj', 'ring'].includes(s.line) && !/[…·+:]|чтобы|Swimming/.test(s.name));
  const lineOf = s => s.line === 'obj' ? 'to' : s.line === 'ring' ? 'ing' : s.line;
  const nextQ = () => {
    const s = pool[Math.floor(Math.random() * pool.length)]; gameState.id = s.id;
    game.innerHTML = `<p class="im-g-h">Игра «Маршрут» · ${gameState.score} из ${gameState.total}</p><p class="im-g-q">После <b>${imEsc(s.name)}</b> — какая линия?</p><div class="im-g-o"><button type="button" data-g="to" class="im-c-to">to do</button><button type="button" data-g="ing" class="im-c-ing">doing</button><button type="button" data-g="bare" class="im-c-bare">do</button></div><button type="button" class="im-g-end">Выйти из игры</button>`;
  };
  game.addEventListener('click', e => {
    if (e.target.closest('.im-g-end')) { setMode('all'); return; }
    if (e.target.closest('.im-g-next')) { close(); nextQ(); return; }
    const b = e.target.closest('[data-g]'); if (!b || game.classList.contains('answered')) return;
    const s = pos(gameState.id), ok = b.dataset.g === lineOf(s); gameState.total++; if (ok) gameState.score++;
    game.querySelector('.im-g-h').textContent = `Игра «Маршрут» · ${gameState.score} из ${gameState.total}`;
    game.querySelector('.im-g-o').innerHTML = `<p class="im-g-r ${ok ? 'ok' : 'bad'}">${ok ? '✓ Верно' : '✗ Нет'}: ${imEsc(s.pat)}</p><button type="button" class="im-g-next">Дальше →</button>`;
    open(s.id);
  }, { signal });
  const timeKey = root.querySelector('.im-time-key');
  const setMode = m => {
    box.querySelectorAll('[data-im-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.imMode === m)));
    box.classList.toggle('im-mode-pair', m === 'pair'); box.classList.toggle('im-mode-time', m === 'time'); timeKey.hidden = m !== 'time';
    gameState.on = m === 'game'; game.hidden = !gameState.on; box.classList.toggle('im-mode-game', gameState.on);
    if (gameState.on) { gameState.score = 0; gameState.total = 0; close(); nextQ(); }
    if (m === 'time') api.smooth(api.fit);
    if (m === 'pair') { const a = IM.pairs[0], b = IM.pairs.at(-1); api.flyTo((a.x + b.x) / 2 + IM_OFF, a.y, Math.min(box.clientWidth / (b.x - a.x + 300), 0.7)); }
  };
  box.addEventListener('click', e => { const m = e.target.closest('[data-im-mode]'); if (m) setMode(m.dataset.imMode); }, { signal });
  box.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { e.stopPropagation(); close(); } }, { signal, capture: true });
  return api;
}
