# Grammar NOEON — Passive Voice v7. Scenario seeds, part 2 of 5

## PART A. General instruction (read it all; it defines the rules for the whole project)

## Who you are and what we are doing

You are the author of exercises for Grammar NOEON (grammar.noeon.org), a grammar trainer for Russian-speaking learners of English (school students and adults). We are rebuilding the Passive Voice exercise bank from scratch.

The main complaint about the old bank: **every task feels the same.** Underneath every sentence was one storyline: "a thing (a bridge, a school, a museum, a car, letters) gets repaired / cleaned / built / sold / opened / closed + a time marker", and the answer was always `be + V3`. After 10 tasks the learner stops thinking about grammar and just looks for "yesterday" or "since". The new bank must break this feeling at every level: storyline, sentence structure, the learner's decision, and the format.

Editorial language: **British English** (colour, organise, flat, lift, queue, timetable). Explanations for learners are in **Russian**.

## Principle 1. Every task is its own small story

- Every task (or mini-text) is built on **one scenario seed** from the list you are given (`seed_id`). Each seed is used **once**. If a seed does not fit the grammar of the cell, skip it and do not "bend" it.
- Treat the seed as a scene from life: who, where, what happened, and why it matters. The sentence must keep **one live detail**: a cause, a consequence, a reaction, a number, a name, an unexpected turn. "The documents were checked" is dead. "Every page of my visa application was checked twice, and the officer still found a missing signature" is alive.
- **Banned default storylines** (allowed at most once per batch, and only if the seed asks for it directly):
  repairing / painting / cleaning / building / demolishing buildings, bridges, roads, schools, museums; "English is spoken…"; "rice is grown…"; "letters are delivered…"; "the meeting / match / concert was cancelled"; "the cake was eaten"; "the windows are washed"; "the car was stolen"; "the homework was done"; "the room is cleaned every day"; "the dishes were washed"; "the tickets were sold out"; "the film was shot / shown".
- Vary **point of view**: first person ("I was told…", "we were asked…") — at least 25%; third person; second person (instructions, notices: "Your bag will be searched"); impersonal (news, science).
- Vary **register**: everyday dialogue with contractions, a chat message, a formal notice, a news report, instructions or a recipe, a description of a scientific or industrial process, a historical note, a review, a work email.
- Vary **tone**: funny, irritating, alarming, touching, neutral, good news, bad news, ironic.
- **Names:** use names from different cultures (British, Irish, Indian, Polish, Nigerian, Spanish, Chinese, Arabic, Russian…). No name appears twice in a batch. Do not use Nora, Maya, Nina, Mia, Tom, Anna, John, Mary, Bob — they are overused in the bank. Often you need no name at all: "my neighbour", "the new intern", "a man in a yellow raincoat".
- Places can be real (Leeds, Kraków, Lagos, Hokkaido) or ordinary ("a petrol station outside Swindon"). No celebrities, politics, religion, tragedies with victims, or medical diagnoses.

## Principle 2. The learner makes a real decision every time

- The cell (`cell`) sets **what** is trained. Inside the cell, the decisions must still differ: one task decides the tense, the next the voice, the next a preposition or word order.
- **No hints before the answer.** The bracket gives only the verb (and words that must be used). The form is decided by context alone.
- **Explicit time markers** (yesterday, last week, since, for, already, yet, just, now, at the moment, by the time, by the end of, tomorrow, next…, every…, ago) — **in at most 1 in 3 tasks per batch**. In the others, the form comes from the logic of the situation: the previous sentence, the other speaker's line, cause and effect, the genre (a notice, a news headline, an instruction).
- With a future deadline "by / before + time" the main answer is **Future Perfect**, but Future Simple goes into `accepted_answers` only when the meaning allows it.
- The task must have **one correct meaning**. If the active and passive voice give two different but equally possible sentences, rewrite the context so that only one is left.

## Principle 3. Sentence structure differs from task to task

Inside one batch:
- **no two tasks start with the same two words**; "By the time / By the end" is banned at the start;
- the **gap position** varies: main clause, relative clause (…the necklace, which **had been hidden**…), after a conjunction (…because…, although…, as soon as…), inside a question, after a modal, at the end of a sentence, in the second speaker's reply;
- the **subject** varies: a thing; a person (I / she / the players / my brother); it / what / who / nothing / nobody / all of us; an abstract noun (the decision, the idea, the results);
- **sentence length**: basic — 8–14 words; medium — 12–22; advanced — 18–35, with a subordinate clause or a twist;
- affirmative, negative and question sentences are all present (negatives and questions together — at least 25%);
- one **verb in a gap** appears at most twice per batch.

## Task formats

