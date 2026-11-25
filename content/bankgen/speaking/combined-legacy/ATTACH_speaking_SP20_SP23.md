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


# Batch SP20 · cell S4 · 31 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 31 tasks** of batch SP20 for cell **S4**.

## Distribution (must match exactly)
- Formats: mc 12, fix 8, which 6, gap 5
- Levels: basic 9, medium 13, advanced 9
- `id`: `SP20-01` … `SP20-31`

### S4. Choose the right verb (mc / which / fix)

**What is trained:** contrast items with 4 verbs; error correction.

**The decision:** contrast of the four verbs in context.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** all of the above.

**Example of the level (do not copy its storyline):** My boss ___ me to send the file by noon. → told

**Typical format mix:** mc 40%, fix 25%, which 20%, gap 15%


## Scenario seeds for this batch
Below are 38 seeds — more than you need. Choose the 31 that best fit cell S4 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "sl-0268", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Let's say we split the bill equally; how much would that be?", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0269", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The hostel was noisy, to say the least.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0270", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): It goes without saying that helmets are compulsory here.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0271", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Rarely has a guest lecturer spoken to such a packed auditorium without using a single slide or note.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0272", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “Hello, could I speak to Mr Patel in the billing department, please?”", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0273", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Last Tuesday, a former astronaut spoke to an audience of five hundred schoolchildren in our town hall.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0274", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nobody could hear, so the guide spoke up when we asked yesterday.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0275", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Yesterday the coach told me off for missing practice.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0276", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The flat is tiny. Having said that, the balcony is lovely.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0277", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We made a strict pact not to talk shop during our sailing holiday, even though we all work at the same hospital.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0278", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “Is that Dr Evans?” — “Speaking. How can I help you?”", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0279", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): You're talking absolute nonsense if you think you can drive from London to Edinburgh in three hours.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0280", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): It should go without saying that you must back up your files.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0281", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Could you speak up? The microphone isn't working.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0282", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): To tell the truth, I prefer the old logo.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0283", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): In tightly knit diplomatic circles, people inevitably talk if an ambassador leaves a reception before the toast.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0284", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Professor Morales is going to speak at the international medical conference in Vienna next week.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0285", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): In a village this small, people always talk if a stranger buys one of the old cottages.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0286", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Our goalkeeper made mistakes. Having said that, he saved the final shot.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0287", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Several players have spoken out against the unfair selection policy.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0288", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): You should speak your mind when we discuss the timetable.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0289", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Only after the chairperson threatened to suspend the sitting did the backbenchers finally stop talking among themselves.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0290", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The two old friends sat on the park bench and talked for hours about their school days.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0291", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Every time those two sports journalists share a cab to the stadium, they talk football the whole way.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0292", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): At last night's debate, Jo ___ her mind despite the criticism.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0293", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Those empty shelves speak volumes about demand.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0294", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The kitchen is our control room, so to speak.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0295", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): No sooner had the switchboard operator asked who was speaking than the line went completely dead.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0296", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “Good afternoon, could I ___ to Mrs Jenkins, please?” — “Just a moment, I'll put you through.”", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0297", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Don't pay any attention to Greg when he criticises the engine — he doesn't own a car and is just talking through his hat.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0298", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We eventually ___ Dad out of buying that broken scooter yesterday.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0299", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Speaking of dinner, have you booked a table?", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0300", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Let's talk the budget over before signing anything.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0301", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The historian is scheduled to ___ to an audience of diplomats and journalists at Chatham House tonight.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0302", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Whenever my dad meets his colleagues at a barbecue, they immediately start ___ shop.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0303", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): If you ring the embassy before nine, an automated voice asks who you wish to speak to and transfers the extension.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0304", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We need to ___ the schedule through before invitations go out.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0305", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Please talk her out of driving in this storm.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): (none yet)
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: (none yet)

## Final self-check (last line of the answer)
`# check: time_markers=<N>/31, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=31, formats=<mc/fix/which/gap>, levels=<b/m/a>`


