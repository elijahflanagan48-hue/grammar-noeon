"use strict";
/* Карта правила Nouns: «Супермаркет существительных» на движке noeon-canvas.js.
   Товар: [слово, перевод, пример, перевод примера, проверка с [верно|неверно|неверно], заметка?, ловушка?]
   Ловушка (trap) — слово, которое по-русски считается иначе, чем по-английски. */
const NM_KINDS = {
  cnt: { label: 'поштучно', title: 'Поштучно', hint: 'можно посчитать: a / an, -s, many' },
  unc: { label: 'на развес', title: 'На развес', hint: 'не считаем: без a, без -s, much' },
  both: { label: 'два значения', title: 'Два значения', hint: 'на развес и поштучно — смысл разный' },
  pack: { label: 'упаковка', title: 'Упаковки', hint: 'делают неисчисляемое считаемым' },
  pl: { label: 'множественное', title: 'Множественное число', hint: 'как образовать' },
  art: { label: 'ценник', title: 'Вход: ценники', hint: 'a / an, the или без артикля' },
  qty: { label: 'касса', title: 'Касса «Сколько?»', hint: 'many, much, few, little…' },
  poss: { label: 'чьё?', title: 'Витрина «Чьё?»', hint: '’s и of' },
  comp: { label: 'составные', title: 'Составные и группы', hint: 'bus stop, team is/are' },
};
const NM_DATA = {
  cnt: [
    ['Овощи и фрукты', 'nr-1', [
      ['apple', 'яблоко', 'I eat an apple every day.', 'Я каждый день съедаю яблоко.', 'Can I have [an apple|apple|an apples]?'],
      ['banana', 'банан', 'There are three bananas in the bag.', 'В пакете три банана.', 'How [many|much|a lot] bananas do we need?'],
      ['egg', 'яйцо', 'I’d like two eggs for breakfast.', 'Я бы хотел два яйца на завтрак.', 'Crack [an egg|a egg|egg] into the bowl.'],
      ['potato', 'картофелина', 'Peel five potatoes, please.', 'Почисти, пожалуйста, пять картофелин.', 'We need two kilos of [potatoes|potatos|potato].', 'Во множественном числе: potatoes, tomatoes — с -es.'],
      ['tomato', 'помидор', 'Add two tomatoes to the salad.', 'Добавь в салат два помидора.', 'This salad has too many [tomatoes|tomatos|tomato].'],
      ['carrot', 'морковка', 'Rabbits love carrots.', 'Кролики обожают морковку.', 'Grate [a carrot|carrot|a carrots].', 'По-русски часто «морковь» — без счёта, а по-английски carrot считается: a carrot, carrots.', true],
      ['orange', 'апельсин', 'She bought a bag of oranges.', 'Она купила пакет апельсинов.', 'Would you like [an orange|a orange|orange]?'],
    ]],
    ['Вещи', 'nr-1', [
      ['chair', 'стул', 'We need two more chairs.', 'Нам нужно ещё два стула.', 'There [are|is|be] four chairs in the kitchen.'],
      ['phone', 'телефон', 'I’ve lost my phone.', 'Я потерял телефон.', 'She has [a|an|—] new phone.'],
      ['bag', 'сумка, пакет', 'Do you need a bag?', 'Вам нужен пакет?', 'How [many|much|little] bags have you got?'],
      ['key', 'ключ', 'Where are my keys?', 'Где мои ключи?', 'I can’t find my [keys|key’s|keies].'],
      ['book', 'книга', 'She reads a book a week.', 'Она читает по книге в неделю.', 'I’ve read [a few|a little|much] books by him.'],
      ['coin', 'монета', 'I have only a few coins.', 'У меня всего несколько монет.', 'I need some [coins|coin|money coins] for the machine.', 'Монеты считаем, а money — нет: some coins, but some money.'],
      ['ticket', 'билет', 'Two tickets to Oxford, please.', 'Два билета до Оксфорда, пожалуйста.', 'Have you got [a ticket|ticket|a tickets]?'],
    ]],
    ['Учёба и работа', 'nr-1', [
      ['job', 'работа, должность', 'She’s got a new job.', 'У неё новая работа.', 'He’s looking for [a job|job|a work].', 'Job — одна конкретная работа (считается). Work — работа вообще (на развес): I have a lot of work.'],
      ['task', 'задача', 'I have three tasks for today.', 'У меня на сегодня три задачи.', 'This is [a difficult task|difficult task|a difficult tasks].'],
      ['lesson', 'урок', 'We have two English lessons a week.', 'У нас два урока английского в неделю.', 'How [many|much|a little] lessons do you have today?'],
      ['exam', 'экзамен', 'I passed all my exams!', 'Я сдал все экзамены!', 'She has [an exam|a exam|exam] tomorrow.'],
      ['project', 'проект', 'We are working on a big project.', 'Мы работаем над большим проектом.', 'They finished [the project|project|a projects] on time.'],
      ['meeting', 'встреча, совещание', 'I have a meeting at ten.', 'У меня совещание в десять.', 'There were [several|much|a little] meetings this week.'],
    ]],
    ['Мысли и слова', 'nr-1', [
      ['idea', 'идея', 'That’s a great idea!', 'Отличная идея!', 'I have [an idea|a idea|idea].'],
      ['problem', 'проблема', 'We have a small problem.', 'У нас небольшая проблема.', 'There aren’t [many|much|a little] problems left.'],
      ['mistake', 'ошибка', 'Everyone makes mistakes.', 'Все ошибаются.', 'You made [a few|a little|much] mistakes.'],
      ['question', 'вопрос', 'Can I ask a question?', 'Можно задать вопрос?', 'Do you have [any questions|any question|some question]?'],
      ['opinion', 'мнение', 'In my opinion, it’s too expensive.', 'По-моему, это слишком дорого.', 'Everyone has [an opinion|a opinion|opinion].'],
      ['suggestion', 'предложение, совет', 'Can I make a suggestion?', 'Можно я кое-что предложу?', 'Thanks for [the suggestions|the suggestion’s|suggestion].', 'Suggestion считается, а близкое по смыслу advice — нет: a suggestion, but some advice.'],
      ['fact', 'факт', 'Here are some facts about whales.', 'Вот несколько фактов о китах.', 'That’s [an interesting fact|interesting fact|an interesting facts].'],
    ]],
  ],
  unc: [
    ['Жидкости', 'nr-1', [
      ['water', 'вода', 'Can I have some water?', 'Можно мне воды?', 'Drink [a glass of water|a water|waters] before breakfast.'],
      ['milk', 'молоко', 'There’s no milk in the fridge.', 'В холодильнике нет молока.', 'How [much|many|a few] milk do we need?'],
      ['juice', 'сок', 'I’d like some orange juice.', 'Я бы выпил апельсинового сока.', 'Get [a carton of juice|a juice carton of|a juices] on the way home.'],
      ['oil', 'масло (растительное), нефть', 'Fry the onion in a little oil.', 'Обжарьте лук на небольшом количестве масла.', 'Add [a little|a few|many] oil to the pan.'],
      ['soup', 'суп', 'Would you like some soup?', 'Хочешь супа?', 'I made [a bowl of soup|a soup bowls|soups] for you.'],
      ['petrol', 'бензин', 'We’re running out of petrol.', 'У нас заканчивается бензин.', 'The car needs [some|a|many] petrol.'],
    ]],
    ['Продукты', 'nr-1', [
      ['rice', 'рис', 'I cook rice twice a week.', 'Я готовлю рис дважды в неделю.', 'We need [a kilo of rice|a rice|rices].'],
      ['sugar', 'сахар', 'Do you take sugar?', 'Вы с сахаром?', 'Not too [much|many|few] sugar, please.'],
      ['flour', 'мука', 'Mix the flour with the eggs.', 'Смешайте муку с яйцами.', 'You need [a bag of flour|a flour|flours].'],
      ['salt', 'соль', 'Add a pinch of salt.', 'Добавьте щепотку соли.', 'There’s too [much|many|a lot] salt in the soup.'],
      ['bread', 'хлеб', 'Could you buy some bread?', 'Купишь хлеба?', 'I bought [a loaf of bread|a bread|breads].', 'Нельзя *a bread*. Одна буханка — a loaf of bread, кусок — a slice of bread.'],
      ['cheese', 'сыр', 'I love French cheese.', 'Обожаю французский сыр.', 'Cut me [a slice of cheese|a cheese slice of|cheeses], please.'],
      ['meat', 'мясо', 'I don’t eat much meat.', 'Я ем мало мяса.', 'How [much|many|few] meat do we need?'],
      ['butter', 'сливочное масло', 'Put some butter on the toast.', 'Намажь тост маслом.', 'There’s [a little|a few|many] butter left.'],
      ['pasta', 'макароны, паста', 'Pasta is easy to cook.', 'Пасту легко готовить.', 'This pasta [is|are|were] delicious.', 'По-русски «макароны» — во множественном числе, а pasta — без -s, глагол в единственном: The pasta is ready.', true],
      ['fruit', 'фрукты', 'Eat more fruit and vegetables.', 'Ешьте больше фруктов и овощей.', 'There [is|are|be] some fruit on the table.', 'Fruit обычно на развес: some fruit, a lot of fruit. Отдельный плод — a piece of fruit или an apple. Fruits — «разные виды фруктов».', true],
    ]],
    ['Материалы', 'nr-1', [
      ['wood', 'дерево (материал)', 'The table is made of wood.', 'Стол сделан из дерева.', 'This box is made of [wood|a wood|woods].', 'A wood — это «лес, роща» (считается): a wood near the village.'],
      ['plastic', 'пластик', 'Try to use less plastic.', 'Старайтесь пользоваться меньше пластиком.', 'We should use [less|fewer|many] plastic.'],
      ['metal', 'металл', 'The door is made of metal.', 'Дверь сделана из металла.', 'It’s made of [metal|a metal|metals].'],
      ['cotton', 'хлопок', 'This shirt is 100% cotton.', 'Эта рубашка из 100% хлопка.', 'A shirt made of [cotton|a cotton|cottons].'],
      ['gold', 'золото', 'Gold is very expensive now.', 'Золото сейчас очень дорогое.', '[Gold is|Gold are|A gold is] a precious metal.'],
      ['sand', 'песок', 'The children played in the sand.', 'Дети играли в песке.', 'There’s [sand|a sand|sands] in my shoes.'],
      ['air', 'воздух', 'Let’s get some fresh air.', 'Давай подышим свежим воздухом.', 'I need [some fresh air|a fresh air|fresh airs].'],
    ]],
    ['Абстрактное', 'nr-1', [
      ['advice', 'совет, советы', 'Can I give you some advice?', 'Можно дам тебе совет?', 'He gave me [some good advice|a good advice|good advices].', 'По-русски «советы» считаем, а advice — нет: никогда *an advice* и *advices*. Один совет — a piece of advice.', true],
      ['information', 'информация, сведения', 'I need more information.', 'Мне нужно больше информации.', 'Thanks for [the information|the informations|an information].', 'Никогда *informations*. Одно сведение — a piece of information.', true],
      ['knowledge', 'знания', 'She has a good knowledge of history.', 'У неё хорошие знания по истории.', 'His [knowledge|knowledges|knowledge’s] of maths is amazing.', 'По-русски «знания» — во множественном, а knowledge — без -s.', true],
      ['progress', 'успехи, прогресс', 'You’re making good progress!', 'У тебя хорошие успехи!', 'She has made [a lot of progress|a progress|many progresses].', 'По-русски «успехи», а progress — без -s и без a.', true],
      ['research', 'исследования', 'They are doing research on sleep.', 'Они проводят исследования сна.', 'There is [a lot of research|many researches|a research] on this.', 'Обычно без -s: do research. Одно исследование — a study или a piece of research.', true],
      ['evidence', 'доказательства, улики', 'There is no evidence against him.', 'Против него нет улик.', 'The police found [some evidence|an evidence|evidences].', 'По-русски «доказательства» — во множественном, а evidence — нет.', true],
      ['help', 'помощь', 'Thanks for your help!', 'Спасибо за помощь!', 'I need [some help|a help|helps].'],
      ['fun', 'веселье, удовольствие', 'We had a lot of fun.', 'Мы отлично повеселились.', 'The party was [great fun|a great fun|great funs].'],
      ['luck', 'удача', 'Good luck with your exam!', 'Удачи на экзамене!', '[Good luck|A good luck|Good lucks] tomorrow!'],
      ['patience', 'терпение', 'Teaching needs a lot of patience.', 'Преподавание требует много терпения.', 'You need [a lot of patience|many patience|a patience].'],
      ['permission', 'разрешение', 'You need permission to park here.', 'Чтобы здесь парковаться, нужно разрешение.', 'Did you ask for [permission|a permission|permissions]?', 'Разрешение как документ — a permit (считается).'],
      ['behaviour', 'поведение', 'His behaviour was strange.', 'Он вёл себя странно.', 'Her [behaviour was|behaviours were|behaviour were] perfect.'],
    ]],
    ['Ловушки', 'nr-1', [
      ['news', 'новости, новость', 'The news is good!', 'Новости хорошие!', 'The news [is|are|were] on at nine.', 'Выглядит как множественное, но глагол в единственном числе: The news is… Одна новость — a piece of news.', true],
      ['furniture', 'мебель', 'We bought some new furniture.', 'Мы купили новую мебель.', 'How [much|many|a few] furniture do you have?', 'Один предмет мебели — a piece of furniture.', true],
      ['luggage', 'багаж, чемоданы', 'How much luggage do you have?', 'Сколько у вас багажа?', 'I have [a lot of luggage|many luggages|a luggage].', 'Чемоданы считаем (two suitcases, two bags), а luggage и baggage — нет.', true],
      ['equipment', 'оборудование', 'The gym has modern equipment.', 'В зале современное оборудование.', 'We need [some new equipment|a new equipment|new equipments].', 'Одна вещь — a piece of equipment.', true],
      ['homework', 'домашнее задание', 'I have a lot of homework today.', 'Сегодня мне много задали.', 'Did you do [your homework|your homeworks|a homework]?', 'Нельзя *homeworks*. Несколько заданий — some homework или three exercises.', true],
      ['money', 'деньги', 'I don’t have much money.', 'У меня мало денег.', 'The money [is|are|were] on the table.', 'По-русски «деньги» — во множественном, а money — единственное, на развес: The money is…', true],
      ['traffic', 'движение, пробки', 'There was a lot of traffic this morning.', 'Утром были жуткие пробки.', 'There [was a lot of traffic|were many traffics|was a traffic].', 'Одна пробка — a traffic jam (считается).', true],
      ['weather', 'погода', 'What lovely weather!', 'Какая прекрасная погода!', 'We had [terrible weather|a terrible weather|terrible weathers].', 'Нельзя *a lovely weather*. Восклицание — What lovely weather!', true],
      ['accommodation', 'жильё', 'Accommodation in London is expensive.', 'Жильё в Лондоне дорогое.', 'We need to find [accommodation|an accommodation|accommodations].', 'Одна квартира — a flat, номер — a room.', true],
      ['music', 'музыка', 'I listen to music on the bus.', 'Я слушаю музыку в автобусе.', 'I love [this music|these musics|a music].', 'Одна песня или произведение — a song, a piece of music.'],
      ['software', 'программы, софт', 'You need to update the software.', 'Нужно обновить программы.', 'This [software is|softwares are|software are] free.', 'Одна программа — a program или an app.', true],
      ['rubbish', 'мусор', 'Take the rubbish out, please.', 'Вынеси, пожалуйста, мусор.', 'There’s [a lot of rubbish|many rubbishes|a rubbish] in the park.', 'В американском английском — garbage или trash, тоже на развес.'],
    ]],
  ],
  pack: [
    ['a piece of advice', 'один совет', 'Let me give you a piece of advice.', 'Позволь дать тебе один совет.', 'She gave me [a piece of|a|an] advice.'],
    ['a piece of information', 'одно сведение', 'That’s a useful piece of information.', 'Это полезная информация.', 'I found [a piece of|an|a] information online.'],
    ['a piece of furniture', 'предмет мебели', 'This chair is a beautiful piece of furniture.', 'Этот стул — прекрасный предмет мебели.', 'We need [a piece of|a|one] furniture for the hall.'],
    ['a piece of news', 'одна новость', 'I have a piece of good news.', 'У меня есть одна хорошая новость.', 'Here’s [a piece of|a|one] news for you.'],
    ['a slice of bread', 'кусок хлеба', 'Can I have a slice of bread?', 'Можно кусок хлеба?', 'I ate [a slice of|a|one] bread.'],
    ['a loaf of bread', 'буханка хлеба', 'Buy a loaf of bread on the way home.', 'Купи буханку хлеба по дороге домой.', 'Two [loaves|loafs|loaf] of bread, please.', 'Loaf → loaves: f меняется на v.'],
    ['a bottle of water', 'бутылка воды', 'Take a bottle of water with you.', 'Возьми с собой бутылку воды.', 'Two [bottles of water|water bottles of|waters bottle], please.'],
    ['a glass of milk', 'стакан молока', 'He drinks a glass of milk at night.', 'Он пьёт стакан молока на ночь.', 'Can I have [a glass of|a|one] milk?'],
    ['a cup of coffee', 'чашка кофе', 'Would you like a cup of coffee?', 'Хотите чашку кофе?', 'I had [two cups of coffee|two coffee cups of|two coffees cups].'],
    ['a carton of juice', 'пакет сока', 'There’s a carton of juice in the fridge.', 'В холодильнике пакет сока.', 'Get [a carton of|a|an] juice.'],
    ['a kilo of rice', 'килограмм риса', 'A kilo of rice is enough.', 'Килограмма риса хватит.', 'We need [two kilos of|two|a] rice.'],
    ['a bag of flour', 'пакет муки', 'Buy a bag of flour for the pancakes.', 'Купи пакет муки для блинов.', 'Bring [a bag of|a|one] flour.'],
    ['a pinch of salt', 'щепотка соли', 'Add a pinch of salt.', 'Добавьте щепотку соли.', 'Just [a pinch of|a|one] salt.'],
    ['a bar of chocolate', 'плитка шоколада', 'I ate a whole bar of chocolate!', 'Я съел целую плитку шоколада!', 'Can you buy me [a bar of|a|an] chocolate?', 'Chocolate как вещество — на развес. A chocolate — одна конфета (считается).'],
    ['a jar of honey', 'банка мёда', 'We bought a jar of honey at the market.', 'Мы купили банку мёда на рынке.', 'There’s [a jar of|a|an] honey on the shelf.'],
    ['a can of cola', 'банка колы', 'He opened a can of cola.', 'Он открыл банку колы.', 'Two [cans of cola|colas can|can of colas], please.'],
    ['a bowl of soup', 'тарелка супа', 'I had a bowl of soup for lunch.', 'На обед я съел тарелку супа.', 'Would you like [a bowl of|a|one] soup?'],
    ['a sheet of paper', 'лист бумаги', 'Take a sheet of paper and a pen.', 'Возьмите лист бумаги и ручку.', 'Can I have [a sheet of|a|one] paper?', 'A paper — это газета или доклад, а не лист.'],
    ['a grain of sand', 'песчинка', 'There’s a grain of sand in my eye.', 'Мне в глаз попала песчинка.', 'Not even [a grain of|a|one] sand was left.'],
    ['a game of chess', 'партия в шахматы', 'Let’s play a game of chess.', 'Давай сыграем партию в шахматы.', 'We played [a game of|a|one] chess.'],
  ],
  both: [
    ['paper', 'nr-3', ['бумага', 'Recycle paper and glass.', 'Сдавайте бумагу и стекло на переработку.'], ['газета, доклад', 'I read a paper on the train.', 'Я читал газету в поезде.'], 'I need [some paper|a paper|papers] to print this.'],
    ['glass', 'nr-3', ['стекло', 'The bottle is made of glass.', 'Бутылка из стекла.'], ['стакан, бокал', 'Can I have a glass of water?', 'Можно стакан воды?'], 'He broke [a glass|glass|a glasses] at dinner.', 'Glasses (мн.) — ещё и «очки».'],
    ['time', 'nr-3', ['время', 'I don’t have much time.', 'У меня мало времени.'], ['раз', 'I’ve been to Rome three times.', 'Я был в Риме три раза.'], 'We had [a great time|great time|a great times] in Spain.', 'A good time — «хорошо провести время»: We had a good time.'],
    ['experience', 'nr-3', ['опыт', 'Do you have experience with children?', 'У вас есть опыт работы с детьми?'], ['случай, впечатление', 'The trip was an amazing experience.', 'Поездка была потрясающим впечатлением.'], 'She has five years’ [experience|experiences|an experience] in sales.'],
    ['chicken', 'nr-3', ['курятина', 'We had chicken for dinner.', 'На ужин у нас была курица.'], ['курица (птица)', 'There’s a chicken in the garden.', 'В саду ходит курица.'], 'Would you like some [chicken|a chicken|chickens] with rice?'],
    ['coffee', 'nr-3', ['кофе (вещество)', 'I don’t drink coffee.', 'Я не пью кофе.'], ['чашка кофе', 'Two coffees, please.', 'Два кофе, пожалуйста.'], 'Can we have [two coffees|two coffee|two coffee’s], please?', 'В кафе так говорят и про tea, beer, water: Two teas, please.'],
    ['room', 'nr-3', ['место, пространство', 'Is there room for one more?', 'Найдётся место ещё для одного?'], ['комната', 'The flat has three rooms.', 'В квартире три комнаты.'], 'There isn’t [enough room|enough rooms|a room] in the car.'],
    ['hair', 'nr-3', ['волосы', 'She has long dark hair.', 'У неё длинные тёмные волосы.'], ['волосок', 'There’s a hair in my soup!', 'У меня в супе волос!'], 'Her [hair is|hairs are|hair are] beautiful.', 'По-русски «волосы» — во множественном, а hair — на развес: Her hair is long.', true],
    ['iron', 'nr-3', ['железо', 'The gate is made of iron.', 'Ворота из железа.'], ['утюг', 'Where’s the iron?', 'Где утюг?'], 'Can I borrow [an iron|iron|a irons]?'],
    ['light', 'nr-3', ['свет', 'Light travels very fast.', 'Свет распространяется очень быстро.'], ['лампа, огонёк', 'Turn off the lights, please.', 'Выключи, пожалуйста, свет.'], 'There isn’t enough [light|lights|a light] to read.'],
    ['work', 'nr-3', ['работа (вообще)', 'I have a lot of work today.', 'У меня сегодня много работы.'], ['произведение', 'a work of art · the works of Tolstoy', 'произведение искусства · сочинения Толстого'], 'I’m looking for [work|a work|works].', 'Конкретная должность — a job: She has a new job.'],
    ['business', 'nr-3', ['бизнес, дела', 'Business is going well.', 'Дела идут хорошо.'], ['фирма, компания', 'She runs a small business.', 'У неё небольшая фирма.'], 'He wants to start [a business|business|a businesses].'],
  ],
  pl: [
    ['+ s', 'nr-4', [
      ['cat', 'cats', 'I have two cats.', 'У меня две кошки.', 'Three [cats|cates|caties].'],
      ['day', 'days', 'See you in two days.', 'Увидимся через два дня.', 'For three [days|daies|dayes].', 'Гласная + y → просто + s: days, boys, keys.'],
      ['photo', 'photos', 'I took a lot of photos.', 'Я сделал много фото.', 'Look at these [photos|photoes|photo].', 'Короткие и заимствованные слова на -o: photos, pianos, videos, radios.'],
    ]],
    ['+ es', 'nr-4', [
      ['box', 'boxes', 'Put the boxes in the car.', 'Положи коробки в машину.', 'Two [boxes|boxs|box].', 'После s, ss, sh, ch, x, z → + es.'],
      ['bus', 'buses', 'The buses are late again.', 'Автобусы опять опаздывают.', 'Two [buses|buss|bus] came at once.'],
      ['watch', 'watches', 'He collects watches.', 'Он коллекционирует часы.', 'Both [watches|watchs|watch] are broken.'],
      ['potato', 'potatoes', 'Peel the potatoes.', 'Почисти картошку.', 'A kilo of [potatoes|potatos|potato].', 'Также tomatoes, heroes, echoes.'],
    ]],
    ['y → ies', 'nr-4', [
      ['city', 'cities', 'Big cities are noisy.', 'В больших городах шумно.', 'I’ve visited many [cities|citys|cityes].', 'Согласная + y → ies.'],
      ['baby', 'babies', 'Babies sleep a lot.', 'Младенцы много спят.', 'Twin [babies|babys|babyes].'],
      ['party', 'parties', 'We went to two parties.', 'Мы сходили на две вечеринки.', 'I love [parties|partys|partyes].'],
    ]],
    ['f, fe → ves', 'nr-4', [
      ['knife', 'knives', 'Be careful with the knives.', 'Осторожно с ножами.', 'Sharp [knives|knifes|knife].'],
      ['leaf', 'leaves', 'The leaves are turning yellow.', 'Листья желтеют.', 'Autumn [leaves|leafs|leafes].'],
      ['wife', 'wives', 'Their wives are friends.', 'Их жёны дружат.', 'Both [wives|wifes|wife].'],
      ['half', 'halves', 'Cut it into two halves.', 'Разрежь на две половины.', 'Two [halves|halfs|half].'],
      ['roof', 'roofs', 'The roofs were covered in snow.', 'Крыши были покрыты снегом.', 'Red [roofs|rooves|roof].', 'Исключения: roofs, chefs, beliefs — просто + s.'],
    ]],
    ['Особые', 'nr-5', [
      ['man', 'men', 'Two men were waiting.', 'Ждали двое мужчин.', 'Three [men|mans|mens].'],
      ['woman', 'women', 'Women live longer.', 'Женщины живут дольше.', 'Two [women|womans|womens].', 'Women читается [ˈwɪmɪn].'],
      ['child', 'children', 'The children are asleep.', 'Дети спят.', 'Three [children|childs|childrens].'],
      ['person', 'people', 'There were ten people.', 'Там было десять человек.', 'How many [people|persons|peoples] came?', 'Peoples — «народы».'],
      ['foot', 'feet', 'My feet hurt.', 'У меня болят ноги.', 'Wet [feet|foots|feets].'],
      ['tooth', 'teeth', 'Brush your teeth.', 'Почисти зубы.', 'White [teeth|tooths|teeths].'],
      ['mouse', 'mice', 'Cats catch mice.', 'Кошки ловят мышей.', 'Three [mice|mouses|mices].', 'Компьютерные мыши — mice или mouses.'],
      ['goose', 'geese', 'Geese fly south in winter.', 'Гуси улетают на юг зимой.', 'A flock of [geese|gooses|geeses].'],
    ]],
    ['Одна форма', 'nr-5', [
      ['sheep', 'sheep', 'There are fifty sheep on the farm.', 'На ферме пятьдесят овец.', 'Ten [sheep|sheeps|sheepes].'],
      ['fish', 'fish', 'We caught three fish.', 'Мы поймали три рыбы.', 'Two [fish|fishs|fishies].', 'Fishes — «разные виды рыб».'],
      ['deer', 'deer', 'We saw two deer in the forest.', 'Мы видели в лесу двух оленей.', 'Two [deer|deers|deeres].'],
      ['series', 'series', 'Two new series start this week.', 'На этой неделе начинаются два новых сериала.', 'This [series is|serie is|series are] great.', 'И единственное, и множественное: a series, two series. Так же species.'],
      ['aircraft', 'aircraft', 'Three aircraft landed.', 'Приземлились три самолёта.', 'Five [aircraft|aircrafts|aircraftes].'],
    ]],
    ['Латынь и греческий', 'nr-5', [
      ['crisis', 'crises', 'The country faced two crises.', 'Страна пережила два кризиса.', 'Economic [crises|crisises|crisis].', '-is → -es: analysis — analyses, thesis — theses.'],
      ['phenomenon', 'phenomena', 'Strange phenomena were reported.', 'Сообщали о странных явлениях.', 'Natural [phenomena|phenomenons|phenomenas].'],
      ['criterion', 'criteria', 'What are the criteria?', 'Каковы критерии?', 'These [criteria|criterions|criterias] are clear.'],
      ['cactus', 'cacti', 'She grows cacti.', 'Она выращивает кактусы.', 'Three [cacti|cactus|cactis].', 'Можно и cactuses.'],
    ]],
    ['Только мн. число', 'nr-5', [
      ['trousers', '—', 'These trousers are too long.', 'Эти брюки слишком длинные.', 'My [trousers are|trouser is|trousers is] new.', 'Одна пара — a pair of trousers. Так же jeans, shorts, pyjamas.'],
      ['scissors', '—', 'Where are the scissors?', 'Где ножницы?', 'The scissors [are|is|was] sharp.', 'Одни ножницы — a pair of scissors.'],
      ['glasses', '—', 'I need my glasses to read.', 'Мне нужны очки, чтобы читать.', 'Her glasses [are|is|was] on the table.'],
      ['clothes', '—', 'Your clothes are dirty.', 'Твоя одежда грязная.', 'These clothes [are|is|was] new.', 'По-русски «одежда» — в единственном числе, а clothes — во множественном: My clothes are…'],
      ['goods', '—', 'The goods were delivered today.', 'Товары доставили сегодня.', 'The goods [were|was|is] expensive.'],
    ]],
    ['-s, но единственное', 'nr-5', [
      ['maths', '—', 'Maths is my favourite subject.', 'Математика — мой любимый предмет.', 'Maths [is|are|were] easy for her.', 'Так же physics, economics, athletics, gymnastics.'],
      ['physics', '—', 'Physics is hard.', 'Физика — сложный предмет.', 'Physics [is|are|were] hard.'],
      ['athletics', '—', 'Athletics is popular here.', 'Лёгкая атлетика здесь популярна.', 'Athletics [is|are|were] my sport.'],
    ]],
  ],
  art: [
    ['a', 'nr-9', [
      ['один из многих', 'I saw a dog in the park.', 'Я видел в парке собаку.', 'There’s [a|the|—] cat on the roof.', 'Говорим о предмете впервые, собеседник его не знает.'],
      ['профессия', 'She’s a doctor.', 'Она врач.', 'My brother is [an|the|—] engineer.', 'По-русски без слова, а по-английски нужен a/an: He’s a teacher.'],
      ['a или an — по звуку', 'an hour · a university · an MBA', 'час · университет · степень MBA', 'It takes [an|a|the] hour.', 'Важен первый звук, а не буква: an hour [ˈaʊə], a university [ˌjuːnɪ…].'],
      ['«один, каждый»', 'twice a week · a hundred', 'два раза в неделю · сто', 'I go swimming three times [a|the|—] week.'],
      ['What a…!', 'What a beautiful day!', 'Какой прекрасный день!', 'What [a|the|—] nice surprise!', 'С неисчисляемыми — без a: What lovely weather!'],
    ]],
    ['the', 'nr-9', [
      ['уже знаем', 'I saw a dog. The dog was huge.', 'Я видел собаку. Собака была огромная.', 'Where’s [the|a|—] car? — In the garage.', 'И я, и собеседник понимаем, о каком предмете речь.'],
      ['единственный', 'the sun · the internet · the sea', 'солнце · интернет · море', 'Look at [the|a|—] moon!'],
      ['превосходная степень', 'the best · the first · the same', 'лучший · первый · тот же', 'It’s [the|a|—] best film I’ve seen.'],
      ['реки, моря, хребты', 'the Thames · the Pacific · the Alps', 'Темза · Тихий океан · Альпы', 'We sailed across [the|a|—] Atlantic.', 'Но отдельные горы и озёра без the: Everest, Lake Baikal.'],
      ['страны-союзы', 'the UK · the USA · the Netherlands', 'Великобритания · США · Нидерланды', 'She lives in [the|a|—] USA.', 'Обычные названия стран — без артикля: France, Japan.'],
      ['инструменты', 'play the piano · play the guitar', 'играть на пианино, на гитаре', 'He plays [the|a|—] violin.', 'Спорт без артикля: play football.'],
    ]],
    ['—', 'nr-9', [
      ['вообще, мн. число', 'Cats are clever.', 'Кошки умные.', '[—|The|A] dogs are loyal animals.', 'Говорим о всех кошках вообще, а не о конкретных.'],
      ['вообще, на развес', 'Water is essential.', 'Вода необходима.', 'I don’t drink [—|the|a] milk.', 'Но конкретная порция — с the: The milk in the fridge is old.'],
      ['имена, города, страны', 'Anna lives in Paris, France.', 'Анна живёт в Париже, во Франции.', 'We flew to [—|the|a] Italy.'],
      ['приёмы пищи', 'have breakfast · after lunch', 'завтракать · после обеда', 'Let’s have [—|the|a] dinner at seven.'],
      ['go to school, to bed', 'go to school · go to bed · at work', 'ходить в школу · ложиться спать · на работе', 'He’s at [—|the|a] work now.', 'Место по назначению — без артикля. Как здание — с the: I went to the school to see the head.'],
      ['языки и предметы', 'I study English and maths.', 'Я изучаю английский и математику.', 'She speaks [—|the|a] Spanish.', 'Но the English — «англичане».'],
    ]],
  ],
  qty: [
    ['many', 'cnt', 'много', 'How many people came?', 'Сколько человек пришло?', 'There aren’t [many|much|a little] cars here.', 'Чаще в вопросах и отрицаниях. В утверждениях обычно a lot of.'],
    ['much', 'unc', 'много', 'I don’t have much time.', 'У меня мало времени.', 'How [much|many|few] water is there?', 'Чаще в вопросах и отрицаниях: How much…? not much.'],
    ['a lot of', 'both', 'много', 'She has a lot of friends and a lot of money.', 'У неё много друзей и много денег.', 'We have [a lot of|much|many] work today.', 'Подходит и к исчисляемым, и к неисчисляемым. Lots of — то же, разговорнее.'],
    ['a few', 'cnt', 'несколько', 'I have a few questions.', 'У меня есть несколько вопросов.', 'I bought [a few|a little|much] apples.', 'Немного, но достаточно — позитивный оттенок.'],
    ['a little', 'unc', 'немного', 'Add a little salt.', 'Добавьте немного соли.', 'There’s [a little|a few|many] milk left.'],
    ['few', 'cnt', 'мало', 'Few people know this.', 'Мало кто это знает.', '[Few|Little|Much] students passed — it was hard.', 'Без a — «мало, почти нет», оттенок негативный.'],
    ['little', 'unc', 'мало', 'We have little time left.', 'У нас осталось мало времени.', 'There’s [little|few|many] hope now.', 'Без a — «мало, почти нет».'],
    ['some', 'both', 'немного, несколько', 'I bought some eggs and some milk.', 'Я купил яиц и молока.', 'Would you like [some|any|many] tea?', 'В утверждениях и в предложениях-просьбах: Would you like some…?'],
    ['any', 'both', 'какой-нибудь, нисколько', 'Do you have any questions?', 'Есть вопросы?', 'We don’t have [any|some|a] bread.', 'В вопросах и отрицаниях.'],
    ['several', 'cnt', 'несколько', 'I’ve been there several times.', 'Я был там несколько раз.', 'She called [several|much|a little] times.'],
    ['a number of', 'cnt', 'ряд, несколько', 'A number of students were late.', 'Несколько студентов опоздали.', 'A number of people [were|was|is] absent.', 'Глагол во множественном. The number of… — «число»: The number of cars is growing.'],
    ['an amount of', 'unc', 'количество', 'It takes a huge amount of time.', 'Это требует огромного количества времени.', 'A large [amount|number|many] of money.'],
    ['plenty of', 'both', 'полно, вдоволь', 'There’s plenty of time.', 'Времени полно.', 'Don’t worry, we have [plenty of|many|much of] chairs.'],
    ['no / none', 'both', 'нисколько', 'There’s no milk. — None at all?', 'Молока нет. — Совсем нет?', 'There [are no|aren’t no|are none] tickets left.', 'No — перед существительным, none — вместо него.'],
    ['fewer / less', 'both', 'меньше', 'fewer cars, less traffic', 'меньше машин, меньше пробок', 'We need [fewer|less|little] chairs.', 'Fewer — с исчисляемыми, less — с неисчисляемыми.'],
  ],
  poss: [
    ['’s', 'nr-6', 'the girl’s bag', 'сумка девочки', 'This is [my sister’s|my sisters|my sister] room.', 'Один владелец: ’s.'],
    ['s’', 'nr-6', 'the girls’ room', 'комната девочек', 'The [students’|student’s|students] books are on the desk.', 'Множественное на -s: только апостроф.'],
    ['children’s', 'nr-6', 'the children’s toys', 'игрушки детей', 'The [children’s|childrens’|childs’] room is upstairs.', 'Особое множественное без -s: + ’s (men’s, women’s, people’s).'],
    ['James’s / James’', 'nr-6', 'James’s car', 'машина Джеймса', 'This is [James’s|Jame’s|Jameses] car.', 'Имена на -s: оба варианта верны.'],
    ['Tom and Ann’s', 'nr-6', 'Tom and Ann’s flat', 'квартира Тома и Анны (общая)', '[Tom and Ann’s|Tom’s and Ann|Tom and Anns] wedding was lovely.', 'Общее — ’s в конце. Раздельное — у каждого: Tom’s and Ann’s phones.'],
    ['of', 'nr-6', 'the end of the film', 'конец фильма', 'I didn’t like [the end of the film|the film’s of end|the end the film].', 'Для вещей и абстрактного обычно of: the name of the street.'],
    ['today’s news', 'nr-6', 'today’s news · a week’s holiday', 'новости дня · недельный отпуск', 'I need [a week’s|a weeks|a week] rest.', 'Со временем — ’s: yesterday’s match, two hours’ drive.'],
    ['at the doctor’s', 'nr-6', 'at the doctor’s · to the hairdresser’s', 'у врача · в парикмахерскую', 'I’m going to [the dentist’s|the dentist’ s|the dentists] tomorrow.', 'Слово «кабинет, магазин» опускается.'],
    ['a friend of mine', 'nr-6', 'a friend of mine · of my brother’s', 'один мой друг · друг моего брата', 'She’s [a friend of mine|a friend of me|a my friend].', 'Двойной родительный: «один из моих друзей».'],
  ],
  comp: [
    ['bus stop', 'nr-7', 'составное', 'Wait at the bus stop.', 'Подожди на остановке.', 'Meet me at the [bus stop|buses stop|stop of bus].', 'Первое слово — как прилагательное, без -s: a shoe shop, a car park.'],
    ['toothbrush', 'nr-7', 'составное', 'Don’t forget your toothbrush.', 'Не забудь зубную щётку.', 'Two new [toothbrushes|teethbrushes|toothsbrush].', 'Множественное — у главного (последнего) слова.'],
    ['a ten-minute walk', 'nr-7', 'составное', 'It’s a ten-minute walk.', 'Это десять минут пешком.', 'It’s a [two-hour|two-hours|two hours] flight.', 'Число + существительное перед другим существительным — без -s.'],
    ['passer-by', 'nr-7', 'составное', 'Two passers-by helped us.', 'Нам помогли двое прохожих.', 'Several [passers-by|passer-bys|passers-bys] stopped.', 'Множественное — у главного слова: mothers-in-law.'],
    ['team', 'nr-8', 'группа', 'The team is / are winning.', 'Команда выигрывает.', 'Our team [is|be|am] the best.', 'Как единое целое — is; как отдельные люди (чаще в BrE) — are.'],
    ['family', 'nr-8', 'группа', 'My family is big. My family are all tall.', 'У меня большая семья. У меня в семье все высокие.', 'His family [are|is|be] all doctors.'],
    ['staff', 'nr-8', 'группа', 'The staff are very friendly.', 'Персонал очень приветливый.', 'All the staff [are|is|was] on holiday.', 'Один сотрудник — a member of staff.'],
    ['police', 'nr-8', 'группа', 'The police are looking for him.', 'Полиция его ищет.', 'The police [are|is|was] here.', 'Всегда множественное: The police are…', true],
    ['people', 'nr-8', 'группа', 'People are kind here.', 'Люди здесь добрые.', 'People [are|is|was] waiting.'],
    ['cattle', 'nr-8', 'группа', 'The cattle are in the field.', 'Скот в поле.', 'The cattle [are|is|was] hungry.', 'По-русски «скот» — единственное число, а cattle — всегда множественное.', true],
  ],
};

