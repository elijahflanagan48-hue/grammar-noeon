import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {grade} from '../cloudflare/generated/checker.mjs';

const root = new URL('../', import.meta.url);
const ctx = {module:{exports:{}}, document:{querySelector(){return {}}}, localStorage:{getItem(){return null}}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('app.js', root), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(new URL('practice-report.js', root), 'utf8'), ctx);
const bank = JSON.parse(fs.readFileSync(new URL('cloudflare/generated/bank.json', root)));
const byId = id => {const item = bank.find(i => i.id === id); assert(item, id); return item;};
let checked = 0;
function check(item, submitted, code, field = 0) {
  const result = grade(item, submitted);
  assert.equal(JSON.stringify(result.fields), JSON.stringify(ctx.fieldResults(item, submitted)), item.id + ': client/Worker');
  assert.equal(result.fields[field].diagnostic?.code, code, item.id + ': ' + JSON.stringify(submitted));
  if (code) {assert.equal(result.fields[field].diagnostic.version, 1); assert.equal(result.fields[field].correct, false);}
  checked++; return result;
}
const cases = [
  ['src-u08-010', 'celebrates', 'agreement'],
  ['src-u08-049', 'celebrates', 'agreement'],
  ['ext-20261030-past-simple-ob-019', 'did not believed', 'after-did'],
  ['ext-20261030-past-simple-ob-019', "didn't believed", 'after-did'],
  ['ext-20261030-past-simple-ob-021', 'did the accident happened', 'after-did'],
  ['src-u07-012', 'has being known', 'been-being'],
  ['pv5-s004', 'is been painted', 'been-being'],
  ['src-u07-043', 'reading', 'missing-auxiliary'],
  ['src-u07-092', 'waiting', 'missing-auxiliary'],
  ['src-u07-092', 'is waiting', 'agreement'],
  ['src-u08-010', 'goes', undefined],
  ['src-u08-010', 'celebrated', undefined],
  ['src-u07-092', 'was wait', undefined],
  ['src-u07-092', 'were waiting', undefined],
  ['src-u08-010', '<img src=x onerror=alert(1)>', undefined],
  ['src-u07-071', 'combine', undefined],
  ['pv5-s006', 'was being cooked', undefined],
];
for (const [id, value, code] of cases) {
  const item = byId(id), submitted = item.blanks.map(b => b.answer); submitted[0] = value;
  check(item, submitted, code);
}
function fixture(answer, base, tense, prompt = 'They (to work).', accepted = []) {
  return {id:'qa', type:'open_brackets', prompt, explanation_ru:'Общее объяснение.', blanks:[{answer, accepted_answers:accepted, base_verb:base, tense_or_construction:tense}]};
}
for (const [item, value, code] of [
  [fixture('works', 'work', 'present_simple', 'She (to work).'), 'work', 'agreement'],
  [fixture('has finished', 'finish', 'present_perfect', 'She (to finish).'), 'have finished', 'agreement'],
  [fixture('did not go', 'go', 'past_simple'), 'did not went', 'after-did'],
  [fixture('go', 'go', 'past_simple', 'Where did you (to go)?'), 'went', 'after-did'],
  [fixture('has been working', 'work', 'present_perfect_continuous', 'She (to work).'), 'has being working', 'been-being'],
  [fixture('is being watched', 'watch', 'pv_present_continuous'), 'is been watched', 'been-being'],
  [fixture('will have finished', 'finish', 'future_perfect'), 'will finished', 'missing-auxiliary'],
  [fixture('was cleaned', 'clean', 'pv_past_simple'), 'cleaned', 'missing-auxiliary'],
  [fixture('has finished', 'finish', 'present_perfect'), 'finished', 'missing-auxiliary'],
  [fixture('will work', 'work', 'future_simple'), 'work', 'missing-auxiliary'],
  [fixture('are not working', 'work', 'present_continuous'), "isn't working", 'agreement'],
  [fixture('are not working', 'work', 'present_continuous', undefined, ["aren't working"]), "isn't working", 'agreement'],
  [fixture('are working', 'work', 'present_continuous', undefined, ['work']), 'work', undefined],
  [fixture('have worked', 'work', 'present_perfect', undefined, ['had worked']), 'has worked', undefined],
  [fixture('are working', 'work', 'present_continuous', undefined, ['were working']), 'is working', undefined],
  [fixture('is happy', 'be', 'present_simple', 'She (to be).'), 'happy', undefined],
  [fixture('has a car', 'have', 'present_simple', 'She (to have).'), 'a car', undefined],
  [fixture('have been working', 'work', 'present_perfect_continuous'), 'working', undefined],
  [fixture('are working', 'work', 'present_continuous'), 'not working', undefined],
  [fixture('are working', 'work', 'present_continuous'), 'are not working', undefined],
  [fixture('would have finished', 'finish', 'future_in_the_past'), "He'd finished", undefined],
  [fixture('did you see her dance', '', 'past_simple'), 'did you see her danced', undefined],
  [fixture('cook', 'cook', 'past_simple', 'I did help (to cook).'), 'cooked', undefined],
  [fixture('were', 'be', 'past_simple', 'If I (to be) there, I would help.'), 'was', undefined],
]) check(item, [value], code);

