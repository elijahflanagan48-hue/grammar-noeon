// Read-only release verification. No authentication or production writes.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const origin=process.argv[2];
assert(['https://grammar.noeon.org','https://grammar-noeon.grammar-noeon.workers.dev'].includes(origin));
let requests=0;
async function get(path){requests++;return fetch(origin+path,{cache:'no-store',signal:AbortSignal.timeout(30000)});}
const response=await get('/assessments.js');assert.equal(response.status,200);
assert.equal(await response.text(),fs.readFileSync(new URL('../assessments.js',import.meta.url),'utf8'));
for(const path of ['/api/tests',...Array.from({length:5},(_,n)=>'/api/tests/passive-'+(n+1)),'/api/test-attempts/missing'])assert.equal((await get(path)).status,401,path);
for(const path of ['/content/assessments/passive.json','/content/assessments/passive.lock.json','/content/assessments/passive-authored.txt','/cloudflare/generated/assessments.json','/cloudflare/generated/assessment-config.mjs','/docs/review/PASSIVE-TESTS-2026-11-03/item-review.json','/scripts/build_passive_tests.py'])assert.equal((await get(path)).status,404,path);
console.log(JSON.stringify({origin,requests,result:'passed',checks:'Published assessment UI matches; all five forms and attempts require authentication; keys, locks, authored source and editorial files are private.',productionWrites:false}));
