import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const files = fs.readdirSync(path.join(root,'tests')).sort();
const remote = name => /(?:-live|-published|release-public)/.test(name);
const python = process.env.PYTHON || 'python3';
let failed = 0;
function run(command,args,env={}) {
  console.log(`\n> ${command === process.execPath ? 'node' : command} ${args.join(' ')}`);
  const result=spawnSync(command,args,{cwd:root,stdio:'inherit',env:{...process.env,...env}});
  if(result.error)console.error(result.error.message);
  if(result.status!==0){failed++;console.error(`FAILED (${result.status ?? result.signal})`);}
}
if(process.argv.includes('--live')) {
  const selected=process.argv.slice(process.argv.indexOf('--live')+1);
  if(!selected.length){console.log('Remote tests (run individually with npm run test:live -- <filename> [arguments]):\n'+files.filter(remote).join('\n'));process.exit(0);}
  const [name,...args]=selected;
  if(!files.includes(name)||!remote(name))throw new Error('Choose a listed live/published test filename.');
  run(process.execPath,['tests/'+name,...args]);
} else if(process.argv.includes('--browser')) {
  for(const name of files.filter(name=>name.endsWith('.cjs')&&!remote(name)))run(process.execPath,['tests/'+name]);
  for(const [width,height] of [[375,812],[1280,800]])for(const theme of ['light','dark'])for(const test of ['self-practice.mjs','student-management-browser.mjs','today-browser.mjs'])run(process.execPath,['tests/'+test],{GRAMMAR_TEST_BROWSER:'1',GRAMMAR_TEST_VIEWPORT:JSON.stringify({width,height}),GRAMMAR_TEST_THEME:theme});
} else {
  run(python,['-B','scripts/build_cloudflare.py']);
  run(python,['-B','scripts/update_docs.py','--check']);
  run(python,['-B','scripts/validate_content.py']);
  run(python,['-B','-m','unittest','discover','-s','tests','-p','test_*.py']);
  let miniflare=true;
  try {require.resolve('miniflare');}catch(error){if(error.code==='MODULE_NOT_FOUND')miniflare=false;else throw error;}
  for(const name of files.filter(name=>name.endsWith('.mjs')&&!remote(name))) {
    const needsMiniflare=/\b(?:Miniflare|from ['"]miniflare)/.test(fs.readFileSync(path.join(root,'tests',name),'utf8'));
    if(needsMiniflare&&!miniflare){console.log('SKIP (Miniflare not installed): '+name);continue;}
    run(process.execPath,['--import','./scripts/no-network.mjs','tests/'+name],{GRAMMAR_TEST_BROWSER:'0'});
  }
}
if(failed)console.error(`\n${failed} failed checks.`);
else console.log('\nAll selected checks passed.');
process.exitCode=failed?1:0;
