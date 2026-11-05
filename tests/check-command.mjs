import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const result=spawnSync(process.execPath,['scripts/check-all.mjs','--live'],{encoding:'utf8'});
assert.equal(result.status,0,result.stderr);
for(const name of ['cloudflare-live-check.mjs','cloudflare-assignments-live.mjs','cloudflare-release-public.mjs','pwa-published.cjs'])assert(result.stdout.includes(name),name);
assert(!result.stdout.includes('self-practice.mjs'));
console.log('Check commands: live alias and published checks isolated from the default suite.');
