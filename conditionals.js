"use strict";
/* Правило Conditionals: интерактивная страница поверх токенов .mv / .sv / .ig. Источник текста — docs/conditionals/RULE.md.
   Без ответов банка и данных проверки. */
const CD_ROW = (tag, cls, id, title, sub, exs, note = '') => `<details class="sv-row ${cls}" id="${id}"><summary><span class="sv-v ${cls}">${tag}</span><span class="sv-rt">${title}<small>${sub}</small></span></summary><div class="sv-rb"><ul class="sv-exs">${exs.map(e => e.startsWith('✗') ? `<li class="sv-no"><s>${e.slice(2)}</s></li>` : `<li>${e}</li>`).join('')}</ul>${note ? `<p class="sv-rn">${note}</p>` : ''}</div></details>`;
const CD_SEC = (id, n, title, lead, body) => `<section class="mv-sec" id="${id}"><h2><span class="mv-num">${n}</span>${title}</h2>${lead ? `<p class="mv-lead">${lead}</p>` : ''}${body}</section>`;
const CD_FORMULA = (parts, note = '') => `<div class="cd-formula">${parts.map(([t, c]) => `<span class="cd-fp ${c || ''}">${t}</span>`).join('<i>→</i>')}</div>${note ? `<p class="cd-fnote">${note}</p>` : ''}`;
const CD_EX = (en, ru) => `<div class="cd-ex"><p>${en}</p><small>${ru}</small></div>`;
/* Переключатель вариантов одной конструкции (как пары to do / doing). */
const CD_SWITCH = (id, name, sides) => `<div class="ig-pair cd-sw" id="${id}"><div class="ig-ph"><b>${name}</b><div class="ig-pbs" role="group" aria-label="${name}">${sides.map((s, i) => `<button type="button" class="ig-pb cd-pb ${s.cls}${i ? '' : ' on'}" data-k="${i}" aria-pressed="${!i}">${s.btn}</button>`).join('')}</div></div>${sides.map((s, i) => `<div class="ig-pp cd-pp ${s.cls}" data-k="${i}"${i ? ' hidden' : ''}><p class="ig-sense">${s.sense}</p><p class="ig-sample">${s.en}</p><p class="ig-ru">${s.ru}</p>${s.form ? `<p class="ig-order">${s.form}</p>` : ''}</div>`).join('')}</div>`;

