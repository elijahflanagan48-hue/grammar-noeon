// Read-only export. Output contains private learning records and stays outside Git.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
const target=process.argv[2];
if(!['test','production'].includes(target))throw new Error('Choose test or production explicitly.');
const config=target==='test'?'cloudflare/wrangler.test.jsonc':'cloudflare/wrangler.jsonc';
const settings=JSON.parse(fs.readFileSync(path.join(root,config),'utf8'));
const database=target==='test'?'grammar-noeon-test':'grammar-noeon';
if(settings.d1_databases?.[0]?.database_name!==database)throw new Error('Database binding does not match the selected environment.');
const directory=path.resolve(root,'../../private/backups/cloudflare');
fs.mkdirSync(directory,{recursive:true,mode:0o700});
const output=path.join(directory,`${database}-${new Date().toISOString().replace(/[:.]/g,'-')}.sql`);
const result=spawnSync(process.execPath,[path.join(root,'scripts/cloudflare.mjs'),'d1','export',database,'--config',config,'--remote','--output',output,'--skip-confirmation'],{cwd:root,encoding:'utf8'});
// Wrangler prints a signed download URL; do not expose it in chat or shared logs.
for(const text of [result.stdout,result.stderr])if(text)process.stdout.write(text.replace(/https:\/\/\S+/g,'[private download link hidden]'));
if(result.error)throw result.error;
if(result.status===0){fs.chmodSync(output,0o600);console.log('Private backup:',output);}
process.exitCode=result.status??1;
