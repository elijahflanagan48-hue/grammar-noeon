import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const noopNode = { addEventListener() {}, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } }, setAttribute() {}, querySelectorAll() { return []; } };
const context = {
  module: { exports: {} },
  console,
  document: { querySelector() { return noopNode; }, querySelectorAll() { return []; } },
  window: { addEventListener() {}, scrollTo() {} },
  location: { hash: "#home", reload() {} },
  localStorage: { getItem() { return null; }, setItem() {} },
  fetch: async () => ({ ok: true, json: async () => ({ parts: [], levels: {}, types: {}, total_items: 0, answer_slots: 0 }), text: async () => "" }),
  requestAnimationFrame() {},
  setTimeout,
};
vm.createContext(context);
vm.runInContext(source.replace(/initialise\(\);/, ""), context);
const { normalise, slugify, TYPE_LABELS, THEORY_ROUTE_BY_FILE } = context.module.exports;

assert.equal(normalise(" I've worked.  "), "i've worked");
assert.equal(normalise("I’ve   worked!"), "i've worked");
assert.equal(slugify("Present Perfect Simple"), "present-perfect-simple");
assert.equal(TYPE_LABELS.context_cloze, "Контекстный текст");
assert.equal(THEORY_ROUTE_BY_FILE["03-past.md"], "past");
console.log("Frontend checks passed.");
