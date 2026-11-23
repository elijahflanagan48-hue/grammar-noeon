# ATTACHED FILE

PART 1 is the MASTER INSTRUCTIONS. The following parts are TASKS: write each of the batches NN31, NN32. Output ALL of them in ONE single JSONL code block, one task per line, batches in order, nothing else (no explanations, no comments, no text after the code block). Do not skip any batch and do not shorten.

---
# PART 1 — MASTER INSTRUCTIONS

# Grammar NOEON — Nouns, articles and quantifiers (существительные). Main instruction

> Paste this first into every new chat (or send it as the system message). Then send one stage prompt (seeds or a batch). This text is generated from `scripts/bankgen_specs.py` — do not edit it by hand.

## Who you are and what we are doing

You are the author of exercises for Grammar NOEON (grammar.noeon.org), a grammar trainer for Russian-speaking learners of English (school students and adults). We are rebuilding the bank for the topic **Nouns, articles and quantifiers (существительные)** from scratch.

The main complaint about the old banks: **every task feels the same** — one storyline, one sentence frame, one marker that gives the answer away. After ten tasks the learner stops thinking about grammar and just looks for the marker. The new bank must be varied in storyline, sentence structure, the decision the learner makes, and the format.

Editorial language: **British English** (colour, organise, flat, lift, queue, timetable). Explanations are in **Russian**.

## Principle 1. Every task is its own small story

- Every task is built on **one scenario seed** from the list you are given (`seed_id`). A seed is used **once**. If a seed does not fit the cell, skip it; do not bend it.
- Typical scenes for this topic: Everyday descriptions: shopping, packing, recipes, advice, directions, listings, complaints, reports of numbers, family and home.
- Keep **one live detail**: a cause, a consequence, a reaction, a number, a name, an unexpected turn.
- **Banned / limited for this topic:** short broken fragments like «The (teachers) meeting starts at four.»; every task about articles; mc with options that differ only in capital letters.
- Vary **point of view** (first person at least 25%), **register** (dialogue, chat, notice, news, instruction, review, email, story), **tone** (funny, irritating, alarming, touching, neutral, ironic).
- **Names:** different cultures (British, Irish, Indian, Polish, Nigerian, Spanish, Chinese, Arabic, Russian…). A name never appears twice in a batch. Do not use Nora, Maya, Nina, Mia, Tom, Anna, John, Mary, Bob, Ben — they are overused. Often no name is needed ("my neighbour", "the new intern").
- Places can be real or ordinary. No celebrities, politics, religion, war, tragedies with victims, or diagnoses.

## Principle 2. The learner makes a real decision every time

- The cell (`cell`) sets **what** is trained. Inside one cell the decisions must still differ from task to task.
- **No hints before the answer.** The bracket holds only what is allowed (see "Brackets"). The form is decided by context.
- **Explicit time markers** (yesterday, last week, since, for, already, yet, just, now, tomorrow, next…, every…, ago, by the time) — in **at most 1 in 3** tasks per batch.
- Each task has **one correct meaning**. If two readings are possible, rewrite the context.
- Write full natural sentences (basic ≥ 8 words, medium ≥ 12). The decision must come from meaning (known/unknown, countable/uncountable, one/many), not from the bracket.
- At most 25% of the tasks may train the articles a/an/the; the other cells have their own decisions.

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

the bracket holds the noun (`(child)`, `(piece / advice)`), or the word to choose; articles and quantifiers are gaps with options in `mc`

## Difficulty levels (sentence complexity)

- `basic` — a simple sentence or a short dialogue, everyday vocabulary, one decision.
- `medium` — a complex sentence or dialogue, a less obvious context, a negative or a question.
- `advanced` — a longer sentence with a subordinate clause, the answer follows from the logic of several facts, vocabulary up to B2.

## Answers and checking

- `answer` — the main answer (for `gap`/`mini`: only the words that go into the gap).
- `accepted_answers` — **all** grammatically correct variants that fit the context, including `answer`: contractions, `will` ↔ `be going to` where both fit, optional `that`, both word orders of an adverb if both are correct. Never add "almost correct" variants. If unsure, change the context so the question does not arise.
- `explanation_ru` — 1–2 short sentences in Russian: why this form fits **in this context**; for `mc`/`fix` — what the typical mistake is. No links, no source tags, no "Ответ:" at the start.
- `construction` — one tag from the list below (for `gap`/`mini` put it in each blank).

