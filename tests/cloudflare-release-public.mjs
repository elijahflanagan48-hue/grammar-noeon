import {manifest as bankManifest, assertBankVersion} from '../scripts/bank-versions.mjs';
// Read-only post-deployment checks; never logs in or mutates a production account.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const origin=process.argv[2];
assert.ok(['https://grammar.noeon.org','https://grammar-noeon.grammar-noeon.workers.dev','https://grammar-noeon-test.grammar-noeon.workers.dev'].includes(origin));
const root=new URL('../',import.meta.url);
let requests=0;
async function get(path){requests++;return fetch(origin+path,{cache:'no-store'});}
assert.deepEqual(await (await get('/api/health')).json(),{ok:true});
const info=await (await get('/api/auth/info')).json();
assert.equal(info.authProvider,'firebase');
assert.equal(info.demo,false);assert.equal(info.local,false);
for(const path of ['pwa.js','passive.js','passive.css','sw.js','content/theory/07-passive.md','index.html','app.js','accounts.js','notifications.js','practice-report.js','styles.css','manifest.webmanifest','data/exercises/index.json','data/theory.json','content/theory/05-contrasts-and-pitfalls.md']){
 const response=await get('/'+path);assert.equal(response.status,200,path);
 assert.equal(await response.text(),fs.readFileSync(new URL(path,root),'utf8'),path+': published file differs');
}
for(const path of ['/data/exercises/part-01.json','/data/exercises/part-13.json','/data/exercises/part-56.json','/data/exercises/part-65.json','/api/notifications','/api/teacher/reviews','/api/teacher/students/missing/reports/missing/review'])assert.equal((await get(path)).status,401,path);
for(const path of ['/docs/review/PASSIVE-THREE-FORMATS-2026-11-03/REPORT.md','/docs/reports/NOTIFICATIONS-2026-10-28.md','/docs/review/TENSE-CLARITY-2026-10-28.md','/server/app.py','/cloudflare/generated/bank.json','/cloudflare/migrations/0005_notification_reads.sql'])assert.equal((await get(path)).status,404,path);
const manifest=await (await get('/data/exercises/index.json')).json();
assert.equal((await get('/api/attempts/missing')).status,401,'Private work details require authentication');
for(const path of ['/cloudflare/migrations/0006_automatic_format_audit.sql','/docs/review/AUTOMATIC-PRACTICE-LEDGER-2026-10-28.json','/docs/reports/AUTOMATIC-PRACTICE-2026-10-28.md'])assert.equal((await get(path)).status,404,path);
assert.equal(manifest.total_items,bankManifest.total_items);assert.equal(manifest.answer_slots,bankManifest.answer_slots);
assert.equal(manifest.content_versions.tenses,bankManifest.content_versions.tenses);
assert.equal(manifest.content_versions.comparison,bankManifest.content_versions.comparison);
assert.equal(manifest.content_versions.passive,bankManifest.content_versions.passive);
assert.deepEqual(manifest.section_types,bankManifest.section_types);
assert.equal(manifest.types.open_brackets,bankManifest.types.open_brackets);
console.log('Public release verified:',origin,requests+' read-only HTTP checks','matching assets/content, Firebase configuration, private exercise bank, authenticated notifications and hidden editorial/server/migration files. No account or production data writes.');
