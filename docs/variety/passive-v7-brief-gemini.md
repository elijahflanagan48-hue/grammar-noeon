# Brief for Gemini: Passive Voice v7, generation by cells

Read first: `docs/variety/passive-v7-spec.md` (matrix D × F × C, limits) and the rule `content/theory/07-passive.md`.
Learners: Russian-speaking, school and adult, levels basic / medium / advanced (by sentence complexity, not CEFR). Editorial language: British English.

## What one request asks for

One cell, one batch: **40 items**. Example: "D2, 40 items: 24 single sentences, 10 mini-texts/dialogues with 2–4 gaps, 6 multiple choice; levels 12 basic / 16 medium / 12 advanced".

## Hard requirements

1. Every item must make the learner **decide** something real. In D2, 40–50% of the gaps have an **active** answer, and the active cases must be natural (verbs without a passive such as arrive, happen, disappear, consist of; or the subject really is the doer).
2. No hints before the answer. Only the context decides the form. An explicit time marker (yesterday, by the time, since, now…) is allowed in at most 1 in 3 items. Otherwise the previous sentence, the dialogue line or the situation decides.
3. Variety inside a batch:
   - no two items open with the same two words;
   - no verb in a gap more than twice;
   - no two items share the same structure (subject type + gap position + cue type);
   - subjects mix things, people (I / she / the players were told / offered / asked) and it / what / who / abstract nouns;
   - gap position varies: main clause, relative clause, after a modal, after a conjunction, in a question, at the end;
   - genres (news, notice, instructions, process, history, accident report, review, dialogue, chat message, school/work, travel, sport, tech, health, nature, arts): at least 8 different ones per batch.
4. Stop-list: `docs/variety/passive-stoplist.json`. Do not use `overused_openings` or `overused_subjects`, and avoid `banned_frames`. Verbs from `overused_verbs` are banned in D1/D2. In D3–D11 they are allowed only when the construction needs them (give/tell/send for two objects, and so on).
5. Natural, authentic English: something a real person would say or write. No sentence written just for the form ("The window is washed every day" with no reason).
6. `accepted_answers` lists **all** correct variants: contractions ('s, 're, 'd, won't), will ↔ be going to where both fit, have ↔ get in causatives, Past Simple where Present Perfect is not required, `need washing` ↔ `need to be washed`.
7. `explanation_ru`: 1–2 short sentences in Russian. Say why this form fits; for D2, why active or passive. No source tags.
8. Do not reuse the gold examples from the spec or their storylines.

## Output format: JSONL, one item per line

Gap tasks use `(cue)` in brackets inside `prompt`. When there are several gaps, the cues appear in order. The cue is the bare infinitive with `to`, plus any supplied words separated by ` / ` (e.g. `(might / to delete)`, `(it / to cut)`, `(to make / wait)`).

```json
{"cell":"D2","format":"gap","genre":"news","level":"medium","prompt":"Two hikers (to rescue) from Snowdon last night after they (to lose) their way in thick fog.","blanks":[{"cue":"to rescue","answer":"were rescued","accepted_answers":["were rescued"],"voice":"passive","construction":"pv_past_simple"},{"cue":"to lose","answer":"had lost","accepted_answers":["had lost","lost"],"voice":"active","construction":"active_past_perfect"}],"explanation_ru":"Туристов спасли другие люди — пассив. Заблудились они сами — актив; Past Perfect, потому что это случилось раньше спасения."}
{"cell":"D10","format":"mc","genre":"instructions","level":"basic","prompt":"Fill the jar ___ warm water and leave it for ten minutes.","options":["with","by","from","of"],"correct_option_index":0,"explanation_ru":"fill with — управление глагола, by здесь не подходит."}
{"cell":"D8","format":"fix","genre":"school","level":"medium","prompt":"We were made stay after the lesson to finish the test.","answer":"We were made to stay after the lesson to finish the test.","accepted_answers":["We were made to stay after the lesson to finish the test."],"has_error":true,"explanation_ru":"После пассивного make нужно to: were made to stay."}
{"cell":"D7","format":"which","genre":"dialogue","level":"medium","prompt":"Your neighbour says: “I didn't do it myself — a builder came on Tuesday.” What did she say before that?","options":["I had the roof repaired last week.","I repaired the roof last week.","The roof repaired last week.","I have repaired the roof last week."],"correct_option_index":0,"explanation_ru":"have + объект + V3: ремонт сделал другой человек по её просьбе."}
```

Allowed `construction` values: `pv_present_simple`, `pv_present_continuous`, `pv_present_perfect`, `pv_past_simple`, `pv_past_continuous`, `pv_past_perfect`, `pv_future_simple`, `pv_future_perfect`, `pv_modal`, `pv_modal_perfect`, `pv_going_to`, `pv_infinitive`, `pv_perfect_infinitive`, `pv_gerund`, `pv_perfect_participle`, `pv_reporting_it`, `pv_reporting_inf`, `pv_two_objects`, `pv_prepositional`, `pv_get`, `pv_causative`, `pv_make_allow`, `pv_perception`, `pv_state`, `pv_need_ing`, `pv_born`, `pv_agent`, `pv_question`, `pv_negative`, `active_<tense>`.

## Self-check before sending (write the results at the end as a comment line `# check: ...`)

- the share of active answers in D2;
- the number of distinct openings, verbs and genres;
- how many items contain an explicit time marker.
