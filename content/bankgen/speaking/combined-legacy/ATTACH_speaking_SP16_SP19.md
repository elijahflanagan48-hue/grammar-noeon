# MASTER

# Grammar NOEON — Speaking verbs: say, tell, speak, talk (глаголы речи). Main instruction

> Paste this first into every new chat (or send it as the system message). Then send one stage prompt (seeds or a batch). This text is generated from `scripts/bankgen_specs.py` — do not edit it by hand.

## Who you are and what we are doing

You are the author of exercises for Grammar NOEON (grammar.noeon.org), a grammar trainer for Russian-speaking learners of English (school students and adults). We are rebuilding the bank for the topic **Speaking verbs: say, tell, speak, talk (глаголы речи)** from scratch.

The main complaint about the old banks: **every task feels the same** — one storyline, one sentence frame, one marker that gives the answer away. After ten tasks the learner stops thinking about grammar and just looks for the marker. The new bank must be varied in storyline, sentence structure, the decision the learner makes, and the format.

Editorial language: **British English** (colour, organise, flat, lift, queue, timetable). Explanations are in **Russian**.

## Principle 1. Every task is its own small story

- Every task is built on **one scenario seed** from the list you are given (`seed_id`). A seed is used **once**. If a seed does not fit the cell, skip it; do not bend it.
- Typical scenes for this topic: People speak, argue, give news, ask for help, order, complain, give a speech, talk on the phone, teach and learn.
- Keep **one live detail**: a cause, a consequence, a reaction, a number, a name, an unexpected turn.
- **Banned / limited for this topic:** «say hello / tell the truth» as isolated collocations in every task; schoolroom scenes as the only context.
- Vary **point of view** (first person at least 25%), **register** (dialogue, chat, notice, news, instruction, review, email, story), **tone** (funny, irritating, alarming, touching, neutral, ironic).
- **Names:** different cultures (British, Irish, Indian, Polish, Nigerian, Spanish, Chinese, Arabic, Russian…). A name never appears twice in a batch. Do not use Nora, Maya, Nina, Mia, Tom, Anna, John, Mary, Bob, Ben — they are overused. Often no name is needed ("my neighbour", "the new intern").
- Places can be real or ordinary. No celebrities, politics, religion, war, tragedies with victims, or diagnoses.

## Principle 2. The learner makes a real decision every time

- The cell (`cell`) sets **what** is trained. Inside one cell the decisions must still differ from task to task.
- **No hints before the answer.** The bracket holds only what is allowed (see "Brackets"). The form is decided by context.
- **Explicit time markers** (yesterday, last week, since, for, already, yet, just, now, tomorrow, next…, every…, ago, by the time) — in **at most 1 in 3** tasks per batch.
- Each task has **one correct meaning**. If two readings are possible, rewrite the context.
- Contexts must be real situations; the learner chooses say/tell/speak/talk and the structure after the verb (object, preposition, that-clause, to-infinitive).
- Include `chat`, `mention`, `announce`, `whisper`, `shout`, `explain` only if the task is about the contrast with the main four.

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

the bracket holds the speaking verb or the word to complete (`(say / tell)`, `(to speak)`), or the preposition in mc

## Difficulty levels (sentence complexity)

- `basic` — a simple sentence or a short dialogue, everyday vocabulary, one decision.
- `medium` — a complex sentence or dialogue, a less obvious context, a negative or a question.
- `advanced` — a longer sentence with a subordinate clause, the answer follows from the logic of several facts, vocabulary up to B2.

## Answers and checking

- `answer` — the main answer (for `gap`/`mini`: only the words that go into the gap).
- `accepted_answers` — **all** grammatically correct variants that fit the context, including `answer`: contractions, `will` ↔ `be going to` where both fit, optional `that`, both word orders of an adverb if both are correct. Never add "almost correct" variants. If unsure, change the context so the question does not arise.
- `explanation_ru` — 1–2 short sentences in Russian: why this form fits **in this context**; for `mc`/`fix` — what the typical mistake is. No links, no source tags, no "Ответ:" at the start.
- `construction` — one tag from the list below (for `gap`/`mini` put it in each blank).

Allowed `construction` tags: `sp_choose_verb`, `sp_fix_mixed`, `sp_language`, `sp_mixed_text`, `sp_prepositions`, `sp_say_collocation`, `sp_say_tell`, `sp_say_that`, `sp_speak_talk`, `sp_structure_mixed`, `sp_tell_collocation`, `sp_tell_pattern`

## Cells of this topic

### S1. say or tell

**What is trained:** say + (to) someone + words; tell + someone + something; tell vs say in reported statements; tell the truth/lie/story/time vs say hello/yes/goodbye.

**The decision:** does the verb take a direct object, a person, a that-clause?

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** he said me; told to me; say a lie; tell hello; tell that without object.

