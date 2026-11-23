# ATTACHED FILE

PART 1 is the MASTER INSTRUCTIONS. The following parts are TASKS: write each of the batches RP32, RP33. Output ALL of them in ONE single JSONL code block, one task per line, batches in order, nothing else (no explanations, no comments, no text after the code block). Do not skip any batch and do not shorten.

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
# PART 2 — TASK RP32

# Batch RP32 · cell R7 · 27 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 27 tasks** of batch RP32 for cell **R7**.

## Distribution (must match exactly)
- Formats: gap 11, mini 6, mc 4, fix 3, which 2, transform 1
- Levels: basic 8, medium 11, advanced 8
- `id`: `RP32-01` … `RP32-27`

### R7. Modals and conditionals in reported speech

**What is trained:** can→could, will→would, must→had to, may→might, should/might/would/could unchanged, conditionals unchanged.

**The decision:** which modals change and which stay.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** must kept; should → had to; would→ will; if-sentence shifted wrongly.

**Example of the level (do not copy its storyline):** She said I (must) hand in the form by Friday, but I (can / still) do it on Monday.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%


## Scenario seeds for this batch
Below are 33 seeds — more than you need. Choose the 27 that best fit cell R7 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "rl-0265", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “I can change a wheel.” → Nina said that she could change a wheel.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0266", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora: “If I had a car, I would drive to the coast.” → Nora said that if she had a car, she would drive to the coast.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0267", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “I can fix the loose shelf.” → Nina said that she could fix the loose shelf.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0268", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora: “If I knew the code, I would open the safe.” → Nora said that if she knew the code, she would open the safe.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0269", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “I cannot lift the suitcase.” → Nina said that she could not lift the suitcase.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0270", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora: “If I lived closer, I would walk to work.” → Nora said that if she lived closer, she would walk to work.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0271", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “The path may be muddy.” → Nina said that the path might be muddy.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0272", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora: “If I had more space, I would grow tomatoes.” → Nora said that if she had more space, she would grow tomatoes.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0273", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “The shop may have a spare part.” → Nina said that the shop might have a spare part.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0274", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora: “If I spoke Italian, I would call the hotel.” → Nora said that if she spoke Italian, she would call the hotel.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0275", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “I must wear safety goggles.” → Nina said that she had to wear safety goggles.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0276", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora: “If I owned a bicycle, I would use the cycle path.” → Nora said that if she owned a bicycle, she would use the cycle path.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0277", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “I must return the borrowed drill.” → Nina said that she had to return the borrowed drill.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0278", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora: “If I had a free evening, I would join the choir.” → Nora said that if she had a free evening, she would join the choir.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0279", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “I must update my contact details.” → Nina said that she had to update her contact details.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0280", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora: “If I worked from home, I would save on travel.” → Nora said that if she worked from home, she would save on travel.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0281", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “I could hear a strange rattle.” → Nina said that she could hear a strange rattle.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0282", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora: “If I had a garden, I would plant a pear tree.” → Nora said that if she had a garden, she would plant a pear tree.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0283", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “I could recognise the handwriting.” → Nina said that she could recognise the handwriting.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0284", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora: “If I could swim, I would join the boat trip.” → Nora said that if she could swim, she would join the boat trip.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0285", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “I should eat before the journey.” → Nina said that she should eat before the journey.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0286", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora: “If I felt better, I would cook dinner.” → Nora said that if she felt better, she would cook dinner.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0287", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “I should not leave the gate open.” → Nina said that she should not leave the gate open.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0288", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora: “If I had set an alarm, I would have caught the coach.” → Nora said that if she had set an alarm, she would have caught the coach.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0289", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “I should save a copy of the file.” → Nina said that she should save a copy of the file.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0290", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora: “If I had checked the map, I would have found the entrance.” → Nora said that if she had checked the map, she would have found the entrance.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0291", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina: “I should ask for a second opinion.” → Nina said that she should ask for a second opinion.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0292", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora: “If I had brought a coat, I would have stayed outside.” → Nora said that if she had brought a coat, she would have stayed outside.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0293", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora: “The lights are on. Ben must be at home.” → Nora said that the lights were on and Ben must be at home.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0294", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora: “If I had saved the receipt, I would have returned the kettle.” → Nora said that if she had saved the receipt, she would have returned the kettle.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0295", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora to Ben: “You must not share this access code.” → Nora said that Ben must not share that access code.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0296", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora: “If I had booked earlier, I would have paid less.” → Nora said that if she had booked earlier, she would have paid less.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0297", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora to Ben: “You may use my desk.” → Nora said that Ben could use her desk.", "hooks": ["a modal said by someone"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): «at a», «at the», «during the», «before the», «during a», «in a», «in our», «during our», «when i», «halfway through», «why did», «inside a», «inside the», «in the», «outside the», «did the», «after the», «everyone in», «near the», «because the», «on the», «nobody in», «on his», «although the», «minutes before», «on monday,», «early in», «back at», «over lunch», «at an», «on our», «at our», «on my», «ten minutes», «standing at», «on a», «midway through», «when we», «heavy rain», «the baker»
- Verbs/words in brackets already used often (avoid unless required): be, leave, have, keep, open, check, take, drop, run, stay, send, lose, wait, start, need, find, want, stand, close, bring, know, work, put, eat, touch
- Names: Ababa, Abena, Abu, Accra, Ada, Addis, Africa, Aino, Aires, Aisha, Alice, Alpine, Alps, Although, Ama, Amara, Amir, Amsterdam, Andean, Andes, Antarctica, Antwerp, Arctic, Are, Argentina, Aroha, Arthur, Astrid, Athens, Auckland, Aunt, Auntie, Australian, Avebury, Back, Bali, Bangalore, Bangkok, Barcelona, Bavaria, Belgium, Bence, Berlin, Bern, Birmingham, Bogota, Bram, Braun, Brazil, Brisbane, Brno, Brussels, Budapest, Budi, Buenos, Busan, Cairo, Callum, Camila, Camille

