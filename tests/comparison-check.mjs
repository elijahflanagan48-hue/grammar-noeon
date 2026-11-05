import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const source = fs.readFileSync(new URL('app.js', root), 'utf8');
const ctx = { module: { exports: {} }, document: { querySelector() { return {}; } }, localStorage: { getItem() { return null; } } };
vm.createContext(ctx);
vm.runInContext(source.replace(/initialise\(\);/, ''), ctx);
const manifest = JSON.parse(fs.readFileSync(new URL('data/exercises/index.json', root), 'utf8'));
const bank = manifest.parts.flatMap(p => JSON.parse(fs.readFileSync(new URL(p.file, root), 'utf8'))).filter(i => i.topic === 'comparison');
const markdown = fs.readFileSync(new URL('content/theory/06-comparison.md', root), 'utf8');
const anchors = new Set(markdown.split('\n').filter(line => /^#{1,6} /.test(line)).map(line => ctx.module.exports.slugify(line.replace(/^#+ /, ''))));
assert.equal(bank.length, 1000);
assert.equal(new Set(bank.map(item => item.id)).size, bank.length);
assert.deepEqual([...new Set(bank.map(i => i.level))].sort(), ['advanced','basic','medium']);
assert.deepEqual([...new Set(bank.map(i => i.type))].sort(),['context_cloze','multiple_choice','open_brackets']);
for (const item of bank) {
  assert.equal(item.topic, 'comparison');
  assert.ok(ctx.exerciseTenses(item).every(id => id.startsWith('cmp_')));
  for (const ref of item.rule_refs) {
    assert.ok(anchors.has(ref.split('#')[1]), item.id + ': missing anchor ' + ref);
    assert.ok(ctx.ruleLink(ref).startsWith('#theory/comparison/'));
  }
  if (item.options) {
    item.options.forEach((_, index) => assert.equal(ctx.evaluate(item, index), index === item.correct_option_index, item.id));
  } else {
    const fields = item.blanks || [item];
    const canonical = fields.map(field => field.answer);
    assert.equal(ctx.evaluate(item, canonical), true, item.id);
    fields.forEach((field, k) => {
      for (const answer of field.accepted_answers) {
        const values = canonical.slice(); values[k] = answer;
        assert.equal(ctx.evaluate(item, values), true, item.id + ': ' + answer);
      }
    });
    if (item.type === 'open_brackets') {
      assert.equal((item.prompt.match(/\([^)]*\)/g) || []).length, fields.length, item.id);
      let k = 0;
      assert.equal(item.prompt.replace(/\([^)]*\)/g, () => fields[k++].answer), item.answer_text, item.id);
    }
  }
}
ctx.bank = bank;
vm.runInContext('state.exercises=bank', ctx);
const form = {
  elements: { type: { value: 'all' }, topic: { value: 'comparison' } },
  querySelectorAll(selector) {
    return selector.includes('name="format"') ? [...new Set(bank.map(i=>i.type))].map(value=>({value})) : selector.includes('name="level"') ? [{value:'basic'}] :
      ['present_simple','cmp_forms','cmp_superlatives','cmp_equality','cmp_development','cmp_precision'].map(value=>({value}));
  },
};
ctx.form = form;
const selected = vm.runInContext('filteredExercises(form)', ctx);
assert.equal(selected.length, bank.filter(i=>i.level==='basic').length);
assert.ok(selected.every(i => i.level === 'basic' && i.topic === 'comparison'));
form.querySelectorAll = selector => selector.includes('name="format"') ? [{value:'open_brackets'}] : selector.includes('name="level"') ? [{value:'advanced'}] : ['cmp_forms','cmp_superlatives','cmp_equality','cmp_development','cmp_precision'].map(value=>({value}));
assert.equal(vm.runInContext('filteredExercises(form).length', ctx), 300);
assert.ok(vm.runInContext('filteredExercises(form).every(i => i.level === "advanced" && i.type === "open_brackets")', ctx));
form.elements.topic.value = 'tenses';
assert.equal(vm.runInContext('filteredExercises(form).length', ctx), 0);
console.log('Comparison: 1000 keys, 3 populated levels, 3 practice formats, variants, anchors, adjective placeholders and section isolation passed.');
