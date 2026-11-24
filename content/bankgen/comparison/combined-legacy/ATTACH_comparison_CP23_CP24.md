# ATTACHED FILE

PART 1 is the MASTER INSTRUCTIONS. The following parts are TASKS: write each of the batches CP23, CP24. Output ALL of them in ONE single JSONL code block, one task per line, batches in order, nothing else (no explanations, no comments, no text after the code block). Do not skip any batch and do not shorten.

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
# PART 2 — TASK CP23

# Batch CP23 · cell C2 · 18 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 18 tasks** of batch CP23 for cell **C2**.

## Distribution (must match exactly)
- Formats: gap 7, mini 4, mc 3, fix 2, which 1, transform 1
- Levels: basic 6, medium 7, advanced 5
- `id`: `CP23-01` … `CP23-18`

### C2. Short or long form and spelling

**What is trained:** -er/-est vs more/most (two-syllable: clever, simple, quiet, narrow, common), doubling consonant, y→i, irregular good/bad/far/old.

**The decision:** the learner chooses the pattern and spells it; irregular forms in context.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** more cheap; the most cheap; funnyer; bigger→biger; farer; elder in wrong use; more easy.

**Example of the level (do not copy its storyline):** The path through the woods was (narrow) than I expected, but the view was (good) than from the road.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%


## Scenario seeds for this batch
Below are 22 seeds — more than you need. Choose the 18 that best fit cell C2 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "cl-0045", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Leila had studied the regulations. She was sufficiently well-informed to answer the technical questions and proposed a more cost-effective solution than Omar did.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0046", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The travel bag is smaller than the suitcase.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0047", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): At 180 cm, Leo is taller than Tom, who is 170 cm.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0048", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The upgraded control panel is sufficiently user-friendly for a trainee to operate without help, while the redesigned motor is more energy-efficient than the previous model.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0049", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Mia is 12 and Kim is 10. Mia is older than Kim.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0050", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): This padded chair is more comfortable than the hard stool.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0051", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The new chair was as polite as her predecessor when challenged, but her position on the deadline was firmer than her predecessor's.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0052", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): This pen costs £1; that one costs £3. This one is cheaper.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0053", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): After repairs, this printer is more reliable than before.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0054", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The reinforced case is too heavy for one person to carry safely, but its contents remain safer during transport than they did in the original packaging.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0055", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): It is 20°C in this room and 16°C outside. This room is warmer.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0056", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The second solution is cleverer than the first: it solves two problems at once.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0057", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The second witness seemed as confident as the first, but her account was less consistent than his: she contradicted herself several times.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0058", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The old lift takes a minute; the new one takes thirty seconds. The old lift is slower.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0059", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): This towel is drier than the one still soaking in water.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0060", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of the housing schemes assessed, the new development offers the most affordable homes, but the journey to the centre is longer than residents were promised.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0061", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): This hall holds 300 people; that one holds 100. This hall is larger.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0062", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): For me, the little reading room is cosier than the echoing hall.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0063", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of the proposals considered this year, the council's latest is the most ambitious, but its explanation of the costs is less convincing than the original: several figures are missing.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0064", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): This door is 90 cm wide; that one is 70 cm. This door is wider.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0065", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I thought the second joke was sillier than the first.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0066", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The new policy is as generous as the old one towards permanent staff, but considerably less favourable towards temporary workers than the previous agreement was: their benefits have been cut.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): «no other», «have you», «why do», «why does», «even though», «"should we», «at the», «i stopped», «if you», «"look at», «i didn't», «with the», «hi mum,», «because the», «according to», «we stayed», «wasn't the», «after trying», «why is», «bring a», «look at», «out of», «do not», «when you», «heavy rain», «the more», «dear council», «when i», «"can you», «did the», «why did», «although the», «we checked», «"is the», «watching the», «none of», «after the», «my swimming», «planning a», «i am»
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: Aalborg, Aberystwyth, According, Actually, Agadir, Agnes, Aiden, Aino, Airport, Alan, Alasdair, Albin, Albuquerque, Alessio, Alex, Alexandria, Alkmaar, All, Alyssa, Amalfi, Amelie, Amira, Ananya, Andre, Andrews, Anja, Annecy, Aomori, Araceli, Arequipa, Arezzo, Aria, Arjun, Arturo, Asheville, Aspen, Astrid, Aswan, Atlanta, Augsburg, Aunt, Aveiro, Avon, Basel, Bay, Bayreuth, Bence, Beth, Biarritz, Bjorn, Bled, Bongani, Brad, Brenda, Brendan, Brent, Brisbane, Britain, Brno, Bruce