# Batch SP21 · cell S4 · 31 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 31 tasks** of batch SP21 for cell **S4**.

## Distribution (must match exactly)
- Formats: mc 12, fix 8, which 6, gap 5
- Levels: basic 9, medium 13, advanced 9
- `id`: `SP21-01` … `SP21-31`

### S4. Choose the right verb (mc / which / fix)

**What is trained:** contrast items with 4 verbs; error correction.

**The decision:** contrast of the four verbs in context.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** all of the above.

**Example of the level (do not copy its storyline):** My boss ___ me to send the file by noon. → told

**Typical format mix:** mc 40%, fix 25%, which 20%, gap 15%


## Scenario seeds for this batch
Below are 29 seeds — more than you need. Choose the 31 that best fit cell S4 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "sl-0306", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Could you talk me through the payment process step by step?", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0307", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anyone who dismisses the surgeon's warning as mere nerves is ___ utter nonsense.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0308", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “Hello, is that the plumber?” — “Yes, ___. How can I help?”", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0309", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): During the networking reception, most of the delegates stood around the buffet table talking business.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0310", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Before retiring, our old supervisor always ___ down to junior staff.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0311", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nobody managed to talk the director out of resigning.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0312", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Please don't talk down to the trainees; they are adults.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0313", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We bumped into our former neighbours at the market and stood by the flower stall talking for nearly an hour.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0314", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): It goes without ___ that nobody should share the door code.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0315", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We need a small group: let's say six people.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0316", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): To tell the truth, I haven't read your message yet.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0317", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Could I speak to the duty manager, please? I'm calling from Room 402 about the air conditioning.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0318", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Will anyone ___ out against the library closure?", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0319", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): It went without saying that everyone would get a refund.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0320", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Dr Kim has been invited to ___ at the renewable energy conference in Stockholm.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0321", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): His refusal to answer yesterday ___ volumes.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0322", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): To say the least, cancelling the final without notice was unfortunate.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0323", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): You can't wear pyjamas to the village post office — the neighbours will ___!", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0324", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): ___ of phones, where is my charger?", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0325", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Don't tell the children off before you know what happened.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0326", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Why do they always have to ___ politics at Christmas dinner when it only causes arguments?", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0327", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): To ___ you the truth, this soup needs more salt.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0328", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): After five days of negotiations, the two countries suspended the peace ___ until next month.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0329", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Please ___ up; the traffic is drowning out your voice.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0330", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): As soon as the lights dimmed in the theatre, the audience stopped ___ and looked at the curtain.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0331", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): This little drone is my flying camera, so to ___.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0332", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Don't try to ___ me into paying for your ticket.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0333", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The librarian ___ us off yesterday for eating near the computers.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0334", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): To ___ you the truth, I don't enjoy camping.", "hooks": ["an argument"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): (none yet)
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: (none yet)

## Final self-check (last line of the answer)
`# check: time_markers=<N>/31, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=31, formats=<mc/fix/which/gap>, levels=<b/m/a>`


# Batch SP22 · cell S5 · 34 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 34 tasks** of batch SP22 for cell **S5**.

## Distribution (must match exactly)
- Formats: mini 24, mc 5, fix 5
- Levels: basic 10, medium 14, advanced 10
- `id`: `SP22-01` … `SP22-34`

### S5. Mini-texts and dialogues

**What is trained:** a short dialogue or story, 2–4 gaps with different speaking verbs and structures.

**The decision:** different verbs and structures in one story.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** all of the above.

**Example of the level (do not copy its storyline):** At the party Lena (to talk) to a stranger who (to say) he (to speak) three languages.

**Typical format mix:** mini 70%, mc 15%, fix 15%


