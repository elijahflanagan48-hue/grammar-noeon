import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const context = {module:{exports:{}}, document:{querySelector(){}}, localStorage:{getItem(){return null}}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('app.js', root), 'utf8').replace(/initialise\(\);/, ''), context);
const get = expression => vm.runInContext(expression, context);
const presets = get('practicePresets');
const targets = get('exerciseTenses');
const section = get('exerciseSection');
const select = get('balancedPractice');
const bank = fs.readdirSync(new URL('data/exercises/', root)).filter(name => /^part-.*json$/.test(name))
  .flatMap(name => JSON.parse(fs.readFileSync(new URL('data/exercises/' + name, root), 'utf8')));
context.bank = bank;
get('state.exercises=bank');

const expected = {
  tenses: [
    ['present-pair', ['present_simple', 'present_continuous'], 10, ['basic', 'medium']],
    ['past-pair', ['past_simple', 'present_perfect'], 10, ['basic', 'medium']],
    ['short', ['present_simple', 'past_simple', 'future_simple'], 5, ['basic']],
  ],
  passive: [
    ['passive-core', ['pv_present_simple', 'pv_past_simple', 'pv_future_simple'], 10, ['basic', 'medium']],
    ['short', ['pv_present_simple', 'pv_past_simple', 'pv_future_simple'], 5, ['basic']],
  ],
  comparison: [['short', ['cmp_forms', 'cmp_superlatives'], 5, ['basic']]],
};
let seed = 29117, selections = 0;
const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2**32);
for (const [topic, definitions] of Object.entries(expected)) {
  const ready = presets(topic);
  assert.equal(ready.length, definitions.length, topic);
  for (const [id, wantedTargets, count, levels] of definitions) {
    const preset = ready.find(item => item.id === id);
    assert(preset, `${topic}/${id}`);
    assert.deepEqual(Array.from(preset.tenses), wantedTargets);
    assert.deepEqual(Array.from(preset.levels), levels);
    assert.equal(preset.count, count);
    assert.equal(preset.type, 'open_brackets');
    assert(preset.title?.trim() && preset.description?.trim(), 'Explain the contents before starting');
    assert(preset.tenses.length <= count, 'A short preset must not expand beyond the promised size for coverage');
    context.form = {
      elements: {topic:{value:topic}, type:{value:preset.type}},
      querySelectorAll(selector) {
        return (selector.includes('name="format"') ? [preset.type] : selector.includes('name="level"') ? preset.levels : preset.tenses).map(value => ({value}));
      },
    };
    const pool = get('filteredExercises(form)');
    assert(pool.length >= count, `${topic}/${id}: enough exercises to honour the advertised count`);
    assert(pool.every(item => section(item) === topic && item.type === 'open_brackets'
      && levels.includes(item.level) && targets(item).every(target => wantedTargets.includes(target))));
    assert(pool.every(item => get('supportedResponseContract')(item)), 'Only supported automatic answers');
    // Assignment preparation removes repeated sentences across exercise variants.
    const unique = get('uniqueAssignmentPool')(pool);
    assert(unique.length >= count, `${topic}/${id}: enough distinct sentences for an assignment`);
    for (let run = 0; run < 30; run++) {
      const chosen = select(run % 2 ? unique : pool, count, random);
      assert.equal(chosen.length, count);
      assert.equal(new Set(chosen.map(item => item.id)).size, count);
      assert(chosen.every(item => targets(item).every(target => wantedTargets.includes(target))));
      for (const target of wantedTargets) assert(chosen.some(item => targets(item).includes(target)), `${topic}/${id}: ${target}`);
      selections++;
    }
  }
}
assert.equal(presets('unknown').length, 0, 'No presets outside a recognised grammar section');
console.log(`Practice presets: six configurations, real filter pools, assignment sentence deduplication and ${selections} exact-size balanced selections passed.`);
