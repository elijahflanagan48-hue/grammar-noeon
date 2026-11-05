const assert = require('node:assert/strict');
const R = require('../students-roster.js');
const now = new Date('2026-11-05T17:00:00+03:00').getTime();
const mk = (name, email, o = {}) => ({ id: name, name, email, active: true, lastActive: null, unfinished: 0, stats: { sessions: 0, score: 0, maxScore: 0 }, ...o });
const real = [
  mk('Самуил', 'markidisamuil@gmail.com', { lastActive: '2026-11-04T20:39:52+03:00', unfinished: 1 }),
  mk('Тимофей майер', 'dadasada3812@gmail.com', { lastActive: '2026-11-05T13:00:58+03:00', unfinished: 1 }),
  mk('Askhab', 'salmaskhab7.7@mail.ru', { lastActive: '2026-11-01T21:14:37+03:00', unfinished: 1 }),
  mk('Dima', 'agafonovdimon2010@gmail.com', { unfinished: 1, stats: { sessions: 1, score: 21, maxScore: 21 } }),
  mk('Gleb', 'forenglish77@mail.ru', { lastActive: '2026-11-04T20:00:43+03:00', unfinished: 1, stats: { sessions: 2, score: 28, maxScore: 40 } }),
  mk('Tamir', 'khantsevt@gmail.com', { lastActive: '2026-11-05T16:38:05+03:00', unfinished: 1 }),
  mk('TEST', 'ilia.p1@yahoo.com', { lastActive: '2026-10-30T12:18:33+03:00', unfinished: 1 }),
  mk('Valerie', 'vpetrova1405@gmail.com', { lastActive: '2026-11-05T11:11:03+03:00' }),
];
const items = real.map(s => ({ s, i: R.describeStudent(s, now) }));
const by = n => items.find(x => x.s.name === n).i;
const find = q => { const r = R.resolveQuery(real, q); return real.filter(s => R.matchesQuery(s, r.q)).map(s => s.name); };

// раскладка и транслит
assert.equal(R.layoutFix('fkbyf'), 'алина');
assert.equal(R.layoutFix('ЫФЬГШД'), 'samuil');
assert.equal(R.layoutFix('[]'), 'хъ');
assert.deepEqual(find('gleb'), ['Gleb']);
assert.deepEqual(find('пдуи'), ['Gleb']);            // «gleb» в русской раскладке
assert.deepEqual(find('ыфьгшд'), ['Самуил']);        // «samuil» в русской раскладке
assert.deepEqual(find('самуил'), ['Самуил']);
assert.deepEqual(find('samuil'), ['Самуил']);        // транслит
assert.deepEqual(find('tim may'), ['Тимофей майер']);
assert.deepEqual(find('майер тим'), ['Тимофей майер']);
assert.deepEqual(find('mail.ru'), ['Askhab', 'Gleb']);
assert.deepEqual(find('e'), real.filter(s => (R.normalize(s.name)+R.normalize(s.email)+R.translit(s.name)).includes('e')).map(s => s.name)); // короткий запрос не раздувается раскладкой
assert.equal(find('').length, 8);
assert.deepEqual(find('zzzzz'), []);
assert.equal(R.resolveQuery(real, 'gleb').fixed, false);
assert.equal(R.resolveQuery(real, 'пдуи').fixed, true);

// статусы
assert.equal(by('Tamir').level, 'today');            // 22 мин назад — не «онлайн»
assert.equal(by('Самуил').level, 'ok');
assert.equal(by('Askhab').level, 'warn');
assert.equal(by('TEST').level, 'warn');              // ровно 7 дней — ещё warn
assert.equal(by('Dima').level, 'none'); assert.equal(by('Dima').attention, false); assert.equal(R.activityText(by('Dima')), 'нет данных');
assert.equal(by('Gleb').pct, 70); assert.equal(by('Gleb').low, false);
assert.equal(items.filter(R.FILTER_TESTS.attention).length, 0);
assert.equal(items.filter(R.FILTER_TESTS.today).length, 3);
assert.equal(items.filter(R.FILTER_TESTS.tasks).length, 7);
assert.equal(items.filter(R.FILTER_TESTS.new).length, 6);

