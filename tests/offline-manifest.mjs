import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const handlers={};let responsePromise, network=true;
const cached=new Map();
const cache={async addAll(requests){for(const request of requests)cached.set(new URL(request.url).pathname,new Response('cached'));},async match(key){return cached.get(key)?.clone();},async put(key,response){cached.set(key,response);}};
const origin='https://grammar.test/';
const context={URL,Response,Request:class extends Request{constructor(url,init){super(new URL(url,origin),init);}},setTimeout,clearTimeout,
 self:{location:{href:origin+'sw.js',origin:new URL(origin).origin},addEventListener(name,fn){handlers[name]=fn;},clients:{claim(){}},skipWaiting(){}},
 caches:{async open(){return cache;},async keys(){return ['grammar-test'];}},
 fetch:async()=>{if(!network)throw Error('offline');return Response.json({total_items:17,answer_slots:23});}};
vm.createContext(context);vm.runInContext(fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8'),context);
let install;handlers.install({waitUntil(p){install=p;}});await install;
assert(cached.has('/data/exercises/index.json'));
assert([...cached.keys()].every(key=>!key.includes('/api/')&&!/part-.*\.json/.test(key)));
for(const pathname of ['/api/auth/me','/data/exercises/part-01.json','/data/exercises/other.json']){
 let handled=false;handlers.fetch({request:new Request(origin+pathname.slice(1)),respondWith(){handled=true;}});assert.equal(handled,false,pathname);
}
async function request(){responsePromise=null;handlers.fetch({request:new Request(origin+'data/exercises/index.json'),respondWith(p){responsePromise=p;},waitUntil(p){p.catch(()=>{});}});return responsePromise;}
assert.deepEqual(await (await request()).json(),{total_items:17,answer_slots:23});
network=false;
assert.deepEqual(await (await request()).json(),{total_items:17,answer_slots:23});
// A failed fetch during initialise must read the cached manifest, not invented totals.
const ctx={module:{exports:{}},document:{querySelector(){return {}}},localStorage:{getItem(){return null;}},fetch:async()=>{throw Error('offline');},caches:{async keys(){return ['grammar-test'];},async open(){return cache;}}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(new URL('../app.js',import.meta.url),'utf8'),ctx);
assert.equal((await vm.runInContext('fetchBankManifest()',ctx)).total_items,17);
console.log('Offline manifest: precache, network refresh, fallback, app cache fallback, API/part exclusion passed.');