// Multi-field feedback describes only the wrong field with its original number.
const mixed = {id:'qa-mixed',type:'context_cloze',prompt:'We {{1:wait}} now. She {{2:not believe}} him yesterday.',blanks:[
  {answer:'are waiting',base_verb:'wait',tense_or_construction:'present_continuous'},
  {answer:'did not believe',base_verb:'not believe',tense_or_construction:'past_simple'}]};
const answer = check(mixed, ['are waiting','did not believed'], 'after-did', 1);
assert(!answer.fields[0].diagnostic);
assert(ctx.explanations(mixed, answer.fields).includes('<li value="2">'));
const americans = byId('src-u08-010'), wrong = check(americans, ['celebrates'], 'agreement');
assert.match(wrong.fields[0].diagnostic.message, /Americans.*множественное число/);
const feedback = ctx.explanations(americans, wrong.fields);
assert(feedback.indexOf('Что исправить') < feedback.indexOf('Общее правило'));
assert(!ctx.explanations(americans).includes('Что исправить'), 'Old fields are not re-diagnosed');
for (const subject of ['The box of books', 'The people who work here', 'My family', 'The news', 'James']) {
  const result = check(fixture('work','work','present_simple', subject + ' (to work).'), ['works'], 'agreement');
  assert(!result.fields[0].diagnostic.message.includes('множественное число'), subject);
}
const option = {id:'qa-choice',type:'multiple_choice',options:['She has been working.','She has being working.'],correct_option_index:0};
check(option, 1, 'been-being'); check(option, 0, undefined);
const manual = {...americans,type:'translation_ru_en',grading_mode:'teacher'};
check(manual, ['celebrates'], undefined);
assert.equal(grade(manual,['celebrates']).fields[0].verified, false);

const stored = ctx.lightHistoryAttempt({answers:[wrong]});
assert.equal(JSON.stringify(stored.answers[0].fields[0].diagnostic), JSON.stringify(wrong.fields[0].diagnostic));
const attempt = {date:'2026-11-03T12:00:00Z',total:1,answers:[wrong]};
assert(ctx.reportMarkup(attempt).includes('Americans» — множественное число'));
assert(!ctx.reportMarkup({...attempt,answers:[{...wrong,fields:[{submitted:'celebrates',correct:false,verified:true}]}]}).includes('Что исправить'));
assert(!ctx.errorExplanations([{...wrong.fields[0], verified:false}]).includes('Что исправить'));
assert(!ctx.errorExplanations([{...wrong.fields[0], manual_review:{note:'Reviewed'}}]).includes('Что исправить'));
const hostile = ctx.errorExplanations([{...wrong.fields[0],diagnostic:{version:1,message:'<img src=x onerror=alert(1)>'}}]);
assert(!hostile.includes('<img')); assert(hostile.includes('&lt;img'));
// Grading accepts all reviewed answers without creating an error diagnosis.
for (const item of bank) {
  const submitted = item.options ? item.correct_option_index : item.blanks.map(b => b.answer);
  assert(grade(item, submitted).fields.every(f => !f.diagnostic), item.id);
}
console.log(`Error feedback: ${checked} positive/negative cases; all ${bank.length} canonical answers, browser/Worker parity, stored reports, legacy neutrality and escaping passed.`);