// граничные случаи
const cold = R.describeStudent(mk('X', 'x@x.ru', { lastActive: '2026-10-20T10:00:00+03:00', unfinished: 2 }), now);
assert.equal(cold.level, 'cold'); assert.equal(cold.attention, true); assert.equal(cold.flag, '16 дн. без занятий');
const coldNoDebt = R.describeStudent(mk('X', 'x@x.ru', { lastActive: '2026-10-20T10:00:00+03:00' }), now);
assert.equal(coldNoDebt.attention, false);            // давно нет, но заданий не висит — не тревожим
const low = R.describeStudent(mk('L', 'l@x.ru', { lastActive: '2026-11-05T10:00:00+03:00', stats: { sessions: 3, score: 12, maxScore: 30 } }), now);
assert.equal(low.attention, true); assert.equal(low.flag, 'точность 40%');
const fewAnswers = R.describeStudent(mk('F', 'f@x.ru', { stats: { sessions: 1, score: 2, maxScore: 8 } }), now);
assert.equal(fewAnswers.low, false);                  // мало ответов — не делаем выводов
const neverIn = R.describeStudent(mk('N', 'n@x.ru', { unfinished: 1 }), now);
assert.equal(neverIn.attention, true); assert.equal(R.activityText(neverIn), 'не заходил');
const archived = R.describeStudent(mk('A', 'a@x.ru', { active: false, unfinished: 3, lastActive: '2026-01-01T00:00:00Z' }), now);
assert.equal(archived.attention, false);
const online = R.describeStudent(mk('O', 'o@x.ru', { lastActive: new Date(now - 3 * 60000).toISOString() }), now);
assert.equal(online.level, 'online'); assert.equal(R.activityText(online), 'онлайн');
const future = R.describeStudent(mk('Z', 'z@x.ru', { lastActive: new Date(now + 3600000).toISOString() }), now);
assert.notEqual(future.level, 'online'); assert.ok(future.days === 0);
assert.equal(R.describeStudent(mk('B', 'b@x.ru', { lastActive: 'мусор' }), now).level, 'none');

// сортировка: null всегда внизу, независимо от направления
const act = rev => R.sortItems(items, 'activity', rev).map(x => x.s.name);
assert.deepEqual(act(false), ['Tamir', 'Тимофей майер', 'Valerie', 'Самуил', 'Gleb', 'Askhab', 'TEST', 'Dima']);
assert.equal(act(true).at(-1), 'Dima'); assert.equal(act(true)[0], 'TEST');
const acc = rev => R.sortItems(items, 'accuracy', rev).map(x => x.s.name);
assert.deepEqual(acc(false).slice(0, 2), ['Dima', 'Gleb']); assert.deepEqual(acc(true).slice(0, 2), ['Gleb', 'Dima']);
assert.ok(acc(true).slice(2).every(n => !['Dima', 'Gleb'].includes(n)));
assert.deepEqual(R.sortItems(items, 'name', false).map(x => x.s.name).slice(0, 3), ['Askhab', 'Dima', 'Gleb']);
assert.equal(R.sortItems(items, 'tasks', false).at(-1).s.name, 'Valerie');

// вспомогательное
assert.deepEqual([1, 2, 5, 11, 21, 22, 25].map(n => R.plural(n, ['задание', 'задания', 'заданий'])), ['задание', 'задания', 'заданий', 'заданий', 'задание', 'задания', 'заданий']);
assert.equal(R.initials('Тимофей майер'), 'ТМ'); assert.equal(R.initials('dima'), 'D'); assert.equal(R.initials(''), '?');
assert.equal(R.highlight('Тимофей майер', 'май'), 'Тимофей <mark>май</mark>ер');
assert.equal(R.highlight('A<b>', 'a'), '<mark>A</mark>&lt;b&gt;');   // экранирование
assert.equal(R.highlight('Ёжик', 'ежик'), '<mark>Ёжик</mark>');
const s = R.summary(items); assert.deepEqual(s, { total: 8, today: 3, attention: 0, avg: 80 }); // (21+28)/(21+40)=80%
assert.ok(R.summaryText(items.slice(0, 2), now).startsWith('Ученики · 05.11.2026 · 2\n• Самуил — вчера'));


