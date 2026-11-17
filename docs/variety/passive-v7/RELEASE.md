# Passive Voice v7 — engine verification, release blocked

Date: 2026-11-16 (Europe/Istanbul). `git pull origin main` completed: already up to date. Engine changes are prepared for the passive-v7-engine branch. No merge into main or deployment is part of this change.

## Release blocker

All 23 approved `content/passive-bank/v7/final/B01.jsonl`–`B23.jsonl` files and `content/passive-bank/v7/keep-v6.txt` are missing. No production exercise text was written or edited. The eleven permitted engine fixtures are outside the production bank. The production builder rejects missing release inputs without modifying the bank.

## Stages 1–6

1. **Builder implemented and fixture-tested.** Converts gap, mini, mc, which and fix; imports the unchanged editorial validator and v6 variant helpers; checks anchors; persists stable source-to-site IDs with tombstones; retains all old items and archives unselected ones. Validates duplicate IDs/seeds, bracket counts, canonical answers and four-choice options. Computes the six practice weights (40/25/20/7/4/4), parts, counts, versions and release metadata. Rebuild tests verify stable IDs, archived grading and byte-for-byte preservation of another topic’s part. The real bank build remains blocked by missing approved inputs.

2. **Shared `error_fix` implemented.** Whole-sentence textarea, full visible instruction including the no-error case, accepted variants, space/case/typographic quote/final punctuation normalisation, Worker/Python grading, draft recovery and legacy-format upgrade compatibility. Feedback and reports show the complete correct sentence. Existing `modal_fix` remains supported. Long choices wrap and provide at least 44 px tap targets.

3. **Passive filters implemented.** Eleven named cells, migration of the seven legacy groups and eight former tense IDs, basic/special/traps presets, updated proportions, theory-section practice links, and cell names in reports and saved lightweight history. Construction tags remain in the bank but cell filters do not require students to select those tags separately. Older API filter requests also migrate.

4. **Varied ordering implemented for every topic.** Selection quotas run first; greedy ordering scores cell/construction, opening, skeleton, verb and type/layout against the last two items using weights 3/3/3/2/1 and half weight at distance two. Ties retain incoming random order. Mini-text separation is enforced whenever possible. The Worker imports generated code from `app.js`. `scripts/automatic_practice.py` is a bank-format converter, not a session picker: it now leaves archived items untouched; it has no independent ordering path. Retired records are excluded from fresh browser/Worker selections, explicit-ID assignments, remediation with new items and library delivery. Existing assignment snapshots still open and grade. Passive library delivery cannot bypass no-repeat protection with `allowRepeat`.

5. **Strict variety gate implemented and connected to `npm run check`.** The JSON limits are exactly those requested. Violations report measured values, limits, excess/shortfall and affected IDs. Retired items are excluded. Limits were not weakened to accommodate v6. The verb limit uses explicit gap `base_verb` cues, matching the existing audit’s available metadata; MC/fix rows do not contain lexical base-verb metadata in the supplied source schema.

6. **Release preparation and available verification completed; publication blocked.** PWA cache bumped from grammar-v94 to grammar-v95; changelog and generated project status updated. Desktop/mobile screenshots and test logs are attached. The production build and final-bank browser tests cannot run without editorial inputs. The strict gate rejects the existing bank, so the required all-green release condition is unmet and no main push occurred. The published-release record is updated by the builder only when approved inputs can be built.

## Counts

Production bank remains `passive-2026-11-09.1`: **1,000 old records, zero published v7 records**, zero records retired by this change. All current records belong to legacy D1 for the new filters. The future active/archived split cannot be reported until Claude supplies the retention list.

| Production format | Items |
|---|---:|
| sentence | 600 |
| mini_text | 200 |
| translation | 100 |
| transformation | 100 |

| Production level | Items |
|---|---:|
| advanced | 334 |
| basic | 314 |
| medium | 352 |

Fixture counts below are **test data only**, not a release bank. Each cell D1–D11 has one fixture.

| Fixture source format | Items |
|---|---:|
| fix | 2 |
| gap | 6 |
| mc | 1 |
| mini | 1 |
| which | 1 |

Fixture levels: basic 3, medium 4, advanced 4.

## Verification

