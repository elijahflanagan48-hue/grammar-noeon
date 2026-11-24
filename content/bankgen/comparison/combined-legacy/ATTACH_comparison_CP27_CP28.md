# ATTACHED FILE

PART 1 is the MASTER INSTRUCTIONS. The following parts are TASKS: write each of the batches CP27, CP28. Output ALL of them in ONE single JSONL code block, one task per line, batches in order, nothing else (no explanations, no comments, no text after the code block). Do not skip any batch and do not shorten.

---
# PART 1 — MASTER INSTRUCTIONS

# Grammar NOEON — Degrees of comparison (степени сравнения). Main instruction

> Paste this first into every new chat (or send it as the system message). Then send one stage prompt (seeds or a batch). This text is generated from `scripts/bankgen_specs.py` — do not edit it by hand.

## Who you are and what we are doing

You are the author of exercises for Grammar NOEON (grammar.noeon.org), a grammar trainer for Russian-speaking learners of English (school students and adults). We are rebuilding the bank for the topic **Degrees of comparison (степени сравнения)** from scratch.

The main complaint about the old banks: **every task feels the same** — one storyline, one sentence frame, one marker that gives the answer away. After ten tasks the learner stops thinking about grammar and just looks for the marker. The new bank must be varied in storyline, sentence structure, the decision the learner makes, and the format.

Editorial language: **British English** (colour, organise, flat, lift, queue, timetable). Explanations are in **Russian**.

## Principle 1. Every task is its own small story

- Every task is built on **one scenario seed** from the list you are given (`seed_id`). A seed is used **once**. If a seed does not fit the cell, skip it; do not bend it.
- Typical scenes for this topic: Two or more things, people, places or times are compared for a reason: a choice, a complaint, a recommendation, a result, a review, a rumour, a plan.
- Keep **one live detail**: a cause, a consequence, a reaction, a number, a name, an unexpected turn.
- **Banned / limited for this topic:** «Ann is 18 and Ben is 15» number pairs where the answer is read off the digits (at most 10% of tasks may contain two numbers to compare); the scene «Of the three…»; weather in London; school subjects as the only comparison.
- Vary **point of view** (first person at least 25%), **register** (dialogue, chat, notice, news, instruction, review, email, story), **tone** (funny, irritating, alarming, touching, neutral, ironic).
- **Names:** different cultures (British, Irish, Indian, Polish, Nigerian, Spanish, Chinese, Arabic, Russian…). A name never appears twice in a batch. Do not use Nora, Maya, Nina, Mia, Tom, Anna, John, Mary, Bob, Ben — they are overused. Often no name is needed ("my neighbour", "the new intern").
- Places can be real or ordinary. No celebrities, politics, religion, war, tragedies with victims, or diagnoses.

## Principle 2. The learner makes a real decision every time

- The cell (`cell`) sets **what** is trained. Inside one cell the decisions must still differ from task to task.
- **No hints before the answer.** The bracket holds only what is allowed (see "Brackets"). The form is decided by context.
- **Explicit time markers** (yesterday, last week, since, for, already, yet, just, now, tomorrow, next…, every…, ago, by the time) — in **at most 1 in 3** tasks per batch.
- Each task has **one correct meaning**. If two readings are possible, rewrite the context.
- The learner must decide the FORM (comparative / superlative / as…as / modifier), not just add -er. The context must show whether two or many things are compared.
- Use real reasons for comparing; avoid dry fact lists. Prefer opinions, plans, reviews and reports.
- Include adverbs, nouns (fewer/less) and verbs (works harder) — not only adjectives. Adjectives at most 55% of the gaps.
- Spread the forms: no single form (-er, more, the -est, as…as) in more than 25% of the batch.

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

the bracket holds the base adjective/adverb/noun (`(good)`, `(quickly)`, `(little / time)`), plus any word that must be used (`(not / tall)`)

## Difficulty levels (sentence complexity)

- `basic` — a simple sentence or a short dialogue, everyday vocabulary, one decision.
- `medium` — a complex sentence or dialogue, a less obvious context, a negative or a question.
- `advanced` — a longer sentence with a subordinate clause, the answer follows from the logic of several facts, vocabulary up to B2.

