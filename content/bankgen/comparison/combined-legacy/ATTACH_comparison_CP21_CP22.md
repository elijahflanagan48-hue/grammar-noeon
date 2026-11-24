# ATTACHED FILE

PART 1 is the MASTER INSTRUCTIONS. The following parts are TASKS: write each of the batches CP21, CP22. Output ALL of them in ONE single JSONL code block, one task per line, batches in order, nothing else (no explanations, no comments, no text after the code block). Do not skip any batch and do not shorten.

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
# PART 2 — TASK CP21

# Batch CP21 · cell C1 · 18 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 18 tasks** of batch CP21 for cell **C1**.

## Distribution (must match exactly)
- Formats: gap 7, mini 4, mc 3, fix 2, which 1, transform 1
- Levels: basic 6, medium 7, advanced 5
- `id`: `CP21-01` … `CP21-18`

### C1. Comparative or superlative?

**What is trained:** two things → comparative + than; three or more → the + superlative (+ in/of).

**The decision:** the learner reads how many things are compared and whether `than` or `the…in/of` frames the sentence.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** He is the taller of two; more bigger; the most easiest; than/then; the + comparative without than.

**Example of the level (do not copy its storyline):** Of my two brothers, Teo is (tall), but Ilya is the (strong) player in the whole team.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%


## Scenario seeds for this batch
Below are 22 seeds — more than you need. Choose the 18 that best fit cell C1 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "cl-0001", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of all the candidates, Noor is the best-qualified, but Eva has a better-established network of professional contacts than Noor does.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0002", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): These ropes measure 1, 2 and 3 m. The 1 m rope is the shortest.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0003", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nina says the day she adopted her cat was the happiest day of her childhood.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0004", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The panel must compare exactly two designs in traditional formal written style. The lighter design is the more practical of the two, although it is not the most durable product in the company's entire range.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0005", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The three bags cost £5, £10 and £20. The £5 bag is the cheapest.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0006", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): In a traditional formal comparison of exactly two proposals, this is the more practical of the two: it needs no extra equipment.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0007", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The revised contract is too restrictive for our usual suppliers to accept, but the wording of the liability clause is clearer than it was before.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0008", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The paths are 2, 4 and 9 km long. The 9 km path is the longest.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0009", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of the rooms we visited, the room at the back was the quietest.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0010", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): In traditional formal written style, of the two assessments, the independent one is the more critical. Of all nine assessments submitted, however, the internal review is the most critical.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0011", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Four rooms were rated for comfort. Room 2 received the highest rating: it is the most comfortable room of the four.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0012", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The two entries received the same top score, above every other entry. They were the joint most successful entries in the competition.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0013", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The negotiations were too tense for an informal discussion, and the eventual compromise was more satisfactory than either delegation had hoped.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0014", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of the five cousins, the baby is the youngest.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0015", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of the three villages, the one beyond the hills is the farthest away.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0016", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The garden is as beautiful in late May as it is in September, although the estate's oldest tree looks more striking in winter.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0017", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Exactly two candidates are compared in traditional formal style. One has ten years of experience, the other two. The first is the more experienced of the two.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0018", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The guide was useful throughout the project, but it was at its most useful during the installation stage, when we consulted it daily.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0019", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of the samples in the research programme, the national survey uses the largest, but our interviews provide a more detailed account than its short questionnaires do.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0020", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of the three days, the day with a temperature of −5°C was the coldest.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0021", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of the three plates, the spotless one is the cleanest.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0022", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The archive lists one hundred manuscripts by date. This is the third-oldest manuscript, but its binding is the best-preserved of all the bindings examined.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): «no other», «have you», «why do», «why does», «even though», «"should we», «at the», «i stopped», «if you», «"look at», «i didn't», «with the», «hi mum,», «because the», «according to», «we stayed», «wasn't the», «after trying», «why is», «bring a», «look at», «out of», «do not», «when you», «heavy rain», «the more», «dear council», «when i», «"can you», «did the», «why did», «although the», «we checked», «"is the», «watching the», «none of», «after the», «my swimming», «planning a», «i am»
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: Aalborg, Aberystwyth, According, Actually, Agadir, Agnes, Aiden, Aino, Airport, Alan, Alasdair, Albin, Albuquerque, Alessio, Alex, Alexandria, Alkmaar, All, Alyssa, Amalfi, Amelie, Amira, Ananya, Andre, Andrews, Anja, Annecy, Aomori, Araceli, Arequipa, Arezzo, Aria, Arjun, Arturo, Asheville, Aspen, Astrid, Aswan, Atlanta, Augsburg, Aunt, Aveiro, Avon, Basel, Bay, Bayreuth, Bence, Beth, Biarritz, Bjorn, Bled, Bongani, Brad, Brenda, Brendan, Brent, Brisbane, Britain, Brno, Bruce

