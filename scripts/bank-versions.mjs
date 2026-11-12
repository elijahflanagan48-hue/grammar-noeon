import fs from 'node:fs';
import assert from 'node:assert/strict';
export const manifest = JSON.parse(fs.readFileSync(new URL('../data/exercises/index.json', import.meta.url), 'utf8'));
export function versionParts(version, section) {
  const match = String(version).match(new RegExp(`^${section}-(\\d{4})-(\\d{2})-(\\d{2})\\.(\\d+)$`));
  assert(match, `Invalid ${section} content version: ${version}`);
  return match.slice(1).map(Number);
}
export function assertBankVersion(item, index = manifest) {
  const section = ['passive','modals','reported','nouns','speaking','infinitive'].includes(item.topic) ? item.topic : item.id.startsWith('cmp-') ? 'comparison' : 'tenses';
  const current = versionParts(index.content_versions[section], section);
  const actual = versionParts(item.content_version, section);
  const difference = actual.map((n, k) => n - current[k]).find(n => n !== 0) || 0;
  assert(difference <= 0, `${item.id}: version newer than manifest`);
}