| `format` | What the learner sees | Rules |
|---|---|---|
| `gap` | One sentence (or a two-line dialogue) with 1 gap, verb in brackets: `(to steal)`, `(not / to tell)`, `(might / to delete)` | the brackets contain the verb with `to` and words that must be used, separated by ` / `; the order inside the brackets does not matter |
| `mini` | A connected mini-text or dialogue of 3–6 sentences with **2–4** gaps | it must be a story with development (beginning → event → consequence), not a list of facts; the gaps check **different** forms/decisions; the text contains at least one sentence with no gap |
| `mc` | A sentence with `___` and 4 options | exactly one option is correct; the distractors are **real mistakes of Russian speakers** (see the cell section), not random rubbish; the options are similar in length; the correct option is not always first |
| `fix` | A sentence that may contain a grammar mistake; the learner rewrites it correctly | in 1 out of 5 `fix` tasks **there is no mistake** (`has_error:false`); a sentence with a mistake contains exactly one mistake; the mistake is typical, not absurd |
| `which` | A short situation (1–2 sentences) + 4 full sentences: "which one fits?" | the options differ in grammar and meaning (active / passive / have sth done / state); exactly one fits the situation in meaning |

## Difficulty levels (by sentence complexity, not CEFR)

- `basic` — a simple sentence or a short dialogue, everyday vocabulary, one decision.
- `medium` — a complex sentence or a dialogue, a less obvious context, a negative/question.
- `advanced` — a long sentence with a subordinate clause, the form is determined by the logic of several events, a rarer construction, vocabulary at B2+ level.

## Answers and checking

- `answer` — the main answer (only the words that go into the gap, without the surrounding words).
- `accepted_answers` — **all** grammatically correct and contextually acceptable variants, including `answer`:
  contractions (`'s been`, `'re being`, `wasn't`, `hasn't been`, `won't be`); `will` ↔ `be going to` where both fit; `have` ↔ `get` in have something done; Past Simple where Present Perfect is not required by the context; `need washing` ↔ `need to be washed`; `Having been rejected` ↔ `Rejected`; both word orders of an adverb, if both are correct.
- Do not add variants that are "almost correct". If you are not sure a variant is correct, do not include it, and change the context so that the question does not arise.
- `explanation_ru` — 1–2 short sentences in Russian: why this form fits **in this context**. For a decision about voice — who performs the action. For `mc`/`fix` — what the mistake is in the typical wrong variant. No links or source tags. No "Ответ: …" at the start.

## Output format (strict)

Only JSONL: **one JSON object per line**, no markdown, no comments between lines, no numbering. At the very end, one line beginning with `# check:` containing the self-check.

```
{"id":"<batch>-01","seed_id":"S123","cell":"D2","format":"gap","genre":"news","level":"medium","prompt":"Two hikers (to rescue) from Snowdon last night after they (to lose) their way in thick fog.","blanks":[{"cue":"to rescue","answer":"were rescued","accepted_answers":["were rescued"],"voice":"passive","construction":"pv_past_simple"},{"cue":"to lose","answer":"had lost","accepted_answers":["had lost","lost"],"voice":"active","construction":"active_past_perfect"}],"explanation_ru":"Туристов спасли — пассив. Заблудились они сами — актив; Past Perfect, потому что это случилось раньше спасения."}
{"id":"<batch>-02","seed_id":"S087","cell":"D10","format":"mc","genre":"recipe","level":"basic","prompt":"Fill the jar ___ warm water and leave it for ten minutes.","options":["with","by","from","of"],"correct_option_index":0,"construction":"pv_agent","explanation_ru":"fill with — так управляет глагол; by здесь не подходит."}
{"id":"<batch>-03","seed_id":"S311","cell":"D8","format":"fix","genre":"school","level":"medium","prompt":"We were made stay after the lesson to finish the test.","answer":"We were made to stay after the lesson to finish the test.","accepted_answers":["We were made to stay after the lesson to finish the test."],"has_error":true,"construction":"pv_make_allow","explanation_ru":"После пассивного make нужно to: were made to stay."}
{"id":"<batch>-04","seed_id":"S502","cell":"D7","format":"which","genre":"dialogue","level":"medium","prompt":"Olga is showing her friend her new kitchen. She didn't do any of the work herself — a local firm did everything in May. What does she say?","options":["We had the kitchen redone in May.","We redid the kitchen in May.","The kitchen redid in May.","We have had redone the kitchen in May."],"correct_option_index":0,"construction":"pv_causative","explanation_ru":"have + объект + V3: работу выполнили другие люди по её заказу."}
# check: active_share=..., time_markers=.../40, openings_unique=yes, verbs_max=2, genres=11, names_repeated=0, seeds_used=40
```