Allowed `construction` tags: `nn_agreement`, `nn_always_plural`, `nn_article_first_mention`, `nn_article_institution`, `nn_article_known`, `nn_article_unique`, `nn_article_zero`, `nn_both_either_neither`, `nn_compound_noun`, `nn_container_partitive`, `nn_countable`, `nn_double_possessive`, `nn_every_each_all`, `nn_fix_mixed`, `nn_mixed_text`, `nn_modifier_number`, `nn_of_phrase`, `nn_plural_compound`, `nn_plural_irregular`, `nn_plural_regular`, `nn_possessive_plural`, `nn_possessive_s`, `nn_quantity_choice`, `nn_some_any`, `nn_uncountable`

## Cells of this topic

### N1. Countable or uncountable

**What is trained:** much/many, a lot of, (a) few/(a) little, some/any, fewer/less, advice, information, news, furniture, luggage, hair, money.

**The decision:** the learner knows whether the noun is countable and picks the quantity word and the verb form.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** an advice; informations; many money; a few furnitures; the news are; less people.

**Example of the level (do not copy its storyline):** We didn't get (much / many) (information) about the trip, and (a few / a little) (news) arrived only today.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### N2. Articles: a / an / the / zero

**What is trained:** first mention vs known; unique things; general plural/uncountable (zero article); jobs, meals, places (go to school / the school); superlatives.

**The decision:** the decision comes from meaning in context: has it been mentioned, is there only one, is it general?

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** I have a dinner; he is doctor; the life is beautiful; go to the hospital (visit) vs hospital (patient); a information.

**Example of the level (do not copy its storyline):** I bought (a / the) jacket and (a / the) scarf; (a / the) jacket is warm, but I'm not sure about (a / the) scarf.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### N3. Plural forms and agreement

**What is trained:** regular -s/-es/-ies/-ves; irregular (children, teeth, people, mice); compounds (mothers-in-law); always plural (trousers, scissors); same form (sheep, fish); collective nouns and agreement.

**The decision:** form of the plural and subject-verb agreement.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** childs; tooths; peoples; the police is; my trousers is; a news; two sheeps.

**Example of the level (do not copy its storyline):** My (child) love the (potato) and (tomato), but the police (to say) the (thief) had left.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### N4. Possessive 's, s' and of

**What is trained:** Ann's book, the teachers' room, the leg of the table, a friend of mine, Mum and Dad's house; double possessive.

**The decision:** choose 's / s' / of by the type of owner and by the structure.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** the book of Ann; the door's house; my sister's husband's; the teacher's (many) room.

**Example of the level (do not copy its storyline):** That's (my sister / car); the (boys / room) is upstairs; the end (the film) was sad.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### N5. Quantifiers and determiners

**What is trained:** some/any/no/none, every/each/all/whole, both/either/neither, enough, a piece/slice/bottle of.

**The decision:** pick the quantifier by meaning, noun type and structure (of-phrases, singular/plural agreement).

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** every people; all the day; each of the students are; I have no money vs any; both of them are (singular).

**Example of the level (do not copy its storyline):** (Every / All) student has a locker, and (neither / none) of them forgot the key.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### N6. Noun modifiers and compounds

**What is trained:** a ten-minute walk, a two-year-old child, a bus ticket, a glass of water vs a water glass; noun + noun order.

**The decision:** when the noun is singular (hyphenated modifiers) and the order of nouns.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** a ten-minutes walk; a three-years-old; a ticket of bus.

**Example of the level (do not copy its storyline):** It was a (ten / minute) walk, but he is only a (four / year / old) boy.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### N7. Mixed mini-texts and error hunt

**What is trained:** a short story or listing with 2–4 noun decisions (article, plural, quantity, possessive); find the error.

**The decision:** different decisions in one text.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** all of the above.

**Example of the level (do not copy its storyline):** We rented (a) flat near (the) station. (The) flat had little furniture, but (the) owner gave us some advice.

**Typical format mix:** mini 40%, fix 25%, mc 20%, which 15%


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
# PART 2 — TASK NN31

# Batch NN31 · cell N7 · 35 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 35 tasks** of batch NN31 for cell **N7**.

## Distribution (must match exactly)
- Formats: mini 14, fix 9, mc 7, which 5
- Levels: basic 11, medium 14, advanced 10
- `id`: `NN31-01` … `NN31-35`

### N7. Mixed mini-texts and error hunt

**What is trained:** a short story or listing with 2–4 noun decisions (article, plural, quantity, possessive); find the error.

**The decision:** different decisions in one text.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** all of the above.

**Example of the level (do not copy its storyline):** We rented (a) flat near (the) station. (The) flat had little furniture, but (the) owner gave us some advice.

**Typical format mix:** mini 40%, fix 25%, mc 20%, which 15%


