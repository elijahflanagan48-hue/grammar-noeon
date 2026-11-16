# Prompt for Codex: Passive Voice v7, the engine and varied selection

> Paste this whole text into Codex (desktop app) in the `grammar-noeon` repository.

---

**First step:** run `git pull origin main` — the files this prompt refers to (`docs/variety/…`, `scripts/passive_v7.py`) were added to GitHub on 2026-11-16 and may not yet be in your local copy. Do all stages in order (1→6), without waiting for confirmation between them.

## Context

The Grammar NOEON site (grammar.noeon.org) is a grammar trainer for Russian-speaking learners. The repository is `elijahflanagan48-hue/grammar-noeon`. Pushing to `main` deploys automatically to Cloudflare, so **nothing goes to `main` until `npm run check` (scripts/check-all.mjs) passes**.

We are rebuilding the Passive Voice bank. Problem: every task in the old bank (`passive-2026-11-09.1`, 1000 items, `data/exercises/part-56…65.json`) was built on one pattern, "a thing + (to V) + a time marker → be + V3", with no active answers, no special constructions and only three formats. Read before you start:
- `docs/variety/passive-v7-spec.md` — the diagnosis, the D1–D11 matrix, formats, limits;
- `docs/variety/passive-v7/plan.json` — the plan of 23 batches;
- `docs/variety/passive-v7/gemini/00-master.md` — the JSONL item format (you write the converter for it);
- `scripts/passive_v7.py` — the existing pipeline (validation of Gemini output, prompts). **Do not change its checks without need**; you may import helpers from it.
- `scripts/build_passive_bank_v6.py` — the current builder: copy its approach to the manifest `data/exercises/index.json`, splitting into `part-*.json`, `accepted_answers`, contractions (`CONTRACT`), and `rule_refs`.

The exercise text is written by Gemini and **checked by Claude**. You do not write or edit exercise text. Your job is the engine.

## Constraints that cannot be broken

1. **Never issue a task the student has already had.** Free practice must not repeat assigned tasks, and later assignments must not repeat free practice (see `freePracticeSentences` in `cloudflare/worker.mjs`). New items get new IDs `pv7-…`. Old items that leave rotation **are not deleted from the data**: history, reports, snapshots of issued assignments and grades must open and display as before.
2. **Desktop and mobile at the same time.** Every new format and filter must be checked on a narrow screen (360–390 px) and on desktop. Long options in "which sentence fits" must wrap, not overflow the screen.
3. **Answer checking accepts every variant from `accepted_answers`**, including contractions and case/space normalisation, just like the existing types.
4. No hints before the answer: no form, no "active/passive" label in the task interface. Only an instruction for the format.
5. The assessments `content/assessments/passive.json` and the related tests (`tests/passive-assessments.mjs`, `tests/passive-integration.mjs`, `tests/passive-tests-release-public.mjs`) must keep working.
6. Do not touch other topics' banks.

## Stage 1. Builder `scripts/build_passive_bank_v7.py`

Input:
- `content/passive-bank/v7/final/B01.jsonl … B23.jsonl` — items **approved by Claude** (same format as `raw/`, see `00-master.md`). Until they exist, test the builder on a small fixture `tests/fixtures/passive-v7-sample.jsonl` (make 10–15 items yourself, one per format and cell; this is test data only and does not go into the bank).
- `content/passive-bank/v7/keep-v6.txt` — IDs of old items that stay in rotation (Claude will fill it; around 150 `open_brackets` + 50 translations + 50 Active→Passive).

Conversion to the site schema (match the field set of existing items; examples: `pv5-s001`, `ig-0005`, `MV-S00-109`):

| `format` | `type` | `layout` / `practice_group` | `instruction_ru` |
|---|---|---|---|
| `gap`, 1–2 gaps | `open_brackets` | `sentence` / `sentence` | «Раскройте скобки.» |
| `mini` | `open_brackets` | `mini_text` / `mini_text` | «Раскройте скобки в тексте.» |
| `mc` | `multiple_choice` | — / `choice` | «Выберите правильный вариант.» |
| `which` | `multiple_choice` | — / `choice` | «Выберите предложение, которое подходит к ситуации.» |
| `fix` | `error_fix` (new shared type, see stage 2) | — / `error_fix` | «Если в предложении есть ошибка, перепишите его правильно. Если ошибки нет, перепишите без изменений.» |

