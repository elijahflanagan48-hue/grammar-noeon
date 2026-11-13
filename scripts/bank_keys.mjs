// Считает на этапе сборки sha256-ключи предложений банка (bank-keys.json).
// Раньше Worker делал это при каждом запуске (~37 тыс. хешей), и запуск упирался в лимит Cloudflare.
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { assignmentSentenceKeys } from '../cloudflare/generated/assignment-keys.mjs';
const dir = new URL('../cloudflare/generated/', import.meta.url);
const text = fs.readFileSync(new URL('bank.json', dir), 'utf8');
const bank = JSON.parse(text);
const digest = value => createHash('sha256').update(value).digest('hex');
const keys = Object.fromEntries(bank.map(item => [item.id, assignmentSentenceKeys(item).map(digest)]));
fs.writeFileSync(new URL('bank-keys.json', dir), JSON.stringify(keys));
console.log(`Bank keys: ${bank.length} exercises.`);