## Answers and checking

- `answer` — the main answer (for `gap`/`mini`: only the words that go into the gap).
- `accepted_answers` — **all** grammatically correct variants that fit the context, including `answer`: contractions, `will` ↔ `be going to` where both fit, optional `that`, both word orders of an adverb if both are correct. Never add "almost correct" variants. If unsure, change the context so the question does not arise.
- `explanation_ru` — 1–2 short sentences in Russian: why this form fits **in this context**; for `mc`/`fix` — what the typical mistake is. No links, no source tags, no "Ответ:" at the start.
- `construction` — one tag from the list below (for `gap`/`mini` put it in each blank).

Allowed `construction` tags: `cp_adverb`, `cp_as_as`, `cp_as_many_much`, `cp_choice`, `cp_comparative`, `cp_double_comparative`, `cp_er_est`, `cp_even_still`, `cp_fewer_less`, `cp_fix_mixed`, `cp_irregular`, `cp_least`, `cp_mixed_text`, `cp_modifier_comparative`, `cp_modifier_superlative`, `cp_more_most`, `cp_more_than_number`, `cp_multiples`, `cp_not_as_as`, `cp_one_of_the`, `cp_ordinal_superlative`, `cp_rewrite`, `cp_same_as`, `cp_similar_different`, `cp_spelling`, `cp_superlative`, `cp_superlative_ever`, `cp_than_clause`, `cp_than_expected`, `cp_than_pronoun`, `cp_the_the`, `cp_verb_comparison`

## Cells of this topic

### C1. Comparative or superlative?

**What is trained:** two things → comparative + than; three or more → the + superlative (+ in/of).

**The decision:** the learner reads how many things are compared and whether `than` or `the…in/of` frames the sentence.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** He is the taller of two; more bigger; the most easiest; than/then; the + comparative without than.

**Example of the level (do not copy its storyline):** Of my two brothers, Teo is (tall), but Ilya is the (strong) player in the whole team.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### C2. Short or long form and spelling

**What is trained:** -er/-est vs more/most (two-syllable: clever, simple, quiet, narrow, common), doubling consonant, y→i, irregular good/bad/far/old.

**The decision:** the learner chooses the pattern and spells it; irregular forms in context.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** more cheap; the most cheap; funnyer; bigger→biger; farer; elder in wrong use; more easy.

**Example of the level (do not copy its storyline):** The path through the woods was (narrow) than I expected, but the view was (good) than from the road.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### C3. as … as, the same as, different from

**What is trained:** as…as, not as/so…as, twice/half/three times as…as, the same…as, similar to, different from, as much/many as.

**The decision:** choose equality/inequality and the linking words; the `as` count and position.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** as tall than; so tall as me (wrong), the same like; as big that; equal with; twice more than.

**Example of the level (do not copy its storyline):** Our new flat isn't (spacious) the old one, but it's twice (cheap) and just (close) to the station.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### C4. Modifiers: much, far, a bit, by far, easily

**What is trained:** a lot / much / far / slightly / a bit / even / still + comparative; by far / easily / much + the + superlative; the second-biggest.

**The decision:** choose the modifier that fits the strength and the form (`very` cannot modify a comparative).

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** very better; more much; by far the better of two; the more biggest.

**Example of the level (do not copy its storyline):** This laptop is (far / fast) than the old one, and it is by far (cheap) in the shop.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### C5. the … the …, and more and more

**What is trained:** the more…, the better…; getting colder and colder; more and more expensive.

**The decision:** recognise cause and effect and build the double comparative.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** the more you study, more you know; more and more better; the more…the more better.

**Example of the level (do not copy its storyline):** The (long) we waited, the (angry) the passengers got, and the platform became (crowded) and (crowded).

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### C6. Adverbs, nouns and verbs

**What is trained:** faster / more carefully / better / worse (adverbs); fewer / less / more + noun; as many / as much as; works harder than.

**The decision:** decide adjective vs adverb, countable vs uncountable (fewer/less), and the form of the adverb.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** She sings more good; less people; fewer money; more quick; hardlier; the most hard.

**Example of the level (do not copy its storyline):** Since we moved, I sleep (well) and I spend (little) time on the road, so there are (few) arguments at home.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### C7. than: what follows