/* ---------- раскладка ---------- */
const NM_ICON = { apple: '🍎', banana: '🍌', egg: '🥚', potato: '🥔', tomato: '🍅', carrot: '🥕', orange: '🍊', chair: '🪑', phone: '📱', bag: '👜', key: '🔑', book: '📖', coin: '🪙', ticket: '🎫', job: '💼', task: '📝', lesson: '🏫', exam: '✍️', project: '📁', meeting: '🤝', idea: '💡', problem: '⚠️', mistake: '❌', question: '❓', opinion: '💬', suggestion: '🙋', fact: '📌',
  water: '💧', milk: '🥛', juice: '🧃', oil: '🫒', soup: '🍲', petrol: '⛽', rice: '🍚', sugar: '🍬', flour: '🌾', salt: '🧂', bread: '🍞', cheese: '🧀', meat: '🥩', butter: '🧈', pasta: '🍝', fruit: '🍇', wood: '🪵', plastic: '♻️', metal: '🔩', cotton: '🧵', gold: '🥇', sand: '🏖️', air: '🌬️',
  advice: '🗣️', information: 'ℹ️', knowledge: '🧠', progress: '📈', research: '🔬', evidence: '🔍', help: '🆘', fun: '🎉', luck: '🍀', patience: '⏳', permission: '✅', behaviour: '🙂', news: '📰', furniture: '🛋️', luggage: '🧳', equipment: '🏋️', homework: '📚', money: '💰', traffic: '🚦', weather: '🌦️', accommodation: '🏠', music: '🎵', software: '💻', rubbish: '🗑️',
  paper: '📄', glass: '🥃', time: '⏰', experience: '🌟', chicken: '🍗', coffee: '☕', room: '🚪', hair: '💇', light: '💡', work: '🛠️', business: '🏢' };
