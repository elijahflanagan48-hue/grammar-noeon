# ATTACHED FILE

PART 1 is the MASTER INSTRUCTIONS. The following parts are TASKS: write each of the batches CP31, CP32. Output ALL of them in ONE single JSONL code block, one task per line, batches in order, nothing else (no explanations, no comments, no text after the code block). Do not skip any batch and do not shorten.

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
# PART 2 — TASK CP31

# Batch CP31 · cell C7 · 24 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 24 tasks** of batch CP31 for cell **C7**.

## Distribution (must match exactly)
- Formats: gap 10, mini 5, mc 4, fix 3, which 1, transform 1
- Levels: basic 7, medium 10, advanced 7
- `id`: `CP31-01` … `CP31-24`

### C7. than: what follows

**What is trained:** than + pronoun (than I / than me), than + clause, than expected, more than + number, prepositions after different/similar.

**The decision:** the structure after than and the register (formal / informal).

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** than I am (fine) vs than me; more than I; different than/to/from; same as vs same like.

**Example of the level (do not copy its storyline):** The test was (hard) than we had expected, and Jun scored higher than (I / do).

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%


## Scenario seeds for this batch
Below are 29 seeds — more than you need. Choose the 24 that best fit cell C7 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "cl-0249", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): After the consultation, the committee was well-informed enough to revise its policy, and its proposal was more far-reaching than the original.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0250", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The blue rope is 2 m long; the red one is 3 m. The blue rope is shorter.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0251", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The second host was nicer than the first: she greeted everyone warmly.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0252", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The board's response expressed anger rather than concern: it was more angry than concerned. Its tone was more hostile than that of the earlier statement.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0253", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The brochure does not answer my question. Please send me further information about the course.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0254", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The reply avoids the question, though its few factual claims are accurate. It is more evasive than inaccurate.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0255", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of the witnesses interviewed, the second was the most reluctant to discuss the incident, yet her description was more precise than the first witness's.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0256", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Route A is 8 km and route B is 5 km. Route A is longer.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0257", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): After midnight the street is quieter than at noon.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0258", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Both plans solve the problem equally well. The modular plan is as practical as the fixed plan, but is more adaptable than it.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0259", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The assessment rules out any increase in risk but permits equality. The risk is no greater than before.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0260", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The phrase describes an extremely healthy person, not a literal comparison with a musical instrument. After her holiday, she said she was as fit as a fiddle.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0261", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of the four historians, Salma is the best-read, but her account of the excavation is more detailed than any of the others.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0262", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My brother is 9 and I am 13. He is younger than me.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0263", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): In the story, the second dragon is lazier than the first: it refuses every task.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0264", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Even after the technical briefing, the committee understood nothing more about the failure. They were none the wiser, although the explanation was detailed enough to fill an entire manual.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0265", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Structures may be up to 2 m high, including exactly 2 m. A structure must be no taller than 2 m.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0266", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I have moved the lamp closer twice, but the text is still difficult to read. Is the print any clearer now?", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0267", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The replacement fabric is thin enough to fold into the storage pouch, yet the supplier claims that it is also more durable than the material it replaces.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0268", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Today it is 2°C; yesterday it was 8°C. Today is colder.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0269", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I find this melody lovelier than the first one.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0270", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The editor's comments made the revised argument all the stronger, even though its conclusion remained short enough to fit in a single paragraph.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0271", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Plan A may cost the same as B or less, but not more. A is no more expensive than B.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0272", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Both routes take forty minutes. The bypass is not any quicker than the road through the village.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0273", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The revised contract is the shortest of the six versions in the file, although its financial provisions are more complicated than those in the earlier version.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0274", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): This train takes one hour; the bus takes two. The train is faster.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0275", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The revised reply is politer than the abrupt first draft.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0276", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The redesign created new problems rather than solving the old ones. It was less helpful than the original system, and its rollout was too costly to repeat.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0277", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Выберите грамматически корректное предложение.", "hooks": ["an expectation versus reality"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): «no other», «have you», «why do», «why does», «even though», «"should we», «at the», «i stopped», «if you», «"look at», «i didn't», «with the», «hi mum,», «because the», «according to», «we stayed», «wasn't the», «after trying», «why is», «bring a», «look at», «out of», «do not», «when you», «heavy rain», «the more», «dear council», «when i», «"can you», «did the», «why did», «although the», «we checked», «"is the», «watching the», «none of», «after the», «my swimming», «planning a», «i am»
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: Aalborg, Aberystwyth, According, Actually, Agadir, Agnes, Aiden, Aino, Airport, Alan, Alasdair, Albin, Albuquerque, Alessio, Alex, Alexandria, Alkmaar, All, Alyssa, Amalfi, Amelie, Amira, Ananya, Andre, Andrews, Anja, Annecy, Aomori, Araceli, Arequipa, Arezzo, Aria, Arjun, Arturo, Asheville, Aspen, Astrid, Aswan, Atlanta, Augsburg, Aunt, Aveiro, Avon, Basel, Bay, Bayreuth, Bence, Beth, Biarritz, Bjorn, Bled, Bongani, Brad, Brenda, Brendan, Brent, Brisbane, Britain, Brno, Bruce

## Final self-check (last line of the answer)
`# check: time_markers=<N>/24, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=24, formats=<gap/mini/mc/fix/which/transform>, levels=<b/m/a>`


---
# PART 3 — TASK CP32

# Batch CP32 · cell C8 · 30 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 30 tasks** of batch CP32 for cell **C8**.

## Distribution (must match exactly)
- Formats: gap 12, mini 7, mc 4, fix 4, which 2, transform 1
- Levels: basic 9, medium 12, advanced 9
- `id`: `CP32-01` … `CP32-30`

