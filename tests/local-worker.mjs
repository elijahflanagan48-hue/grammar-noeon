// Requires Miniflare: smoke test the documented isolated local development command.
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const result=spawnSync(process.execPath,['scripts/local-worker.mjs','--smoke'],{encoding:'utf8',timeout:60000});
console.log(result.stdout);
assert.equal(result.status,0,result.stderr);
