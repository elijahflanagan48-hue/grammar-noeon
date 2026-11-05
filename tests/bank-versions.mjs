import assert from 'node:assert/strict';
import {manifest,assertBankVersion} from '../scripts/bank-versions.mjs';
for(const section of Object.keys(manifest.content_versions)) {
 const id=section==='comparison'?'cmp-fixture':'fixture';
 const current=manifest.content_versions[section];
 assertBankVersion({id,topic:section,content_version:current});
 const future=structuredClone(manifest);
 const prefix=current.slice(0,current.lastIndexOf('.'));
 future.content_versions[section]=prefix+'.10';
 assertBankVersion({id,topic:section,content_version:prefix+'.2'},future);
 assert.throws(()=>assertBankVersion({id,topic:section,content_version:prefix+'.11'},future));
 assert.throws(()=>assertBankVersion({id,topic:section,content_version:'old'},future));
}
console.log('Manifest version validation: current/mixed revisions, numeric ordering, invalid/future versions.');
