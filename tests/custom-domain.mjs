import fs from 'node:fs';
import assert from 'node:assert/strict';
const file = new URL('../cloudflare/.domain-worker.mjs', import.meta.url);
try {
  fs.writeFileSync(file, fs.readFileSync(new URL('../cloudflare/worker.mjs', import.meta.url), 'utf8').replace("from './generated/bank.json';", "from './generated/bank.json' with {type:'json'};"));
  const {default: worker} = await import(file);
  const db = {prepare(sql) {return {bind() {return this;}, async first() {return sql.includes('app_meta') ? {value:'grammar-noeon'} : null;}};}};
  const old = 'https://grammar-noeon.grammar-noeon.workers.dev', custom = 'https://grammar.noeon.org';
  const env = {PUBLIC_ORIGIN:old, ADDITIONAL_ORIGINS:custom, DB:{withSession() {return db;}}};
  const get = origin => worker.fetch(new Request(origin+'/api/auth/me'), env);
  for (const origin of [old, custom]) {
    const r = await get(origin); assert.equal(r.status,200); assert.deepEqual(await r.json(),{user:null});
  }
  for (const origin of ['http://grammar.noeon.org','https://untrusted.test','https://grammar.noeon.org.attacker.test']) assert.equal((await get(origin)).status,503);
  for (const [host, origin] of [[custom, old],[old,custom],[custom,'https://attacker.test']]) {
    const r = await worker.fetch(new Request(host+'/api/auth/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'{}'}),env);
    assert.equal(r.status,403);
  }
  const crossSite = await worker.fetch(new Request(custom+'/api/auth/login',{method:'POST',headers:{Origin:custom,'Sec-Fetch-Site':'cross-site','Content-Type':'application/json'},body:'{}'}),env);
  assert.equal(crossSite.status,403);
  for (const host of [old, custom]) {
    const r = await worker.fetch(new Request(host+'/api/auth/login',{method:'POST',headers:{Origin:host,'Content-Type':'text/plain'},body:'{}'}),env);
    assert.equal(r.status,415);
  }
  assert.equal((await worker.fetch(new Request(custom+'/api/auth/me'),{...env,ADDITIONAL_ORIGINS:''})).status,503);
  console.log('Custom domain: both explicit HTTPS hosts, host-bound POST origin, cross-site denial, unknown hosts and unchanged content-type checks passed.');
} finally {fs.rmSync(file,{force:true});}