// ---------- профиль ученика и очередь проверки ----------
// время
assert.equal(R.ts(null), null); assert.equal(R.ts(''), null); assert.equal(R.ts('мусор'), null);
assert.equal(R.ts(1793900170), 1793900170000);       // секунды Unix
assert.equal(R.ts(1793900170000), 1793900170000);    // миллисекунды
assert.equal(R.ts('2026-11-05T14:00:00Z'), Date.parse('2026-11-05T14:00:00Z'));
assert.ok(R.fmtDate('2026-11-05T14:00:00Z', now).startsWith('5 нояб'));
assert.ok(/2025/.test(R.fmtDate('2025-03-01T10:00:00Z', now)));   // чужой год показываем
assert.equal(R.fmtDate(null, now), '—');
assert.equal(R.agoText('2026-11-05T10:00:00+03:00', now), 'сегодня'); assert.equal(R.agoText('2026-11-04T10:00:00+03:00', now), 'вчера');
assert.equal(R.agoText('2026-11-02T10:00:00+03:00', now), '3 дн. назад'); assert.equal(R.agoText(null, now), 'нет данных');

// задания
const A = (o) => ({ practiceId: 'p' + Math.random(), title: 'Работа', created: '2026-11-04T10:00:00+03:00', status: 'assigned', index: 0, total: 20, score: 0, maxScore: 0, ...o });
const v1 = R.workView(A({ status: 'assigned', created: '2026-10-26T10:00:00+03:00' }), now);
assert.equal(v1.tone, 'new'); assert.equal(v1.label, 'Не начато'); assert.equal(v1.staleDays, 10);
assert.equal(R.workView(A({ status: 'assigned' }), now).staleDays, 0);                       // свежее не тревожим
assert.equal(R.workView(A({ status: 'assigned', created: '2026-10-26T10:00:00+03:00', index: 3 }), now).staleDays, 0); // начато
const v2 = R.workView(A({ status: 'started', index: 5, total: 20 }), now);
assert.equal(v2.tone, 'run'); assert.equal(v2.progress, 25); assert.equal(R.workView(A({ status: 'draft' }), now).label, 'В процессе');
const v3 = R.workView(A({ status: 'completed', index: 20, score: 17, maxScore: 20 }), now);
assert.equal(v3.pct, 85); assert.equal(v3.tone, 'done'); assert.equal(R.workView(A({ status: 'completed', maxScore: 0 }), now).pct, null);
assert.equal(R.workView({ id: 'h1', date: 1793900170, status: 'wat', source: 'self' }, now).self, true);   // неизвестный статус не ломает
assert.equal(R.workView({ index: 30, total: 20, status: 'started' }, now).progress, 100);               // не выше 100%
const B = R.bucketAssignments([A({ status: 'completed', created: '2026-11-01T10:00:00Z' }), A({ status: 'assigned', created: '2026-11-03T10:00:00Z' }), A({ status: 'started', created: '2026-10-30T10:00:00Z' }), A({ status: 'cancelled' }), A({ status: 'completed', created: '2026-11-03T10:00:00Z' })], now);
assert.deepEqual([B.open.length, B.done.length, B.off.length], [2, 2, 1]);
assert.ok(B.open[0].date < B.open[1].date);          // самое давнее — сверху
assert.ok(B.done[0].date > B.done[1].date);          // выполненные: новые сверху
assert.deepEqual(R.bucketAssignments(null, now), { open: [], done: [], off: [] });

