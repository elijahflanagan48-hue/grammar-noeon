// Versioned editorial regression suites use their saved input revisions.
// Current distinct cloze data are checked in distinct-cloze.mjs.
import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const distinct=new Map(read('docs/review/DISTINCT-CLOZE-2026-10-31/before-records.json').map(i=>[i.id,i]));
const variety=new Map(read('docs/review/CLOZE-VARIETY-2026-10-31/before-records.json').map(i=>[i.id,i]));
export const beforeDistinctCloze=bank=>bank.map(i=>distinct.get(i.id)||i);
export const beforeClozeVariety=bank=>beforeDistinctCloze(bank).map(i=>variety.get(i.id)||i);

const constructions=new Map(read('docs/review/ADJECTIVES-CONSTRUCTIONS-2026-11-01/before-records.json').map(i=>[i.id,i]));
export const beforeAdjectiveConstructions=bank=>beforeAdjectiveMix(bank).map(i=>constructions.get(i.id)||i);

const mixed=new Map(read('docs/review/ADJECTIVES-MIXED-2026-11-01/before-records.json').map(i=>[i.id,i]));
export const beforeAdjectiveMix=bank=>beforeAdjectiveClarity(bank).map(i=>mixed.get(i.id)||i);

const clarity=new Map(read('docs/review/ADJECTIVES-CLARITY-2026-11-01/before-records.json').map(i=>[i.id,i]));
export const beforeAdjectiveClarity=bank=>bank.map(i=>clarity.get(i.id)||i);
