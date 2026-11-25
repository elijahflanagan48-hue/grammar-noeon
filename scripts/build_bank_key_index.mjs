// Build-time index of sentence keys for the whole bank: id -> concatenated 16-hex prefixes of sha256(key).
// The Worker used to hash ~65k keys at request time and memoise them (+~25 MB heap on top of the ~100 MB parsed bank),
// which exceeded the 128 MB Worker limit (Error 1102) on /assignment-pool for students with long histories.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const generated = resolve(dirname(fileURLToPath(import.meta.url)), '../cloudflare/generated');
const { assignmentSentenceKeys } = await import(pathToFileURL(resolve(generated, 'assignment-keys.mjs')).href);
const bank = JSON.parse(readFileSync(resolve(generated, 'bank.json'), 'utf8'));
const index = {};
for (const item of bank) {
  index[item.id] = assignmentSentenceKeys(item).map(key => createHash('sha256').update(key).digest('hex').slice(0, 16)).join('');
}
writeFileSync(resolve(generated, 'bank-keys.json'), JSON.stringify(index));
console.log(`bank-keys.json: ${bank.length} exercises`);