// тепловая карта
assert.equal(R.heatClass(null, 0), 'none'); assert.equal(R.heatClass(100, 4), 'thin'); assert.equal(R.heatClass(49, 5), 'bad');
assert.equal(R.heatClass(50, 5), 'warn'); assert.equal(R.heatClass(70, 5), 'mid'); assert.equal(R.heatClass(85, 5), 'good'); assert.equal(R.heatClass(84, 99), 'mid');

const stat = { kinds: {
  practice: { sessions: 3, correct: 30, checked: 50, pending: 2, lastWork: '2026-11-04T10:00:00Z', sections: [
    { id: 'tenses', correct: 20, checked: 30, pending: 0, lastWork: '2026-11-04T10:00:00Z', topics: [{ id: 'past_perfect', correct: 3, checked: 10, pending: 0 }, { id: 'present_simple', correct: 17, checked: 20, pending: 0 }] },
    { id: 'modals', correct: 10, checked: 20, pending: 2, lastWork: '2026-11-03T10:00:00Z', topics: [{ id: 'mv_can', correct: 4, checked: 5, pending: 2 }] }] },
  assessment: { sessions: 1, correct: 5, checked: 10, pending: 0, lastWork: null, sections: [
    { id: 'tenses', correct: 5, checked: 10, pending: 0, lastWork: null, topics: [{ id: 'past_perfect', correct: 1, checked: 5, pending: 0 }] }] },
} };
const o = R.overallStats(stat);
assert.deepEqual([o.correct, o.checked, o.pct, o.sessions, o.practiceSessions, o.testSessions, o.pending], [35, 60, 58, 4, 3, 1, 2]);
assert.equal(R.overallStats(null).pct, null); assert.equal(R.overallStats({ kinds: { practice: { sessions: 0, correct: 0, checked: 0, pending: 0, sections: [] }, assessment: { sessions: 0, correct: 0, checked: 0, pending: 0, sections: [] } } }).sessions, 0);
const sp = R.sectionsView(stat, 'practice');
assert.deepEqual(sp.map(x => x.id), ['tenses', 'comparison', 'passive', 'modals', 'reported']);   // всегда 5 разделов
assert.equal(sp[0].pct, 67); assert.equal(sp[1].pct, null); assert.equal(sp[1].topics.length, 0);
assert.deepEqual(sp[0].topics.map(t => [t.id, t.pct, t.heat]), [['past_perfect', 30, 'bad'], ['present_simple', 85, 'good']]);
assert.equal(sp[3].topics[0].heat, 'mid');
const sa = R.sectionsView(stat, 'all');                                      // тренировки + тесты вместе
assert.deepEqual([sa[0].checked, sa[0].topics.find(t => t.id === 'past_perfect').checked, sa[0].topics.find(t => t.id === 'past_perfect').pct], [40, 15, 27]);
assert.equal(R.sectionsView(null, 'practice')[0].checked, 0);
assert.deepEqual(R.weakTopics(stat).map(t => [t.id, t.pct]), [['past_perfect', 27]]);   // mv_can: 80%, present_simple: 85%
assert.deepEqual(R.weakTopics(stat, { below: 90, limit: 2 }).map(t => t.id), ['past_perfect', 'mv_can']);
assert.deepEqual(R.weakTopics(stat, { minChecked: 30 }), []);