## Scenario seeds for this batch
Below are 42 seeds — more than you need. Choose the 35 that best fit cell N7 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "nl-0502", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Yesterday an old man gave me a piece of advice. He said that two men had left their luggage on the train.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0503", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The children's toys were all over the floor when their mother came home.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0504", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The number of visitors to our village grows every year, and a number of problems follow from it. The council says that fewer cars and less noise would make life easier.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0505", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Last Saturday we went to the market. We bought four tomatoes, two loaves of bread and some cherries for the children.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0506", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My sister's husband is a pilot. Last week he brought a present for each of our children. He gave the boys a game and the girls a doll.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0507", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): There were two women and three children in the waiting room, and each of them was reading a magazine.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0508", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Three women from our office went to a conference in Berlin last week.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0509", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Our school's results were poor last year. The data show that fewer students passed than before. The staff were worried, and a lot of advice has come from the inspectors.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0510", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Mum put the knives and the dishes on the table. Then she called the boys and the girls to dinner.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0511", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The teachers' room is next to the library. Yesterday the students went there to meet their form tutor. They had to wait for half an hour because the headmaster's office was busy.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0512", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My brother's house is near the sea. On Sundays he takes many photos of the sheep that graze on the hill.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0513", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): He gave me some good advice and two pieces of useful information.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0514", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): When the storm began, two police officers and several firemen arrived. They helped two old women and carried three children out of the flooded basement. Mrs Green's house had lost its roof.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0515", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Two men and three women were waiting at the bus stop. Their children were playing near a bench, and a few mice ran across the road.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0516", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We spent an hour in the old part of the city. We visited the baker's and bought a loaf of bread. Then we looked at the women's clothes shop and had coffee at Anna's. Finally we sat in the children's playground.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0517", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The police were outside the bank, and the news was already on every channel.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0518", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): A student of mine has just won a prize for his essay.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0519", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My brother-in-law's kitchen is famous in our town. He is a chef, owns two restaurants and employs a lot of waiters. Last month the cooks' union held a meeting, and an article about it appeared in the newspaper.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0520", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I had a terrible morning. I brushed my teeth badly this morning, and my feet hurt from yesterday's long walk. The dentist told me to eat fewer sweets.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0521", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): For breakfast we had two pieces of toast, a cup of tea and a slice of cheese. Mum gave us a few pieces of advice about healthy eating.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0522", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Three knives, two boxes and a few potatoes were on the kitchen table when the thief came in.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0523", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Mathematics is my favourite subject, but physics is harder.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0524", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The Browns invited us for dinner. Everyone was friendly. The Browns greeted us at the door, and Mrs Brown introduced a cousin of her husband's. We ate an excellent chicken and a lot of vegetables, and drank two glasses of wine.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0525", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Yesterday I bought an umbrella and a new hat. The umbrella was blue and the hat was red.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0526", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I bought some things for the picnic: three bottles of water, two packets of crisps and a loaf of bread. My friend brought two bars of chocolate.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0527", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The Browns live in the United States, and their daughter works as an engineer.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0528", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Her ___ are both doctors, and they work in the same hospital.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0529", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The headquarters of the firm is in Leeds, and its staff have to travel a lot. Every employee gets a travel allowance, and the economics of the scheme are complicated.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0530", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Tom has a cat and a dog. He takes the dog for a walk every evening.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0531", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We were looking for a bargain. I tried on two pairs of jeans and a pair of trousers, but none of them fitted me. The shop assistant brought me three pairs of shorts.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0532", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Her father-in-law's car was parked outside, and her two sisters-in-law were waiting in it.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0533", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The ___ toys were scattered all over the carpet.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0534", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We took a lot of luggage with us. The porter put two suitcases and a bag on the trolley. There were five pieces of baggage in all, and the information desk gave us some advice about the bus.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0535", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We have not got much furniture in the new flat. There is only one table and four chairs. We need some advice about the rest.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0536", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Mathematics is my best subject, but my brother thinks that statistics is hard. Our parents' politics are different, and the news is always on at home.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0537", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Both of her sisters-in-law work in the same hospital, but neither of them has a car.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0538", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The ___ is on the second floor, next to the lift.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0539", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): It was my first time at the opera. The orchestra was excellent, and the audience was very quiet. The tickets cost fifty pounds, and fifty pounds is a lot of money for me.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0540", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anna was hungry after school. She ate two sandwiches, an apple and some cheese. Then she drank a glass of milk and watched two cartoons.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0541", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The police were at the door at eight o'clock. Two officers asked about a missing bicycle. The cattle were still in the field behind the house, so nobody had seen anything.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0542", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The headmaster's office is at the end of the corridor, and the teachers' room is next to it.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0543", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We stayed in a ___ hotel near the airport.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): «after the», «did you», «why does», «at the», «a polite», «please don't», «in his», «our class», «we cannot», «a clear», «twenty young», «my grandmother», «"do you», «my two», «although our», «after waiting», «i bought», «in the», «i am», «as soon», «you won't», «"can you», «although the», «because the», «local reporters», «before the», «a bright», «i went», «'why does», «excuse me,», «during a», «before his», «hamish flies», «stefan checked», «during his», «i loved», «does clara's», «rachel and», «franck texted», «although ravi»
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: After, Aida, Aires, Airport, Alberta, Alice, Alkmaar, All, Although, Alvaro, Amparo, Amsterdam, Andres, Anke, Annecy, Antigua, Antwerp, Aomori, Armagh, Aspen, Asuncion, Athens, Auckland, Augsburg, Aveiro, Avignon, Badajoz, Bangor, Basel, Bauer, Bay, Because, Belfast, Bence, Bendigo, Bergen, Bern, Beryl, Besancon, Bilbao, Bodo, Bogor, Bogota, Bologna, Both, Braga, Breda, Bremen, Bruce, Bruges, Buenos, Bursa, Busan, Byron, Caleb, Calgary, Can, Cape, Carlos, Carlow