**What is trained:** than + pronoun (than I / than me), than + clause, than expected, more than + number, prepositions after different/similar.

**The decision:** the structure after than and the register (formal / informal).

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** than I am (fine) vs than me; more than I; different than/to/from; same as vs same like.

**Example of the level (do not copy its storyline):** The test was (hard) than we had expected, and Jun scored higher than (I / do).

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### C8. Superlatives in real sentences

**What is trained:** the + superlative + present perfect / ever; one of the + superlative + plural; the least; the second/third; the + superlative + in/of/that.

**The decision:** the superlative frame: in / of / ever / one of the / least.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** one of the best teacher; the most big in the world; the less; in my family the oldest of.

**Example of the level (do not copy its storyline):** It was (bad) meal I have ever eaten, but it was one of (cheap) in town.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### C9. Mixed mini-texts, rewrite and error hunt

**What is trained:** a review or short text with 2–4 different comparisons; rewrite a sentence with as…as / than; find the mistake.

**The decision:** different forms in one text; the choice of structure that keeps the meaning.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** all of the above.

**Example of the level (do not copy its storyline):** Rewrite with the same meaning: Our hotel was cheaper than yours. → Your hotel wasn't as ___ as ours.

**Typical format mix:** mini 40%, fix 20%, transform 20%, which 10%, mc 10%


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
# PART 2 — TASK CP27

# Batch CP27 · cell C4 · 30 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 30 tasks** of batch CP27 for cell **C4**.

## Distribution (must match exactly)
- Formats: gap 12, mini 7, mc 4, fix 4, which 2, transform 1
- Levels: basic 9, medium 12, advanced 9
- `id`: `CP27-01` … `CP27-30`

### C4. Modifiers: much, far, a bit, by far, easily

**What is trained:** a lot / much / far / slightly / a bit / even / still + comparative; by far / easily / much + the + superlative; the second-biggest.

**The decision:** choose the modifier that fits the strength and the form (`very` cannot modify a comparative).

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** very better; more much; by far the better of two; the more biggest.

**Example of the level (do not copy its storyline):** This laptop is (far / fast) than the old one, and it is by far (cheap) in the shop.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%