## Scenario seeds for this batch
Below are 41 seeds — more than you need. Choose the 34 that best fit cell S5 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "sl-0335", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): It goes without saying that any confidential data discussed in this room must not be shared online.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0336", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Could you speak up a bit? The traffic outside is really loud.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0337", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I wasn't going to buy a new coat, but my friend talked me into trying on the green parka.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0338", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Instead of lecturing teenagers and talking down to them, good teachers treat them with respect.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0339", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My mum told me off yesterday for leaving wet towels on the bathroom floor.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0340", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Everyone at the hospital speaks highly of the new surgeon from Dublin.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0341", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We don't need to advertise our bakery any more — the queue outside every Saturday morning speaks for itself.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0342", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “It's pouring with rain again!” — “You can say that again!”", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0343", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Working sixty hours a week without a break is beginning to tell on Arthur's health.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0344", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): At first the landlady refused to allow pets, but after a long chat we managed to talk her round.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0345", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Don't talk back to your grandmother when she asks you to tidy your desk.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0346", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Before signing the mortgage contract, you should talk it over with your partner.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0347", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The new software has a few bugs. Having ___ that, it is still much faster than the old system.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0348", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): To tell the truth, I didn't enjoy the play at all, even though the critics praised it.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0349", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Speaking of holidays, have you renewed your passport for our trip to Morocco yet?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0350", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Few employees were brave enough to ___ out against the company's decision to cut overtime pay.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0351", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We could meet outside the cinema at, let's ___, quarter past seven.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0352", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Helena is never afraid to speak her mind at staff meetings, even if the director disagrees.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0353", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Repairing the flooded basement will cost thousands of pounds, to ___ nothing of the ruined furniture.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0354", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): You forgot your umbrella and got soaked? I ___ you so!", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0355", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Frankly ___, I don't think the new timetable will save us any time at all.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0356", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The label says “Wash by hand”; look at it before you start.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0357", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Please tell your coach about the injury.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0358", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): If you two have had a misunderstanding, sit down over a cup of tea and ___ it out.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0359", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Yesterday the nurse told me not to eat before the test.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0360", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): They were talking football during the entire bus ride.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0361", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The hotel room was tiny and noisy — disappointing, to ___ the least.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0362", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): — Hello, can I speak to Dr Lane, please? — Speaking. This is Dr Lane.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0363", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We didn't say a word during the silent film.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0364", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): When the junior clerk was unfairly blamed for the error, only one colleague dared to ___ up for him.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0365", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): For once, you're talking sense; we really do need a backup.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0366", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): She has just said yes to the job offer.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0367", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The ferry was cancelled because of the storm. Needless to ___, we missed our connecting train in Dover.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0368", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Don't tell me your password, even if I ask.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0369", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Please say hello to your uncle for me.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0370", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Yesterday the receptionist told us that the pool was closed.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0371", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): In yesterday's message, Omar said that the ferry had been cancelled.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0372", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The fans always talk sport over breakfast.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0373", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): What did the email say about the new opening hours?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0374", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): At the gate yesterday, the guard told visitors to show their passes.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0375", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): How do you say “receipt” in English?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): (none yet)
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: (none yet)

## Final self-check (last line of the answer)
`# check: time_markers=<N>/34, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=34, formats=<mini/mc/fix>, levels=<b/m/a>`


# Batch SP23 · cell S5 · 33 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 33 tasks** of batch SP23 for cell **S5**.

## Distribution (must match exactly)
- Formats: mini 23, mc 5, fix 5
- Levels: basic 10, medium 13, advanced 10
- `id`: `SP23-01` … `SP23-33`

### S5. Mini-texts and dialogues

**What is trained:** a short dialogue or story, 2–4 gaps with different speaking verbs and structures.

**The decision:** different verbs and structures in one story.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** all of the above.

**Example of the level (do not copy its storyline):** At the party Lena (to talk) to a stranger who (to say) he (to speak) three languages.

**Typical format mix:** mini 70%, mc 15%, fix 15%


