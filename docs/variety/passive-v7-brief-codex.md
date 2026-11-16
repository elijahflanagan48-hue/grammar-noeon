# Brief for Codex: engine work for Passive Voice v7 and varied practice

Context: `docs/variety/passive-v7-spec.md`. Content (JSONL from Gemini, reviewed by Claude) arrives in `content/passive-bank/v7/*.jsonl`.

## 1. Bank builder `scripts/build_passive_bank_v7.py`

- Reads `content/passive-bank/v7/*.jsonl` plus a list of retained old IDs `content/passive-bank/v7/keep-v6.txt`.
- Converts items to the site schema (see existing `open_brackets`, `multiple_choice`, `context_cloze`, `modal_fix`, `translation_ru_en`, `active_to_passive` items):
  - `gap` with one gap → `open_brackets` / layout `sentence`; with several → `open_brackets` / layout `mini_text`;
  - `mc` and `which` → `multiple_choice` (`which` puts the situation in `prompt` and full sentences in `options`);
  - `fix` → a correction type (reuse the `modal_fix` UI as a shared `error_fix` type; `has_error:false` means the correct answer is the unchanged sentence).
- New IDs `pv7-<cell>-NNN`; `content_version` = `passive-2026-11-XX.1`.
- `tense_or_construction`, `practice_tenses` and `tags` come from `construction`. Add `cell`, `genre` and `skeleton` (computed with `audit_variety.skeleton`) to each item.
- Active answers in D2 must be graded as correct as normal; do not apply any "passive only" rule to them.
- Old items not in `keep-v6.txt` are removed from free practice and new assignments, but remain readable for history, reports and already-issued snapshots. Keep the no-overlap rule: never issue a task the student has already had.

## 2. Practice filters

Replace `PASSIVE_TARGETS` with groups that line up with the D cells: forms by tense (D1), "Active or passive?" (D2), modal and going to (D3), infinitive and -ing (D4), it is said / is believed to (D5), two objects and prepositions (D6), get and have something done (D7), make / allow / see (D8), traps: state, need doing, born (D9), by / with (D10), questions and word order (D11). The format checkboxes should include the new types. Everything must work on desktop and mobile.

## 3. Varied selection inside a session (all topics)

In `app.js` (`balancedPractice` / the session picker) and in the server-side picker (if separate), after the quotas are chosen, order the session so that two neighbouring items do not share:
the `cell` (or `tense_or_construction` for older banks), the format, the first two words of `prompt`, the verb of the answer, or the `skeleton`. Spread mini-texts evenly. If a perfect order is impossible, minimise the conflicts greedily. Add a unit test in `tests/`.

## 4. Variety gate in CI

`scripts/check-all.mjs` → call `python3 scripts/audit_variety.py passive --gate docs/variety/passive-gates.json`. Release is blocked if the limits in section 5 of the spec are broken (same opening > 2%, a verb > 6 times, explicit time marker > 35%, any cell outside its quota by more than ±3 percentage points). Add a `--gate` mode to `audit_variety.py`.

## Do not

- write or rewrite exercise text (that is Gemini + Claude);
- touch other topics' banks;
- push without `check-all` passing.
