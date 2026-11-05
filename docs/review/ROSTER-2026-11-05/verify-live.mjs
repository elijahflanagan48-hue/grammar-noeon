import fs from 'node:fs';import assert from 'node:assert/strict';
let checks=0;for(const origin of ['https://grammar.noeon.org','https://grammar-noeon.grammar-noeon.workers.dev']){
for(const file of ['index.html','students-roster.js','students-roster.css','sw.js','accounts.js','app.js','data/exercises/index.json']){const r=await fetch(origin+'/'+file,{signal:AbortSignal.timeout(30000)});assert.equal(r.status,200,file);assert(Buffer.from(await r.arrayBuffer()).equals(fs.readFileSync(file)),file);checks++}
assert.equal((await fetch(origin+'/api/teacher/students')).status,401);assert.equal((await fetch(origin+'/data/exercises/part-01.json')).status,401);checks+=2}
console.log(JSON.stringify({checks,byteExact:true,privateStudents:true,privateBank:true}));
