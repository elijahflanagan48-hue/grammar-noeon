# ATTACHED FILE

PART 1 is the MASTER INSTRUCTIONS. The following parts are TASKS: write each of the batches NN17, NN18. Output ALL of them in ONE single JSONL code block, one task per line, batches in order, nothing else (no explanations, no comments, no text after the code block). Do not skip any batch and do not shorten.

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
# PART 2 — TASK NN17

# Batch NN17 · cell N1 · 26 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 26 tasks** of batch NN17 for cell **N1**.

## Distribution (must match exactly)
- Formats: gap 10, mini 6, mc 4, fix 3, which 2, transform 1
- Levels: basic 8, medium 10, advanced 8
- `id`: `NN17-01` … `NN17-26`

### N1. Countable or uncountable

**What is trained:** much/many, a lot of, (a) few/(a) little, some/any, fewer/less, advice, information, news, furniture, luggage, hair, money.

**The decision:** the learner knows whether the noun is countable and picks the quantity word and the verb form.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** an advice; informations; many money; a few furnitures; the news are; less people.

**Example of the level (do not copy its storyline):** We didn't get (much / many) (information) about the trip, and (a few / a little) (news) arrived only today.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%


## Scenario seeds for this batch
Below are 30 seeds — more than you need. Choose the 26 that best fit cell N1 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "nl-0067", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I counted three glasses of water on the table.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0068", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Employers expect a certain amount of ___ from new staff.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0069", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The equipment in the gym ___ very modern.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0070", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I'm afraid I have a ___ of bad news for you.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0071", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We ordered two portions of chips for the table.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0072", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): There are too many cars and too much traffic in the city centre.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0073", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Please send me ___ photo of the document.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0074", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): There are three ___ of luggage on the platform.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0075", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Can I give you a few pieces of advice?", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0076", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): She has a lot of homework and four exercises to finish.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0077", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Her ___ was better than I had expected.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0078", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The theory is supported by only one ___ of research.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0079", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My brother gave me two items of clothing for my birthday.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0080", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We need more chairs and more equipment for the new classroom.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0081", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Can I have ___ sugar in my tea, please?", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0082", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): She has just heard three pieces of news from her sister.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0083", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): There was too much noise and too many people in the café.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0084", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): He gave us some useful ___ before the trip.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0085", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We bought two pieces of furniture for the hall: a table and a mirror.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0086", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): He has made a lot of progress this term, and his friends are proud of him.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0087", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The luggage ___ already in the car.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0088", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Can I borrow a sheet of paper? I need to write down a phone number.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0089", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The hotel room had two large beds and some old furniture.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0090", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): He told us ___ about his journey.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0091", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We heard three pieces of music at the concert: one by Bach and two by Haydn.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0092", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We carried our bags and all the equipment to the van.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0093", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I need to buy ___ bread.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0094", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The police found a new piece of evidence in the garden.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0095", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The teacher gave us a lot of homework and two long essays.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0096", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): She gave me two useful ___ about my CV.", "hooks": ["counting things"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): «after the», «did you», «why does», «at the», «a polite», «please don't», «in his», «our class», «we cannot», «a clear», «twenty young», «my grandmother», «"do you», «my two», «although our», «after waiting», «i bought», «in the», «i am», «as soon», «you won't», «"can you», «although the», «because the», «local reporters», «before the», «a bright», «i went», «'why does», «excuse me,», «during a», «before his», «hamish flies», «stefan checked», «during his», «i loved», «does clara's», «rachel and», «franck texted», «although ravi»
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: After, Aida, Aires, Airport, Alberta, Alice, Alkmaar, All, Although, Alvaro, Amparo, Amsterdam, Andres, Anke, Annecy, Antigua, Antwerp, Aomori, Armagh, Aspen, Asuncion, Athens, Auckland, Augsburg, Aveiro, Avignon, Badajoz, Bangor, Basel, Bauer, Bay, Because, Belfast, Bence, Bendigo, Bergen, Bern, Beryl, Besancon, Bilbao, Bodo, Bogor, Bogota, Bologna, Both, Braga, Breda, Bremen, Bruce, Bruges, Buenos, Bursa, Busan, Byron, Caleb, Calgary, Can, Cape, Carlos, Carlow