### C8. Superlatives in real sentences

**What is trained:** the + superlative + present perfect / ever; one of the + superlative + plural; the least; the second/third; the + superlative + in/of/that.

**The decision:** the superlative frame: in / of / ever / one of the / least.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** one of the best teacher; the most big in the world; the less; in my family the oldest of.

**Example of the level (do not copy its storyline):** It was (bad) meal I have ever eaten, but it was one of (cheap) in town.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%


## Scenario seeds for this batch
Below are 36 seeds — more than you need. Choose the 30 that best fit cell C8 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "cl-0278", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The museum's recently restored portrait is valuable enough to require a separate insurance policy, while the unsigned sketch is one of the earliest works in the collection.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0279", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The ropes measure 2, 5 and 8 metres. The eight-metre rope is the longest.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0280", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Complete the conventional group phrases. It is the quietest room in this house and the quietest of the four rooms we tested.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0281", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The battery-powered model is not as reliable as the mains-powered one; its battery life is also one of the best in its price category.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0282", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): This is one of the nicest ___ in the town.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0283", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): In traditional formal written style, the engineer describes the reinforced frame as the stronger of the two frames tested.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0284", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The coastal route is sufficiently scenic to attract walkers throughout the year, but it is also the most vulnerable to disruption during storms.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0285", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Room 3 is larger than rooms 1 and 2; these are the only rooms. Room 3 is the biggest of the three.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0286", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Both lakes reached the same maximum depth in the survey. They are the joint deepest lakes among the eight surveyed.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0287", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Port Vale is as large as the other port in the region by population, but ranks only fifth among the twenty cities for density: it is the fifth-most densely populated.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0288", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Exactly two reports are compared in traditional formal written style. This report covers twenty issues; the other covers five. This is the more detailed of the two.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0289", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The garden changes through the seasons. It is at its most colourful in September, when more varieties are in flower than at any other time.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0290", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Model K is effective enough to remove the specified contaminant, although its replacement cartridge is one of the most expensive on the market.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0291", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Ada scored more points than all her opponents. She had the highest score in the tournament.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0292", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): After the six samples were compared, the laboratory marked this sample as purest; no other sample contained such a small proportion of impurities.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0293", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The editor is comparing exactly two versions in traditional formal written style. The later version is the more coherent of the two, but the opening paragraph is still the weakest part of the whole essay.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0294", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): She has presented ten arguments; these three are rated above all the others. These are her most convincing arguments.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0295", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): In a formal note of thanks, the visitor wrote, 'You have been most helpful.' She was expressing strong gratitude, not ranking the staff.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0296", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The report identifies the eastern district as the city's most deprived area, yet its community centre has better facilities than several wealthier districts' centres.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0297", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Eva exceeds all her teammates in height. She is taller than every other member of the team.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0298", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The second-most expensive model has a better battery than the cheapest one, although it costs only slightly more.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0299", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of the eight rescue vehicles tested, the tracked model was the most manoeuvrable on soft ground, although it was slower than the others on the road.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0300", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Among these five weeks, this was the busiest ___ the month.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0301", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Several routes are equally short. The woodland route is one of the shortest, rather than the only route with the minimum distance.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0302", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The chamber is large enough for the recording equipment and has the best acoustics of all the rooms tested.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0303", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Exactly two devices are compared in traditional formal style. A fails less often than B. A is the more reliable of the two.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0304", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): No other photograph in my folder has received such a high rating. This is my best photograph.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0305", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The museum's acquisition is sufficiently recent to remain on the new-arrivals list, but it is already one of the most fragile objects in the collection.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0306", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Two items share the highest price in the set. This is the joint most expensive item in the set.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0307", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): No person who completed the expedition was younger than Dara. She was the youngest person to complete the route, despite having less experience than most of the group.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0308", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The offer was as high as the owner had requested and included the most favourable conditions of all the bids.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0309", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The room ranks second by size in the building. It is the second-largest room in the building.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0310", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): This is one of the most useful tools in the workshop because it can replace three separate instruments.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0311", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The organisation's proposal was too ambitious for its existing resources and became its most controversial scheme of the year.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0312", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Exactly two routes are compared in traditional formal style. This one costs £5 and the other £8. This is the cheaper of the two.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0313", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of all the meals we ate on the trip, the family dinner was the most memorable. We still talk about it.", "hooks": ["a ranking or record"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): «no other», «have you», «why do», «why does», «even though», «"should we», «at the», «i stopped», «if you», «"look at», «i didn't», «with the», «hi mum,», «because the», «according to», «we stayed», «wasn't the», «after trying», «why is», «bring a», «look at», «out of», «do not», «when you», «heavy rain», «the more», «dear council», «when i», «"can you», «did the», «why did», «although the», «we checked», «"is the», «watching the», «none of», «after the», «my swimming», «planning a», «i am»
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: Aalborg, Aberystwyth, According, Actually, Agadir, Agnes, Aiden, Aino, Airport, Alan, Alasdair, Albin, Albuquerque, Alessio, Alex, Alexandria, Alkmaar, All, Alyssa, Amalfi, Amelie, Amira, Ananya, Andre, Andrews, Anja, Annecy, Aomori, Araceli, Arequipa, Arezzo, Aria, Arjun, Arturo, Asheville, Aspen, Astrid, Aswan, Atlanta, Augsburg, Aunt, Aveiro, Avon, Basel, Bay, Bayreuth, Bence, Beth, Biarritz, Bjorn, Bled, Bongani, Brad, Brenda, Brendan, Brent, Brisbane, Britain, Brno, Bruce

## Final self-check (last line of the answer)
`# check: time_markers=<N>/30, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=30, formats=<gap/mini/mc/fix/which/transform>, levels=<b/m/a>`