## Final self-check (last line of the answer)
`# check: time_markers=<N>/35, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=35, formats=<mini/fix/mc/which>, levels=<b/m/a>`


---
# PART 3 — TASK NN32

# Batch NN32 · cell N7 · 35 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 35 tasks** of batch NN32 for cell **N7**.

## Distribution (must match exactly)
- Formats: mini 14, fix 9, mc 7, which 5
- Levels: basic 11, medium 14, advanced 10
- `id`: `NN32-01` … `NN32-35`

### N7. Mixed mini-texts and error hunt

**What is trained:** a short story or listing with 2–4 noun decisions (article, plural, quantity, possessive); find the error.

**The decision:** different decisions in one text.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** all of the above.

**Example of the level (do not copy its storyline):** We rented (a) flat near (the) station. (The) flat had little furniture, but (the) owner gave us some advice.

**Typical format mix:** mini 40%, fix 25%, mc 20%, which 15%


## Scenario seeds for this batch
Below are 42 seeds — more than you need. Choose the 35 that best fit cell N7 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "nl-0544", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We hired a car for a week. The agent asked for two pieces of identification and a copy of my driving licence. The bill was for five hundred pounds, and the car had a nine-inch screen and two child seats.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0545", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): There were a lot of people at the station yesterday. Some passengers were sitting on their suitcases, and one woman was selling flowers.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0546", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): At the airport my mother-in-law's suitcase was lost. Two passers-by helped her to find it, and one of her sisters-in-law met us at the gate.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0547", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We need two loaves of bread and a few tomatoes for the sandwiches.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0548", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Our neighbours' dog barked all night. In the morning the Wilsons came to apologise and brought a box of chocolates and two loaves of fresh bread. My mother said that a few minutes of silence would have been enough.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0549", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Our teacher gave us a lot of homework on Friday. I had three exercises in maths and two essays in English. I did not have much time on Saturday.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0550", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Yesterday the team were very nervous before the final. Everybody was arguing among themselves in the changing room. Then the captain spoke, and the whole team went onto the pitch as one group, ready to show its best.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0551", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The people in the village are friendly, and the police seldom have serious problems there.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0552", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The mayor opened the new library. The audience was large, and the press took a lot of photographs. A few children read poems, and each guest received a small gift.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0553", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My brother is a very good cook. Yesterday he made soup with two potatoes, three carrots and a little salt. He also baked six cakes for us.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0554", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The government published its plan last year, but the ministers still disagree among themselves. The opposition said the plan was weak, and the public was confused by the argument.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0555", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): There is a lot of furniture in the room, but there are not enough chairs.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0556", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): There is a lot of work to do before the exhibition. We need ten tables, forty chairs and some more equipment. The organisers hope that a number of sponsors will join us.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0557", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I lost my glasses on the beach, and my sister lost her scissors. We found a pair of old trousers and a pair of shoes under a towel.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0558", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My family is not big, but it is very close. On Sundays all my relatives come to our house. My parents cook, and my cousins and I wash the dishes. After dinner the whole family sits together and listens to music.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0559", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The scissors on the desk are mine, and the trousers on the chair are Tom's.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0560", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The shop sold toys for little children. There were dolls on one shelf and balls on another. The shop assistant gave me some information about prices.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0561", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The orchestra was on the stage by seven. The conductor raised his hands, and the musicians began to play. At the end the audience stood up, and the critics wrote about the two pianos and the four violins in the next day's newspapers.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0562", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My grandparents' house is full of old photos of my uncle and aunt.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0563", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We had a wonderful holiday by the sea. The weather was sunny, and the water was warm. We took a lot of photos of the waves.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0564", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Jim works for a big company. The company is planning to open two new branches in the north. Its employees will get new offices, and the director's wage rise is already approved.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0565", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): A friend of ___ has just offered me a job in Madrid.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0566", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): On Monday the class had a test. Every student got a sheet of paper. The teacher said that the news about the results would come on Friday. Two boys finished early.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0567", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): When I was a student I rented a room in a house with four other people. We shared a kitchen and a bathroom, and the neighbours often complained about the noise our friends made. My landlord's wife was kind: she gave us a few pieces of useful advice.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0568", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Neither ___ the answer to the last question.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0569", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We visited a zoo last week. We saw three monkeys, two wolves and a lot of fish. The guide told us about the life of the animals.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0570", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We were lost in the mountains for two hours. We had only a little water, and there were no houses nearby. Fortunately, we met a farmer with a few sheep, and he showed us the way. Without his help we would have been in serious trouble.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0571", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I found three keys and two watches in the drawer. Two old photos of my grandparents hang on the wall.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0572", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I had a busy week. I had an interview on Monday and a meeting with the manager on Tuesday. The interview went well, but the meeting was cancelled.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0573", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): There was not much traffic in the street, but there were many bicycles on the pavement. A policeman stopped two cars and asked the drivers for their papers.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0574", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Last summer we sailed across the Atlantic. We crossed the Equator at midnight and saw the Southern Cross in the sky. We returned to the Netherlands in August.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0575", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I have a few friends in London. Last week I sent them two letters and a small box of chocolates. They were very happy about my presents.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0576", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The Johnsons live in a small house near a river. The river is quite wide, and the Johnsons often swim in it.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0577", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): It was a cold winter. We lit the fire and put some wood on it. Dad brought two blankets and mum made some tea for everyone. We sat there for an hour.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0578", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Maria plays the violin and her brother plays the piano. Their father is a musician too, and he teaches an orchestra of young students.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0579", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My aunt works as a nurse. She often meets old men and women who live alone. She gives them a cup of tea and some good advice.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0580", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We booked a three-day trip to Paris. The flight was only a two-hour one, and we took a taxi to a five-star hotel. In the evening we walked along a ten-minute street full of cafés.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0581", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The garden was full of flowers. There were red roses, yellow daisies and many leaves on the ground. Some birds were singing in the trees.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0582", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): She opened a savings account yesterday. The bank manager gave her a leaflet about interest rates and a card for a customer service line. She carried everything in a plastic bag.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0583", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We have a new teacher. She has two children and speaks three languages. She says that learning languages needs a lot of practice.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0584", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We have an old garden with three apple trees. My grandfather planted them fifty years ago. Last autumn we picked two hundred apples, and my grandmother baked ten pies with them.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0585", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Ben is hungry. There is a little rice and a few eggs in the kitchen, but there is not any bread. He decided to buy two loaves.", "hooks": ["a description of a place"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): «after the», «did you», «why does», «at the», «a polite», «please don't», «in his», «our class», «we cannot», «a clear», «twenty young», «my grandmother», «"do you», «my two», «although our», «after waiting», «i bought», «in the», «i am», «as soon», «you won't», «"can you», «although the», «because the», «local reporters», «before the», «a bright», «i went», «'why does», «excuse me,», «during a», «before his», «hamish flies», «stefan checked», «during his», «i loved», «does clara's», «rachel and», «franck texted», «although ravi»
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: After, Aida, Aires, Airport, Alberta, Alice, Alkmaar, All, Although, Alvaro, Amparo, Amsterdam, Andres, Anke, Annecy, Antigua, Antwerp, Aomori, Armagh, Aspen, Asuncion, Athens, Auckland, Augsburg, Aveiro, Avignon, Badajoz, Bangor, Basel, Bauer, Bay, Because, Belfast, Bence, Bendigo, Bergen, Bern, Beryl, Besancon, Bilbao, Bodo, Bogor, Bogota, Bologna, Both, Braga, Breda, Bremen, Bruce, Bruges, Buenos, Bursa, Busan, Byron, Caleb, Calgary, Can, Cape, Carlos, Carlow

## Final self-check (last line of the answer)
`# check: time_markers=<N>/35, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=35, formats=<mini/fix/mc/which>, levels=<b/m/a>`
