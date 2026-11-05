import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{reconcileStudentSession:merge,rememberAccountDraft:mark}=require('../accounts.js');
const item={id:'test',blanks:[{id:'b'}]},saved={id:'session',items:[item,item],index:0,answers:[],correct:0,draft:null,revision:3};
const previous={remote:{id:'session',revision:3},items:[item,item],index:0,checked:false,draft:['typed']};
let n=0;function test(label,fn){fn();n++;console.log('PASS',label)}
test('legacy unsynced draft recovered',()=>assert.deepEqual(merge(saved,previous).draft,['typed']));
test('marked unsynced draft recovered after reload',()=>{const local=structuredClone(previous);mark(local,['offline']);const r=merge(saved,local);assert.deepEqual(r.draft,['offline']);assert(r.draftPending);assert(r.draftTracked)});
test('explicit empty field preserved',()=>{const local=structuredClone(previous);mark(local,['']);assert.deepEqual(merge({...saved,draft:['server']},local).draft,[''])});
test('radio index zero preserved',()=>{const local={...previous,draft:0};const remote={...saved,items:[{id:'choice',options:['one','two']}],draft:1};assert.equal(merge(remote,local).draft,0)});
test('new remote draft preserved with local recovery choice',()=>{const local=structuredClone(previous);mark(local,['mine']);const r=merge({...saved,revision:4,draft:['other device']},local);assert.deepEqual(r.draft,['other device']);assert.deepEqual(r.draftConflict.submitted,['mine']);assert(!r.draftPending)});
test('conflict survives another reload',()=>{const local=structuredClone(previous);mark(local,['mine']);const remote={...saved,revision:4,draft:['other device']};const r=merge(remote,local);assert.deepEqual(merge(remote,r).draftConflict.submitted,['mine'])});
test('already acknowledged write clears dirty marker',()=>{const local=structuredClone(previous);mark(local,['mine']);const r=merge({...saved,revision:4,draft:['mine']},local);assert(!r.draftPending);assert(!r.draftConflict)});
test('synced old draft does not compete with newer server draft',()=>{const local={...previous,draftTracked:true};const r=merge({...saved,revision:4,draft:['remote']},local);assert.deepEqual(r.draft,['remote']);assert(!r.draftConflict)});
test('new question never receives stale draft',()=>{const local=structuredClone(previous);mark(local,['old question']);const r=merge({...saved,index:1,answers:[{}],draft:['next question'],revision:4},local);assert.deepEqual(r.draft,['next question']);assert(!r.draftPending);assert(!r.draftConflict)});
test('another session never receives draft',()=>{const r=merge({...saved,id:'other'},previous);assert.equal(r.draft,null);assert(!r.draftConflict)});
test('checked result wins over draft',()=>{const local={...previous,checked:true};const r=merge({...saved,index:1,answers:[{correct:true}],revision:4},local);assert(r.checked);assert.equal(r.index,0);assert(!r.draftPending)});
test('invalid/corrupt draft ignored',()=>assert.equal(merge(saved,{...previous,draft:[{},'wrong length']}).draft,null));
console.log(n+' reconciliation checks passed.');
