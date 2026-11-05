import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
const assert = require('node:assert/strict');
const R = require('../students-roster.js');
const now = new Date('2026-11-05T17:00:00+03:00').getTime();
const mk = (name, email, o = {}) => ({ id: name, name, email, active: true, lastActive: null, unfinished: 0, stats: { sessions: 0, score: 0, maxScore: 0 }, ...o });
const real = [
  mk('Самуил', 'fixture1442065360897982698@example.test', { lastActive: '2026-11-04T20:39:52+03:00', unfinished: 1 }),
  mk('Тимофей майер', 'fixture3957204281290646003@example.test', { lastActive: '2026-11-05T13:00:58+03:00', unfinished: 1 }),
  mk('Askhab', 'fixture6988654655897287967@example.test', { lastActive: '2026-11-01T21:14:37+03:00', unfinished: 1 }),
  mk('Dima', 'fixture3078278062958892584@example.test', { unfinished: 1, stats: { sessions: 1, score: 21, maxScore: 21 } }),
  mk('Gleb', 'fixture6222524592160362535@example.test', { lastActive: '2026-11-04T20:00:43+03:00', unfinished: 1, stats: { sessions: 2, score: 28, maxScore: 40 } }),
  mk('Tamir', 'fixture6629638298286032950@example.test', { lastActive: '2026-11-05T16:38:05+03:00', unfinished: 1 }),
  mk('TEST', 'fixture5539737838138808776@example.test', { lastActive: '2026-10-30T12:18:33+03:00', unfinished: 1 }),
  mk('Valerie', 'fixture902583429906037368@example.test', { lastActive: '2026-11-05T11:11:03+03:00' }),
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
assert.deepEqual(find('fixture'), real.map(s=>s.name));
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
console.log('OK: все проверки пройдены');
