import vm from 'node:vm';import fs from 'node:fs';import assert from 'node:assert/strict';
const R=new URL('../',import.meta.url).pathname;
const ctx={module:{exports:{}},document:{querySelector(){}},localStorage:{getItem(){return null}}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(R+'app.js','utf8'),ctx);vm.runInContext(fs.readFileSync(R+'nouns-rule.js','utf8'),ctx);
const html=ctx.nounsRuleHtml('ref-');
assert(html.startsWith('<div class="mv nr"'));
assert.equal((html.match(/<section class="mv-sec"/g)||[]).length,11);
assert(!/\]\(|accepted_answers/.test(html),'no raw markdown or answers');
assert((html.match(/<table/g)||[]).length>=30,'tables carry the content');
assert((html.match(/<details class="nr-more"/g)||[]).length>=8,'details on demand');
assert((html.match(/class="nr-quiz"/g)||[]).length>=4,'self-checks');
// every heading of the markdown reference must stay reachable as an anchor of the page
const src=fs.readFileSync(R+'app.js','utf8');
const siteSlug=eval(src.match(/const slugify = (\(text\) => [\s\S]*?);\n/)[1]);
const headings=[...fs.readFileSync(R+'content/theory/09-nouns.md','utf8').matchAll(/^#{2,4}\s+(.+)$/gm)].map(x=>siteSlug(x[1]));
for(const h of headings)assert(html.includes('id="ref-'+h+'" data-nouns-id="'+h+'"'),'missing anchor '+h);
for(let n=1;n<=11;n++)assert(html.includes('data-nouns-anchor="nr-'+n+'"'),'nav '+n);
const sw=fs.readFileSync(R+'sw.js','utf8');for(const f of ['nouns-rule.js','nouns-rule.css'])assert(sw.includes('"'+f+'"'),f);
console.log('OK nouns rule format checks');