**Example of the level (do not copy its storyline):** He (to tell) his sister he was ill, but he (to say) the same thing to the manager on Monday.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### S2. speak or talk

**What is trained:** speak a language / to someone / about; talk to / with / about / over; speak vs talk in formal/informal use.

**The decision:** language, formality, and the preposition.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** talk English; speak with my friends about it (fine but mark); say English; talk to me about.

**Example of the level (do not copy its storyline):** Can you (to speak) slowly? I'd like to (to talk) to you about the trip, but I don't (to speak) Italian well.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### S3. Structures after the verb

**What is trained:** say + that; tell + obj + that / to-inf; speak / talk + preposition; ask + obj + to-inf; say / tell + wh-word.

**The decision:** object, preposition, or clause pattern after the verb.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** said me that; told that; talk me; speak about me (wrong object).

**Example of the level (do not copy its storyline):** She (to tell) me (not / to be) late, and (to say) that the train (to leave) at six.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%

### S4. Choose the right verb (mc / which / fix)

**What is trained:** contrast items with 4 verbs; error correction.

**The decision:** contrast of the four verbs in context.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** all of the above.

**Example of the level (do not copy its storyline):** My boss ___ me to send the file by noon. → told

**Typical format mix:** mc 40%, fix 25%, which 20%, gap 15%

### S5. Mini-texts and dialogues

**What is trained:** a short dialogue or story, 2–4 gaps with different speaking verbs and structures.

**The decision:** different verbs and structures in one story.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** all of the above.

**Example of the level (do not copy its storyline):** At the party Lena (to talk) to a stranger who (to say) he (to speak) three languages.

**Typical format mix:** mini 70%, mc 15%, fix 15%


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


# BATCHES

Write every batch below, in order, with the exact requested IDs and counts. Review grammar, complete accepted variants and simple vocabulary before output. One JSONL code block.


# Batch SP16 · cell S2 · 29 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 29 tasks** of batch SP16 for cell **S2**.

## Distribution (must match exactly)
- Formats: gap 12, mini 6, mc 4, fix 4, which 2, transform 1
- Levels: basic 9, medium 11, advanced 9
- `id`: `SP16-01` … `SP16-29`

### S2. speak or talk

**What is trained:** speak a language / to someone / about; talk to / with / about / over; speak vs talk in formal/informal use.

**The decision:** language, formality, and the preposition.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** talk English; speak with my friends about it (fine but mark); say English; talk to me about.

**Example of the level (do not copy its storyline):** Can you (to speak) slowly? I'd like to (to talk) to you about the trip, but I don't (to speak) Italian well.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%


## Scenario seeds for this batch
Below are 28 seeds — more than you need. Choose the 29 that best fit cell S2 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "sl-0159", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): In parts of the Scottish Highlands, a significant number of residents still ___ Gaelic alongside English.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0160", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Our tour guide in Cairo speaks Arabic, English, and German fluently.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0161", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Please ask the presenter to speak more slowly so the sign-language interpreter can keep up.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0162", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Even on a luxury cruise, the two corporate partners couldn't resist ___ business by the pool.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0163", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Please stop ___ while I'm trying to explain the rules of the board game!", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0164", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The charity's founder has been invited to speak at the annual summit in Brussels this autumn.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0165", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): After inhaling smoke from the kitchen fire, the chef was barely able to ___ when the paramedics arrived.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0166", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): After catching a bad cold at the stadium, the commentator could barely speak the next morning.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0167", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Have you ever met a diplomat who can speak five foreign languages without a trace of an accent?", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0168", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “Good morning, could I ___ to the head of compliance?” — “___.”", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0169", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): You're ___ nonsense — penguins don't live in the Arctic!", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0170", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Whenever my brother and his bandmates meet at a café, they end up talking music until closing time.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0171", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Candidates applying for the simultaneous interpreting course must ___ at least two official UN languages at C1 level.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0172", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Do you ___ Mandarin, or did you use a guide when you travelled across China?", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0173", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): When the actress heard she had won first prize, she was too overwhelmed with emotion to speak.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0174", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My cousins love ___ football whenever there's a big match on TV.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0175", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Stop talking nonsense — nobody is going to fire you just for arriving five minutes late once.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0176", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Please ___ more quietly — the baby has just fallen asleep in the next room.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0177", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): In many border towns in South Tyrol, shopkeepers speak both German and Italian effortlessly.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0178", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I'm glad someone at this meeting is finally ___ sense about the deadline.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0179", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My new flatmate is from Lisbon, so she ___ Portuguese as her mother tongue.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0180", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): He was so startled by the sudden knock at the window that he couldn't ___ for several seconds.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0181", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “City Museum reception, good morning. Who's ___, please?”", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0182", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): How many people in your department can ___ fluent German with our Frankfurt clients?", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0183", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Over two thousand students gathered in the main square to hear the Nobel laureate ___ to the crowd.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0184", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Could you ___ a bit more slowly, please? I'm writing down the postcode.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0185", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We sat by the fireplace with a pot of tea and ___ for hours about our childhood holidays.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0186", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): By the time she finished secondary school in Geneva, Nadia ___ three languages effortlessly.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): (none yet)
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: (none yet)

