import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const ctx={module:{exports:{}},document:{querySelector(){return {}}},localStorage:{getItem(){return null}}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('app.js','utf8').replace(/initialise\(\);/,''),ctx);vm.runInContext(fs.readFileSync('accounts.js','utf8'),ctx);
const {assignmentPreviewCandidates,assignmentRandomCandidate,assignmentPreviewCard}=ctx.module.exports;
const m=JSON.parse(fs.readFileSync('data/exercises/index.json')),bank=m.parts.flatMap(p=>JSON.parse(fs.readFileSync(p.file)));
const a=bank.find(i=>i.type==='open_brackets'),b=bank.find(i=>i.id!==a.id&&i.type==='open_brackets');
assert(!assignmentPreviewCandidates([a,b],[a]).some(i=>i.id===a.id));
assert(!assignmentPreviewCandidates([a,b,{...a,id:'same-sentence'}],[a]).some(i=>i.id==='same-sentence'));
assert(assignmentPreviewCandidates([a,b],[a]).some(i=>i.id===b.id));
for(const type of ['open_brackets','multiple_choice','context_cloze']){
 const i=bank.find(i=>i.type===type);const html=assignmentPreviewCard({...i,prompt:'<img src=x onerror=alert(1)> '+i.prompt},0);
 assert(!html.includes('<img'));assert(html.includes('&lt;img'));assert(html.includes('<details>'));assert(!html.includes('{{'));
 if(i.options)for(const option of i.options)assert(html.includes(vm.runInContext('escapeHtml',ctx)(option)));
}
assert.match(fs.readFileSync('app.js','utf8'),/renderAssignmentPreview\(form, selected\)/);
console.log('Assignment preview: selection excludes reviewed IDs and overlapping sentences; all three formats and untrusted prompts escaped.');

const pool=vm.runInContext('uniqueAssignmentPool',ctx)(bank.filter(i=>i.type==='open_brackets')).slice(0,4);
const seen=new Set([pool[0].id]);let chosen=[pool[0],pool[3]];
for(let n=0;n<2;n++){
 const next=assignmentRandomCandidate(pool,chosen,0,seen,()=>0);
 assert(next&&!seen.has(next.id));assert.notEqual(next.id,chosen[1].id);seen.add(next.id);chosen[0]=next;
}
const cycled=assignmentRandomCandidate(pool,chosen,0,new Set(pool.map(i=>i.id)),()=>0);
assert(cycled&&cycled.id!==chosen[0].id&&cycled.id!==chosen[1].id);
assert.equal(assignmentRandomCandidate([pool[0]],[pool[0]],0),null);
console.log('Random replacement: unseen choices first, cycle excludes current and selected IDs, empty alternatives handled.');
