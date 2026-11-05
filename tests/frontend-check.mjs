// Include agreement and bank-key regressions in the existing CI entry point.
import './agreement.mjs';
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const noopNode = { addEventListener() {}, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } }, setAttribute() {}, querySelectorAll() { return []; } };
const context = {
  module: { exports: {} },
  console,
  document: { querySelector() { return noopNode; }, querySelectorAll() { return []; } },
  window: { addEventListener() {}, scrollTo() {} },
  location: { hash: "#home", reload() {} },
  localStorage: { getItem() { return null; }, setItem() {} },
  fetch: async () => ({ ok: true, json: async () => ({ parts: [], levels3: {}, types: {}, total_items: 0, answer_slots: 0 }), text: async () => "" }),
  requestAnimationFrame() {},
  setTimeout,
};
vm.createContext(context);
vm.runInContext(source.replace(/initialise\(\);/, ""), context);
const { normalise, slugify, TYPE_LABELS, THEORY_ROUTE_BY_FILE } = context.module.exports;

assert.equal(normalise(" I've worked.  "), "i've worked");
assert.equal(normalise("I’ve   worked!"), "i've worked");
assert.equal(slugify("Present Perfect Simple"), "present-perfect-simple");
assert.equal(TYPE_LABELS.context_cloze, "Контекстный текст");
assert.equal(THEORY_ROUTE_BY_FILE["03-past.md"], "past");
console.log("Frontend checks passed.");

assert.equal(vm.runInContext('fieldResults({blanks:[{answer:"went"},{answer:"gone"}]},["went","wrong"]).filter(f=>f.correct).length',context),1);
assert.equal(vm.runInContext('fieldResults({options:["a","b"],correct_option_index:0},0)[0].correct',context),true);
assert.equal(vm.runInContext('evaluate({blanks:[{answer:"went"}]},[""])',context),null);
console.log("Per-field regression checks passed.");

context.localStorage = {
  values: new Map(),
  getItem(key) { return this.values.get(key) || null; },
  setItem(key, value) { this.values.set(key, value); },
};
vm.runInContext('state.theory = [{id:"foundations",title:"Основы времён"},{id:"past",title:"Past"},{id:"comparison",title:"Степени сравнения"}]', context);
const tenseNav = context.theoryNav("foundations");
const comparisonNav = context.theoryNav("comparison");
for(const nav of [tenseNav,comparisonNav])assert.ok(nav.includes('href="#grammar"'));
assert.ok(tenseNav.includes('#theory/past'));
assert.ok(!tenseNav.includes('#theory/comparison'));
assert.ok(!comparisonNav.includes('#theory/past'));
assert.ok(comparisonNav.includes('#theory/comparison/формы-и-орфография'));
assert.ok(tenseNav.includes('class="active" aria-current="location" href="#theory/foundations"'));
assert.ok(comparisonNav.includes('class="active" aria-current="location" href="#theory/comparison/формы-и-орфография"'));
vm.runInContext('localStorage.setItem(storageKey("practice-settings:tenses"),JSON.stringify({topic:"tenses",count:"50"}));localStorage.setItem(storageKey("practice-settings:comparison"),JSON.stringify({topic:"comparison",count:"5"}));',context);
assert.equal(context.practiceSettings("tenses").count,"50");
assert.equal(context.practiceSettings("comparison").count,"5");
context.localStorage.values.clear();
vm.runInContext('localStorage.setItem(storageKey("practice-settings"),JSON.stringify({topic:"comparison",count:"25"}))',context);
assert.equal(context.practiceSettings("comparison").count,"25");
assert.equal(context.practiceSettings("tenses").count,undefined);
context.renderGrammar();
assert.ok(noopNode.innerHTML.includes('#practice/tenses'));
assert.ok(noopNode.innerHTML.includes('#practice/comparison'));
context.renderGrammar("",true,{id:"pupil",name:"Demo"});
assert.ok(noopNode.innerHTML.includes('#assign/pupil/tenses'));
assert.ok(noopNode.innerHTML.includes('#assign/pupil/comparison'));
console.log("Grammar sections: section-specific theory navigation, independent settings, safe legacy migration and assignment routes passed.");