const NM_TAG_H = 66, NM_GAP = 16, NM_FS = 27;
const nmTagW = (s, sub = '', icon = false) => Math.max(110, Math.max(s.length, sub.length * 0.82) * NM_FS * 0.56 + 52 + (icon ? 40 : 0));
function nmLayout() {
  const items = [], zones = [], shelves = [];
  const push = item => { item.id = 'n' + items.length; items.push(item); return item; };
  // Раскладывает группы товаров (полки) внутри зоны шириной w; возвращает высоту.
  const fill = (kind, groups, x, y, w, opts = {}) => {
    let cy = y + 120;
    groups.forEach(g => {
      const title = g.title, rows = [[]]; let rowW = 0;
      g.items.forEach(it => {
        const tw = nmTagW(it.name, it.sub, !it.sub && !!NM_ICON[it.name] && (kind === 'cnt' || kind === 'unc' || kind === 'both'));
        if (rowW + tw > w - 60 && rows.at(-1).length) { rows.push([]); rowW = 0; }
        rows.at(-1).push([it, tw]); rowW += tw + NM_GAP;
      });
      if (title) { shelves.push({ kind, x: x + 30, y: cy, w: w - 60, title }); cy += 70; }
      rows.forEach(r => {
        let cx = x + 30;
        shelves.push({ kind, x: x + 24, y: cy + NM_TAG_H + 6, w: w - 48, plank: true });
        r.forEach(([it, tw]) => { push({ ...it, kind: it.kind || kind, x: cx, y: cy, w: tw, h: NM_TAG_H }); cx += tw + NM_GAP; });
        cy += NM_TAG_H + 34;
      });
      cy += opts.groupGap ?? 22;
    });
    return cy - y + 10;
  };
  const zone = (kind, title, sub, x, y, w, groups, opts) => { const h = fill(kind, groups, x, y, w, opts); zones.push({ kind, title, sub, x, y, w, h }); return h; };
  const rowsOf = (list, map) => list.map(map);
  const word = (kind, ref, zoneName) => r => ({ name: r[0], ru: r[1], ex: r[2], exRu: r[3], check: r[4], note: r[5] || '', trap: !!r[6], ref, zone: zoneName });
  const C = NM_DATA;
  // План магазина: пять колонок слева направо — вход, поштучно, упаковки и касса, на развес, множественное.
  const TOP = 330, GAP = 90;
  const widths = [940, 1020, 760, 1100, 1060];
  const X = []; widths.reduce((x, w, i) => { X[i] = x; return x + w + GAP; }, 120);
  const ys = widths.map(() => TOP);
  const put = (col, kind, title, sub, groups, opts) => { ys[col] += zone(kind, title, sub, X[col], ys[col], widths[col], groups, opts) + 80; };
  put(0, 'art', 'Вход: какой ценник?', 'a / an, the или без артикля', C.art.map(([t, ref, rows]) => ({ title: t === '—' ? 'без артикля' : t, items: rows.map(r => ({ name: r[0], art: t, ex: r[1], exRu: r[2], check: r[3], note: r[4] || '', ref: t === 'a' ? 'a-an' : t === 'the' ? 'the' : 'нулевой-артикль', zone: 'Ценник ' + (t === '—' ? 'без артикля' : t) })) })));
  put(0, 'poss', 'Витрина «Чьё?»', '’s и of', [{ items: C.poss.map(r => ({ name: r[0], ref: r[1], ex: r[2], exRu: r[3], check: r[4], note: r[5] || '', zone: 'Чьё?' })) }]);
  put(1, 'cnt', 'Поштучно', 'an apple · two apples · many', C.cnt.map(([t, ref, rows]) => ({ title: t, items: rows.map(word('cnt', ref, t)) })));
  put(1, 'both', 'Два значения', 'на развес — одно, поштучно — другое', [{ items: C.both.map(r => ({ name: r[0], ref: r[1], u: r[2], c: r[3], check: r[4], note: r[5] || '', trap: !!r[6], ru: r[2][0] + ' / ' + r[3][0], zone: 'Два значения' })) }]);
  put(2, 'pack', 'Упаковки', 'считаем неисчисляемое', [{ items: C.pack.map(r => ({ name: r[0], ru: r[1], ex: r[2], exRu: r[3], check: r[4], note: r[5] || '', ref: 'nr-2', zone: 'Упаковки' })) }]);
  put(2, 'qty', 'Касса «Сколько?»', 'many, much, few…', [{ items: C.qty.map(r => ({ name: r[0], with: r[1], ru: r[2], ex: r[3], exRu: r[4], check: r[5], note: r[6] || '', ref: 'nr-10', zone: 'Касса' })) }]);
  put(3, 'unc', 'На развес', 'some water · much time · без -s', C.unc.map(([t, ref, rows]) => ({ title: t, items: rows.map(word('unc', ref, t)) })));
  put(4, 'pl', 'Множественное число', 'два, три, много', C.pl.map(([t, ref, rows]) => ({ title: t, items: rows.map(r => ({ name: r[0], sub: r[1] === '—' ? '' : '→ ' + r[1], pl: r[1], ex: r[2], exRu: r[3], check: r[4], note: r[5] || '', ref, zone: t, plGroup: t })) })), { groupGap: 10 });
  put(4, 'comp', 'Составные и группы', 'bus stop · the team is / are', [
    { title: 'Составные', items: C.comp.filter(r => r[1] === 'nr-7').map(r => ({ name: r[0], ref: r[1], ex: r[3], exRu: r[4], check: r[5], note: r[6] || '', trap: !!r[7], zone: 'Составные' })) },
    { title: 'Группы людей', items: C.comp.filter(r => r[1] === 'nr-8').map(r => ({ name: r[0], ref: r[1], ex: r[3], exRu: r[4], check: r[5], note: r[6] || '', trap: !!r[7], zone: 'Группы людей' })) }]);
  const W = X[4] + widths[4] + 120, H = Math.max(...ys) + 160;
  const AX = 120;
  return { items, zones, shelves, W, H, cols: { AX, X, widths } };
}
const NM = nmLayout();