Fields:
- `id` — `<batch number>-NN` (e.g. `B03-17`);
- `seed_id` — the id of the seed used;
- `cell` — D1…D11;
- `format` — gap | mini | mc | fix | which;
- `genre` — one of: news, notice, instructions, recipe, process, history, report, review, dialogue, chat, email, school, work, travel, sport, tech, health, nature, arts, science, home, city, shopping, food;
- `level` — basic | medium | advanced;
- `blanks[]` (gap, mini): `cue` exactly as in the brackets inside `prompt`, in the same order; `answer`; `accepted_answers`; `voice` (passive | active); `construction`;
- `options` + `correct_option_index` (mc, which); `construction` at item level;
- `answer` + `accepted_answers` + `has_error` (fix): `answer` is the whole corrected sentence; if there is no mistake, `answer` = `prompt`;
- `explanation_ru`.

Allowed `construction` values:
`pv_present_simple, pv_present_continuous, pv_present_perfect, pv_past_simple, pv_past_continuous, pv_past_perfect, pv_future_simple, pv_future_perfect, pv_modal, pv_modal_perfect, pv_going_to, pv_infinitive, pv_perfect_infinitive, pv_gerund, pv_perfect_participle, pv_reporting_it, pv_reporting_inf, pv_two_objects, pv_prepositional, pv_get, pv_causative, pv_make_allow, pv_perception, pv_state, pv_need_ing, pv_born, pv_agent, pv_question, pv_negative, active_present_simple, active_present_continuous, active_present_perfect, active_present_perfect_continuous, active_past_simple, active_past_continuous, active_past_perfect, active_future_simple, active_future_perfect, active_other`.

## Before sending, check every task

1. Would a native speaker say or write this in this situation? If not, rewrite it.
2. Is there exactly one correct meaning? Are all correct variants in `accepted_answers`?
3. Does the bracket give away the answer (e.g. `(to be repaired)`)? It must not.
4. Is there a banned storyline? A repeated opening? A third use of the same verb? A repeated name?
5. Does the format/level/count distribution match the request exactly?


## PART B. Task for this message: scenario seeds, part 2 of 5

**In this message, do NOT write any exercises yet** — only the 200 scenario seeds described below. The exercise format in Part A is for later stages. If 200 seeds do not fit in one reply, stop after a complete line and I will write «continue».


Before writing the exercises, we are building a catalogue of **scenario seeds**: short, concrete situations from life. Each future task will be built on its own seed, so that the storylines of the bank never repeat. The quality of the whole bank depends on this stage.

Write **200 seeds** for the domains of part 2 (40 for each of the 5 domains):

| Part | Domains |
|---|---|
| 2 | university and exams · work and the office · jobs, interviews, dismissals · shopping and online orders · travel and airports |

### What makes a good seed

- **Concrete:** there is a place, people (or a role), an event and one unexpected or vivid detail.
- **There is a natural reason for the passive or for a trap:** the doer is unknown, unimportant or obvious; or the focus is on the person affected ("I was offered…", "she was asked…"); or there is a rumour/report ("is said to…"); or a service is done by someone else ("had it fixed"); or the opposite — something happens by itself (arrived, disappeared, broke).
- **The seeds within a domain are not alike:** different places, ages, professions, countries, tones (funny, irritating, alarming, touching, neutral). 40 seeds in "animals" are not 40 lost cats: a parrot repeating a password, a stork nest on a power pole, a dog listed as a "staff member" at a library, a seal in a canal in Rotterdam, a hedgehog census in a village…
- **Banned** (see the master instruction): repair/painting/building of houses, bridges, schools, museums; "the meeting was cancelled"; "the car was stolen"; "letters are delivered"; "the cake was eaten"; "English is spoken"; and similar default storylines. Every seed must be **different from these** in its own way.
- Realistic, not absurd. Funny is fine; nonsense is not.
- No celebrities, politics, religion, war, deaths, injuries with details, or diagnoses.

### Seed format (JSONL, one line per seed; the example below is from another domain, it only shows the format)

```
{"seed_id":"S2-001","domain":"weather","place":"a campsite in the Lake District","who":"a family of four on their first camping trip","situation":"A storm in the night blew their tent into a neighbouring field; a farmer brought it back at breakfast, folded.","hooks":["agent unknown/unimportant","something happened by itself"],"tone":"funny","register":"chat"}
```

- `seed_id`: `S2-NNN` (001–200);
- `situation`: 1–2 sentences in English, up to 35 words, written in plain past or present — **not** a ready exercise sentence;
- `hooks`: 1–3 of: `agent unknown/unimportant`, `focus on affected person`, `report/rumour`, `service by someone else`, `something happened by itself`, `rule/obligation`, `process/steps`, `deduction about the past`, `state vs action`, `two objects (give/offer/send)`, `phrasal/prepositional verb`;
- `tone`: funny | annoying | alarming | touching | neutral | good news | bad news | ironic;
- `register`: dialogue | chat | email | notice | news | instructions | report | history | review | process.

Across the 200 seeds the `hooks` should be balanced: no single hook in more than 25% of the seeds; `something happened by itself` and `focus on affected person` — at least 15% each.

At the end: `# check: seeds=200, per_domain=40×5, hooks={...}, tones={...}`.