Field details:
- `id`: `pv7-<cell>-<NNN>` (numbering within the cell, stable across rebuilds: keep the mapping `Bxx-NN → pv7-…` in `content/passive-bank/v7/id-map.json` and never reuse a number).
- `topic: "passive"`, `content_version: "passive-2026-11-DD.1"` (the release date), `response_contract`/`answer_profile` — as in v6.
- Gaps: `blanks[].id`, `answer`, `accepted_answers` (+ contracted variants as `CONTRACT` does in v6, without duplicates), `base_verb` = cue, `supplied_words`, `tense_or_construction` = `construction`, `explanation_ru`, `rule_refs`. `answer_text` = prompt with gaps filled in by `answer`. Keep the `(cue)` in `prompt` in the same format as v6, so the existing UI shows the brackets.
- MC/which: `options`, `correct_option_index`, `accepted_option_indices`, `answer`, `summary` (the full correct sentence).
- New metadata on **every** v7 item: `cell` (D1…D11), `genre`, `seed_id`, `skeleton` (from `scripts/audit_variety.py: skeleton(prompt)`), `voice` on each gap.
- `practice_tenses` and `tags`: the cell code `pv_D1…pv_D11` **plus** the constructions of all gaps. Old v6 items from `keep-v6.txt` get `pv_D1`.
- `rule_refs` by cell (anchors in `content/theory/07-passive.md` / `passive.js`): D1 → `pv-table`, `pv-aspect`; D2 → `pv-focus`, `pv-boundaries`; D3 → `pv-modals`; D4 → `pv-nonfinite`; D5 → `pv-reporting`; D6 → `pv-objects`, `pv-phrasal`; D7 → `pv-get`, `pv-causative`; D8 → `pv-patterns`; D9 → `pv-boundaries`; D10 → `pv-agent`; D11 → `pv-questions`. Check that every anchor actually exists and opens in the reference panel during practice.
- `practice_weight` is chosen so that a session gives roughly: single sentences 40%, mini-texts 25%, choice 20%, error correction 7%, translation 4%, Active→Passive 4%.
- Old v6 items **not** in `keep-v6.txt`: keep them in the data, add `retired: "passive-v7"`, and exclude them from free practice, new assignments and automatic practice (`scripts/automatic_practice.py`, the picker in `app.js` and in `cloudflare/worker.mjs` via `generated/selection.mjs`). Already issued assignments with them must open, grade and show as before.
- The builder **fails with an error** if: an id is duplicated; `answer` is not in `accepted_answers`; the number of brackets ≠ the number of gaps; a seed is repeated; an MC has ≠ 4 options; `python3 scripts/passive_v7.py validate` gives errors for any `final/` batch.
- Update `data/exercises/index.json` (counts, types, levels, `content_version`) and `docs/current-release.json` the same way the other builders do.

## Stage 2. `error_fix` type and rendering

- Create a shared type `error_fix` based on the existing `modal_fix` UI (`app.js` line with `item.type==='modal_fix'`): a text area for the whole sentence; grading compares with `accepted_answers` after normalisation (spaces, typographic quotes/apostrophes, final full stop). If there is no error, the correct answer is the original sentence. `modal_fix` must keep working (you may make it an alias).
- Grading on the server (`server/grading.py`, the worker) — add the type in the same places where `modal_fix` is handled.
- `multiple_choice` with long options (`which`): check line wrapping and tap targets on mobile.
- The result screen and the report show the correct answer for `error_fix` as a sentence with the corrected part highlighted, if the existing report can do it for `modal_fix`; otherwise just the full sentence.
- Add the type label in `app.js` (`error_fix: "Исправить ошибку"`) and in the format filter of the passive practice.

## Stage 3. Passive practice filters

Replace `PASSIVE_TARGETS` (now 8 tenses) with groups by cell. Keep the `PASSIVE_LEGACY_TARGETS` mapping and the conversion of saved settings (`oldToNew`, around line 854 of `app.js`) so students' and teachers' old saved presets do not break:

| id | Label |
|---|---|
| `pv_D1` | Формы пассива по временам |
| `pv_D2` | Active или passive? |
| `pv_D3` | Модальные и going to |
| `pv_D4` | Инфинитив и -ing в пассиве |
| `pv_D5` | It is said… / is believed to… |
| `pv_D6` | Два дополнения и предлоги |
| `pv_D7` | Get-passive и have something done |
| `pv_D8` | make, allow, see в пассиве |
| `pv_D9` | Ловушки: состояние, need doing, born |
| `pv_D10` | By, with или без исполнителя |
| `pv_D11` | Вопросы и порядок слов |

- The text under the filters ("При выборе всех форматов: скобки — 80%…") — update it to the new proportions.
- Teacher presets (the `passive-core` block and its neighbours around line 929 of `app.js`): basic → D1 + D2; plus presets "Особые конструкции" (D3–D8) and "Ловушки и порядок слов" (D9–D11).
- The "Формы" / "Зачем пассив" / "Особые конструкции" buttons in the theory (`app.js` line 368) should open practice with the matching cells.
- The weak-topics block / "Сегодня" / the report must show the cell names, not raw codes.

## Stage 4. Varied order inside a session (all topics)

Even a varied bank feels monotonous if similar tasks come one after another.

- In `balancedPractice` (built into `generated/selection.mjs` for the worker — find the source and the build step), **after** the quotas are chosen, add a step `diversifyOrder(items)`: order the session so that neighbouring items differ as much as possible. The key of an item: `cell` (or `tense_or_construction` of the first gap for old banks), `type/layout`, the first two words of `prompt`, the verb of the first gap (`base_verb`), `skeleton` (if missing, compute it with the same function in JS). Penalty for a matching neighbour: cell 3, opening 3, skeleton 3, verb 2, format 1; and for a match at distance 2 — half of that. Greedy: next = the remaining item with the lowest penalty against the last two (ties broken by the existing random order). Spread mini-texts evenly over the session (no two in a row).
- Same in the server picker of the worker and in automatic practice (`scripts/automatic_practice.py`), if it orders items itself.
- Test `tests/practice-variety.mjs`: on a synthetic pool of 200 items with 10 repeating keys, the number of neighbouring matches after `diversifyOrder` is at least 3 times smaller than for random order; the set of items does not change; topic and level quotas are preserved.

## Stage 5. Variety gate in CI

- Add `--gate <json>` mode to `scripts/audit_variety.py`: read limits from `docs/variety/passive-gates.json` and exit with code 1 when they are broken. Create the file:
  ```json
  {"topic":"passive","exclude_retired":true,"max_opening_share":0.02,"max_by_the_share":0.015,"max_verb_uses":6,"max_time_marker_share":0.35,
   "min_active_share_in_D2":0.4,"cell_shares":{"D1":0.30,"D2":0.20,"D3":0.08,"D4":0.08,"D5":0.06,"D6":0.07,"D7":0.07,"D8":0.04,"D9":0.04,"D10":0.03,"D11":0.03},"cell_tolerance":0.03,
   "max_near_duplicate_pairs":0}
  ```
- Connect the gate to `scripts/check-all.mjs` for the passive topic (only items without `retired`).
- The gate must print a clear report: which limit is broken, by how much, and on which items.

## Stage 6. Release

1. `python3 scripts/build_passive_bank_v7.py` → `npm run check` → all tests pass.
2. Browser tests: practice by each cell, each format, a mixed session; desktop and mobile; an old assignment with retired items opens and is graded.
3. Bump the PWA version (`sw.js`, as was done in the previous releases), `docs/CHANGELOG.md`, `PROJECT-STATUS.md`.
4. A report in `docs/variety/passive-v7/RELEASE.md`: how many items by cell/format/level, the output of the variety gate, screenshots of the new formats (desktop + mobile).
5. Push to `main` only after all of the above.

## What to hand back

A short report: what was done in each stage, which files changed, test results, what you could not do and why. If you notice an error in an exercise text, **do not fix it** — list it in the report (id + what is wrong), and Claude will decide.