## Scenario seeds for this batch
Below are 36 seeds — more than you need. Choose the 30 that best fit cell C4 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "cl-0140", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The spokesperson sounded defensive rather than informative. Her reply was more defensive than informative, whereas the written report was more informative than the speech.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0141", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The station is 4 km away and the park 2 km away. The station is farther away than the park.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0142", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Although the shed had stood empty for months, not a trace of moisture remained. The wood was as dry as a bone.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0143", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The revised procedure meets a higher standard: it is superior to its predecessor, yet it is more demanding to administer than the previous procedure.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0144", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The full account covers all six stages; the summary covers only two. In coverage, the account is more complete than the summary.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0145", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The revised quote is exactly the same price as the first one. It is not any cheaper than the original quote.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0146", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Neither response was desirable, but a short interruption would do less harm than a shutdown. It was the lesser of two evils, although even that option was too disruptive for the night shift.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0147", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Both options cause harm, but A causes less. It is the lesser of two evils.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0148", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The first instructions confused everyone. Are the updated instructions any better, or do they leave the same questions unanswered?", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0149", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The organisation was as well off after the grant as it had been before the funding cut, but its remote branch was worse off because its local subsidy had been withdrawn.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0150", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The results may be equally significant or more significant, but not less. They are no less significant than the pilot results.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0151", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Everyone is welcome at the celebration, and extra guests will make it more enjoyable. As the saying goes, the more, the merrier.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0152", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of the accounts available, the revised version is the most complete, although its chronology is less clear than the original: several dates are omitted.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0153", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): A cannot cost less than B, but equal prices are allowed. A is no cheaper than B.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0154", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The replacement must match or exceed the present quality. It must be no worse than the current product.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0155", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The first report described a major emergency, but the inspection found only a minor fault. The problem is not urgent enough to justify closing the site and is more limited than the first report suggested.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0156", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): A may equal B in price or cost more, but may not cost less. A is no cheaper than B.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0157", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The reply offered politeness rather than help. It was more polite than helpful; it did not answer the actual question.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0158", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The panel must be thin enough to fit the slot and no thicker than twelve millimetres.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0159", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Both alternatives are harmful, but this one is less harmful. We chose the lesser of two evils.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0160", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The visitors were interested rather than impressed. They were more interested than impressed.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0161", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of the fee structures considered, the revised one is the most expensive, but the associated service is no less reliable than before.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0162", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My aunt was born before my father. She is two years older than he is.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0163", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The replacement passed every test and the old model failed two. It is superior to the old model.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0164", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The submission must be long enough to explain the method and the summary no shorter than 200 words.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0165", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The label does not say how to wash the cloth. We need further instructions before putting it in the machine.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0166", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): A short delay would avoid cancelling the entire event. It is preferable to a cancellation.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0167", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The venue must be small enough to fit the site, while admission must be no more expensive than at the old hall.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0168", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The central café's prices are higher than those at the station café, where the same meals cost less.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0169", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The new pump produces more water per minute. Its output is higher than that of the old pump.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0170", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The replacement ramp must be steep enough to reach the platform within the available distance and no narrower than the original.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0171", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The suitcase can weigh 15 kg or less, including exactly 15 kg. It must be no heavier than 15 kg.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0172", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The task took twenty minutes, though we had allowed only ten. It was lengthier than expected.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0173", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of the materials assessed, the proposed surface is the most resistant to moisture and no less flexible than the original material.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0174", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The three camps are 2, 4 and 8 km from the gate. The eight-kilometre camp is the farthest from the gate.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0175", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The two sisters were born in 1990 and 1995. The one born in 1990 is the older sister, though both work at the same hospital.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): «no other», «have you», «why do», «why does», «even though», «"should we», «at the», «i stopped», «if you», «"look at», «i didn't», «with the», «hi mum,», «because the», «according to», «we stayed», «wasn't the», «after trying», «why is», «bring a», «look at», «out of», «do not», «when you», «heavy rain», «the more», «dear council», «when i», «"can you», «did the», «why did», «although the», «we checked», «"is the», «watching the», «none of», «after the», «my swimming», «planning a», «i am»
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: Aalborg, Aberystwyth, According, Actually, Agadir, Agnes, Aiden, Aino, Airport, Alan, Alasdair, Albin, Albuquerque, Alessio, Alex, Alexandria, Alkmaar, All, Alyssa, Amalfi, Amelie, Amira, Ananya, Andre, Andrews, Anja, Annecy, Aomori, Araceli, Arequipa, Arezzo, Aria, Arjun, Arturo, Asheville, Aspen, Astrid, Aswan, Atlanta, Augsburg, Aunt, Aveiro, Avon, Basel, Bay, Bayreuth, Bence, Beth, Biarritz, Bjorn, Bled, Bongani, Brad, Brenda, Brendan, Brent, Brisbane, Britain, Brno, Bruce

## Final self-check (last line of the answer)
`# check: time_markers=<N>/30, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=30, formats=<gap/mini/mc/fix/which/transform>, levels=<b/m/a>`


---
# PART 3 — TASK CP28

# Batch CP28 · cell C5 · 24 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 24 tasks** of batch CP28 for cell **C5**.

## Distribution (must match exactly)
- Formats: gap 10, mini 5, mc 4, fix 3, which 1, transform 1
- Levels: basic 7, medium 10, advanced 7
- `id`: `CP28-01` … `CP28-24`

### C5. the … the …, and more and more

**What is trained:** the more…, the better…; getting colder and colder; more and more expensive.

**The decision:** recognise cause and effect and build the double comparative.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** the more you study, more you know; more and more better; the more…the more better.

**Example of the level (do not copy its storyline):** The (long) we waited, the (angry) the passengers got, and the platform became (crowded) and (crowded).

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%