/* ---------- отрисовка ---------- */
function nmEsc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); }
function nmSolved(text) { return nmEsc(text).replace(/\[([^|\]]+)(?:\|[^\]]*)?\]/g, '<b>$1</b>'); }
const NM_PACK = Object.fromEntries(NM_DATA.pack.map(r => [r[0].split(' of ')[1], r[0]]));
function nmArticle(w) { return /^(hour|honest|heir)/.test(w) ? 'an' : /^(uni|use|eu|one|once)/.test(w) ? 'a' : /^[aeiou]/.test(w) ? 'an' : 'a'; }
function nmPlural(w) {
  const pl = NM_DATA.pl.flatMap(g => g[2]).find(r => r[0] === w);
  if (pl) return pl[1];
  if (/(s|sh|ch|x|z)$/.test(w) || /(potato|tomato)$/.test(w)) return w + 'es';
  if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ies';
  return w + 's';
}
// Подпись «ценника» для режима «Ценники»
function nmPrice(it) {
  if (it.kind === 'cnt') return `${nmArticle(it.name)} ${it.name} · ${nmPlural(it.name)}`;
  if (it.kind === 'unc') return `some ${it.name} · ${NM_PACK[it.name] || 'a piece of ' + it.name}`;
  if (it.kind === 'both') return `${it.name} · ${nmArticle(it.name)} ${it.name}`;
  if (it.kind === 'qty') return { cnt: 'поштучно', unc: 'на развес', both: 'оба отдела' }[it.with];
  return '';
}
function nmTag(it) {
  const top = it.kind === 'qty' ? `nm-with-${it.with}` : '';
  const sub = it.sub || '', price = nmPrice(it);
  const icon = !sub && (it.kind === 'cnt' || it.kind === 'unc' || it.kind === 'both') ? NM_ICON[it.name] : '';
  const cx = it.x + it.w / 2 + (icon ? 18 : 0);
  return `<g class="nm-st nm-k-${it.kind} ${top}${it.trap ? ' nm-trap' : ''}" data-st="${it.id}" tabindex="-1">
    <rect class="nm-tag" x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" rx="14"/>
    <rect class="nm-stripe" x="${it.x}" y="${it.y}" width="10" height="${it.h}" rx="5"/>
    <circle class="nm-hole" cx="${it.x + it.w - 16}" cy="${it.y + 16}" r="5"/>
    ${icon ? `<text class="nm-icon" x="${it.x + 36}" y="${it.y + 44}" text-anchor="middle">${icon}</text>` : ''}
    <text class="nm-name${sub ? ' has-sub' : ''}" x="${cx + 4}" y="${it.y + (sub ? 30 : 43)}" text-anchor="middle">${nmEsc(it.name)}</text>
    ${sub ? `<text class="nm-sub" x="${cx + 4}" y="${it.y + 56}" text-anchor="middle">${nmEsc(sub)}</text>` : ''}
    ${price ? `<text class="nm-price" x="${cx + 4}" y="${it.y + it.h + 30}" text-anchor="middle">${nmEsc(price)}</text>` : ''}
    ${it.trap ? `<g class="nm-flag"><circle cx="${it.x + it.w - 4}" cy="${it.y + 4}" r="17"/><text x="${it.x + it.w - 4}" y="${it.y + 13}" text-anchor="middle">!</text></g>` : ''}
  </g>`;
}
function nmZone(z) {
  return `<g class="nm-zone nm-z-${z.kind}"><rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="34"/>
    <text class="nm-zt" x="${z.x + 34}" y="${z.y + 70}">${nmEsc(z.title)}</text>
    <text class="nm-zs" x="${z.x + z.w - 34}" y="${z.y + 66}" text-anchor="end">${nmEsc(z.sub)}</text></g>`;
}
function nmShelf(s) {
  return s.plank ? `<rect class="nm-plank nm-pk-${s.kind}" x="${s.x}" y="${s.y}" width="${s.w}" height="8" rx="4"/>`
    : `<g class="nm-sign nm-pk-${s.kind}"><rect x="${s.x}" y="${s.y}" width="${s.title.length * 21 + 48}" height="52" rx="26"/><text x="${s.x + 22}" y="${s.y + 36}">${nmEsc(s.title)}</text></g>`;
}
function nounsMapSvg() {
  const { W, H, cols } = NM;
  // Вход (стрелки маршрута покупателя) и «мост» упаковок между отделами
  const cnt = NM.zones.find(z => z.kind === 'cnt'), unc = NM.zones.find(z => z.kind === 'unc'), pack = NM.zones.find(z => z.kind === 'pack');
  const bridge = `<g class="nm-bridge"><path d="M${cnt.x + cnt.w} ${cnt.y + 220} H${pack.x}"/><path d="M${pack.x + pack.w} ${unc.y + 220} H${unc.x}"/>
    <text x="${(cnt.x + cnt.w + pack.x) / 2}" y="${cnt.y + 200}" text-anchor="middle">⇄</text><text x="${(pack.x + pack.w + unc.x) / 2}" y="${unc.y + 200}" text-anchor="middle">⇄</text></g>`;
  const fascia = `<g class="nm-fascia"><rect x="${cols.AX}" y="60" width="${W - 2 * cols.AX}" height="200" rx="40"/>
    <g class="nm-fascia-logo" transform="translate(${cols.AX + 60} 100)"><path d="M0 14h22l18 78h86l16-58H34" /><circle cx="52" cy="112" r="10"/><circle cx="112" cy="112" r="10"/></g>
    <text class="nm-fa-h" x="${cols.AX + 250}" y="170">Супермаркет существительных</text>
    <text class="nm-fa-t" x="${W - cols.AX - 60}" y="140" text-anchor="end">Слева — поштучно, справа — на развес,</text>
    <text class="nm-fa-t" x="${W - cols.AX - 60}" y="184" text-anchor="end">между ними упаковки и касса. «!» — ловушка для русского.</text></g>`;
  const art = NM.zones.find(z => z.kind === 'art');
  const door = `<g class="nm-door"><text x="${art.x + 30}" y="${art.y - 22}">↓ ВХОД</text></g>`;
  return `<svg class="nm-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Карта правила: супермаркет существительных">
    ${fascia}${NM.zones.map(nmZone).join('')}${bridge}${door}${NM.shelves.map(nmShelf).join('')}${NM.items.map(nmTag).join('')}</svg>`;
}
function nounsMapHtml() {
  const modes = `<span class="nm-modes" role="group" aria-label="Режим карты"><button type="button" data-nm-mode="all" aria-pressed="true">Отделы</button><button type="button" data-nm-mode="trap" aria-pressed="false">Ловушки</button><button type="button" data-nm-mode="price" aria-pressed="false">Ценники</button><button type="button" data-nm-mode="game" aria-pressed="false">Игры</button></span>`;
  const search = `<label class="nm-search"><span class="sr-only">Найти слово на карте</span><input type="search" placeholder="Найти: advice, деньги, mice…" autocomplete="off" spellcheck="false"><span class="nc-results nm-results" hidden></span></label>`;
  const key = Object.entries({ cnt: 'поштучно', unc: 'на развес', both: 'два значения', pack: 'упаковки', pl: 'множественное', art: 'артикли', qty: 'количество', poss: 'чьё?', comp: 'составные' }).map(([k, v]) => `<li class="nm-c-${k}">${v}</li>`).join('');
  return `<section class="nm-wrap" id="nouns-market" aria-labelledby="nm-title">
    <div class="nm-head"><div><p class="eyebrow">Карта правила</p><h2 id="nm-title">Супермаркет существительных</h2><p>Каждое слово лежит на своей полке: поштучно его покупают или на развес. Нажмите на ценник, чтобы увидеть формы, примеры и проверить себя.</p></div>
      <ul class="nm-key">${key}<li class="nm-c-trap">ловушка</li></ul></div>
    ${noeonCanvasShell('nm-canvas', 'Карта правила «Супермаркет существительных». Перетаскивайте, масштабируйте колесом или щипком', search + modes, 'Тяните карту · колесо или щипок — масштаб · нажмите на ценник')}
  </section>`;
}