## Final self-check (last line of the answer)
`# check: time_markers=<N>/29, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=29, formats=<gap/mini/mc/fix/which/transform>, levels=<b/m/a>`


# Batch SP17 · cell S3 · 25 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 25 tasks** of batch SP17 for cell **S3**.

## Distribution (must match exactly)
- Formats: gap 10, mini 6, mc 4, fix 3, which 1, transform 1
- Levels: basic 8, medium 10, advanced 7
- `id`: `SP17-01` … `SP17-25`

### S3. Structures after the verb

**What is trained:** say + that; tell + obj + that / to-inf; speak / talk + preposition; ask + obj + to-inf; say / tell + wh-word.

**The decision:** object, preposition, or clause pattern after the verb.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** said me that; told that; talk me; speak about me (wrong object).

**Example of the level (do not copy its storyline):** She (to tell) me (not / to be) late, and (to say) that the train (to leave) at six.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%


## Scenario seeds for this batch
Below are 30 seeds — more than you need. Choose the 25 that best fit cell S3 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "sl-0187", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The repair will cost a fortune, to say nothing of the delivery charge.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0188", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Months of night shifts are telling on her health.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0189", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Needless to say, the puppy loved its new bed.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0190", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): In her closing remarks last night, the chairwoman said that further budget cuts were inevitable.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0191", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Mark told us yesterday that the train was delayed.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0192", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Before leaving for the airport, Clara told her flatmate not to forget to water the ferns.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0193", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The shop opens at noon, that is to say, twelve o'clock.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0194", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): You missed the last bus again? I told you so!", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0195", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “This queue is endless!” “You can say that again!”", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0196", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “Under no circumstances will we compromise on safety,” the chief engineer said as he concluded the briefing.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0197", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “I'll meet you at the entrance,” Leo said and hung up.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0198", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): If you see Arthur in the canteen, please tell him that his parcel has arrived.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0199", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I cannot speak for the other parents; this is only my opinion.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0200", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Our clients always speak highly of your work.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0201", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Would you speak up a little? I can barely hear you.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0202", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Not once during the three-hour inquiry did the witness say anything to the committee that contradicted his earlier statement.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0203", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Did Emma say anything about her new flat at lunch?", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0204", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Why didn't anyone tell us earlier that the motorway was closed for repairs?", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0205", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): She is against the picnic, but perhaps we can talk her round.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0206", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): This record speaks for itself: twelve wins in a row.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0207", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): How did you talk your brother into lending you his bike?", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0208", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): No sooner had the auctioneer said that the bidding was closed than a collector at the back raised his paddle.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0209", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The librarian told the children not to run between the shelves a minute ago.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0210", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Our landlord has repeatedly told the tenants on the top floor not to leave bikes in the hallway.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0211", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Will Mum tell me off if I get paint on the carpet?", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0212", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Frankly speaking, I would rather stay home tonight.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0213", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): To tell the truth, the cheaper headphones sound better.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0214", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “Should the alarm sound for more than ten seconds, evacuate the laboratory immediately,” the safety officer told us on our first day.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0215", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): What exactly did the mechanic say to you when you picked up the car?", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0216", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The paramedic calmly told the injured cyclist to stay still until the ambulance arrived.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): (none yet)
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: (none yet)

## Final self-check (last line of the answer)
`# check: time_markers=<N>/25, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=25, formats=<gap/mini/mc/fix/which/transform>, levels=<b/m/a>`


# Batch SP18 · cell S3 · 25 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 25 tasks** of batch SP18 for cell **S3**.

## Distribution (must match exactly)
- Formats: gap 10, mini 6, mc 4, fix 3, which 1, transform 1
- Levels: basic 8, medium 10, advanced 7
- `id`: `SP18-01` … `SP18-25`

### S3. Structures after the verb

**What is trained:** say + that; tell + obj + that / to-inf; speak / talk + preposition; ask + obj + to-inf; say / tell + wh-word.

**The decision:** object, preposition, or clause pattern after the verb.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** said me that; told that; talk me; speak about me (wrong object).

**Example of the level (do not copy its storyline):** She (to tell) me (not / to be) late, and (to say) that the train (to leave) at six.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%


