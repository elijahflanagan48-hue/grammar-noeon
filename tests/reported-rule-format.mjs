import vm from 'node:vm';import fs from 'node:fs';import assert from 'node:assert/strict';
const R=new URL('../',import.meta.url).pathname;
const ctx={module:{exports:{}},document:{querySelector(){}},localStorage:{getItem(){return null}}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(R+'app.js','utf8'),ctx);vm.runInContext(fs.readFileSync(R+'reported-speech.js','utf8'),ctx);
const html=ctx.reportedRuleHtml('ref-');
assert(html.startsWith('<div class="mv rsp"'));assert.equal((html.match(/<section class="mv-sec"/g)||[]).length,7);
assert(!/\]\(|REPORTEDFRAGMENT|full-theory\.html/.test(html),'no raw markdown or placeholders');
for(let n=1;n<=20;n++){const a='rs'+String(n).padStart(2,'0');assert(html.includes('id="ref-'+a+'" data-reported-id="'+a+'"'),a)}
assert(html.includes('data-reported-anchor="rsp-r1"'));
const full=fs.readFileSync(R+'content/theory/reported-full.html','utf8');
assert.equal((full.match(/<table/g)||[]).length,38);for(let n=1;n<=20;n++)assert(full.includes('id="rs'+String(n).padStart(2,'0')+'"'));
for(const bad of ['accepted_answers','rs-data','rs-RS01-001','application/json'])assert(!full.includes(bad),bad);
assert(!/\]\(/.test(full));
const sw=fs.readFileSync(R+'sw.js','utf8');for(const f of ['reported-speech.js','content/theory/reported-full.css','content/theory/reported-full.js'])assert(sw.includes('"'+f+'"'),f);
console.log('OK reported rule/full format checks');
