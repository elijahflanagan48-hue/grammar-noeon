// Run the actual Worker and SQL in-process when a test does not need workerd.
// This checks application behaviour; it does not replace edge-runtime tests.
import {DatabaseSync} from 'node:sqlite';
import {AsyncLocalStorage} from 'node:async_hooks';
import {build} from 'esbuild';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../',import.meta.url));
const outbound=new AsyncLocalStorage(),originalFetch=globalThis.fetch;
globalThis.fetch=(input,init)=>outbound.getStore()?.(new Request(input,init))??originalFetch(input,init);

export async function workerFixture(identityService){
  const sqlite=new DatabaseSync(':memory:');
  sqlite.exec(fs.readFileSync(root+'cloudflare/schema.sql','utf8'));
  class Statement{
    constructor(sql,values=[]){this.sql=sql;this.values=values;}
    bind(...values){return new Statement(this.sql,values);}
    async first(column){const row=sqlite.prepare(this.sql).get(...this.values);return row?(column?row[column]:{...row}):null;}
    async all(){return {success:true,results:sqlite.prepare(this.sql).all(...this.values).map(r=>({...r}))};}
    async run(){const r=sqlite.prepare(this.sql).run(...this.values);return {success:true,meta:{changes:Number(r.changes),last_row_id:Number(r.lastInsertRowid)}};}
  }
  const db={prepare:sql=>new Statement(sql),withSession(){return this;},async batch(statements){
    sqlite.exec('BEGIN');try{const results=[];for(const s of statements)results.push(/^\s*(SELECT|WITH)/i.test(s.sql)?await s.all():await s.run());sqlite.exec('COMMIT');return results;}catch(error){sqlite.exec('ROLLBACK');throw error;}
  }};
  const bundle=await build({entryPoints:[root+'cloudflare/worker.mjs'],bundle:true,write:false,platform:'node',format:'esm'});
  const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].contents).toString('base64'));
  const env={DB:db,PUBLIC_ORIGIN:'https://grammar.test',OWNER_SETUP_CODE:'fictional-owner-code',FIREBASE_API_KEY:'fictional-public-api-key',ASSETS:{fetch:()=>new Response('',{status:404})}};
  return {db,dispatchFetch(url,init){return outbound.run(identityService,()=>worker.fetch(new Request(url,init),env));},dispose(){sqlite.close();}};
}