## Scenario seeds for this batch
Below are 40 seeds — more than you need. Choose the 33 that best fit cell S5 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "sl-0376", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “Your taxi is here,” the porter said a moment ago.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0377", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I can tell from your expression that the interview went well.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0378", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Have you ever told a joke on live television?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0379", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Can you speak Japanese well enough to read this menu?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0380", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Before bedtime yesterday, Grandpa told a story about a lost dog.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0381", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): You mustn't tell this secret to anyone.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0382", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Don't talk nonsense; the moon isn't made of cheese.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0383", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The screen currently says that our train is ten minutes late.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0384", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The fortune-teller offered to tell my fortune.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0385", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I couldn't tell the two suitcases apart in the dark.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0386", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The invitation ___ “Bring a friend”, so I brought my neighbour.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0387", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Every night he kneels to say a prayer.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0388", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Did the child tell a lie about the missing cake?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0389", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The host ___ us not to feed the cat when we arrived yesterday.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0390", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “You've won a bike!” the presenter said yesterday.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0391", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Could you tell the time without looking at your phone?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0392", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The caller replied, “___,” when I asked for Ms Bell.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0393", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Have you said goodbye to everyone yet?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0394", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): This actor is said to own a vineyard in France.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0395", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Our football coach is strict about phones. At Monday's training, two players were sitting on the bench talking shop about their part-time jobs instead of warming up. “Save it for later,” the coach said. Then she told them a story about a team that lost a final because nobody was listening.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0396", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Did you ___ sorry for breaking the plate?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0397", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): It is said that the old tunnel reaches the harbour.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0398", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): During our cycling trip, we stopped at a crossroads. The old signpost said “Lake 5 km”, but our guide just laughed. “Never trust that sign,” he told us. “The locals turned it round years ago as a joke.” We couldn't stop talking about it all the way to the lake.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0399", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Don't ___ back to the referee.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0400", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I have been invited to speak at the graduation ceremony.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0401", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We held a video call last night to plan the school fair. The connection was terrible. “Could you speak up a bit?” I asked our treasurer. She repeated that we could afford two stalls. Then I tried to talk my cousin into baking muffins. “To tell you the truth, I've never baked anything,” she admitted.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0402", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Could you ___ me through the first exercise?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0403", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We should say thank you before leaving the host's house.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0404", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): At the climbing centre, I froze halfway up the wall. I was so scared that I couldn't speak. My friend shouted from below, “Don't look down!” I wanted to quit, but she talked me out of it. At the top I finally said what I was thinking: “Never again!”", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0405", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Her medals ___ for themselves.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0406", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I won't say no to a free slice of pizza.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0407", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Our group chat was full of confusing messages about Saturday's picnic. Nobody had told the new members where we were meeting. I pinned a message that said, “Main gate, 11 a.m.” Then Leo asked me to talk him through ordering the food online, because he had never used the app before.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0408", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Don't ___ ill of your teammates behind their backs.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0409", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The witnesses have already told the police everything they remember.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0410", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My brother wanted to buy a huge gaming chair. “It won't fit under your desk,” I said. He ignored me, so I told him to measure the space first. It was twenty centimetres too small. In the end he didn't order it, and he even let me talk him through choosing a smaller one.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0411", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Yesterday our new neighbour knocked on the door. She told us that she had lost her keys. “The spare set is inside,” she said. Fortunately, my flatmate can speak Polish, so he helped her explain the problem to her landlord.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0412", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): She used to speak Portuguese at home before moving abroad.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0413", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Our running group meets before sunrise. Yesterday the organiser phoned me at 6 a.m. “Hello, is that Kate?” she asked. “Speaking,” I answered sleepily. She told me that the riverside path was flooded and we would use the park. Honestly, I was happy to say goodbye to the cold river wind for one morning.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0414", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Our class recorded a podcast last week. At first nobody wanted to say anything into the microphone. Then Mina told a joke about our school canteen, and everyone relaxed. By the end, even our quietest classmate was talking sense about the new timetable.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0415", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nobody wants to talk shop at their own birthday party.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): (none yet)
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: (none yet)

## Final self-check (last line of the answer)
`# check: time_markers=<N>/33, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=33, formats=<mini/mc/fix>, levels=<b/m/a>`
