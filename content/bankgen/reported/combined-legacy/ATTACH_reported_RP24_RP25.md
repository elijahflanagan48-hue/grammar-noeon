# ATTACHED FILE

PART 1 is the MASTER INSTRUCTIONS. The following parts are TASKS: write each of the batches RP24, RP25. Output ALL of them in ONE single JSONL code block, one task per line, batches in order, nothing else (no explanations, no comments, no text after the code block). Do not skip any batch and do not shorten.

---
# PART 1 — MASTER INSTRUCTIONS

# Grammar NOEON — Reported speech (косвенная речь). Main instruction

> Paste this first into every new chat (or send it as the system message). Then send one stage prompt (seeds or a batch). This text is generated from `scripts/bankgen_specs.py` — do not edit it by hand.

## Who you are and what we are doing

You are the author of exercises for Grammar NOEON (grammar.noeon.org), a grammar trainer for Russian-speaking learners of English (school students and adults). We are rebuilding the bank for the topic **Reported speech (косвенная речь)** from scratch.

The main complaint about the old banks: **every task feels the same** — one storyline, one sentence frame, one marker that gives the answer away. After ten tasks the learner stops thinking about grammar and just looks for the marker. The new bank must be varied in storyline, sentence structure, the decision the learner makes, and the format.

Editorial language: **British English** (colour, organise, flat, lift, queue, timetable). Explanations are in **Russian**.

## Principle 1. Every task is its own small story

- Every task is built on **one scenario seed** from the list you are given (`seed_id`). A seed is used **once**. If a seed does not fit the cell, skip it; do not bend it.
- Typical scenes for this topic: Somebody says something and somebody else reports it later: a chat, a phone call, an interview, a meeting, a rumour, a text message, a lesson, a news item, a complaint.
- Keep **one live detail**: a cause, a consequence, a reaction, a number, a name, an unexpected turn.
- **Banned / limited for this topic:** Nora, Maya, Nina, Ben as heroes; the shape «A to B: “I will + verb + object”»; household chores as the only scene; one-line speech under 8 words in more than 20% of tasks.
- Vary **point of view** (first person at least 25%), **register** (dialogue, chat, notice, news, instruction, review, email, story), **tone** (funny, irritating, alarming, touching, neutral, ironic).
- **Names:** different cultures (British, Irish, Indian, Polish, Nigerian, Spanish, Chinese, Arabic, Russian…). A name never appears twice in a batch. Do not use Nora, Maya, Nina, Mia, Tom, Anna, John, Mary, Bob, Ben — they are overused. Often no name is needed ("my neighbour", "the new intern").
- Places can be real or ordinary. No celebrities, politics, religion, war, tragedies with victims, or diagnoses.

## Principle 2. The learner makes a real decision every time

- The cell (`cell`) sets **what** is trained. Inside one cell the decisions must still differ from task to task.
- **No hints before the answer.** The bracket holds only what is allowed (see "Brackets"). The form is decided by context.
- **Explicit time markers** (yesterday, last week, since, for, already, yet, just, now, tomorrow, next…, every…, ago, by the time) — in **at most 1 in 3** tasks per batch.
- Each task has **one correct meaning**. If two readings are possible, rewrite the context.
- Every task must contain the speech in some context (who, where, why), not a bare quotation. At least 40% of the tasks are two-part: a short narrative sentence plus the speech or the report.
- Vary the reporting verb: say, tell, ask, explain, mention, promise, warn, admit, deny, suggest, insist, wonder, remind, complain, announce, offer, refuse, advise, order. `said` may be at most 25% of the batch.
- The learner must decide, not copy: whether to shift the tense, which pronoun, which time word, which pattern (that-clause / to-infinitive / -ing). The brackets never reveal this.
- At most 1 in 3 tasks may have a time word that signals the answer (yesterday, tomorrow, now).

## Principle 3. Sentence structure differs from task to task