/* ---------- карточка ---------- */
function nmShuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function nmCheck(text) {
  const m = text && text.match(/\[([^\]]+)\]/); if (!m) return '';
  const opts = m[1].split('|');
  return `<div class="nm-check"><p class="nm-ch-h">Проверьте себя</p><p class="nm-ch-q">${nmEsc(text.replace(m[0], '___')).replace('___', '<span class="nm-gap">___</span>')}</p><div class="nm-ch-o">${nmShuffle(opts).map(o => `<button type="button"${o === opts[0] ? ' data-ok' : ''}>${nmEsc(o === '—' ? '— (без артикля)' : o)}</button>`).join('')}</div></div>`;
}
function nmForms(it) {
  if (it.kind === 'cnt') { const a = nmArticle(it.name), pl = nmPlural(it.name); return [[`${a} ${it.name}`, 'один'], [`two ${pl}`, 'несколько'], [`many ${pl} · a few ${pl}`, 'много · несколько'], [`How many ${pl}?`, 'сколько?']]; }
  if (it.kind === 'unc') { const p = NM_PACK[it.name] || `a piece of ${it.name}`; return [[`${it.name}`, 'без a и без -s'], [`some ${it.name} · a lot of ${it.name}`, 'немного · много'], [`much ${it.name} · a little ${it.name}`, 'много · немного'], [`How much ${it.name}?`, 'сколько?'], [p, 'одна порция']]; }
  return [];
}
function nmPanelHtml(id) {
  const it = NM.items[+id.slice(1)], K = NM_KINDS[it.kind];
  const ruleLink = `<a class="nm-rule" href="#theory/nouns/${nmEsc(it.ref)}" data-nm-rule="${nmEsc(it.ref)}">Подробно в правиле →</a>`;
  const head = (extra = '') => `<header><span class="nm-badge nm-c-${it.kind}">${nmEsc(K.label)}</span><span class="nm-zone-n">${nmEsc(it.zone || K.title)}</span><h3>${nmEsc(it.name)}</h3>${extra}</header>`;
  const trap = it.trap ? `<p class="nm-trapnote"><b>Ловушка для русского.</b> ${nmEsc(it.note)}</p>` : '';
  const note = !it.trap && it.note ? `<p class="nm-note">${nmEsc(it.note)}</p>` : '';
  const ex = (e, r) => `<li><span class="nm-ex">${nmSolved(e)}</span><span class="nm-ru">${nmEsc(r)}</span></li>`;
  if (it.kind === 'both') {
    const side = (k, d, lbl) => `<div class="nm-side nm-c-${k}"><p class="nm-side-h"><b>${lbl}</b> ${nmEsc(d[0])}</p><p class="nm-ex">${nmEsc(d[1])}</p><p class="nm-ru">${nmEsc(d[2])}</p></div>`;
    return head(`<p class="nm-pat">Одно слово — два товара.</p>`) + side('unc', it.u, `${it.name}`) + side('cnt', it.c, `${nmArticle(it.name)} ${it.name} / ${nmPlural(it.name)}`) + trap + note + nmCheck(it.check) + ruleLink;
  }
  if (it.kind === 'cnt' || it.kind === 'unc') {
    const forms = nmForms(it).map(([f, l]) => `<li><b>${nmEsc(f)}</b><small>${nmEsc(l)}</small></li>`).join('');
    return head(`<p class="nm-pat">${nmEsc(it.ru)}</p>`) + `<ul class="nm-forms nm-c-${it.kind}">${forms}</ul><ul class="nm-exs">${ex(it.ex, it.exRu)}</ul>` + trap + note + nmCheck(it.check) + ruleLink;
  }
  if (it.kind === 'pl') {
    const big = it.pl === '—' ? '' : `<p class="nm-plbig"><span>${nmEsc(it.name)}</span><i>→</i><b>${nmEsc(it.pl)}</b></p>`;
    return head(`<p class="nm-pat">${nmEsc(it.plGroup)}</p>`) + big + `<ul class="nm-exs">${ex(it.ex, it.exRu)}</ul>` + note + nmCheck(it.check) + ruleLink;
  }
  if (it.kind === 'qty') {
    const w = { cnt: ['nm-c-cnt', 'с исчисляемыми: books, people'], unc: ['nm-c-unc', 'с неисчисляемыми: time, water'], both: ['nm-c-both', 'с теми и другими'] }[it.with];
    return head(`<p class="nm-pat">${nmEsc(it.ru)}</p>`) + `<p class="nm-with ${w[0]}">${nmEsc(w[1])}</p><ul class="nm-exs">${ex(it.ex, it.exRu)}</ul>` + note + nmCheck(it.check) + ruleLink;
  }
  if (it.kind === 'art') {
    const label = it.art === '—' ? 'без артикля' : it.art;
    return head(`<p class="nm-pat">Ценник: <b class="nm-artb">${nmEsc(label)}</b></p>`) + `<ul class="nm-exs">${ex(it.ex, it.exRu)}</ul>` + note + nmCheck(it.check) + ruleLink;
  }
  return head() + `<ul class="nm-exs">${ex(it.ex, it.exRu)}</ul>` + trap + note + nmCheck(it.check) + ruleLink;
}