## Final self-check (last line of the answer)
`# check: time_markers=<N>/27, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=27, formats=<gap/mini/mc/fix/which/transform>, levels=<b/m/a>`


---
# PART 3 — TASK RP33

# Batch RP33 · cell R8 · 30 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 30 tasks** of batch RP33 for cell **R8**.

## Distribution (must match exactly)
- Formats: mini 24, mc 3, which 3
- Levels: basic 9, medium 12, advanced 9
- `id`: `RP33-01` … `RP33-30`

### R8. Reporting a conversation (mini-text)

**What is trained:** 3–5 sentences retelling a conversation, interview or message: mixed statements, questions and commands in one text.

**The decision:** each gap is a different decision; the text must hold together as a story.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** all of the above, together.

**Example of the level (do not copy its storyline):** After the interview Kofi told his mum that the manager (to like) his CV. She (ask) him when he (to start) and (tell) him (to celebrate).

**Typical format mix:** mini 80%, mc 10%, which 10%


## Scenario seeds for this batch
Below are 36 seeds — more than you need. Choose the 30 that best fit cell R8 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "rl-0298", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Can you fix the neighbour’s door tomorrow?” → Nora asked Leo if he could fix the neighbour’s door the next day.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0299", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Have you checked the flight status for tomorrow?” → Nora asked Leo if he had checked the flight status for the next day.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0300", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Did you check the fridge before breakfast?” → Nora asked Leo if he had checked the fridge before breakfast.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0301", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Did you book a hotel room yesterday?” → Nora asked Leo if he had booked a hotel room the day before.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0302", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Do you keep your receipts here?” → Nora asked Leo if he kept his receipts there.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0303", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Are you cleaning the balcony now?” → Nora asked Leo if he was cleaning the balcony then.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0304", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Do you recognise this street?” → Nora asked Leo if he recognised that street.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0305", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Have you watered your garden today?” → Nora asked Leo if he had watered his garden that day.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0306", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Do you work in this building?” → Nora asked Leo if he worked in that building.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0307", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Will you bring your charger tomorrow?” → Nora asked Leo if he would bring his charger the next day.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0308", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Who lent you this camera?” → Nora asked Leo who had lent him that camera.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0309", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Did you leave your umbrella here yesterday?” → Nora asked Leo if he had left his umbrella there the day before.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0310", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “What time does your class start?” → Nora asked Leo what time his class started.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0311", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Are you waiting for your sister here?” → Nora asked Leo if he was waiting for his sister there.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0312", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Who has taken your seat?” → Nora asked Leo who had taken his seat.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0313", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Can you carry this suitcase?” → Nora asked Leo if he could carry that suitcase.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0314", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Why are you carrying your coat?” → Nora asked Leo why he was carrying his coat.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0315", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Will you finish your report tonight?” → Nora asked Leo if he would finish his report that night.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0316", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Let’s visit the science museum tomorrow.” → Nora suggested visiting the science museum the next day.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0317", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “When will you collect your parcel?” → Nora asked Leo when he would collect his parcel.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0318", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Let’s hold a picnic in the park tomorrow.” → Nora suggested holding a picnic in the park the next day.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0319", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “How do you get to your office from here?” → Nora asked Leo how he got to his office from there.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0320", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Yes, I did eat your last biscuit yesterday.” → Nora admitted eating Leo’s last biscuit the day before.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0321", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Who did you invite to your party?” → Nora asked Leo who he had invited to his party.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0322", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Mia → Leo: “I open my laptop in this room.” → Mia said that she opened her laptop in that room.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0323", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Which shoes are you wearing tomorrow?” → Nora asked Leo which shoes he was wearing the next day.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0324", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Mia → Leo: “My sister works here.” → Mia said that her sister worked there.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0325", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Where can you park your car here?” → Nora asked Leo where he could park his car there.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0326", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Mia → Leo: “I keep these tickets in my wallet.” → Mia said that she kept those tickets in her wallet.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0327", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Whose bag have you found here?” → Nora asked Leo whose bag he had found there.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0328", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Mia → Leo: “I will hang these curtains tomorrow.” → Mia said that she would hang those curtains the next day.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0329", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “How long have you lived in this village?” → Nora asked Leo how long he had lived in that village.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0330", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Mia → Leo: “My aunt will lend us her car.” → Mia said that her aunt would lend them her car.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0331", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Who is helping you today?” → Nora asked Leo who was helping him that day.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0332", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Mia → Leo: “I am making your birthday card.” → Mia said that she was making Leo’s birthday card.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0333", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nora → Leo: “Where have you left your shopping list?” → Nora asked Leo where he had left his shopping list.", "hooks": ["a story told afterwards"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): «at a», «at the», «during the», «before the», «during a», «in a», «in our», «during our», «when i», «halfway through», «why did», «inside a», «inside the», «in the», «outside the», «did the», «after the», «everyone in», «near the», «because the», «on the», «nobody in», «on his», «although the», «minutes before», «on monday,», «early in», «back at», «over lunch», «at an», «on our», «at our», «on my», «ten minutes», «standing at», «on a», «midway through», «when we», «heavy rain», «the baker»
- Verbs/words in brackets already used often (avoid unless required): be, leave, have, keep, open, check, take, drop, run, stay, send, lose, wait, start, need, find, want, stand, close, bring, know, work, put, eat, touch
- Names: Ababa, Abena, Abu, Accra, Ada, Addis, Africa, Aino, Aires, Aisha, Alice, Alpine, Alps, Although, Ama, Amara, Amir, Amsterdam, Andean, Andes, Antarctica, Antwerp, Arctic, Are, Argentina, Aroha, Arthur, Astrid, Athens, Auckland, Aunt, Auntie, Australian, Avebury, Back, Bali, Bangalore, Bangkok, Barcelona, Bavaria, Belgium, Bence, Berlin, Bern, Birmingham, Bogota, Bram, Braun, Brazil, Brisbane, Brno, Brussels, Budapest, Budi, Buenos, Busan, Cairo, Callum, Camila, Camille

## Final self-check (last line of the answer)
`# check: time_markers=<N>/30, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=30, formats=<mini/mc/which>, levels=<b/m/a>`