Inside one batch:
- **no two tasks start with the same two words**; "By the time / By the end" is not allowed at the start;
- the **gap position** varies (main clause, subordinate clause, after a conjunction, in a question, in the second speaker's reply, end of sentence);
- the **subject** varies (a thing, a person, I/we/you, it/nobody/all of us, an abstract noun);
- **sentence length**: basic 8–14 words; medium 12–22; advanced 18–35 with a subordinate clause or a twist;
- affirmative, negative and question sentences are all present (negatives and questions together ≥ 25%);
- one **verb or word in a bracket** appears at most twice per batch.

## Vocabulary rules (mandatory)

We train grammar, not vocabulary. A strange word must never be what makes the learner stumble.

- Level caps: **basic** = A1–A2 words only; **medium** = up to B1; **advanced** = up to B2 (single C1 words allowed only when needed). At most 0 rare words in basic, 1 in medium, 2 in advanced.
- Rare = C1/C2 or not in everyday lists. Bad examples: squirrel, canopy, monologue, prop, kiln, auction, locomotive, porcelain, vintage, automated, arborist.
- No narrow professional or hobby vocabulary (crafts, music, science, law, medicine, cooking), no exotic animals, plants or food, no archaic or literary words.
- The word in a bracket is always a very common one (go, make, take, give, find, buy, send, open, clean, wait, ask, build, write, repair, invite…).
- Plots are ordinary life: home, school, work, road, shop, friends, trips, sport, internet. Variety comes from situations, people and places, not from rare words. When in doubt, use the word a school student knows after two years of English.

## Formats

| `format` | What the learner sees | Rules |
|---|---|---|
| `gap` | One sentence (or a two-line dialogue) with 1–2 gaps and words in brackets | the brackets contain only what the topic allows (see "Brackets"), parts separated by ` / ` |
| `mini` | A connected mini-text or dialogue of 3–6 sentences with **2–4** gaps | a story with development, not a list of facts; the gaps check **different** decisions; at least one sentence has no gap |
| `mc` | A sentence with `___` and 4 options | exactly one correct; the distractors are **real mistakes of Russian speakers**, not rubbish; options of similar length; the correct one is not always first |
| `fix` | A sentence that may contain a grammar mistake; the learner rewrites it | in 1 of 5 `fix` tasks **no mistake** (`has_error:false`, `answer` equals `prompt`); a wrong sentence has exactly one typical mistake |
| `which` | A short situation (1–2 sentences) + 4 full sentences: "which one fits?" | the options differ in grammar and meaning; exactly one fits the situation |
| `transform` | A source sentence plus the start of the new sentence; the learner writes the whole sentence | `answer` = the full correct sentence; `accepted_answers` = all correct full-sentence variants (contractions, optional `that`, etc.) |

### Brackets

the bracket holds the verb of the reported clause (`(to be)`, `(will / to come)`), or the pattern word (`(to tell / him / to wait)`)

## Difficulty levels (sentence complexity)

- `basic` — a simple sentence or a short dialogue, everyday vocabulary, one decision.
- `medium` — a complex sentence or dialogue, a less obvious context, a negative or a question.
- `advanced` — a longer sentence with a subordinate clause, the answer follows from the logic of several facts, vocabulary up to B2.

## Answers and checking

- `answer` — the main answer (for `gap`/`mini`: only the words that go into the gap).
- `accepted_answers` — **all** grammatically correct variants that fit the context, including `answer`: contractions, `will` ↔ `be going to` where both fit, optional `that`, both word orders of an adverb if both are correct. Never add "almost correct" variants. If unsure, change the context so the question does not arise.
- `explanation_ru` — 1–2 short sentences in Russian: why this form fits **in this context**; for `mc`/`fix` — what the typical mistake is. No links, no source tags, no "Ответ:" at the start.
- `construction` — one tag from the list below (for `gap`/`mini` put it in each blank).

Allowed `construction` tags: `rp_advice`, `rp_backshift_future`, `rp_backshift_modal`, `rp_backshift_past`, `rp_backshift_perfect`, `rp_backshift_present`, `rp_choose_report`, `rp_command`, `rp_conditional`, `rp_fix_mixed`, `rp_mixed_story`, `rp_modal_change`, `rp_modal_unchanged`, `rp_no_shift_present_verb`, `rp_no_shift_true`, `rp_offer_invitation`, `rp_place_words`, `rp_pronouns`, `rp_question_embedded`, `rp_question_wh`, `rp_question_yesno`, `rp_request`, `rp_shift_optional`, `rp_suggest`, `rp_time_words`, `rp_verb_ing`, `rp_verb_prep_ing`, `rp_verb_that`, `rp_verb_to_inf`, `rp_warning`

## Cells of this topic

### R1. Backshift of tenses in statements

**What is trained:** present→past, past→past perfect, will→would, can→could, present perfect→past perfect.

**The decision:** the tense is chosen from what the speaker said and when it is reported, not from a marker; some tasks have the reporting verb in the present (no shift).

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** She said she is tired (no shift); He said he has finished → he said he finished (lost Past Perfect); said me; will → will (no would).

**Example of the level (do not copy its storyline):** On the phone Dan told me he (to be) stuck in traffic and (to call) back in ten minutes.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### R2. Shift or no shift?

**What is trained:** no backshift when the fact is still true, a general truth, the reporting verb is in the present or Present Perfect, or the report is immediate.

**The decision:** the learner decides whether to shift at all; both forms are accepted only when the meaning really allows both.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** Always shifting (He said the Earth went round the Sun); never shifting after said.

**Example of the level (do not copy its storyline):** The guide said the castle (to close) at five, so we still have time — it's only four now.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### R3. Pronouns, time and place words

**What is trained:** I→he/she, my→his/her, today→that day, tomorrow→the next day, now→then, here→there, ago→before, this→that, last night→the night before.

**The decision:** the changed word is deduced from who speaks to whom and from when the report is made.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** Keeping here/tomorrow/ago unchanged; wrong pronoun (He said that I…); this → that forgotten.

**Example of the level (do not copy its storyline):** Mira told me, “I'll show you my flat tomorrow.” → Mira told me she'd show me her flat (the next day).

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### R4. Reported questions

**What is trained:** yes/no questions (if/whether) and wh-questions: statement word order, no do/does/did, no question mark, tense shift.

**The decision:** word order and the linking word (if / whether / wh-word), plus the tense.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** He asked me where did I live; asked if I did like; asked me what was my name; forgetting if.

**Example of the level (do not copy its storyline):** The receptionist asked us (we / to have) a booking.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### R5. Orders, requests, advice, offers

**What is trained:** tell / ask / order / advise / warn / remind / invite / beg + object + (not) to-infinitive.

**The decision:** the learner chooses the pattern: object + to-inf, and where `not` goes; ask someone to do vs ask if.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** He told me do it; asked me that I open; told to me; not to / to not confusion; said me to.

**Example of the level (do not copy its storyline):** The coach warned the boys (not / to go) near the river after dark.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### R6. Reporting verbs and their patterns

**What is trained:** admit / deny / suggest / insist / apologise for / accuse of / threaten / promise / refuse / agree / offer: -ing, to-inf, that-clause, preposition.

**The decision:** the verb decides the pattern; the bracket gives the base verb only.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** He suggested to go; promised that going; denied to take; apologised to be late; refused that.

**Example of the level (do not copy its storyline):** Max admitted (to forget) the password, and Lena suggested (to call) the helpdesk.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### R7. Modals and conditionals in reported speech

**What is trained:** can→could, will→would, must→had to, may→might, should/might/would/could unchanged, conditionals unchanged.

**The decision:** which modals change and which stay.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** must kept; should → had to; would→ will; if-sentence shifted wrongly.

**Example of the level (do not copy its storyline):** She said I (must) hand in the form by Friday, but I (can / still) do it on Monday.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### R8. Reporting a conversation (mini-text)

**What is trained:** 3–5 sentences retelling a conversation, interview or message: mixed statements, questions and commands in one text.

**The decision:** each gap is a different decision; the text must hold together as a story.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** all of the above, together.

**Example of the level (do not copy its storyline):** After the interview Kofi told his mum that the manager (to like) his CV. She (ask) him when he (to start) and (tell) him (to celebrate).

**Typical format mix:** mini 80%, mc 10%, which 10%

### R9. Error hunt and two-way transformation

**What is trained:** find the mistake in a reported sentence, or choose the correct report of a given direct speech, or turn reported into direct.

**The decision:** typical mistakes of Russian speakers; 20% of `fix` items are correct as they stand.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** see all cells above.

**Example of the level (do not copy its storyline):** The teacher asked me why was I late. → The teacher asked me why I was late.

**Typical format mix:** fix 40%, mc 25%, which 15%, transform 20%


## Output format (strict)

Only JSONL: **one JSON object per line**, no markdown, no comments, no numbering. The last line starts with `# check:` and contains your self-check.

```
{"id":"<batch>-01","seed_id":"<seed id>","cell":"<cell>","format":"gap","genre":"chat","level":"medium","prompt":"…(to verb)…","blanks":[{"cue":"to verb","answer":"…","accepted_answers":["…"],"construction":"<tag>"}],"explanation_ru":"…"}
{"id":"<batch>-02","seed_id":"…","cell":"…","format":"mc","genre":"…","level":"basic","prompt":"… ___ …","options":["…","…","…","…"],"correct_option_index":2,"construction":"<tag>","explanation_ru":"…"}
{"id":"<batch>-03","seed_id":"…","cell":"…","format":"fix","genre":"…","level":"medium","prompt":"…","answer":"…","accepted_answers":["…"],"has_error":true,"construction":"<tag>","explanation_ru":"…"}
{"id":"<batch>-04","seed_id":"…","cell":"…","format":"which","genre":"…","level":"medium","prompt":"<situation>","options":["…","…","…","…"],"correct_option_index":0,"construction":"<tag>","explanation_ru":"…"}
{"id":"<batch>-05","seed_id":"…","cell":"…","format":"transform","genre":"…","level":"medium","prompt":"<source sentence> → <start of the new sentence> …","answer":"<full sentence>","accepted_answers":["<full sentence>"],"construction":"<tag>","explanation_ru":"…"}
```

`genre` is one of: news notice instructions recipe process history report review dialogue chat email school work travel sport tech health nature arts science home city shopping food.


---
# PART 2 — TASK RP24

# Batch RP24 · cell R2 · 30 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 30 tasks** of batch RP24 for cell **R2**.

## Distribution (must match exactly)
- Formats: gap 12, mini 7, mc 4, fix 4, which 2, transform 1
- Levels: basic 9, medium 12, advanced 9
- `id`: `RP24-01` … `RP24-30`

### R2. Shift or no shift?

**What is trained:** no backshift when the fact is still true, a general truth, the reporting verb is in the present or Present Perfect, or the report is immediate.

**The decision:** the learner decides whether to shift at all; both forms are accepted only when the meaning really allows both.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** Always shifting (He said the Earth went round the Sun); never shifting after said.

**Example of the level (do not copy its storyline):** The guide said the castle (to close) at five, so we still have time — it's only four now.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%


## Scenario seeds for this batch
Below are 34 seeds — more than you need. Choose the 30 that best fit cell R2 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "rl-0052", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna says that she (to live) near the harbour. → Anna says that she lives near the harbour.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0053", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna said that she (to work) at the airport. → Anna said that she works at the airport.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0054", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna says that she (to speak) Portuguese. → Anna says that she speaks Portuguese.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0055", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna said that she (to play) the cello. → Anna said that she plays the cello.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0056", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna says that she (to know) the receptionist. → Anna says that she knows the receptionist.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0057", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna said that she (to have) two sisters. → Anna said that she has two sisters.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0058", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna says that she (to own) a small bakery. → Anna says that she owns a small bakery.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0059", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna said that she (to like) quiet cafés. → Anna said that she likes quiet cafés.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0060", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna says that she (to need) reading glasses. → Anna says that she needs reading glasses.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0061", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna said that she (to prefer) tea without sugar. → Anna said that she prefers tea without sugar.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0062", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna says that she (to teach) swimming. → Anna says that she teaches swimming.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0063", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna said that she (to write) for a local newspaper. → Anna said that she writes for a local newspaper.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0064", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna says that she (to keep) hens in the garden. → Anna says that she keeps hens in the garden.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0065", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna said that she (to travel) by train. → Anna said that she travels by train.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0066", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna says that she (to belong) to a walking club. → Anna says that she belongs to a walking club.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0067", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna said that she (to use) a hearing aid. → Anna said that she uses a hearing aid.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0068", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna says that she (to wear) contact lenses. → Anna says that she wears contact lenses.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0069", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna said that she (to run) a repair shop. → Anna said that she runs a repair shop.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0070", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna says that she (to wait) for a bus. → Anna says that she is waiting for a bus.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0071", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna said that she (to visit) a friend. → Anna said that she is visiting a friend.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0072", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna says that she (to prepare) lunch. → Anna says that she is preparing lunch.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0073", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna said that she (to stay) at a hostel. → Anna said that she is staying at a hostel.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0074", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna says that she (to look) for a scarf. → Anna says that she is looking for a scarf.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0075", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna said that she (to learn) sign language. → Anna said that she is learning sign language.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0076", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna says that she (to build) a model boat. → Anna says that she is building a model boat.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0077", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna said that she (to organise) a school concert. → Anna said that she is organising a school concert.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0078", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna says that she (to paint) a portrait. → Anna says that she is painting a portrait.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0079", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna said that she (to lose) the house key. → Anna said that she has lost the house key.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0080", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna says that she (to break) a finger. → Anna says that she has broken a finger.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0081", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna said that she (to finish) the application. → Anna said that she has finished the application.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0082", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora: “The Earth goes round the Sun.” → Nora said that the Earth goes round the Sun.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0083", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna said that she (to leave) the oven on. → Anna said that she has left the oven on.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0084", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna says that she (to forget) the access code. → Anna says that she has forgotten the access code.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0085", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna said that she (to receive) a job offer. → Anna said that she has received a job offer.", "hooks": ["something still true now"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): «at a», «at the», «during the», «before the», «during a», «in a», «in our», «during our», «when i», «halfway through», «why did», «inside a», «inside the», «in the», «outside the», «did the», «after the», «everyone in», «near the», «because the», «on the», «nobody in», «on his», «although the», «minutes before», «on monday,», «early in», «back at», «over lunch», «at an», «on our», «at our», «on my», «ten minutes», «standing at», «on a», «midway through», «when we», «heavy rain», «the baker»
- Verbs/words in brackets already used often (avoid unless required): be, leave, have, keep, open, check, take, drop, run, stay, send, lose, wait, start, need, find, want, stand, close, bring, know, work, put, eat, touch
- Names: Ababa, Abena, Abu, Accra, Ada, Addis, Africa, Aino, Aires, Aisha, Alice, Alpine, Alps, Although, Ama, Amara, Amir, Amsterdam, Andean, Andes, Antarctica, Antwerp, Arctic, Are, Argentina, Aroha, Arthur, Astrid, Athens, Auckland, Aunt, Auntie, Australian, Avebury, Back, Bali, Bangalore, Bangkok, Barcelona, Bavaria, Belgium, Bence, Berlin, Bern, Birmingham, Bogota, Bram, Braun, Brazil, Brisbane, Brno, Brussels, Budapest, Budi, Buenos, Busan, Cairo, Callum, Camila, Camille

## Final self-check (last line of the answer)
`# check: time_markers=<N>/30, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=30, formats=<gap/mini/mc/fix/which/transform>, levels=<b/m/a>`


---
# PART 3 — TASK RP25

# Batch RP25 · cell R3 · 27 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 27 tasks** of batch RP25 for cell **R3**.

## Distribution (must match exactly)
- Formats: gap 11, mini 6, mc 4, fix 3, which 2, transform 1
- Levels: basic 8, medium 11, advanced 8
- `id`: `RP25-01` … `RP25-27`

### R3. Pronouns, time and place words

**What is trained:** I→he/she, my→his/her, today→that day, tomorrow→the next day, now→then, here→there, ago→before, this→that, last night→the night before.

**The decision:** the changed word is deduced from who speaks to whom and from when the report is made.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** Keeping here/tomorrow/ago unchanged; wrong pronoun (He said that I…); this → that forgotten.

**Example of the level (do not copy its storyline):** Mira told me, “I'll show you my flat tomorrow.” → Mira told me she'd show me her flat (the next day).

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%


## Scenario seeds for this batch
Below are 33 seeds — more than you need. Choose the 27 that best fit cell R3 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "rl-0086", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “I check my diary every evening.” → Maya tells Leo that she checks her diary every evening.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0087", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “I am cleaning the attic today.” → Nina said that she was cleaning the attic that day.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0088", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya: “I leave my walking boots here.” → Maya said that she left her walking boots there.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0089", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “I keep my passport in a safe.” → Maya tells Leo that she keeps her passport in a safe.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0090", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “I have a dentist appointment today.” → Nina said that she had a dentist appointment that day.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0091", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya: “I am waiting here.” → Maya said that she was waiting there.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0092", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “I share my lunch with you.” → Maya tells Leo that she shares her lunch with him.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0093", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “I will pay the deposit today.” → Nina said that she would pay the deposit that day.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0094", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya: “I have stored the paint here.” → Maya said that she had stored the paint there.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0095", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “I lend you my bicycle on Fridays.” → Maya tells Leo that she lends him her bicycle on Fridays.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0096", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “I need to collect the curtains today.” → Nina said that she needed to collect the curtains that day.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0097", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya: “The children play here.” → Maya said that the children played there.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0098", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “I trust your advice.” → Maya tells Leo that she trusts his advice.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0099", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “I bought a tent yesterday.” → Nina said that she had bought a tent the day before.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0100", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya: “The team meets here.” → Maya said that the team met there.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0101", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “I like your new haircut.” → Maya tells Leo that she likes his new haircut.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0102", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “I will not use the car tomorrow.” → Nina said that she would not use the car the next day.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0103", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya: “I do not feel safe here.” → Maya said that she did not feel safe there.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0104", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “I remember your old address.” → Maya tells Leo that she remembers his old address.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0105", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “I am trying a new recipe now.” → Nina said that she was trying a new recipe then.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0106", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya: “This cup is chipped.” → Maya said that that cup was chipped.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0107", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “You can borrow my camera.” → Maya tells Leo that he can borrow her camera.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0108", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “I am not looking at the screen now.” → Nina said that she was not looking at the screen then.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0109", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya: “This room needs fresh air.” → Maya said that that room needed fresh air.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0110", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “You know my sister.” → Maya tells Leo that he knows her sister.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0111", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “I will move into the flat next week.” → Nina said that she would move into the flat the following week.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0112", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya: “This jacket belongs to my sister.” → Maya said that that jacket belonged to her sister.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0113", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “You have my phone number.” → Maya tells Leo that he has her phone number.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0114", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “I repaired the gate last week.” → Nina said that she had repaired the gate the previous week.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0115", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya: “This desk is too low.” → Maya said that that desk was too low.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0116", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “You always leave your coat at work.” → Maya tells Leo that he always leaves his coat at work.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0117", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “I moved to this town three years ago.” → Nina said that she had moved to that town three years before.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0118", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya: “I bought this basket at a fair.” → Maya said that she had bought that basket at a fair.", "hooks": ["speech with time/place words"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): «at a», «at the», «during the», «before the», «during a», «in a», «in our», «during our», «when i», «halfway through», «why did», «inside a», «inside the», «in the», «outside the», «did the», «after the», «everyone in», «near the», «because the», «on the», «nobody in», «on his», «although the», «minutes before», «on monday,», «early in», «back at», «over lunch», «at an», «on our», «at our», «on my», «ten minutes», «standing at», «on a», «midway through», «when we», «heavy rain», «the baker»
- Verbs/words in brackets already used often (avoid unless required): be, leave, have, keep, open, check, take, drop, run, stay, send, lose, wait, start, need, find, want, stand, close, bring, know, work, put, eat, touch
- Names: Ababa, Abena, Abu, Accra, Ada, Addis, Africa, Aino, Aires, Aisha, Alice, Alpine, Alps, Although, Ama, Amara, Amir, Amsterdam, Andean, Andes, Antarctica, Antwerp, Arctic, Are, Argentina, Aroha, Arthur, Astrid, Athens, Auckland, Aunt, Auntie, Australian, Avebury, Back, Bali, Bangalore, Bangkok, Barcelona, Bavaria, Belgium, Bence, Berlin, Bern, Birmingham, Bogota, Bram, Braun, Brazil, Brisbane, Brno, Brussels, Budapest, Budi, Buenos, Busan, Cairo, Callum, Camila, Camille

## Final self-check (last line of the answer)
`# check: time_markers=<N>/27, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=27, formats=<gap/mini/mc/fix/which/transform>, levels=<b/m/a>`