/* ---------- запуск ---------- */
let nounsMapAbort = null;
function initialiseNounsMap(root) {
  const box = root.querySelector('#nm-canvas'); if (!box) return;
  nounsMapAbort?.abort(); nounsMapAbort = new AbortController(); const signal = nounsMapAbort.signal;
  window.addEventListener('hashchange', () => { if (!box.isConnected) nounsMapAbort?.abort(); }, { signal });
  const world = box.querySelector('.nc-world'); world.innerHTML = nounsMapSvg();
  box.querySelector('.nc-mini-art').innerHTML = `<svg viewBox="0 0 ${NM.W} ${NM.H}">${NM.zones.map(z => `<rect class="nm-mini nm-z-${z.kind}" x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="40"/>`).join('')}</svg>`;
  const panel = document.createElement('aside'); panel.className = 'nc-panel nm-panel'; panel.hidden = true; panel.setAttribute('aria-live', 'polite'); box.append(panel);
  const game = document.createElement('div'); game.className = 'nc-ui nm-game'; game.hidden = true; box.append(game);
  const svg = world.querySelector('svg');
  const mobile = () => box.clientWidth < 700;
  const panelSpace = () => panel.hidden ? {} : mobile() ? { bottom: panel.offsetHeight } : { right: panel.offsetWidth + 16 };
  const centre = it => ({ x: it.x + it.w / 2, y: it.y + it.h / 2 });
  const open = (id, fly = true) => {
    svg.querySelectorAll('.nm-st.is-on').forEach(n => n.classList.remove('is-on'));
    svg.querySelector(`[data-st="${id}"]`)?.classList.add('is-on');
    panel.innerHTML = `<button type="button" class="nm-close" aria-label="Закрыть">✕</button>${nmPanelHtml(id)}`; panel.hidden = false; panel.scrollTop = 0;
    if (fly) { const c = centre(NM.items[+id.slice(1)]); api.flyTo(c.x, c.y, Math.max(api.v.k, mobile() ? 0.7 : 0.8), panelSpace()); }
  };
  const close = () => { panel.hidden = true; svg.querySelectorAll('.nm-st.is-on').forEach(n => n.classList.remove('is-on')); };
  const api = initialiseNoeonCanvas(box, {
    W: NM.W, H: NM.H, signal, minK: 0.08, maxK: 1.6,
    onZoom: k => { box.classList.toggle('lod-low', k < 0.3); box.classList.toggle('lod-mid', k >= 0.3 && k < 0.5); },
    onTap: e => { const st = e.target?.closest?.('[data-st]'); if (st) { if (gameState.on && gameState.kind && !gameState.answered) return; open(st.dataset.st); st.classList.remove('nm-jump'); void st.getBBox(); st.classList.add('nm-jump'); } else if (!panel.hidden) close(); },
    start: ({ v, apply, fit, box: b }) => { if (b.clientWidth < 700) { v.k = 0.3; v.x = -NM.cols.AX * 0.3 + 8; v.y = -40; apply(); } else fit(); },
  });
  panel.addEventListener('click', e => {
    if (e.target.closest('.nm-close')) { close(); return; }
    const opt = e.target.closest('.nm-ch-o button');
    if (opt) { const c = opt.closest('.nm-check'); if (c.classList.contains('done')) return; const ok = opt.hasAttribute('data-ok'); c.classList.add('done', ok ? 'ok' : 'bad');
      c.querySelectorAll('button').forEach(b => { b.disabled = true; if (b.hasAttribute('data-ok')) b.classList.add('right'); }); if (!ok) opt.classList.add('wrong');
      const right = c.querySelector('[data-ok]').textContent; c.querySelector('.nm-gap').textContent = right.startsWith('—') ? '—' : right; return; }
    const rule = e.target.closest('[data-nm-rule]');
    if (rule && typeof revealNounsAnchor === 'function') { e.preventDefault(); if (api.isFull()) box.querySelector('[data-nc-full]').click(); revealNounsAnchor(document.querySelector('.theory-content'), rule.dataset.nmRule); }
  }, { signal });
  // поиск: по-английски и по-русски
  const input = box.querySelector('.nm-search input'), results = box.querySelector('.nm-results');
  const norm = s => String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/[’']/g, '\'').trim();
  input.addEventListener('input', () => {
    const q = norm(input.value); if (!q) { results.hidden = true; return; }
    const score = it => { const n = norm(it.name); return n === q ? 0 : n.startsWith(q) ? 1 : n.includes(q) ? 2 : 3; };
    const hits = NM.items.filter(it => norm(it.name).includes(q) || norm(it.ru).includes(q) || norm(it.pl).includes(q)).sort((a, b) => score(a) - score(b)).slice(0, 9);
    results.innerHTML = hits.length ? hits.map(h => `<button type="button" data-go="${h.id}"><b>${nmEsc(h.name)}</b><small>${nmEsc(NM_KINDS[h.kind].label)}${h.ru && h.ru !== '—' ? ' · ' + nmEsc(h.ru) : ''}</small></button>`).join('') : '<span class="nm-none">Нет на карте</span>';
    results.hidden = false;
  }, { signal });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') results.querySelector('[data-go]')?.click(); if (e.key === 'Escape') { input.value = ''; results.hidden = true; } }, { signal });
  results.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (!b) return; results.hidden = true; input.blur(); open(b.dataset.go); }, { signal });
  // ---------- игры ----------
  // Три игры по 10 вопросов: «Разложи по полкам», «Упакуй товар», «Касса: найди ошибку».
  // Верный ответ улетает в тележку, серия правильных ответов растёт, лучший результат запоминается.
  const gameState = { on: false, kind: null, list: [], i: 0, log: [], answered: false, streak: 0 };
  const hud = document.createElement('div'); hud.className = 'nc-ui nm-hud'; hud.hidden = true; box.append(hud);
  const best = { get: k => { try { return +localStorage.getItem('nm-best-' + k) || 0; } catch { return 0; } }, set: (k, v) => { try { localStorage.setItem('nm-best-' + k, v); } catch {} } };
  const renderHud = () => { const ok = gameState.log.filter(r => r.ok).length; hud.innerHTML = `<span class="nm-cart" aria-hidden="true">🛒</span><b>${ok}</b><span class="nm-hud-s">${gameState.streak > 1 ? `серия ×${gameState.streak}` : 'в тележке'}</span>`; };
  const shelfName = { cnt: 'Поштучно', unc: 'На развес', both: 'Два значения' };
  const shopPool = NM.items.filter(it => it.kind === 'cnt' || it.kind === 'unc' || it.kind === 'both');
  const packItems = NM.items.filter(it => it.kind === 'pack');
  const PACK_GROUP = { piece: 'a', game: 'a', bottle: 'l', glass: 'l', cup: 'l', carton: 'l', can: 'l', bowl: 'l', jar: 'l', slice: 's', loaf: 's', kilo: 's', bag: 's', pinch: 's', bar: 's', sheet: 's', grain: 's' };
  const PACK_PL = { piece: 'pieces', game: 'games', bottle: 'bottles', glass: 'glasses', cup: 'cups', carton: 'cartons', can: 'cans', bowl: 'bowls', jar: 'jars', slice: 'slices', loaf: 'loaves', kilo: 'kilos', bag: 'bags', pinch: 'pinches', bar: 'bars', sheet: 'sheets', grain: 'grains' };
  const packOf = it => { const [, cont, , ...rest] = it.name.split(' '); return { cont, noun: rest.join(' ') }; };
  const GAMES = {
    shelf: { title: 'Разложи по полкам', icon: '🧺', about: 'поштучно, на развес или два значения?', pool: () => shopPool,
      ask: it => ({ q: `Куда положить <b>${nmEsc(it.name)}</b>?`, opts: ['cnt', 'unc', 'both'].map(k => ({ v: k, t: shelfName[k], cls: 'nm-c-' + k })), right: it.kind,
        why: it.kind === 'cnt' ? `${nmArticle(it.name)} ${it.name}, ${nmPlural(it.name)}` : it.kind === 'unc' ? `some ${it.name}, ${NM_PACK[it.name] || 'a piece of ' + it.name}` : `${it.name} — ${it.u[0]}; ${nmArticle(it.name)} ${it.name} — ${it.c[0]}`, open: it.id, label: it.name }) },
    pack: { title: 'Упакуй товар', icon: '📦', about: 'бутылка, кусок или плитка?', pool: () => packItems,
      ask: it => { const { cont, noun } = packOf(it), group = PACK_GROUP[cont];
        const wrong = nmShuffle(Object.keys(PACK_GROUP).filter(c => PACK_GROUP[c] !== group)).slice(0, 2);
        return { q: `a <span class="nm-gap">___</span> of <b>${nmEsc(noun)}</b>`, opts: nmShuffle([cont, ...wrong]).map(c => ({ v: c, t: c, cls: 'nm-c-pack' })), right: cont, why: `${it.name} — ${it.ru}`, open: it.id, label: it.name }; } },
    till: { title: 'Касса: найди ошибку', icon: '🧾', about: 'кассир пробил с ошибкой — исправьте', pool: () => packItems.filter(it => !/chess/.test(it.name)),
      ask: it => { const { cont, noun } = packOf(it), pl = PACK_PL[cont];
        const right = `two ${pl} of ${noun}`, w1 = /s$/.test(noun) ? `two ${noun}` : `two ${noun}s`, w2 = `two ${cont} of ${noun}s`;
        return { q: `<span class="nm-till">2 × <s>${nmEsc(w1)}</s></span><br>Как пробить правильно?`, opts: nmShuffle([right, w1 === right ? `two ${noun}` : `${nmArticle(noun)} ${noun}s`, w2]).map(t => ({ v: t, t, cls: 'nm-c-unc' })), right,
          why: `${noun} — на развес, считаем упаковками: ${right}`, open: it.id, label: right }; } },
  };
  const menu = () => {
    gameState.kind = null; hud.hidden = true; close();
    game.innerHTML = `<p class="nm-g-h">Игры супермаркета</p><div class="nm-g-menu">${Object.entries(GAMES).map(([k, g]) => `<button type="button" data-game="${k}"><span class="nm-g-ic" aria-hidden="true">${g.icon}</span><span><b>${g.title}</b><small>${g.about}${best.get(k) ? ` · рекорд ${best.get(k)}/10` : ''}</small></span></button>`).join('')}</div><button type="button" class="nm-g-end">Выйти из игр</button>`;
  };
  const ask = () => {
    const G = GAMES[gameState.kind], it = gameState.list[gameState.i], q = G.ask(it); gameState.q = q; gameState.answered = false;
    game.innerHTML = `<div class="nm-g-top"><p class="nm-g-h">${G.icon} ${G.title}</p><div class="nm-g-bar" aria-hidden="true"><i style="width:${gameState.i * 10}%"></i></div><p class="nm-g-n">${gameState.i + 1} / ${gameState.list.length}</p></div>
      <p class="nm-g-q">${q.q}</p><div class="nm-g-o">${q.opts.map(o => `<button type="button" data-g="${nmEsc(o.v)}" class="${o.cls}">${nmEsc(o.t)}</button>`).join('')}</div>`;
    game.classList.remove('nm-shake', 'nm-pop');
  };
  const flyToCart = (from) => {
    const r = box.getBoundingClientRect(), f = from.getBoundingClientRect(), h = hud.getBoundingClientRect();
    const chip = document.createElement('span'); chip.className = 'nm-fly'; chip.textContent = from.textContent; box.append(chip);
    const x0 = f.left - r.left + f.width / 2, y0 = f.top - r.top + f.height / 2, x1 = h.left - r.left + 24, y1 = h.top - r.top + h.height / 2;
    chip.style.left = x0 + 'px'; chip.style.top = y0 + 'px';
    const anim = chip.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${(x1 - x0) / 2}px), calc(-50% + ${(y1 - y0) / 2 - 80}px)) scale(.9)`, opacity: 1, offset: .5 }, { transform: `translate(calc(-50% + ${x1 - x0}px), calc(-50% + ${y1 - y0}px)) scale(.3)`, opacity: .2 }], { duration: 650, easing: 'cubic-bezier(.3,.7,.4,1)' });
    anim.onfinish = () => { chip.remove(); hud.classList.remove('nm-bump'); void hud.offsetWidth; hud.classList.add('nm-bump'); };
  };
  const receipt = () => {
    const G = GAMES[gameState.kind], ok = gameState.log.filter(r => r.ok).length, rec = ok > best.get(gameState.kind);
    if (rec) best.set(gameState.kind, ok);
    const stars = ok === 10 ? '★★★' : ok >= 8 ? '★★☆' : ok >= 5 ? '★☆☆' : '☆☆☆';
    game.innerHTML = `<div class="nm-receipt"><p class="nm-r-h">${G.icon} ЧЕК № ${String(Math.floor(Math.random() * 9000) + 1000)}</p><p class="nm-r-sub">${nmEsc(G.title)}</p>${gameState.log.map(r => `<p class="nm-r-row ${r.ok ? 'ok' : 'bad'}"><span>${nmEsc(r.label)}</span><i></i><b>${r.ok ? '✓' : '✗'}</b></p>`).join('')}<p class="nm-r-total"><span>ИТОГО</span><i></i><b>${ok} из ${gameState.log.length}</b></p><p class="nm-r-stars">${stars}</p><p class="nm-r-thanks">${rec ? 'Новый рекорд! ' : ''}${ok === 10 ? 'Идеальная покупка!' : ok >= 7 ? 'Хорошо! Ошибки можно найти на карте.' : 'Загляните в отделы ещё раз.'}</p></div><div class="nm-g-o"><button type="button" class="nm-g-again">Ещё раз</button><button type="button" class="nm-g-menu-b">Другая игра</button></div>`;
    if (ok === 10) confetti();
  };
  const confetti = () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors = ['var(--nm-cnt)', 'var(--nm-unc)', 'var(--nm-both)', 'var(--nm-pack)', 'var(--nm-qty)'];
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('i'); p.className = 'nm-confetti'; p.style.background = colors[i % colors.length]; p.style.left = (10 + Math.random() * 80) + '%'; box.append(p);
      p.animate([{ transform: 'translateY(-20px) rotate(0)', opacity: 1 }, { transform: `translate(${(Math.random() - .5) * 160}px, ${box.clientHeight * (.6 + Math.random() * .4)}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }], { duration: 1400 + Math.random() * 900, easing: 'cubic-bezier(.2,.6,.4,1)' }).onfinish = () => p.remove();
    }
  };
  const startGame = kind => { gameState.kind = kind; gameState.list = nmShuffle(GAMES[kind].pool()).slice(0, 10); gameState.i = 0; gameState.log = []; gameState.streak = 0; close(); hud.hidden = false; renderHud(); ask(); };
  game.addEventListener('click', e => {
    if (e.target.closest('.nm-g-end')) { setMode('all'); return; }
    const pick = e.target.closest('[data-game]'); if (pick) { startGame(pick.dataset.game); return; }
    if (e.target.closest('.nm-g-again')) { startGame(gameState.kind); return; }
    if (e.target.closest('.nm-g-menu-b')) { menu(); return; }
    if (e.target.closest('.nm-g-next')) { gameState.i++; close(); if (gameState.i >= gameState.list.length) receipt(); else ask(); return; }
    const b = e.target.closest('[data-g]'); if (!b || gameState.answered) return;
    const q = gameState.q, ok = b.dataset.g === q.right; gameState.answered = true;
    gameState.streak = ok ? gameState.streak + 1 : 0;
    gameState.log.push({ label: q.label, ok });
    game.querySelectorAll('[data-g]').forEach(x => { x.disabled = true; if (x.dataset.g === q.right) x.classList.add('right'); });
    if (ok) { b.classList.add('right'); flyToCart(b); game.classList.add('nm-pop'); } else { b.classList.add('wrong'); game.classList.add('nm-shake'); try { navigator.vibrate?.(30); } catch {} }
    renderHud();
    const st = svg.querySelector(`[data-st="${q.open}"]`); st?.classList.remove('nm-jump'); void st?.getBBox?.(); st?.classList.add(ok ? 'nm-jump' : 'nm-wobble');
    game.insertAdjacentHTML('beforeend', `<p class="nm-g-r ${ok ? 'ok' : 'bad'}">${ok ? (gameState.streak > 2 ? `✓ Верно! Серия ×${gameState.streak}` : '✓ Верно') : '✗ Нет'}: ${nmEsc(q.why)}</p><button type="button" class="nm-g-next">${gameState.i + 1 < gameState.list.length ? 'Дальше →' : 'Получить чек'}</button>`);
    open(q.open);
  }, { signal });
  const setMode = m => {
    box.querySelectorAll('[data-nm-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.nmMode === m)));
    box.classList.toggle('nm-mode-trap', m === 'trap'); box.classList.toggle('nm-mode-price', m === 'price');
    gameState.on = m === 'game'; game.hidden = !gameState.on; box.classList.toggle('nm-mode-game', gameState.on);
    if (gameState.on) menu(); else { gameState.answered = false; hud.hidden = true; }
    if (m === 'trap') api.fit();
  };
  box.addEventListener('click', e => { const m = e.target.closest('[data-nm-mode]'); if (m) setMode(m.dataset.nmMode); }, { signal });
  box.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { e.stopPropagation(); close(); } }, { signal, capture: true });
  return api;
}
