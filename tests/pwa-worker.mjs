import fs from 'node:fs';
import assert from 'node:assert/strict';
const file=process.cwd()+'/cloudflare/.stage5-worker.mjs';
try {
fs.writeFileSync(file,fs.readFileSync('cloudflare/worker.mjs','utf8').replace("from './generated/bank.json';", "from './generated/bank.json' with {type:'json'};"));
const {default:worker}=await import(file);
const db={prepare(sql){return {bind(){return this},async first(){return sql.includes('app_meta')?{value:'grammar-noeon'}:null}}}};
const env={PUBLIC_ORIGIN:'https://grammar.test',DB:{withSession(){return db}},ASSETS:{fetch:async()=>new Response('asset',{headers:{'Cache-Control':'public, max-age=1000'}})}};
for(const url of ['/','/index.html','/sw.js']){for(const url of ['/wixt-lat.woff2','/icons/icon-192.png','/favicon.svg','/app.js?v=test','/styles.css?v=test']){const r=await worker.fetch(new Request('https://grammar.test'+url),env);assert.equal(r.headers.get('Cache-Control'),'public, max-age=31536000, immutable',url);}
for(const url of ['/index.html?v=test','/sw.js?v=test','/?v=test']){const r=await worker.fetch(new Request('https://grammar.test'+url),env);assert.equal(r.headers.get('Cache-Control'),'no-cache',url);}
const privatePart=await worker.fetch(new Request('https://grammar.test/data/exercises/part-01.json?v=test'),env);assert.equal(privatePart.status,401);assert.equal(privatePart.headers.get('Cache-Control'),'no-store');
const r=await worker.fetch(new Request('https://grammar.test'+url),env);assert.equal(r.headers.get('Cache-Control'),'no-cache');console.log('PASS no-cache',url)}
const r=await worker.fetch(new Request('https://grammar.test/api/auth/me'),env);assert.equal(r.status,200);assert.deepEqual(await r.json(),{user:null});console.log('PASS guest auth/me 200 user:null');
}finally{fs.rmSync(file,{force:true})}
