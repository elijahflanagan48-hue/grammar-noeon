import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context={module:{exports:{}},document:{querySelector(){}},localStorage:{getItem(){return null}},navigator:{onLine:true}};
vm.createContext(context);vm.runInContext(fs.readFileSync(new URL('../app.js',import.meta.url),'utf8').replace(/initialise\(\);/,''),context);
const get=source=>vm.runInContext(source,context),error=get('practiceCountError');
for(const n of [1,7,17,33,49,50])assert.equal(error({elements:{count:{value:String(n),min:'1'}}}),'');
for(const value of ['',0,-1,1.5,51,'invalid',Infinity])assert(error({elements:{count:{value:String(value),min:'1'}}}));
assert(error({elements:{count:{value:'7',min:'13'}}}),'Selected Tenses coverage keeps its lower bound');
assert.equal(error({elements:{count:{value:'17',min:'13'}}}),'');
context.calls=0;get('accountRequest=async()=>{calls++;throw Error("Unexpected request");}');
for(const value of ['',0,1.5,51]){
 const node={textContent:''};context.form={elements:{count:{value:String(value),min:'1'}},querySelector(){return node;}};
 await get('startSession({preventDefault(){},currentTarget:form})');assert(node.textContent.includes('целое количество'));
}
assert.equal(context.calls,0,'Invalid quantities cannot start or assign through the programmatic entry point');
console.log('Custom quantities: 1/7/17/33/49/50, empty/fraction/out-of-range rejection, Tenses lower bound and no-request submit guard passed.');
