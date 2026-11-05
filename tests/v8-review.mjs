import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {auditBank} from '../scripts/review-bank.mjs';
const {summary}=auditBank(undefined,JSON.parse(fs.readFileSync(new URL('../docs/review/PASSIVE-2026-11-03/before/data/exercises/index.json',import.meta.url))));
assert.equal(summary.records,5379);assert.equal(summary.fields,7125);assert.equal(summary.parts,55);
for(const name of ['accepted_failures','invalid_accepted','person_mutations_accepted','structural_findings','enhanced_grammar_findings'])assert.deepEqual(summary[name],[],name);
for(const name of ['app.js','cloudflare/worker.mjs'])assert(!fs.readFileSync(new URL('../'+name,import.meta.url),'utf8').includes('cefr_estimate'),name+': current runtime must use level');
assert(!fs.existsSync(new URL('../cloudflare/public/docs/review',import.meta.url)),'Private review keys must not be copied into public assets');
console.log('V8 mechanical audit: canonical/accepted/contraction parity, wrong-person rejection, levels and public allowlist verified.');

const ctx={module:{exports:{}},document:{querySelector(){}},localStorage:{getItem(){return null}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(new URL('../app.js',import.meta.url),'utf8'),ctx);
ctx.current={id:'current',level:'basic',content_version:'old-but-current'};ctx.old={id:'current',content_version:'earlier-snapshot'};
assert.equal(vm.runInContext('sessionContentOutdated({},current)',ctx),false);
assert.equal(vm.runInContext('sessionContentOutdated({contentOutdated:true},current)',ctx),true);
vm.runInContext('state.exercises=[current]',ctx);assert.equal(vm.runInContext('sessionContentOutdated({},old)',ctx),true);