- Full `npm run check`: **fails the variety gate on the unchanged v6 bank**; all other runnable checks passed. There are 42 passing Python tests, including six builder/gate/archive tests. The runner skips 25 checks whose historical audit/source archives are absent. [Public check summary](check-output.txt).
- New engine integration: 11 fixtures and 16 accepted-answer variants; browser/Worker/Python behaviour checked; stable settings migration, no-error correction and retired grading covered.
- All five passive assessment forms / 125 questions: original SHA-256 seal and canonical grading pass. Existing modal correction compatibility passes.
- Selection variety: 200 synthetic records, adjacent repeated cell keys **16 → 0**, same item set and quotas, Python/JS skeleton parity.
- Browser: **39 cell/format/mixed/retired checks at 360, 390 and 1280 px**, including all cell anchors, long-option wrapping and tap targets, full instructions, feedback/report correct sentences, readable cell labels and actual student resumption/grading of an archived assignment. [Browser output](browser-output.txt).
- Existing no-overlap test (`tests/free-vs-assigned.mjs`) passes; no student production data was accessed.
- `git diff --check` passes. Other topics’ production exercise parts and `content/assessments/passive.json` are unchanged.

**Unavailable checks:** 25 historical checks lack their required input archives in this checkout. They are not represented as passing. The v7 test independently checks the actual assessment seal and grading. Remote release verification was not run because no release occurred.

## Variety gate output

Command: `python3 scripts/audit_variety.py --gate docs/variety/passive-gates.json` → exit **1**. [Complete output with item IDs](variety-gate.txt).

Examples from the current bank: opening “by the” 5% vs 2%; “By the time/end” 4.9% vs 1.5%; time markers 39% vs 35%; no D2 active gaps; D1 share 100% vs target 30% ± 3%. Further repeated-verb and cell-share failures are listed in the linked output.

## Screenshots (isolated test fixtures)

| Format | Desktop 1280 px | Phone 360 px | Phone 390 px |
|---|---|---|---|
| Which sentence fits | [Desktop](screenshots/pv7-D7-001-1280.png) | [360 px](screenshots/pv7-D7-001-360.png) | [390 px](screenshots/pv7-D7-001-390.png) |
| Error correction | [Desktop](screenshots/pv7-D8-001-1280.png) | [360 px](screenshots/pv7-D8-001-360.png) | [390 px](screenshots/pv7-D8-001-390.png) |
| No-error correction | [Desktop](screenshots/pv7-D9-001-1280.png) | [360 px](screenshots/pv7-D9-001-360.png) | [390 px](screenshots/pv7-D9-001-390.png) |
| Multiple choice | [Desktop](screenshots/pv7-D10-001-1280.png) | [360 px](screenshots/pv7-D10-001-360.png) | [390 px](screenshots/pv7-D10-001-390.png) |

## Main files changed

- Builder and selection: `scripts/build_passive_bank_v7.py`, `app.js`, `scripts/build_cloudflare.py`.
- Rendering, grading and reports: `accounts.js`, `practice-report.js`, `practice-design.css`, `cloudflare/worker.mjs`, `cloudflare/teacher-library.mjs`, `server/app.py`, `server/grading.py`.
- Validation: `scripts/audit_variety.py`, `scripts/check-all.mjs`, `scripts/validate_content.py`, `docs/variety/passive-gates.json`.
- Tests: `tests/passive-v7.mjs`, `tests/passive-v7-browser.cjs`, `tests/practice-variety.mjs`, `tests/test_passive_v7.py`, isolated fixtures.
- Documentation and PWA: this report and screenshots, `docs/CHANGELOG.md`, `PROJECT-STATUS.md`, `sw.js`.

## Exercise text observations

No production exercise text was changed. No approved v7 exercise text was available for review, so there are no v7 item IDs to send back for editorial correction. Intentional errors in `tests/fixtures/passive-v7-sample.jsonl` test the correction UI and are not editorial findings.

## Remaining release work

After the approved batches and retention list arrive: run the production builder, review the resulting active/archived counts and generated ID map, run `npm run docs:update` and `npm run check`, then test actual final-bank sessions on desktop/mobile and the unchanged issued assignments. Update the release report from fixture evidence to real-bank evidence. Push to main only when those checks pass. No relaxation of the gate or generated substitute exercise text is authorised by this implementation.
