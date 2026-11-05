import vm from 'node:vm';import fs from 'node:fs';import assert from 'node:assert/strict';
const R=new URL('../',import.meta.url).pathname;
const ctx={module:{exports:{}},document:{querySelector(){}},localStorage:{getItem(){return null}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(R+'app.js','utf8'),ctx);
const html=ctx.reportedRuleHtml(fs.readFileSync(R+'content/theory/08-reported.md','utf8'));
assert.equal((html.match(/<table>/g)||[]).length,8);assert.equal((html.match(/<h2/g)||[]).length,7);assert(!html.includes('REPORTEDFRAGMENT'));assert(html.includes('href="content/theory/reported-full.html'));assert(!html.includes('<details open'));
assert(!/\]\(/.test(html),'raw markdown link');assert(!/full-theory\.html/.test(html));
for(let n=1;n<=20;n++){const a='rs'+String(n).padStart(2,'0');assert(html.includes('id="'+a+'"'));assert.equal(ctx.ruleLink('content/reported-speech/08-reported.md#'+a),'#theory/reported/'+a)}
assert(html.includes('id="rs-check"'));
const full=fs.readFileSync(R+'content/theory/reported-full.html','utf8');assert.equal((full.match(/<table>/g)||[]).length,38);for(const bad of ['accepted_answers','rs-data','rs-RS01-001','application/json'])assert(!full.includes(bad),bad);
for(let n=1;n<=20;n++)assert(full.includes('id="rs'+String(n).padStart(2,'0')+'"'));
// old renderer regression: link inside <details>
const h2=ctx.reportedRuleHtml('# T\n\n## A\n\n<details>\n<summary>Q</summary>\n\nText [Link →](full-theory.html#rs03)\n\n</details>\n');
assert(!/\]\(/.test(h2)&&h2.includes('reported-full.html#rs03'),h2);
console.log('OK reported rule/full checks');