## Scenario seeds for this batch
Below are 30 seeds — more than you need. Choose the 25 that best fit cell S3 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "sl-0217", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): That shortcut damages the grass, to say nothing of the flowers.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0218", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Can you talk Leo into joining the choir?", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0219", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Feel free to speak your mind; we need honest feedback.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0220", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): At yesterday's symposium, several climatologists said that coastal defences would need twice the current funding.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0221", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Wait here — I just want to say something to the receptionist.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0222", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nobody has told the new intern how to log in to the company server yet.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0223", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We need a digital copy, that is to say, a file rather than a printout.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0224", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): You two should sit down and talk it out.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0225", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Needless to say, losing the only key complicated our weekend.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0226", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): At the press conference, the architect said very little to the journalists about the structural flaws in the foundation.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0227", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Dan called an hour ago and said he would be working late tonight.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0228", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Most reviewers are saying that the sequel is far worse than the original film.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0229", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “These tickets cost far too much.” “You can say that again.”", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0230", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Don't talk back to your grandmother.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0231", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Your plan failed? Well, I ___ you so.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0232", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): At no point during the negotiations did the ministry ___ that the subsidies would be withdrawn immediately.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0233", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Kevin ___ that he couldn't find his house keys anywhere.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0234", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): She walked past my desk without saying what she thought of the proposal.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0235", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I won't tell on you if you admit you ate the biscuits.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0236", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Could someone ___ Max out of selling his guitar?", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0237", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): At yesterday's hearing, Rosa ___ up for the tenants.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0238", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The harbour master strictly ___ the ferry captain not to attempt the crossing in such dense fog.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0239", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “The soup needs a bit more salt,” Dad ___ after tasting it.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0240", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “I've never seen such a disorganised event,” the journalist said to her colleague outside the hall.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0241", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Let the quality ___ for itself before you offer a discount.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0242", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): As elected captain, he now ___ for the whole squad.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0243", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Several passengers claimed they had never been ___ to fill in a customs declaration form prior to landing.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0244", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): What did the receptionist ___ to you when you asked for a quiet room?", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0245", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): When the customs officer asked about the camera, Lucas said that he had bought it in Tokyo.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0246", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): After an hour of persuasion yesterday, Ben ___ his sister round.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): (none yet)
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: (none yet)

## Final self-check (last line of the answer)
`# check: time_markers=<N>/25, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=25, formats=<gap/mini/mc/fix/which/transform>, levels=<b/m/a>`


# Batch SP19 · cell S3 · 25 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 25 tasks** of batch SP19 for cell **S3**.

## Distribution (must match exactly)
- Formats: gap 10, mini 6, mc 4, fix 3, which 1, transform 1
- Levels: basic 8, medium 10, advanced 7
- `id`: `SP19-01` … `SP19-25`

### S3. Structures after the verb

**What is trained:** say + that; tell + obj + that / to-inf; speak / talk + preposition; ask + obj + to-inf; say / tell + wh-word.

**The decision:** object, preposition, or clause pattern after the verb.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** said me that; told that; talk me; speak about me (wrong object).

**Example of the level (do not copy its storyline):** She (to tell) me (not / to be) late, and (to say) that the train (to leave) at six.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%


## Scenario seeds for this batch
Below are 21 seeds — more than you need. Choose the 25 that best fit cell S3 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "sl-0247", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): It is unkind to ___ ill of someone who cannot defend herself.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0248", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Hardly had the referee ___ the players to step back when another argument broke out near the penalty spot.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0249", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “I'll text you as soon as the plane lands,” Chloe ___ to her mum at the gate.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0250", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Every time the Wi-Fi drops, our IT support just tells us to restart the router.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0251", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Rather than argue online, can we ___ this out face to face?", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0252", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Generally ___, a smaller bag is easier to carry.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0253", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The tour guide has already told the group twice where the coach will park after the tour.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0254", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): You'll have to ___ up for the people at the back to hear.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0255", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Last Friday, my friends ___ me into entering the race.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0256", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My physiotherapist always says that swimming is much gentler on the knees than jogging.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0257", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): At breakfast yesterday, the teenager ___ back to his father.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0258", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): He apologised for what he had said to his teammates during the half-time break.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0259", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I have already ___ the delivery driver off for blocking the ramp.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0260", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Why didn't you ___ to the waiter that the steak was undercooked?", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0261", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): It goes without ___ that guide dogs are welcome.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0262", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): In his email this morning, the supplier ___ that the spare parts would ship on Wednesday.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0263", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Even under pressure, she always ___ her mind.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0264", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Has anyone ___ the neighbours on the ground floor about Sunday's roof repairs?", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0265", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Please don't ___ the children where we've hidden their birthday presents.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0266", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “We can't approve the loan without a guarantor,” the bank clerk ___ as he handed back the folder.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0267", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): During the interview, the singer ___ very little to the host about her upcoming album.", "hooks": ["reporting someone's words"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): (none yet)
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: (none yet)

## Final self-check (last line of the answer)
`# check: time_markers=<N>/25, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=25, formats=<gap/mini/mc/fix/which/transform>, levels=<b/m/a>`
