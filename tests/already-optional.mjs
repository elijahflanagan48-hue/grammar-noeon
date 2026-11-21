import assert from 'node:assert/strict';
import { grade } from '../cloudflare/generated/checker.mjs';
// «already» не влияет на проверку: с ним и без него ответ верен; остальное по-прежнему проверяется строго.
const gap = (answer, extra = {}) => ({ id: 't', type: 'open_brackets', prompt: 'She {{1:finish}} the report.', blanks: [{ answer }], ...extra });
const ok = (item, text) => assert.equal(grade(item, [text]).correct, true, `${item.blanks[0].answer} ← ${text}`);
const no = (item, text) => assert.equal(grade(item, [text]).correct, false, `${item.blanks[0].answer} ← ${text}`);
for (const profile of [undefined, 'modal-exact-v1', 'english-standard-v2']) {
  const extra = profile ? { answer_profile: profile } : {};
  const plain = gap('has finished', extra), withAlready = gap('has already finished', extra);
  for (const item of [plain, withAlready]) { ok(item, 'has finished'); ok(item, 'has already finished'); ok(item, 'Has  already  finished.'); no(item, 'finished'); no(item, 'has already finish'); no(item, 'had already finished'); no(item, 'has already'); }
}
// Слово «already» как сам ответ не стирается.
no(gap('yet'), 'already'); no(gap('already'), 'yet'); no(gap('already'), ''.padEnd(1, ' ').trim() || 'x');
ok(gap('already'), 'already');
// Сокращения тоже работают.
ok(gap("hasn't finished"), "hasn't already finished"); ok(gap("hasn't already finished"), 'has not finished');
console.log('already is optional in answer checking: passed.');