## Final self-check (last line of the answer)
`# check: time_markers=<N>/18, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=18, formats=<gap/mini/mc/fix/which/transform>, levels=<b/m/a>`


---
# PART 3 — TASK CP24

# Batch CP24 · cell C2 · 18 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 18 tasks** of batch CP24 for cell **C2**.

## Distribution (must match exactly)
- Formats: gap 7, mini 4, mc 3, fix 2, which 1, transform 1
- Levels: basic 6, medium 7, advanced 5
- `id`: `CP24-01` … `CP24-18`

### C2. Short or long form and spelling

**What is trained:** -er/-est vs more/most (two-syllable: clever, simple, quiet, narrow, common), doubling consonant, y→i, irregular good/bad/far/old.

**The decision:** the learner chooses the pattern and spells it; irregular forms in context.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** more cheap; the most cheap; funnyer; bigger→biger; farer; elder in wrong use; more easy.

**Example of the level (do not copy its storyline):** The path through the woods was (narrow) than I expected, but the view was (good) than from the road.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%


## Scenario seeds for this batch
Below are 22 seeds — more than you need. Choose the 18 that best fit cell C2 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "cl-0067", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The family tent is bigger than the one-person tent.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0068", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): In the novel, the prince is unhappier after the wedding than before it.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0069", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The researcher took the most cautious position of all the panel members, although her final recommendation was more definite than the committee had expected.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0070", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): This sheet is 1 mm thick and that one is 3 mm. This sheet is thinner.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0071", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The family's income has increased without any increase in its expenses. It is better off now than before.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0072", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The rebuilt shelter is secure enough to store the equipment overnight, although its storage area is narrower than the plans indicated.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0073", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The first puzzle needed five steps; this one needs only one. This one is easier.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0074", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The briefing included the latest figures. Afterwards, the panel was better-informed than it had been at the start of the meeting.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0075", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The new evidence made an early settlement likely enough to justify postponing the hearing, while the proposed timetable became more realistic than the original schedule.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0076", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The café served 200 people today and 50 yesterday. Today it was busier.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0077", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The larger windows make this office better-lit than the storeroom, which has only one small window.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0078", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The second speaker was as articulate as the first, yet his explanation was less persuasive than hers because he offered no supporting evidence.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0079", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The new leak is worse than the old one: the whole floor is wet.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0080", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The waterproof jacket is cheap enough for my budget and lighter than the one I bought last winter.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0081", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Of the programmes reviewed, the revised version is the most inclusive, and the selection criteria are more transparent than those used last year.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0082", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): After the accident, the driver became more careful than before.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0083", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The frozen path was slipperier than the dry pavement, so we walked beside the road instead.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0084", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The follow-up report is sufficiently balanced for use as an introduction to the dispute, but its recommendations are less specific than those of the original: no deadlines are given.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0085", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): At 2 m, this lane is narrower than the 4 m lane.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0086", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The spare key was more useful than the map when we discovered that the front door was locked.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0087", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I am 15 and my sister is 12. I am older than my sister.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "cl-0088", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I found the practical lesson more interesting than the lecture because we could test the equipment ourselves.", "hooks": ["a recommendation or review"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): «no other», «have you», «why do», «why does», «even though», «"should we», «at the», «i stopped», «if you», «"look at», «i didn't», «with the», «hi mum,», «because the», «according to», «we stayed», «wasn't the», «after trying», «why is», «bring a», «look at», «out of», «do not», «when you», «heavy rain», «the more», «dear council», «when i», «"can you», «did the», «why did», «although the», «we checked», «"is the», «watching the», «none of», «after the», «my swimming», «planning a», «i am»
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: Aalborg, Aberystwyth, According, Actually, Agadir, Agnes, Aiden, Aino, Airport, Alan, Alasdair, Albin, Albuquerque, Alessio, Alex, Alexandria, Alkmaar, All, Alyssa, Amalfi, Amelie, Amira, Ananya, Andre, Andrews, Anja, Annecy, Aomori, Araceli, Arequipa, Arezzo, Aria, Arjun, Arturo, Asheville, Aspen, Astrid, Aswan, Atlanta, Augsburg, Aunt, Aveiro, Avon, Basel, Bay, Bayreuth, Bence, Beth, Biarritz, Bjorn, Bled, Bongani, Brad, Brenda, Brendan, Brent, Brisbane, Britain, Brno, Bruce

## Final self-check (last line of the answer)
`# check: time_markers=<N>/18, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=18, formats=<gap/mini/mc/fix/which/transform>, levels=<b/m/a>`