// на что обратить внимание
const label = id => ({ past_perfect: 'Past Perfect' }[id] || id);
const buckets = R.bucketAssignments([A({ practiceId: 'x1', title: 'Повтор', status: 'assigned', created: '2026-10-26T10:00:00+03:00' })], now);
const ins = R.insightsFor({ studentId: 's 1', buckets, stat, labelOf: label, now });
assert.deepEqual(ins.map(n => n.tone), ['warn', 'info', 'bad']);
assert.equal(ins[0].title, '«Повтор» не начато 10 дн.'); assert.equal(ins[0].href, '#student-work/s%201/x1');
assert.equal(ins[1].title, '2 ответа ждут вашей проверки'); assert.equal(ins[1].href, '#review-queue');
assert.equal(ins[2].title, 'Слабая тема'); assert.deepEqual(ins[2].chips.map(c => [c.label, c.pct, c.href]), [['Past Perfect', 27, '#assign/s%201/past_perfect']]);
assert.equal(R.weakTopics(stat, { below: 90, limit: 3 }).length, 3);   // past_perfect 27, mv_can 80, present_simple 85
assert.equal(R.insightsFor({ studentId: 's', buckets: R.bucketAssignments([], now), stat: { kinds: { ...stat.kinds, practice: { ...stat.kinds.practice, sections: [{ id: 'tenses', correct: 8, checked: 30, pending: 0, topics: [{ id: 'a', correct: 1, checked: 10 }, { id: 'b', correct: 2, checked: 10 }, { id: 'c', correct: 3, checked: 10 }, { id: 'd', correct: 1, checked: 10 }] }] } } }, now }).find(n => n.chips).chips.length, 3);   // не больше трёх тем
const two = R.bucketAssignments([A({ status: 'assigned', created: '2026-10-20T10:00:00+03:00' }), A({ status: 'assigned', created: '2026-10-21T10:00:00+03:00' })], now);
const insTwo = R.insightsFor({ studentId: 's', buckets: two, stat: null, now });
assert.equal(insTwo.length, 1); assert.equal(insTwo[0].tab, 'tasks'); assert.ok(insTwo[0].title.includes('2 задания'));
const empty = { kinds: { practice: { sessions: 0, correct: 0, checked: 0, pending: 0, sections: [] }, assessment: { sessions: 0, correct: 0, checked: 0, pending: 0, sections: [] } } };
assert.equal(R.insightsFor({ studentId: 's', buckets: R.bucketAssignments([], now), stat: empty, now })[0].action, 'Назначить первое задание');
assert.equal(R.insightsFor({ studentId: 's', buckets: R.bucketAssignments([], now), stat: null, now }).length, 0);   // пока нет статистики — молчим
assert.equal(R.insightsFor({ studentId: 's', buckets: R.bucketAssignments([A({ status: 'assigned' })], now), stat: empty, now }).length, 0);

// список по давности активности
const sortedItems = R.sortItems(items, 'activity', false);
const groups = R.groupByActivity(sortedItems);
assert.deepEqual(groups.map(g => [g.key, g.items.length]), [['today', 3], ['week', 4], ['none', 1]]);
assert.deepEqual(groups[0].items.map(x => x.s.name), ['Tamir', 'Тимофей майер', 'Valerie']);
assert.deepEqual(R.groupByActivity([]), []);

// очередь проверки
const rq = [{ studentId: 'a', studentName: 'Анна', title: 'Past', pending: 2 }, { studentId: 'b', studentName: 'Борис', title: 'Modals', pending: 5 }, { studentId: 'a', studentName: 'Анна', title: 'Passive', pending: 1 }];
assert.deepEqual(R.groupReviews(rq).map(g => [g.studentName, g.fields, g.works.length]), [['Борис', 5, 1], ['Анна', 3, 2]]);
assert.deepEqual(R.groupReviews(rq, 'anna').map(g => g.studentName), ['Анна']);   // транслит
assert.deepEqual(R.groupReviews(rq, 'modals').map(g => g.studentName), ['Борис']);
assert.deepEqual(R.groupReviews(rq, 'zzz'), []); assert.deepEqual(R.groupReviews(null), []);
const rm = R.reviewsByStudent(rq); assert.deepEqual(rm.get('a'), { fields: 3, works: 2 });
assert.equal(R.FILTER_TESTS.review({ s: {}, i: { review: { fields: 2 } } }), true); assert.equal(R.FILTER_TESTS.review({ s: {}, i: {} }), false);
assert.equal(R.FILTER_TESTS.review({ s: { active: false }, i: { review: { fields: 2 } } }), false);
console.log('OK: все проверки пройдены');