## Final self-check (last line of the answer)
`# check: time_markers=<N>/26, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=26, formats=<gap/mini/mc/fix/which/transform>, levels=<b/m/a>`


---
# PART 3 — TASK NN18

# Batch NN18 · cell N2 · 25 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 25 tasks** of batch NN18 for cell **N2**.

## Distribution (must match exactly)
- Formats: gap 10, mini 6, mc 4, fix 3, which 1, transform 1
- Levels: basic 8, medium 10, advanced 7
- `id`: `NN18-01` … `NN18-25`

### N2. Articles: a / an / the / zero

**What is trained:** first mention vs known; unique things; general plural/uncountable (zero article); jobs, meals, places (go to school / the school); superlatives.

**The decision:** the decision comes from meaning in context: has it been mentioned, is there only one, is it general?

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** I have a dinner; he is doctor; the life is beautiful; go to the hospital (visit) vs hospital (patient); a information.

**Example of the level (do not copy its storyline):** I bought (a / the) jacket and (a / the) scarf; (a / the) jacket is warm, but I'm not sure about (a / the) scarf.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%


## Scenario seeds for this batch
Below are 30 seeds — more than you need. Choose the 25 that best fit cell N2 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "nl-0097", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I bought an umbrella yesterday, but I left it on the bus.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0098", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): She is an engineer at a big car company.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0099", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Can you open the window? It is very hot in here.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0100", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): It was an unusual idea, but everyone liked it.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0101", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): He waited for an hour and then went home.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0102", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Please close the door when you leave.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0103", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We saw a film last night. the film was really funny.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0104", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My brother is a university student in Leeds.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0105", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): This is the first time I have been to Spain.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0106", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): There is a cat in the garden. the cat is black.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0107", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): She wants to be a European diplomat.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0108", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): He is the only person who knows the answer.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0109", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We stayed at a hotel near the station. The hotel was clean and cheap.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0110", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): He lives in a small flat near the park.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0111", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): She was the first woman to win the prize in our town.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0112", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The tickets cost five pounds a kilo, so I bought two.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0113", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The sun rises in the east.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0114", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): It was a 4-year-old boy who found the key.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0115", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): He is such an honest man that everyone trusts him.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0116", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The moon was full and bright last night.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0117", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): She picked up the book from the table and started to read.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0118", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): After a long wait, the doctor called us in.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0119", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My sister plays the guitar in a band.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0120", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): She is an hour late, and we are still waiting.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0121", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Do you know the man who is standing by the door?", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0122", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): She is the best student in our group.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0123", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Can you pass me the salt, please?", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0124", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I put the keys in a drawer, but I cannot remember which one.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0125", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): He gave me a useful piece of advice.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "nl-0126", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): It took a while to find the right street.", "hooks": ["a unique or known object"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): «after the», «did you», «why does», «at the», «a polite», «please don't», «in his», «our class», «we cannot», «a clear», «twenty young», «my grandmother», «"do you», «my two», «although our», «after waiting», «i bought», «in the», «i am», «as soon», «you won't», «"can you», «although the», «because the», «local reporters», «before the», «a bright», «i went», «'why does», «excuse me,», «during a», «before his», «hamish flies», «stefan checked», «during his», «i loved», «does clara's», «rachel and», «franck texted», «although ravi»
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: After, Aida, Aires, Airport, Alberta, Alice, Alkmaar, All, Although, Alvaro, Amparo, Amsterdam, Andres, Anke, Annecy, Antigua, Antwerp, Aomori, Armagh, Aspen, Asuncion, Athens, Auckland, Augsburg, Aveiro, Avignon, Badajoz, Bangor, Basel, Bauer, Bay, Because, Belfast, Bence, Bendigo, Bergen, Bern, Beryl, Besancon, Bilbao, Bodo, Bogor, Bogota, Bologna, Both, Braga, Breda, Bremen, Bruce, Bruges, Buenos, Bursa, Busan, Byron, Caleb, Calgary, Can, Cape, Carlos, Carlow

## Final self-check (last line of the answer)
`# check: time_markers=<N>/25, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=25, formats=<gap/mini/mc/fix/which/transform>, levels=<b/m/a>`