## Scenario seeds for this batch
Below are 29 seeds — more than you need. Choose the 24 that best fit cell C5 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "cl-0176", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of the procedures tested, the revised one was the most effective, despite requiring only half as long a training period as the old one.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0177", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The population rises every month. The city is becoming more and more crowded.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0178", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Both candidates can do the job equally well. In formal written style, Leena is as capable a manager as the other candidate.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0179", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): As the pool of eligible applicants narrows, each appointment carries greater risk. The smaller the pool, the more consequential each selection decision becomes.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0180", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Clear instructions reduce the number of questions. The clearer the instructions are, the fewer questions people ask.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0181", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The full ribbon is 12 metres long and the sample is 4 metres long. The sample is one third as long as the full ribbon.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0182", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Greater disclosure reduces the scope for contradictory interpretations. The more transparent the process, the fewer conflicting accounts emerge.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0183", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): One lens costs £201 and the other £200. The first is slightly more expensive than the second.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0184", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The original cable is 10 metres long and the spare is 5 metres long. The spare is half as long as the original.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0185", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): A higher degree of specialisation reduces the number of suitable vacancies. The more specialised the qualification, the fewer suitable posts there are.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0186", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Both methods achieve the same success rate. In formal written English: this is as effective a method as the old one.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0187", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The revised estimate is £405 and the earlier estimate £400. The revised price is five pounds higher, not five times as high.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0188", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): When supporting evidence becomes more convincing, the initial objection becomes harder to defend. The more compelling the evidence, the less defensible the objection becomes.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0189", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): New requirements are added every week. The task is getting more and more complicated.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0190", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The alternative design saves just two minutes during installation. It is only a little more convenient than the original.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0191", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): More comprehensive checks leave fewer faults unnoticed, making the final product more reliable. The more thorough the inspection, the more reliable the finished product.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0192", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): A is 4 m long and B is 8 m long. A is half as long as B.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0193", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The original plan was risky, but the revision removed the only backup route. The revised plan is still riskier.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0194", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The alternative method is sufficiently economical for routine production, although its implementation is slightly more complicated than the initial plan suggested.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0195", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The new version improves the rating by only one point. It is slightly better than the old one.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0196", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): New exceptions are added every month. The procedure is becoming more and more complicated, rather than simpler.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0197", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The revised account is coherent enough for a reader unfamiliar with the dispute, even though the chronology is only slightly clearer than it was before.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0198", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Выберите грамматически корректное предложение.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0199", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Demand rises every week, and each new round of bookings adds pressure. Places are becoming more and more difficult to obtain.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0200", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The replacement device is wide enough to accommodate the larger sensor, while its casing is much more robust than the earlier plastic housing.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0201", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Traffic increases each week. The street is getting noisier and noisier.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0202", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): More preparation reduces uncertainty. The more thorough the preparation, the less uncertain the team feels about the next stage.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0203", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The archive is easily the most extensive of the five collections, although its online catalogue is rather more difficult to navigate than the others.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0204", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Among all four solutions, this one is far ahead on practicality. It is by far the most practical solution.", "hooks": ["an effect (the more…the…)"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): «no other», «have you», «why do», «why does», «even though», «"should we», «at the», «i stopped», «if you», «"look at», «i didn't», «with the», «hi mum,», «because the», «according to», «we stayed», «wasn't the», «after trying», «why is», «bring a», «look at», «out of», «do not», «when you», «heavy rain», «the more», «dear council», «when i», «"can you», «did the», «why did», «although the», «we checked», «"is the», «watching the», «none of», «after the», «my swimming», «planning a», «i am»
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: Aalborg, Aberystwyth, According, Actually, Agadir, Agnes, Aiden, Aino, Airport, Alan, Alasdair, Albin, Albuquerque, Alessio, Alex, Alexandria, Alkmaar, All, Alyssa, Amalfi, Amelie, Amira, Ananya, Andre, Andrews, Anja, Annecy, Aomori, Araceli, Arequipa, Arezzo, Aria, Arjun, Arturo, Asheville, Aspen, Astrid, Aswan, Atlanta, Augsburg, Aunt, Aveiro, Avon, Basel, Bay, Bayreuth, Bence, Beth, Biarritz, Bjorn, Bled, Bongani, Brad, Brenda, Brendan, Brent, Brisbane, Britain, Brno, Bruce

## Final self-check (last line of the answer)
`# check: time_markers=<N>/24, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=24, formats=<gap/mini/mc/fix/which/transform>, levels=<b/m/a>`