const CD_BUILDER = {
  // реальность · время условия · время результата
  'r-always-same': ['Zero conditional', 'if / when + Present → Present', 'If you heat ice, it melts.', 'Если нагреть лёд, он тает.', 'Факты, правила, привычки: так бывает всегда.', 'cd-zero'],
  'r-future-same': ['First conditional', 'if + Present → will / can / might / повелительное', 'If the shop is open, I’ll buy some bread.', 'Если магазин открыт, я куплю хлеба.', 'Реальное будущее. После if — настоящее время, без will.', 'cd-first'],
  'r-now-same': ['Реальное сейчас', 'if + Present → повелительное / should / can', 'If you’re tired, have a rest.', 'Если устал — отдохни.', 'Условие — правда прямо сейчас.', 'cd-first'],
  'r-past-same': ['Реальное прошлое', 'if + Past → Past', 'If it rained, we played cards at home.', 'Когда шёл дождь, мы играли дома в карты.', 'Прошедшее после if — не «бы»: так и было.', 'cd-zero'],
  'u-always-same': ['Second conditional', 'if + Past Simple → would + V', 'If people were kinder, the world would be a better place.', 'Если бы люди были добрее, мир был бы лучше.', 'Нереальное «всегда» — тоже второй тип.', 'cd-second'],
  'u-now-same': ['Second conditional', 'if + Past Simple → would + V', 'If I had more time, I would learn Spanish.', 'Если бы у меня было больше времени, я бы выучил испанский.', 'Шаг назад: have → had, will → would.', 'cd-second'],
  'u-future-same': ['Second conditional · were to', 'if + Past / were to → would + V', 'If I won the lottery, I’d travel round the world.', 'Если бы я выиграл в лотерею, я бы объехал весь мир.', 'Будущее, в которое говорящий почти не верит.', 'cd-second'],
  'u-past-same': ['Third conditional', 'if + had done → would have done', 'If we had left earlier, we wouldn’t have missed the bus.', 'Если бы мы вышли раньше, не опоздали бы на автобус.', 'Прошлое не изменить: сожаление, упрёк.', 'cd-third'],
  'u-past-now': ['Mixed: тогда → сейчас', 'if + had done → would + V (now)', 'If I hadn’t missed the flight, I would be in Rome now.', 'Если бы я не опоздал на рейс, я бы сейчас был в Риме.', 'Условие в прошлом, результат сейчас.', 'cd-mixed'],
  'u-now-past': ['Mixed: всегда → тогда', 'if + Past Simple → would have done', 'If I spoke French, I would have understood the guide yesterday.', 'Если бы я знал французский, я бы вчера понял гида.', 'Постоянное условие, результат в прошлом.', 'cd-mixed'],
  'u-always-past': ['Mixed: всегда → тогда', 'if + Past Simple → would have done', 'If she weren’t so shy, she would have spoken at the meeting.', 'Не будь она такой стеснительной, она бы выступила на собрании.', 'Черта характера — поэтому тогда.', 'cd-mixed'],
};
function cdBuilderOut(key) {
  const [real, cond, res] = key.split('-');
  let k = key;
  if (!CD_BUILDER[k]) k = real + '-' + cond + '-same';
  const d = CD_BUILDER[k];
  const extra = real === 'r' && res !== 'same' ? '<p class="cd-b-tip">В реальном мире время каждой части выбирается просто по смыслу: <i>If he left at six, he’ll be there by now.</i></p>'
    : !CD_BUILDER[key] && real === 'u' ? '<p class="cd-b-tip">Такой смешанный вариант встречается редко. Чаще всего это обычный второй или третий тип.</p>' : '';
  return `<p class="cd-b-type">${d[0]}</p><p class="cd-b-f">${d[1]}</p><p class="cd-b-en">${d[2]}</p><p class="cd-b-ru">${d[3]}</p><p class="cd-b-n">${d[4]}</p>${extra}<a href="#${d[5]}">Подробно ↓</a>`;
}
const CD_REFLECT = [
  ['I [don’t have] a car, so I [can’t] drive you.', 'If I [had] a car, I [could] drive you.', 'сейчас'],
  ['I [am not] rich, so I [won’t] buy that house.', 'If I [were] rich, I [would] buy that house.', 'сейчас'],
  ['If I [get] the job, I[’ll] buy a car.', 'If I [got] the job, I[’d] buy a car.', 'будущее'],
  ['I [missed] the bus, so I [was] late.', 'If I [hadn’t missed] the bus, I [wouldn’t have been] late.', 'прошлое'],
  ['She [didn’t know], so she [didn’t come].', 'If she [had known], she [would have come].', 'прошлое'],
];
const CD_TRAPS = [
  ['If it will rain, we’ll stay at home.', 'If it <b>rains</b>, we’ll stay at home.', 'Будущее после if — настоящим временем.'],
  ['If I would have money, I would buy it.', 'If I <b>had</b> money, I would buy it.', 'would — только в главной части.'],
  ['If I’d have known, I’d have come.', 'If I <b>had known</b>, I’d have come.', 'В условии третьего типа — had + V3.'],
  ['If I knew it yesterday, I would help.', 'If I <b>had known</b> it yesterday, I <b>would have helped</b>.', '«Если бы» о прошлом — Past Perfect.'],
  ['I wish I can swim.', 'I wish I <b>could</b> swim.', 'После wish — шаг назад.'],
  ['I wish I would be taller.', 'I wish I <b>were</b> taller.', 'wish + would — не о себе и не о состояниях.'],
  ['I wish you will pass the exam.', 'I <b>hope</b> you pass the exam.', 'Реальное будущее — hope.'],
  ['Unless you don’t hurry, you’ll be late.', '<b>Unless</b> you hurry, you’ll be late.', 'unless уже значит «если не».'],
  ['Take a coat if it gets cold. (заранее)', 'Take a coat <b>in case</b> it gets cold.', 'На всякий случай, заранее — in case.'],
  ['I’d rather you don’t smoke here.', 'I’d rather you <b>didn’t</b> smoke here.', 'would rather + другой человек + Past.'],
  ['It’s time we go home.', 'It’s time we <b>went</b> home.', 'it’s time + подлежащее + Past.'],
  ['Hadn’t I seen it, I would have fallen.', '<b>Had I not</b> seen it, I would have fallen.', 'В инверсии не сокращаем.'],
  ['Even if it was cold, we went out.', '<b>Even though</b> it was cold, we went out.', 'Факт — even though, условие — even if.'],
];
const CD_QUIZ = [
  ['If it ___ tomorrow, we’ll cancel the picnic.', ['rains', 'will rain', 'would rain'], 'Первый тип: будущее после if — настоящим.', 'cd-first'],
  ['If I ___ you, I’d say sorry.', ['were', 'am', 'would be'], 'If I were you — устойчивое выражение.', 'cd-second'],
  ['If she had left earlier, she ___ the train.', ['would have caught', 'would catch', 'will catch'], 'Третий тип: would have + V3.', 'cd-third'],
  ['If I hadn’t stayed up so late, I ___ so tired now.', ['wouldn’t be', 'wouldn’t have been', 'won’t be'], 'Смешанный: тогда → сейчас (now).', 'cd-mixed'],
  ['Take a torch ___ the lights go out.', ['in case', 'unless', 'if only'], 'На всякий случай — in case.', 'cd-conj'],
  ['I wish I ___ more free time.', ['had', 'have', 'would have'], 'wish о настоящем — Past Simple.', 'cd-wish'],
  ['I wish I ___ to her like that yesterday.', ['hadn’t spoken', 'didn’t speak', 'wouldn’t speak'], 'wish о прошлом — Past Perfect.', 'cd-wish'],
  ['It’s high time you ___ a new phone.', ['bought', 'buy', 'will buy'], 'it’s high time + Past.', 'cd-unreal'],
  ['___ you need any help, please call reception.', ['Should', 'Would', 'Had'], 'Инверсия первого типа — Should you…', 'cd-inversion'],
  ['___ your help, I would have failed.', ['Without', 'Unless', 'Except'], 'Условие без if: without + существительное.', 'cd-implied'],
];