## Final self-check (last line of the answer)
`# check: time_markers=<N>/18, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=18, formats=<gap/mini/mc/fix/which/transform>, levels=<b/m/a>`


---
# PART 3 — TASK CP22

# Batch CP22 · cell C1 · 18 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 18 tasks** of batch CP22 for cell **C1**.

## Distribution (must match exactly)
- Formats: gap 7, mini 4, mc 3, fix 2, which 1, transform 1
- Levels: basic 6, medium 7, advanced 5
- `id`: `CP22-01` … `CP22-18`

### C1. Comparative or superlative?

**What is trained:** two things → comparative + than; three or more → the + superlative (+ in/of).

**The decision:** the learner reads how many things are compared and whether `than` or `the…in/of` frames the sentence.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** He is the taller of two; more bigger; the most easiest; than/then; the + comparative without than.

**Example of the level (do not copy its storyline):** Of my two brothers, Teo is (tall), but Ilya is the (strong) player in the whole team.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%


## Scenario seeds for this batch
Below are 22 seeds — more than you need. Choose the 18 that best fit cell C1 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "cl-0023", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): A most thoughtful gesture means ___.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0024", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): All five routes have been assessed for safety. Which route is safest, taking the full set of risk ratings into account?", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0025", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The smaller engine is efficient enough for daily city deliveries, but its performance on long climbs is worse than its rival's.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0026", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of the four runners, the winner was the fastest.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0027", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of the three coats, the one dripping with water was the wettest.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0028", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): For a formal written comparison of exactly two samples, sample A is the more representative of the two. Yet neither is among the most representative samples in the full dataset.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0029", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): No bag in this set costs less than the green one; another bag may share its price. It is one of the cheapest bags in the set.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0030", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The formal letter offers warm praise without comparing the writer's hosts with anyone else: it calls them most generous hosts.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0031", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of all the responses to the consultation, the public's was the most hostile, while support within the council was stronger than it had been before the consultation.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0032", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of these three editions, the one published this morning is the newest.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0033", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): In the story, the dragon that never moves is the laziest of the five.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0034", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The conclusion is too short to summarise every chapter, yet it contains the book's most far-reaching claim.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0035", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): No other idea in our list is more useful than this one. It is one of the most useful ideas in the list.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0036", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The new hall is large enough for the conference, but its stage is the widest of all the stages measured.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0037", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The revised schedule is sufficiently flexible to accommodate an extra delivery, although evening work remains more frequent than the team would prefer.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0038", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of all the hosts we met, Jo was the nicest.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0039", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): To me, the final melody is the loveliest of the six.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0040", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of the eleven bids received, the local firm's was the most competitive on price, although its delivery estimate was longer than those of several rivals.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0041", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The three bags have capacities of 5, 10 and 20 litres. The five-litre bag is the smallest.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0042", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The report does not claim that this design is uniquely best. It places it among the most reliable designs tested.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0043", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The upgraded filter makes the water clear enough for visual inspection, although the maintenance procedure is more demanding than the supplier suggested.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0044", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of the three routes, the pedestrian path is the safest.", "hooks": ["choice between two"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): «no other», «have you», «why do», «why does», «even though», «"should we», «at the», «i stopped», «if you», «"look at», «i didn't», «with the», «hi mum,», «because the», «according to», «we stayed», «wasn't the», «after trying», «why is», «bring a», «look at», «out of», «do not», «when you», «heavy rain», «the more», «dear council», «when i», «"can you», «did the», «why did», «although the», «we checked», «"is the», «watching the», «none of», «after the», «my swimming», «planning a», «i am»
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: Aalborg, Aberystwyth, According, Actually, Agadir, Agnes, Aiden, Aino, Airport, Alan, Alasdair, Albin, Albuquerque, Alessio, Alex, Alexandria, Alkmaar, All, Alyssa, Amalfi, Amelie, Amira, Ananya, Andre, Andrews, Anja, Annecy, Aomori, Araceli, Arequipa, Arezzo, Aria, Arjun, Arturo, Asheville, Aspen, Astrid, Aswan, Atlanta, Augsburg, Aunt, Aveiro, Avon, Basel, Bay, Bayreuth, Bence, Beth, Biarritz, Bjorn, Bled, Bongani, Brad, Brenda, Brendan, Brent, Brisbane, Britain, Brno, Bruce

## Final self-check (last line of the answer)
`# check: time_markers=<N>/18, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=18, formats=<gap/mini/mc/fix/which/transform>, levels=<b/m/a>`


