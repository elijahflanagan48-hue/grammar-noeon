# ATTACHED FILE

PART 1 is the MASTER INSTRUCTIONS. The following parts are TASKS: write each of the batches RP26, RP27. Output ALL of them in ONE single JSONL code block, one task per line, batches in order, nothing else (no explanations, no comments, no text after the code block). Do not skip any batch and do not shorten.

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
# PART 2 — TASK RP26

# Batch RP26 · cell R4 · 21 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 21 tasks** of batch RP26 for cell **R4**.

## Distribution (must match exactly)
- Formats: gap 8, mini 5, mc 3, fix 3, which 1, transform 1
- Levels: basic 6, medium 9, advanced 6
- `id`: `RP26-01` … `RP26-21`

### R4. Reported questions

**What is trained:** yes/no questions (if/whether) and wh-questions: statement word order, no do/does/did, no question mark, tense shift.

**The decision:** word order and the linking word (if / whether / wh-word), plus the tense.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** He asked me where did I live; asked if I did like; asked me what was my name; forgetting if.

**Example of the level (do not copy its storyline):** The receptionist asked us (we / to have) a booking.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%


## Scenario seeds for this batch
Below are 26 seeds — more than you need. Choose the 21 that best fit cell R4 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "rl-0119", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Do you keep a spare umbrella?” → Anna asked Leo if he kept a spare umbrella.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0120", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “Where do you buy your coffee?” → Maya asked Leo where he bought his coffee.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0121", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Do you need a receipt?” → Anna asked Leo if he needed a receipt.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0122", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “Where does your uncle live?” → Maya asked Leo where his uncle lived.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0123", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Do you know the way to the pool?” → Anna asked Leo if he knew the way to the pool.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0124", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “Where are the spare chairs?” → Maya asked Leo where the spare chairs were.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0125", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Do you enjoy gardening?” → Anna asked Leo if he enjoyed gardening.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0126", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “Where did you put the stamps?” → Maya asked Leo where he had put the stamps.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0127", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Does your brother drive a van?” → Anna asked Leo if his brother drove a van.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0128", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “Where are you staying?” → Maya asked Leo where he was staying.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0129", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Does the camera have a timer?” → Anna asked Leo if the camera had a timer.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0130", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “Where will you leave the keys?” → Maya asked Leo where he would leave the keys.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0131", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Do the guests eat fish?” → Anna asked Leo if the guests ate fish.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0132", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “Where can the children play?” → Maya asked Leo where the children could play.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0133", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Is your room warm enough?” → Anna asked Leo if his room was warm enough.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0134", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “Why do you avoid the main road?” → Maya asked Leo why he avoided the main road.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0135", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Are the children at school?” → Anna asked Leo if the children were at school.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0136", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “Why is the front door open?” → Maya asked Leo why the front door was open.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0137", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Is the cupboard empty?” → Anna asked Leo if the cupboard was empty.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0138", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “Why did you change the booking?” → Maya asked Leo why he had changed the booking.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0139", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Do you have any allergies?” → Anna asked Leo if he had any allergies.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0140", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “Why has the price increased?” → Maya asked Leo why the price had increased.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0141", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Does the kettle switch itself off?” → Anna asked Leo if the kettle switched itself off.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0142", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “Why are you wearing two coats?” → Maya asked Leo why he was wearing two coats.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0143", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Did you charge the torch?” → Anna asked Leo if he had charged the torch.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0144", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “When does your course begin?” → Maya asked Leo when his course began.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): «at a», «at the», «during the», «before the», «during a», «in a», «in our», «during our», «when i», «halfway through», «why did», «inside a», «inside the», «in the», «outside the», «did the», «after the», «everyone in», «near the», «because the», «on the», «nobody in», «on his», «although the», «minutes before», «on monday,», «early in», «back at», «over lunch», «at an», «on our», «at our», «on my», «ten minutes», «standing at», «on a», «midway through», «when we», «heavy rain», «the baker»
- Verbs/words in brackets already used often (avoid unless required): be, leave, have, keep, open, check, take, drop, run, stay, send, lose, wait, start, need, find, want, stand, close, bring, know, work, put, eat, touch
- Names: Ababa, Abena, Abu, Accra, Ada, Addis, Africa, Aino, Aires, Aisha, Alice, Alpine, Alps, Although, Ama, Amara, Amir, Amsterdam, Andean, Andes, Antarctica, Antwerp, Arctic, Are, Argentina, Aroha, Arthur, Astrid, Athens, Auckland, Aunt, Auntie, Australian, Avebury, Back, Bali, Bangalore, Bangkok, Barcelona, Bavaria, Belgium, Bence, Berlin, Bern, Birmingham, Bogota, Bram, Braun, Brazil, Brisbane, Brno, Brussels, Budapest, Budi, Buenos, Busan, Cairo, Callum, Camila, Camille