function cdSections() {
  const core = CD_SEC('cd-core', 0, 'Два мира', 'Условие + результат. Главный вопрос: это правда (или может случиться) или нет?', `
    <div class="cd-worlds"><div class="cd-world cd-r"><p class="cd-wt">Реальный мир</p><p>Это правда или может случиться. Время глагола — обычное.</p>${CD_EX('If I <b>have</b> time, I<b>’ll</b> call you.', 'Если будет время, позвоню.')}</div>
    <div class="cd-world cd-u"><p class="cd-wt">Мир «если бы»</p><p>Этого нет, не было или вряд ли будет. Время делает <b>шаг назад</b>.</p>${CD_EX('If I <b>had</b> time, I<b>’d</b> call you.', 'Если бы было время, позвонил бы (но его нет).')}</div></div>
    <p class="cd-key">В мире «если бы» прошедшая форма не значит «прошлое», она значит «нереально». <i>If I had a car</i> — это про сейчас: машины нет.</p>
    <div class="cd-steps" aria-label="Шаг назад во времени"><span><b>is, am, are</b> → were</span><span><b>have, do</b> → had, did</span><span><b>can, will</b> → could, would</span><span><b>did</b> → had done</span><span><b>would do</b> → would have done</span></div>
    <h3 class="cd-h3">Отразите фразу</h3><p class="cd-sub">Нажмите «Отразить»: реальность превращается в «если бы».</p>
    <ol class="cd-reflect">${CD_REFLECT.map(([r, u, t]) => `<li><span class="cd-rt">${t}</span><p class="cd-rr">${r.replace(/\[([^\]]+)\]/g, '<mark>$1</mark>')}</p><p class="cd-ru" hidden>${u.replace(/\[([^\]]+)\]/g, '<mark>$1</mark>')}</p><button type="button" class="cd-rb" aria-pressed="false">⇅ Отразить</button></li>`).join('')}</ol>
    <div class="cd-ru-tip"><b>Русское «если бы» — это два английских случая.</b> Смотрите на время: «если бы я знал (сейчас)» → <i>If I knew</i>; «если бы я знал (тогда)» → <i>If I had known</i>.</div>
    <h3 class="cd-h3" id="cd-builder">Конструктор условия</h3><p class="cd-sub">Выберите три ответа — получите формулу и пример.</p>
    <div class="cd-builder" data-key="r-future-same">
      <div class="cd-axis" data-axis="real"><span>Это правда?</span><button type="button" class="cd-ax on" data-val="r" aria-pressed="true">да / может быть</button><button type="button" class="cd-ax" data-val="u" aria-pressed="false">нет, «если бы»</button></div>
      <div class="cd-axis" data-axis="cond"><span>Когда условие?</span><button type="button" class="cd-ax" data-val="always" aria-pressed="false">всегда</button><button type="button" class="cd-ax" data-val="past" aria-pressed="false">прошлое</button><button type="button" class="cd-ax" data-val="now" aria-pressed="false">сейчас</button><button type="button" class="cd-ax on" data-val="future" aria-pressed="true">будущее</button></div>
      <div class="cd-axis" data-axis="res"><span>А результат?</span><button type="button" class="cd-ax on" data-val="same" aria-pressed="true">в то же время</button><button type="button" class="cd-ax" data-val="now" aria-pressed="false">сейчас</button><button type="button" class="cd-ax" data-val="past" aria-pressed="false">в прошлом</button></div>
      <div class="cd-bout" aria-live="polite">${cdBuilderOut('r-future-same')}</div>
    </div>
    <h3 class="cd-h3">Все типы на одном экране</h3>
    <div class="cd-tiles">${[
      ['Zero', 'cd-r', 'всегда', 'if + Present → Present', 'cd-zero'], ['First', 'cd-r', 'реальное будущее', 'if + Present → will', 'cd-first'],
      ['Second', 'cd-u', '«если бы» сейчас', 'if + Past → would', 'cd-second'], ['Third', 'cd-u', '«если бы» тогда', 'if + had done → would have done', 'cd-third'],
      ['Mixed', 'cd-m', 'тогда → сейчас', 'if + had done → would do', 'cd-mixed'], ['Mixed', 'cd-m', 'всегда → тогда', 'if + Past → would have done', 'cd-mixed'],
    ].map(([n, c, w, f, a]) => `<a class="cd-tile ${c}" href="#${a}"><b>${n}</b><small>${w}</small><span>${f}</span></a>`).join('')}</div>`);

  const zero = CD_SEC('cd-zero', 1, 'Zero: так бывает всегда', 'Факты, законы, правила, привычки.', `
    ${CD_FORMULA([['if / when + Present', 'cd-r'], ['Present', 'cd-r']], 'if и when здесь почти одно и то же: «каждый раз, когда».')}
    <div class="sv-rows">
      ${CD_ROW('всегда', 'cd-r', 'cd-zero-facts', 'Законы и факты', 'If you heat ice, it melts.', ['If you heat ice, it melts.', 'Plants die if they don’t get water.', 'When the sun goes down, it gets cold.'])}
      ${CD_ROW('всегда', 'cd-r', 'cd-zero-rules', 'Инструкции и правила', 'результат — повелительное', ['If the alarm rings, leave the building.', 'If the light flashes, press the red button.', 'You can’t go in unless you have a ticket.'])}
      ${CD_ROW('всегда', 'cd-r', 'cd-zero-habits', 'Мои привычки', 'If I drink coffee late, I can’t sleep.', ['If I drink coffee after six, I can’t sleep.', 'Whenever it snows, the trains are late.'])}
      ${CD_ROW('прошлое', 'cd-r', 'cd-zero-past', 'Привычки в прошлом', 'реальное прошлое, без «бы»', ['If it rained, we played cards at home.', 'When we were kids, if we were bored, we built huts in the garden.'], 'Это то, что было на самом деле. Не путать с нереальным вторым типом.')}
      ${CD_ROW('сравни', 'cd-r', 'cd-zero-first', 'Zero или First?', 'всегда или один случай', ['If you don’t water plants, they die. — всегда', 'If you don’t water this plant, it will die. — этот цветок, впереди'])}
    </div>`);

  const first = CD_SEC('cd-first', 2, 'First: реальное будущее', 'Может случиться — и тогда будет результат.', `
    ${CD_FORMULA([['if + Present', 'cd-r'], ['will + V', 'cd-r']], '<b>Главная ловушка:</b> «если пойдёт дождь» — по-английски <i>If it rains</i>, а не <s>If it will rain</s>.')}
    ${CD_EX('If the train is late, I’ll take a taxi.', 'Если поезд опоздает, я возьму такси.')}
    <div class="sv-rows">
      ${CD_ROW('условие', 'cd-r', 'cd-first-if', 'Что бывает в условии', 'Present Simple · Continuous · Perfect', ['If you see Anna, say hi.', 'If you’re going to the shop, can you get some milk?', 'If you’ve finished your test, you can leave.'])}
      ${CD_ROW('результат', 'cd-r', 'cd-first-res', 'Что бывает в результате', 'will · going to · can · might · should · повелительное', ['If you help me, I’ll help you.', 'If he keeps eating like that, he’s going to be ill.', 'If you finish early, you can go home.', 'If we’re lucky, we might see a dolphin.', 'If you feel sick, you should lie down.', 'If you see Tom, tell him to call me.'])}
      ${CD_ROW('if / when', 'cd-r', 'cd-first-when', 'If или when?', 'может быть / точно будет', ['If I see Max, I’ll tell him. — может, и не увижу', 'When I see Max, I’ll tell him. — точно увидимся'])}
      ${CD_ROW('время', 'cd-r', 'cd-first-time', 'when, as soon as, until, before', 'тоже без will', ['I’ll call you as soon as I get home.', 'Wait here until I come back.', '✗ I’ll call you when I will get home.'], 'Соседнее правило: после союзов времени будущее — тоже настоящим временем.')}
      ${CD_ROW('вдруг', 'cd-r', 'cd-first-should', 'If you should… · if you happen to…', 'вдруг, случайно', ['If you should need anything, just ask.', 'If you happen to see my keys, let me know.'], 'Менее вероятно и вежливее, чем просто if.')}
      ${CD_ROW('will в if', 'cd-r', 'cd-first-will', 'Когда will после if возможен', 'согласие, вежливость, следствие', ['If you’ll take a seat, the doctor will see you soon. — если вы согласны', 'If you would sign here, please. — очень вежливо', 'I’d be grateful if you would reply by Friday.', 'If it will help, I’ll stay late. — если от этого будет толк', '✗ If it will rain tomorrow, …'], 'Это особые значения. В обычном условии will после if — ошибка.')}
    </div>`);

  const conj = CD_SEC('cd-conj', 3, 'Союзы вместо if', 'Во всех — настоящее время, когда речь о будущем.', `
    <div class="sv-rows">
      ${CD_ROW('unless', 'cd-g', 'cd-unless', 'unless = если не', 'кроме случая, когда', ['We’ll go to the beach unless it rains.', 'Unless you hurry, you’ll miss the bus.', 'You can’t go out unless you clean your room.', '✗ Unless it doesn’t rain, …'], 'После unless — утверждение. Unless не заменяет if…not, когда «не» — причина: <i>I’ll be sad if you don’t come</i> (не <s>unless you come</s>).')}
      ${CD_ROW('as long as', 'cd-g', 'cd-as-long-as', 'as long as · so long as', 'при условии, что; только если', ['You can borrow my bike as long as you bring it back by Friday.', 'So long as we leave by eight, we’ll be fine.'], 'as long as — разговорное, so long as — чуть формальнее.')}
      ${CD_ROW('provided', 'cd-g', 'cd-provided', 'provided (that) · providing (that)', 'при условии (формальнее)', ['We’ll take the job provided they pay for the flights.', 'Providing the weather is good, the race will start at ten.'])}
      ${CD_ROW('condition', 'cd-g', 'cd-condition', 'on condition (that)', 'строго при условии', ['They let him stay on condition that he paid the rent on time.'], 'Договоры, правила, строгие условия.')}
      ${CD_ROW('only if', 'cd-g', 'cd-only-if', 'only if', 'только если', ['I’ll come only if you invite Ben too.', 'Only if you finish your homework can you watch TV.'], 'Only if в начале предложения → инверсия во второй части.')}
      ${CD_ROW('even if', 'cd-g', 'cd-even-if', 'even if', 'даже если', ['I’ll go for a run even if it rains.', '✗ Even if it was raining, we went out. → Even though it was raining, …'], '<b>even though</b> = хотя: это факт, а не условие.')}
      ${CD_ROW('in case', 'cd-g', 'cd-in-case', 'in case', 'на всякий случай, заранее', ['Take an umbrella in case it rains.', 'I’ll buy some snacks in case Tom comes. — куплю в любом случае', 'I’ll buy some snacks if Tom comes. — куплю, только если придёт', 'I took a map in case we got lost.', 'In case of fire, use the stairs.'], 'in case ≠ if. О прошлом — in case + Past. <b>in case of</b> + существительное — на табличках и в правилах.')}
      ${CD_ROW('whether', 'cd-g', 'cd-whether', 'whether … or not', 'всё равно, … или нет', ['Whether you like it or not, the test is on Monday.'])}
      ${CD_ROW('what if', 'cd-g', 'cd-suppose', 'suppose · supposing · what if · imagine', 'предположим; а что, если', ['What if the shop is closed? — реально', 'Suppose it rains — what will we do?', 'Imagine you won a million — what would you buy? — нереально', 'What if he had said no? — нереальное прошлое'])}
      ${CD_ROW('assuming', 'cd-g', 'cd-assuming', 'assuming (that)', 'если исходить из того, что', ['Assuming the weather is good, we’ll eat outside.'])}
    </div>`);

  const second = CD_SEC('cd-second', 4, 'Second: «если бы» сейчас и в будущем', 'Нереальное настоящее и маловероятное будущее.', `
    ${CD_FORMULA([['if + Past Simple', 'cd-u'], ['would + V', 'cd-u']])}
    ${CD_EX('If I lived by the sea, I’d swim every day.', 'Если бы я жил у моря, я бы плавал каждый день. (не живу)')}
    <div class="sv-rows">
      ${CD_ROW('сейчас', 'cd-u', 'cd-second-now', 'Нереальное настоящее', 'на самом деле не так', ['If I knew his number, I’d call him.', 'If I had a car, I could drive you home.'])}
      ${CD_ROW('будущее', 'cd-u', 'cd-second-future', 'Маловероятное будущее', 'мечтаю, но не верю', ['If I won the lottery, I’d travel round the world.', 'If I get the job, I’ll buy a car. — реально (first)', 'If I got the job, I’d buy a car. — просто мечтаю (second)'], 'First или second решает не грамматика, а то, насколько говорящий верит в условие.')}
      ${CD_ROW('were', 'cd-u', 'cd-were', 'were или was', 'If I were you', ['If it were warmer, we could eat outside.', 'If he was here, he’d help. — разговорное', 'If I were you, I’d talk to her. — только were'], 'were — норма в письме и на экзамене, was — в разговоре. В заданиях сайта засчитываются оба, кроме If I were you.')}
      ${CD_ROW('совет', 'cd-u', 'cd-if-i-were-you', 'If I were you, I’d…', 'на твоём месте', ['If I were you, I wouldn’t buy that phone.', '“Shall I tell her?” — “I wouldn’t.”'])}
      ${CD_ROW('условие', 'cd-u', 'cd-second-if', 'Что ещё бывает в условии', 'Past Continuous · could', ['If it wasn’t raining, we’d go for a walk.', 'If I could drive, I’d get a job as a courier.'])}
      ${CD_ROW('результат', 'cd-u', 'cd-second-res', 'Что бывает в результате', 'would · could · might · would be doing', ['If you asked him nicely, he might help.', 'We could go to the cinema if you weren’t so tired.', 'If I were at home now, I’d be watching the match.'])}
      ${CD_ROW('were to', 'cd-u', 'cd-were-to', 'If … were to', 'подчёркнуто гипотетически, мягко', ['If the price were to rise again, many people would stop buying it.', 'If you were to move the sofa, we’d have more space.'], 'Формально; звучит осторожнее обычного второго типа.')}
      ${CD_ROW('вежливо', 'cd-u', 'cd-polite', 'Would it be OK if I…?', 'прошедшая форма смягчает', ['Would it be OK if I left a bit early today?', 'I’d be grateful if you could send me the file.'])}
    </div>`);

  const third = CD_SEC('cd-third', 5, 'Third: «если бы» в прошлом', 'Прошлое уже не изменить: сожаление, упрёк, «а вот если бы…».', `
    ${CD_FORMULA([['if + had done', 'cd-u'], ['would have done', 'cd-u']])}
    ${CD_EX('If I had set an alarm, I wouldn’t have overslept.', 'Если бы я поставил будильник, я бы не проспал.')}
    <div class="sv-rows">
      ${CD_ROW('модальные', 'cd-u', 'cd-third-modal', 'could have · might have', 'смог бы · может быть', ['If you had told me, I could have helped.', 'If we had taken the other road, we might have got there sooner.'])}
      ${CD_ROW('процесс', 'cd-u', 'cd-third-cont', 'Длительные формы', 'had been doing · would have been doing', ['If he hadn’t been driving so fast, he wouldn’t have crashed.', 'If the meeting hadn’t been cancelled, I would have been sitting there all afternoon.'])}
      ${CD_ROW('’d', 'cd-u', 'cd-third-d', '’d = had или would?', 'смотрите на следующее слово', ['If I’d known (= had known), I’d have come (= would have come).', '✗ If I’d have known, …'], 'После ’d идёт V3 — это had. Идёт have или глагол — это would.')}
      ${CD_ROW('без if', 'cd-u', 'cd-third-but', 'I would have…, but', 'результат без условия', ['I would have called you, but my phone was dead.', 'I set two alarms; otherwise I would have overslept.'])}
    </div>`);

  const mixed = CD_SEC('cd-mixed', 6, 'Mixed: смешанные', 'Прошлое и настоящее в одном предложении. Смотрите, к какому времени относится каждая часть.', `
    <div class="cd-mix"><div class="cd-mixc"><p class="cd-wt">тогда → сейчас</p>${CD_FORMULA([['if + had done', 'cd-u'], ['would + V (now)', 'cd-m']])}${CD_EX('If I hadn’t missed that flight, I would be in Rome now.', 'Если бы я не опоздал на рейс, я бы сейчас был в Риме.')}${CD_EX('If she had saved some money, she wouldn’t need a loan now.', 'Если бы она копила, ей бы сейчас не нужен был кредит.')}<p class="cd-fnote">Маркеры результата: now, today, still, these days.</p></div>
    <div class="cd-mixc"><p class="cd-wt">всегда → тогда</p>${CD_FORMULA([['if + Past Simple', 'cd-m'], ['would have done', 'cd-u']])}${CD_EX('If I spoke French, I would have understood the guide yesterday.', 'Если бы я знал французский, я бы вчера понял гида.')}${CD_EX('If he weren’t so lazy, he would have finished the project last week.', 'Не будь он таким ленивым, он бы закончил проект на прошлой неделе.')}<p class="cd-fnote">Условие — черта характера или постоянное положение дел.</p></div></div>`);

  const implied = CD_SEC('cd-implied', 7, 'Условие без if', 'Тот же смысл — другими словами.', `
    <div class="sv-rows">
      ${CD_ROW('without', 'cd-g', 'cd-without', 'without · with + существительное', 'без · будь у тебя', ['Without your help, I would have failed.', 'With a bit more practice, you could win the next race.'])}
      ${CD_ROW('but for', 'cd-g', 'cd-but-for', 'but for · if it weren’t / hadn’t been for', 'если бы не', ['But for the rain, the match would have been perfect. — официально', 'If it weren’t for my sister, I’d be completely lost here. — сейчас', 'If it hadn’t been for the map, we would have got lost. — тогда', 'If not for you, I’d have given up. — разговорное'])}
      ${CD_ROW('otherwise', 'cd-g', 'cd-otherwise', 'otherwise · or (else)', 'иначе, а то', ['Write it down, otherwise you’ll forget.', 'Hurry up, or (else) we’ll be late.', 'I set two alarms; otherwise I would have overslept.'])}
      ${CD_ROW('and / or', 'cd-g', 'cd-imperative', 'Повелительное + and / or', 'сделай — и… · не делай — а то…', ['Turn left at the bank and you’ll see the café.', 'Don’t touch the plate, or you’ll burn your fingers.'])}
      ${CD_ROW('if so', 'cd-g', 'cd-if-so', 'if so · if not · if necessary · if possible', 'краткие формы', ['Is the museum open on Mondays? If so, let’s go then. If not, we’ll go on Tuesday.', 'I’ll stay late if necessary.'])}
      ${CD_ROW('в таком случае', 'cd-g', 'cd-in-that-case', 'in that case', 'тогда, в таком случае', ['“It’s raining.” — “In that case, let’s take the car.”'], 'Не путать с in case — на всякий случай.')}
    </div>`);

  const inversion = CD_SEC('cd-inversion', 8, 'Инверсия: официально, без if', 'Письма, объявления, договоры, эссе. Вспомогательный глагол встаёт перед подлежащим.', `
    <div class="cd-inv">${[
      ['First', 'If you have any questions, …', 'Should you have any questions, please contact us.'],
      ['Second · be', 'If I were in your position, …', 'Were I in your position, I would refuse.'],
      ['Second · глагол', 'If the company moved abroad, …', 'Were the company to move abroad, many people would lose their jobs.'],
      ['Third', 'If we had known earlier, …', 'Had we known earlier, we would have changed our plans.'],
      ['если бы не', 'If it weren’t / hadn’t been for…', 'Were it not for… · Had it not been for…'],
    ].map(([t, a, b]) => `<div class="cd-invr"><span class="cd-invt">${t}</span><p class="cd-inva">${a}</p><p class="cd-invb">${b}</p></div>`).join('')}</div>
    <ul class="cd-rules"><li>Только три глагола: <b>should, were, had</b>.</li><li>После should — глагол без -s: <i>Should the parcel arrive</i>.</li><li>Отрицание без сокращения: <b>Had I not</b> seen the sign… · <s>Hadn’t I seen…</s></li></ul>`);

  const wish = CD_SEC('cd-wish', 9, 'Wish и If only', 'Та же логика «если бы»: время делает шаг назад. If only — то же самое, но эмоциональнее.', `
    <p class="cd-key"><b>Знак переворачивается:</b> «жаль, что я <u>не</u> знаю» → <i>I wish I <b>knew</b></i>; «жаль, что я сказал» → <i>I wish I <b>hadn’t</b> said it</i>.</p>
    <div class="ig-pairs">
      ${CD_SWITCH('cd-wish-main', 'I wish…', [
        { btn: 'сейчас', cls: 'cd-u', sense: 'хочу, чтобы сейчас было иначе', en: 'I wish I had a bigger flat.', ru: 'Жаль, что у меня маленькая квартира.', form: 'wish + Past Simple / Continuous · were' },
        { btn: 'тогда', cls: 'cd-u', sense: 'жалею о прошлом', en: 'I wish I hadn’t eaten that second pizza.', ru: 'Жаль, что я съел вторую пиццу.', form: 'wish + Past Perfect' },
        { btn: 'перемены', cls: 'cd-m', sense: 'хочу, чтобы кто-то изменил поведение', en: 'I wish my neighbours would turn the music down.', ru: 'Вот бы соседи сделали музыку потише.', form: 'wish + sb + would + V' },
      ])}
      ${CD_SWITCH('cd-wish-could', 'I wish I could…', [
        { btn: 'сейчас', cls: 'cd-u', sense: 'не умею, не могу сейчас', en: 'I wish I could swim.', ru: 'Жаль, что я не умею плавать.', form: 'wish + could + V' },
        { btn: 'тогда', cls: 'cd-u', sense: 'не смог тогда', en: 'I wish I could have been there.', ru: 'Жаль, что я не смог там быть.', form: 'wish + could have + V3' },
      ])}
      ${CD_SWITCH('cd-if-only', 'If only…', [
        { btn: 'сейчас', cls: 'cd-u', sense: 'ах, если бы сейчас', en: 'If only I had more time!', ru: 'Ах, если бы у меня было больше времени!' },
        { btn: 'тогда', cls: 'cd-u', sense: 'ах, если бы тогда', en: 'If only we had booked a table!', ru: 'Ах, если бы мы заказали столик!' },
        { btn: 'перемены', cls: 'cd-m', sense: 'ну хоть бы…', en: 'If only the bus would come!', ru: 'Ну хоть бы автобус пришёл!' },
      ])}
    </div>
    <div class="sv-rows">
      ${CD_ROW('would', 'cd-u', 'cd-wish-would', 'wish + would: осторожно', 'не о себе и не о состояниях', ['I wish you would stop interrupting me.', 'I wish it would stop raining.', '✗ I wish I would be taller. → I wish I were taller.', '✗ I wish my flat would be bigger. → I wish my flat were bigger.'])}
      ${CD_ROW('hope', 'cd-u', 'cd-wish-hope', 'wish или hope?', 'нереальное или реальное будущее', ['I hope you pass the exam. — может случиться', 'I wish I had more time. — нереально', '✗ I wish you pass the exam.'])}
      ${CD_ROW('другое', 'cd-u', 'cd-wish-other', 'Другие значения wish', 'хотеть · желать', ['I wish to speak to the manager. — хотеть (официально)', 'We wish you a happy birthday! · Wish me luck!'])}
    </div>`);

  const unreal = CD_SEC('cd-unreal', 10, 'Другие «если бы»', 'would rather, it’s time, as if — та же логика шага назад.', `
    <div class="ig-pairs">
      ${CD_SWITCH('cd-rather', 'would rather', [
        { btn: 'я сам', cls: 'cd-r', sense: 'предпочёл бы сделать сам', en: 'I’d rather stay at home tonight.', ru: 'Я бы лучше остался дома.', form: 'would rather + V (без to)' },
        { btn: 'ты', cls: 'cd-u', sense: 'хочу, чтобы другой человек…', en: 'I’d rather you didn’t tell anyone.', ru: 'Я бы предпочёл, чтобы ты никому не говорил.', form: 'would rather + sb + Past' },
        { btn: 'тогда: я', cls: 'cd-u', sense: 'жаль, что я тогда не…', en: 'I’d rather have gone by train.', ru: 'Я бы лучше поехал поездом.', form: 'would rather have + V3' },
        { btn: 'тогда: ты', cls: 'cd-u', sense: 'жаль, что ты тогда…', en: 'I’d rather you hadn’t invited him.', ru: 'Лучше бы ты его не приглашал.', form: 'would rather + sb + Past Perfect' },
      ])}
      ${CD_SWITCH('cd-time', 'It’s time…', [
        { btn: 'to do', cls: 'cd-r', sense: 'просто пора', en: 'It’s time to go.', ru: 'Пора идти.', form: 'It’s time + to V · It’s time for sb + to V' },
        { btn: 'sb did', cls: 'cd-u', sense: 'уже пора бы, опаздываем', en: 'It’s high time you found a job.', ru: 'Тебе давно пора найти работу.', form: 'It’s (high / about) time + sb + Past' },
      ])}
      ${CD_SWITCH('cd-as-if', 'as if / as though', [
        { btn: 'похоже', cls: 'cd-r', sense: 'похоже на правду', en: 'It looks as if it’s going to rain.', ru: 'Похоже, будет дождь.', form: 'обычное время' },
        { btn: 'неправда', cls: 'cd-u', sense: 'как будто (а это не так)', en: 'He talks as if he knew everything.', ru: 'Он говорит так, будто всё знает.', form: 'шаг назад: Past' },
        { btn: 'было раньше', cls: 'cd-u', sense: 'как будто раньше случилось', en: 'She looked as if she had seen a ghost.', ru: 'Она выглядела так, будто увидела привидение.', form: 'Past Perfect' },
      ])}
    </div>
    <div class="sv-rows">
      ${CD_ROW('похоже', 'cd-u', 'cd-prefer', 'would prefer · would sooner', 'похожие конструкции', ['I’d prefer to walk.', 'I’d prefer it if you called first.', 'I’d sooner stay in than go out in this rain.'])}
      ${CD_ROW('ошибки', 'cd-u', 'cd-unreal-traps', 'Частые ошибки', '', ['✗ I’d rather to stay. → I’d rather stay.', '✗ I’d rather you don’t tell. → I’d rather you didn’t tell.', '✗ It’s high time you find a job. → … you found a job.'])}
    </div>`);

  const traps = CD_SEC('cd-traps', 11, 'Ловушки для русскоязычных', 'Нажмите на карточку с ошибкой — увидите, как правильно.', `
    <div class="cd-traps">${CD_TRAPS.map(([bad, good, why]) => `<button type="button" class="cd-trap" aria-expanded="false"><span class="cd-tb"><s>${bad}</s></span><span class="cd-tg" hidden><span>✓ ${good}</span><small>${why}</small></span></button>`).join('')}</div>
    <div class="cd-ru-tip"><b>Прошедшее после if — не всегда «бы».</b> О реальном прошлом говорят обычными временами: <i>If she was at the party, I didn’t see her.</i> · <i>If he left at six, he’ll be there by now.</i></div>`);

  const quiz = CD_SEC('cd-check', 12, 'Проверьте себя', 'Десять вопросов по всему правилу.', `
    <ol class="cd-quiz">${CD_QUIZ.map(([q, opts, why, ref], i) => `<li class="cd-q" data-ok="${opts[0].replace(/"/g, '&quot;')}"><p>${q.replace('___', '<span class="cd-gap">___</span>')}</p><div class="cd-qo">${[...opts.slice(i % 3), ...opts.slice(0, i % 3)].map(o => `<button type="button">${o}</button>`).join('')}</div><p class="cd-qw" hidden>${why} <a href="#${ref}">Правило ↑</a></p></li>`).join('')}</ol>
    <p class="cd-score" aria-live="polite"></p>`);

  return [core, zero, first, conj, second, third, mixed, implied, inversion, wish, unreal, traps, quiz].join('\n');
}
const CONDITIONALS_RULE_CONTENT = `<div class="mv sv ig cd" id="cd-root" lang="ru">
<header class="mv-hero sv-hero" id="cd-top"><h1>Conditionals</h1><p>Условные предложения: реальные и «если бы», смешанные, wish, would rather, условия без if и официальная инверсия. Главное — в карточках, подробности раскрываются по нажатию.</p>
<div class="mv-chips"><span class="mv-chip">if · when</span><span class="mv-chip">unless · in case</span><span class="mv-chip">would · would have</span><span class="mv-chip">mixed</span><span class="mv-chip">I wish</span><span class="mv-chip">Had I known</span></div></header>
<nav class="mv-nav" aria-label="Разделы правила"><a href="#cd-core">0 Два мира</a><a href="#cd-zero">1 Zero</a><a href="#cd-first">2 First</a><a href="#cd-conj">3 Союзы</a><a href="#cd-second">4 Second</a><a href="#cd-third">5 Third</a><a href="#cd-mixed">6 Mixed</a><a href="#cd-implied">7 Без if</a><a href="#cd-inversion">8 Инверсия</a><a href="#cd-wish">9 Wish</a><a href="#cd-unreal">10 Rather · time</a><a href="#cd-traps">11 Ловушки</a><a href="#cd-check">12 Проверка</a></nav>
${cdSections()}
</div>`;

function conditionalsRuleHtml(prefix = '') {
  const safePrefix = String(prefix).replace(/[^a-zA-Z0-9_-]/g, '');
  return CONDITIONALS_RULE_CONTENT
    .replace(/id="([^"]+)"/g, (_, id) => 'id="' + safePrefix + id + '" data-cd-id="' + id + '"')
    .replace(/href="#(cd-[^"]+)"/g, (_, id) => 'href="#theory/conditionals/' + id + '" data-cd-anchor="' + id + '"');
}
function revealConditionalsAnchor(container, anchor) {
  const root = container?.matches?.('.cd') ? container : container?.querySelector?.('.cd');
  const id = String(anchor || '').replace(/^#?(?:theory\/conditionals\/)?/, '');
  if (!id) return;
  if (!root) { document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' }); return; }
  const target = [root, ...root.querySelectorAll('[data-cd-id]')].find(node => node.dataset.cdId === id || node.id === id);
  if (!target) { const outer = document.getElementById(id); if (outer) outer.scrollIntoView({ block: 'start', behavior: 'instant' }); return; }
  for (let node = target.closest('details'); node; node = node.parentElement?.closest('details')) node.open = true;
  const spot = target.closest('details') || target.closest('.ig-pair') || target;
  const scrollArea = root.closest('.reference-reader,.rule-dialog-content');
  if (scrollArea) {
    const nav = root.querySelector('.mv-nav');
    scrollArea.scrollTop += spot.getBoundingClientRect().top - scrollArea.getBoundingClientRect().top - (nav?.getBoundingClientRect().height || 0) - 16;
  } else spot.scrollIntoView({ block: 'start', behavior: 'instant' });
  if (spot.classList?.contains('ig-pair')) { spot.classList.add('ig-flash'); setTimeout(() => spot.classList.remove('ig-flash'), 1200); }
}
function cdPick(group, selector, el) { group.querySelectorAll(selector).forEach(b => { const on = b === el; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }); }
function initialiseConditionalsRule(container) {
  const root = container?.matches?.('.cd') ? container : container?.querySelector?.('.cd');
  if (!root || root.dataset.initialised) return;
  root.dataset.initialised = 'true';
  let score = 0, answered = 0;
  root.addEventListener('click', event => {
    const t = event.target;
    const link = t.closest?.('[data-cd-anchor]');
    if (link && root.contains(link) && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) {
      event.preventDefault(); event.stopPropagation(); revealConditionalsAnchor(root, link.dataset.cdAnchor); return;
    }
    const pb = t.closest?.('.cd-pb');
    if (pb && root.contains(pb)) { const pair = pb.closest('.ig-pair'); cdPick(pb.parentElement, '.cd-pb', pb); pair.querySelectorAll('.cd-pp').forEach(p => { p.hidden = p.dataset.k !== pb.dataset.k; }); return; }
    const ax = t.closest?.('.cd-ax');
    if (ax && root.contains(ax)) {
      const b = ax.closest('.cd-builder'); cdPick(ax.parentElement, '.cd-ax', ax);
      const val = name => b.querySelector(`[data-axis="${name}"] .cd-ax.on`)?.dataset.val;
      const key = `${val('real')}-${val('cond')}-${val('res') === val('cond') ? 'same' : val('res')}`;
      b.dataset.key = key; const out = b.querySelector('.cd-bout'); out.innerHTML = cdBuilderOut(key).replace(/href="#(cd-[^"]+)"/g, (_, id) => 'href="#theory/conditionals/' + id + '" data-cd-anchor="' + id + '"');
      out.classList.remove('cd-pop'); void out.offsetWidth; out.classList.add('cd-pop'); return;
    }
    const rb = t.closest?.('.cd-rb');
    if (rb && root.contains(rb)) { const li = rb.closest('li'), on = rb.getAttribute('aria-pressed') !== 'true'; rb.setAttribute('aria-pressed', String(on)); li.classList.toggle('on', on); li.querySelector('.cd-rr').hidden = on; li.querySelector('.cd-ru').hidden = !on; rb.textContent = on ? '⇅ Вернуть' : '⇅ Отразить'; return; }
    const trap = t.closest?.('.cd-trap');
    if (trap && root.contains(trap)) { const on = trap.getAttribute('aria-expanded') !== 'true'; trap.setAttribute('aria-expanded', String(on)); trap.querySelector('.cd-tg').hidden = !on; return; }
    const qo = t.closest?.('.cd-qo button');
    if (qo && root.contains(qo)) {
      const q = qo.closest('.cd-q'); if (q.classList.contains('done')) return;
      const ok = qo.textContent === q.dataset.ok; q.classList.add('done', ok ? 'ok' : 'bad'); answered++; if (ok) score++;
      q.querySelectorAll('button').forEach(b => { b.disabled = true; if (b.textContent === q.dataset.ok) b.classList.add('right'); }); if (!ok) qo.classList.add('wrong');
      q.querySelector('.cd-gap').textContent = q.dataset.ok; q.querySelector('.cd-qw').hidden = false;
      const total = root.querySelectorAll('.cd-q').length; root.querySelector('.cd-score').textContent = answered === total ? `Итог: ${score} из ${total}` : `Верно: ${score} из ${answered}`;
    }
  });
}
