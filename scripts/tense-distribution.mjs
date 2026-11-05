import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {exerciseTenses, PRACTICE_TENSES} from '../cloudflare/generated/selection.mjs';
import {reportFieldTopics} from '../cloudflare/generated/topics.mjs';

export const root = new URL('../', import.meta.url);
export const read = name => JSON.parse(fs.readFileSync(new URL(name, root), 'utf8'));
export function distribution(bank) {
  return PRACTICE_TENSES.filter(t => !t.id.startsWith('cmp_') && !t.id.startsWith('pv_') && t.id !== 'other_constructions').map(t => {
    const items = bank.filter(i => exerciseTenses(i).includes(t.id));
    const pure = items.filter(i => exerciseTenses(i).length === 1);
    const levels = Object.fromEntries(['basic','medium','advanced'].map(level => [level, pure.filter(i => i.level === level).length]));
    let fields = 0;
    for (const item of bank) {
      if (item.blanks) item.blanks.forEach((_, n) => { if (reportFieldTopics(item,n).includes(t.id)) fields++; });
      else if (exerciseTenses(item).includes(t.id)) fields++;
    }
    return {id:t.id, label:t.label, items:items.length, pure:pure.length, fields, levels};
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const index = read('data/exercises/index.json');
  const bank = index.parts.flatMap(p => read(p.file));
  console.log(JSON.stringify({versions:index.content_versions, total:index.total_items, answerSlots:index.answer_slots, distribution:distribution(bank)}, null, 2));
}