## Final self-check (last line of the answer)
`# check: time_markers=<N>/21, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=21, formats=<gap/mini/mc/fix/which/transform>, levels=<b/m/a>`


---
# PART 3 — TASK RP27

# Batch RP27 · cell R4 · 21 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 21 tasks** of batch RP27 for cell **R4**.

## Distribution (must match exactly)
- Formats: gap 8, mini 5, mc 3, fix 3, which 1, transform 1
- Levels: basic 6, medium 9, advanced 6
- `id`: `RP27-01` … `RP27-21`

### R4. Reported questions

**What is trained:** yes/no questions (if/whether) and wh-questions: statement word order, no do/does/did, no question mark, tense shift.

**The decision:** word order and the linking word (if / whether / wh-word), plus the tense.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** He asked me where did I live; asked if I did like; asked me what was my name; forgetting if.

**Example of the level (do not copy its storyline):** The receptionist asked us (we / to have) a booking.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%


## Scenario seeds for this batch
Below are 25 seeds — more than you need. Choose the 21 that best fit cell R4 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "rl-0145", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Did you remember your gloves?” → Anna asked Leo if he had remembered his gloves.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0146", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “When did the parcel arrive?” → Maya asked Leo when the parcel had arrived.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0147", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Did the shop refund the money?” → Anna asked Leo if the shop had refunded the money.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0148", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “When can the electrician come?” → Maya asked Leo when the electrician could come.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0149", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Did you not receive the email?” → Anna asked Leo if he had not received the email.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0150", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “How do you clean the filter?” → Maya asked Leo how he cleaned the filter.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0151", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Did the plumber not leave a number?” → Anna asked Leo if the plumber had not left a number.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0152", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “How did you open the tin?” → Maya asked Leo how he had opened the tin.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0153", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Are you carrying any glass?” → Anna asked Leo if he was carrying any glass.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0154", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “How much does the repair cost?” → Maya asked Leo how much the repair cost.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0155", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Are you looking for a bookshop?” → Anna asked Leo if he was looking for a bookshop.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0156", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “What do you keep in that box?” → Maya asked Leo what he kept in that box.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0157", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Is your friend staying overnight?” → Anna asked Leo if his friend was staying overnight.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0158", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “What did you choose for lunch?” → Maya asked Leo what he had chosen for lunch.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0159", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Were you working on the roof?” → Anna asked Leo if he had been working on the roof.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0160", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “What has your cat broken?” → Maya asked Leo what his cat had broken.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0161", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Was the machine making a noise?” → Anna asked Leo if the machine had been making a noise.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0162", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “What time does the last bus leave?” → Maya asked Leo what time the last bus left.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0163", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Have you seen the new playground?” → Anna asked Leo if he had seen the new playground.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0164", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “Which route will you take?” → Maya asked Leo which route he would take.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0165", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Has your sister passed her driving test?” → Anna asked Leo if his sister had passed her driving test.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0166", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “Who feeds the rabbits?” → Maya asked Leo who fed the rabbits.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0167", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Had you eaten before the interview?” → Anna asked Leo if he had eaten before the interview.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0168", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maya to Leo: “Who moved the ladder?” → Maya asked Leo who had moved the ladder.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "rl-0169", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna to Leo: “Had the visitors left before the storm?” → Anna asked Leo if the visitors had left before the storm.", "hooks": ["a question someone asked"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): «at a», «at the», «during the», «before the», «during a», «in a», «in our», «during our», «when i», «halfway through», «why did», «inside a», «inside the», «in the», «outside the», «did the», «after the», «everyone in», «near the», «because the», «on the», «nobody in», «on his», «although the», «minutes before», «on monday,», «early in», «back at», «over lunch», «at an», «on our», «at our», «on my», «ten minutes», «standing at», «on a», «midway through», «when we», «heavy rain», «the baker»
- Verbs/words in brackets already used often (avoid unless required): be, leave, have, keep, open, check, take, drop, run, stay, send, lose, wait, start, need, find, want, stand, close, bring, know, work, put, eat, touch
- Names: Ababa, Abena, Abu, Accra, Ada, Addis, Africa, Aino, Aires, Aisha, Alice, Alpine, Alps, Although, Ama, Amara, Amir, Amsterdam, Andean, Andes, Antarctica, Antwerp, Arctic, Are, Argentina, Aroha, Arthur, Astrid, Athens, Auckland, Aunt, Auntie, Australian, Avebury, Back, Bali, Bangalore, Bangkok, Barcelona, Bavaria, Belgium, Bence, Berlin, Bern, Birmingham, Bogota, Bram, Braun, Brazil, Brisbane, Brno, Brussels, Budapest, Budi, Buenos, Busan, Cairo, Callum, Camila, Camille

## Final self-check (last line of the answer)
`# check: time_markers=<N>/21, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=21, formats=<gap/mini/mc/fix/which/transform>, levels=<b/m/a>`
