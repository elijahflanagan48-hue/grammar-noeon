// Собирает content/theory/12-conditionals-rule.html из conditionals.js (тот же текст, что на странице правила).
import fs from 'node:fs';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('conditionals.js', root), 'utf8') + ';globalThis.__html = CONDITIONALS_RULE_CONTENT;', ctx);
fs.writeFileSync(new URL('content/theory/12-conditionals-rule.html', root), ctx.__html + '\n');
console.log('content/theory/12-conditionals-rule.html', ctx.__html.length);
