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


# Batch SP12 · cell S1 · 34 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 34 tasks** of batch SP12 for cell **S1**.

## Distribution (must match exactly)
- Formats: gap 14, mini 7, mc 5, fix 4, which 2, transform 2
- Levels: basic 10, medium 14, advanced 10
- `id`: `SP12-01` … `SP12-34`

### S1. say or tell

**What is trained:** say + (to) someone + words; tell + someone + something; tell vs say in reported statements; tell the truth/lie/story/time vs say hello/yes/goodbye.

**The decision:** does the verb take a direct object, a person, a that-clause?

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** he said me; told to me; say a lie; tell hello; tell that without object.

**Example of the level (do not copy its storyline):** He (to tell) his sister he was ill, but he (to say) the same thing to the manager on Monday.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%


## Scenario seeds for this batch
Below are 41 seeds — more than you need. Choose the 34 that best fit cell S1 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "sl-0001", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The seventeenth-century portrait in the east wing is said to have been painted by a pupil of Rembrandt.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0002", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Don't forget to say thank you to Aunt Clara for the birthday card.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0003", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): It says in today's local paper that the old cinema on High Street will be turned into flats.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0004", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Had the solicitor told the clients about the hidden clause earlier, they would never have signed the lease.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0005", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Why did you say to her that the party was cancelled?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0006", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The estate agent has just said that the sellers accepted our offer.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0007", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Only a trained botanist can tell these two species of wild mushroom apart without a microscope.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0008", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My little nephew is only six, but he can already tell the time on a clock with hands.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0009", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The suspect has told so many lies to the investigators that nobody believes his alibi anymore.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0010", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Clause 14 of the tenancy agreement explicitly says that subletting any part of the premises is prohibited.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0011", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My kitchen clock says quarter to eight, so we still have twenty minutes before the bus.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0012", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Throughout the entire two-hour train journey, the passenger opposite me didn't say a single word.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0013", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Rarely does a politician openly tell the electorate that taxes will have to rise before an election.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0014", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Our coach always tells us to warm up before running.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0015", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “We've run out of printer paper again,” the secretary said, opening an empty drawer.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0016", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Had the applicant told the truth about his previous dismissal, the panel might have given him a second chance.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0017", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Promise me you'll tell the truth, even if you broke the vase by accident.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0018", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My grandfather loves telling stories about his youth in Odessa whenever the whole family gathers.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0019", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): It was said at the time that the chancellor had offered his resignation twice before the budget vote.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0020", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Oliver was so angry after the match that he left the changing room without saying goodbye.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0021", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Before the rescue boat reached the reef, the sailors said a silent prayer for calm seas.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0022", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The mountain rescue team has just told the hikers stranded at the hut to stay indoors until the blizzard subsides.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0023", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Please don't tell anyone what happened at the office today.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0024", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): In his interview yesterday, the director said nothing to the press about the cast.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0025", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): So convincing was the deepfake audio that even the singer's producer couldn't tell it from a studio recording.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0026", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Uncle Ben always tells funny jokes at family dinners to make everyone laugh.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0027", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Because the twin kittens have the exact same markings, only our vet can tell one from the other.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0028", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Hardly a word was said at the dinner table after the solicitor read out the disputed will.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0029", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): What does the label on your wool jumper say about washing it in warm water?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0030", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The building regulations clearly say that every stairwell must have an emergency light.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0031", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Whatever the Auditor General may have told the board in private, the published report remains highly critical.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0032", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Everyone at the meeting yesterday said that the budget was too small.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0033", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Whenever I ask about the budget, the manager says that the figures aren't final yet.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0034", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): An experienced customs dog can tell within seconds whether a suitcase contains prohibited agricultural produce.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0035", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I knew right away that Leo was telling a lie because his ears turned bright red.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0036", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I could tell by the tone of Noah's voice on the phone last night that something had gone wrong.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0037", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Several missing manuscripts from the monastery library are said to be in a private collection in Zurich.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0038", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): They say that eating carrots helps you see in the dark, although doctors doubt it.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0039", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): This mountain spring water is said to have healing properties, attracting visitors from all over the region.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0040", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The whistle-blower regrets not having told the regulators about the accounting irregularities much sooner.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0041", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “This coffee is freezing,” Maya said as she pushed the mug away.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): (none yet)
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: (none yet)

## Final self-check (last line of the answer)
`# check: time_markers=<N>/34, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=34, formats=<gap/mini/mc/fix/which/transform>, levels=<b/m/a>`


# Batch SP13 · cell S1 · 34 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 34 tasks** of batch SP13 for cell **S1**.

## Distribution (must match exactly)
- Formats: gap 14, mini 7, mc 5, fix 4, which 2, transform 2
- Levels: basic 10, medium 14, advanced 10
- `id`: `SP13-01` … `SP13-34`

### S1. say or tell

**What is trained:** say + (to) someone + words; tell + someone + something; tell vs say in reported statements; tell the truth/lie/story/time vs say hello/yes/goodbye.

**The decision:** does the verb take a direct object, a person, a that-clause?

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** he said me; told to me; say a lie; tell hello; tell that without object.

**Example of the level (do not copy its storyline):** He (to tell) his sister he was ill, but he (to say) the same thing to the manager on Monday.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%


## Scenario seeds for this batch
Below are 41 seeds — more than you need. Choose the 34 that best fit cell S1 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "sl-0042", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I remember saying to you last month that this laptop battery wouldn't last long.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0043", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): In nineteen-thirties port cities, sailors often paid street astrologers to tell their fortunes before a long voyage.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0044", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): If I tell you a secret about the surprise party, will you keep it to yourself?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0045", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): If a witness is caught telling a lie under oath, they can face serious charges for perjury.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0046", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Whatever the barometer on the wall may say, the fishermen refuse to leave port when the wind blows from the east.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0047", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): If you bumped into the cyclist by mistake, the least you can do is say sorry.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0048", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): According to the dashboard thermometer, it says minus four outside, so watch out for black ice.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0049", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The judge sternly told the defence counsel not to interrupt the cross-examination again.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0050", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My dentist told me last week to replace my toothbrush every three months.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0051", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “Don't touch the wet paint on the banister,” the decorator told me as I walked upstairs.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0052", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Rarely can an untrained listener tell the difference between a Stradivarius and a modern master violin in a blind test.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0053", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Even from the back of the hall, I could tell that the violinist was nervous.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0054", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Without her reading glasses, Mrs Higgins struggles to tell the time on her small wristwatch.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0055", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): For decades, the abandoned lighthouse on the headland was said to be haunted by its former keeper.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0056", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Please say hello to your parents for me when you visit them this weekend.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0057", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Even when the committee offered to double his fee, the architect firmly said no to the design changes.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0058", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Having been told repeatedly to keep the fire exits clear, the warehouse supervisor was fined during the inspection.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0059", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Who told you that the exam had been moved to Friday?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0060", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Could you tell the delivery driver to leave the boxes on the porch if I'm in the shower?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0061", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Having been caught telling lies to the parliamentary committee, the minister had no choice but to resign.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0062", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): These two blue jumpers look identical to me — how do you tell them apart?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0063", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Have you ever met someone who claims they can tell your fortune by reading tea leaves?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0064", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The sunken galleon off the coast is ___ to have carried a cargo of seventeenth-century silver coins.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0065", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The road sign at the bridge says “Maximum weight 3 tonnes”.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0066", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): It is often said that the hardest part of writing a novel is finishing the first chapter.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0067", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Had the surveyor ___ us about the subsidence risk, we would have pulled out of the purchase at once.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0068", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Come sit down and tell me all about your weekend in Berlin.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0069", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): While we were waiting for the ferry, an old fisherman told us about the storm of 1998.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0070", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Unless you look at the serial number under a magnifying glass, it is impossible to ___ the counterfeit notes from the genuine ones.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0071", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Why did you ___ a lie when Mum asked who had eaten the last slice of cake?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0072", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Hannah never tells secrets to anyone at work because gossip spreads through the office in minutes.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0073", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): It is widely ___ among wine critics that the 2015 vintage was the finest of the decade.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0074", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): What does your watch ___? Mine stopped an hour ago.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0075", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Does the instruction manual say which button resets the dishwasher after a power cut?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0076", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “Our priority remains the preservation of the wetland,” the conservationist ___ to the assembly before stepping down.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0077", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My older brother ___ me not to touch his guitar without asking.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0078", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The vet told my sister yesterday not to give the puppy any table scraps.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0079", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anyone who has worked in customer service for years can immediately ___ when a caller is exaggerating.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0080", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The two brothers sound so similar on the phone that I can never ___ them apart.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0081", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Whenever the atmosphere in the studio gets tense, the sound engineer tells a joke to lighten the mood.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0082", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The small print at the bottom of the invoice ___ that late payments incur a five per cent surcharge.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): (none yet)
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: (none yet)

## Final self-check (last line of the answer)
`# check: time_markers=<N>/34, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=34, formats=<gap/mini/mc/fix/which/transform>, levels=<b/m/a>`


# Batch SP14 · cell S1 · 33 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 33 tasks** of batch SP14 for cell **S1**.

## Distribution (must match exactly)
- Formats: gap 13, mini 7, mc 5, fix 4, which 2, transform 2
- Levels: basic 10, medium 13, advanced 10
- `id`: `SP14-01` … `SP14-33`

### S1. say or tell

**What is trained:** say + (to) someone + words; tell + someone + something; tell vs say in reported statements; tell the truth/lie/story/time vs say hello/yes/goodbye.

**The decision:** does the verb take a direct object, a person, a that-clause?

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** he said me; told to me; say a lie; tell hello; tell that without object.

**Example of the level (do not copy its storyline):** He (to tell) his sister he was ill, but he (to say) the same thing to the manager on Monday.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%


## Scenario seeds for this batch
Below are 40 seeds — more than you need. Choose the 33 that best fit cell S1 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "sl-0083", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Make sure you ___ goodbye to your cousins before we get into the car.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0084", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Whenever my grandmother loses her spectacles, she says a quick prayer to Saint Anthony.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0085", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The coroner's report ___ nothing about whether the faulty wiring had been inspected the previous winter.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0086", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Did you ___ Sarah about the change in tomorrow's timetable?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0087", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): You should have told the hairdresser right away that the water was too hot.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0088", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): No matter how plausibly a candidate ___ lies during an interview, background checks usually expose the fabrication.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0089", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Can your little sister ___ the time yet, or does she still use a digital watch?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0090", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Just by looking at the dark clouds over the bay, the skipper could ___ that a squall was approaching.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0091", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The reclusive billionaire is ___ to have donated half of his art collection to the national gallery anonymously.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0092", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The notice on the gate ___ “Beware of the dog”, so let's ring the bell first.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0093", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The satnav says we'll reach the ferry terminal in forty minutes if traffic stays light.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0094", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The lifeguard ___ the swimmers to get out of the water before the storm hit.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0095", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): What were you saying to the neighbours when I pulled into the driveway?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0096", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The two restoration workshops use such similar glazes that even museum curators struggle to ___ their ceramics apart.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0097", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): How do jewellers ___ a laboratory-grown diamond from a natural stone?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0098", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I offered to pay for the broken mug, and the café owner ___ no and smiled.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0099", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Local fishermen say that the harbour seals always gather near the pier before a heavy storm.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0100", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Grandpa always ___ us how he built his first boat by hand.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0101", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “Please keep your boarding passes ready,” the gate agent said over the loudspeaker a moment ago.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0102", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): To be honest, nobody at the table laughed when the best man ___ his third joke.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0103", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): He was so embarrassed by his mistake during the rehearsal that he stood there and said nothing.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0104", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Did the invigilator tell the candidates when they could open the question papers?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0105", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): If you promise not to repeat it, I'll ___ a secret about who's getting promoted next month.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0106", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Check the packet — it should say on the back how many grams of sugar are in each serving.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0107", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The optician ___ me that my prescription hadn't changed since last year.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0108", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Even after comparing the two samples side by side, the inspector couldn't ___ the difference.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0109", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): ___ hello to Sam for me if you bump into him at the gym tonight.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0110", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Our tennis coach has repeatedly ___ the juniors not to leave empty water bottles on the court.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0111", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The witness swore to ___ the truth, the whole truth, and nothing but the truth.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0112", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): They ___ that this winter is going to be the coldest in thirty years.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0113", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The pharmacist ___ that I should take the tablets with food, not on an empty stomach.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0114", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): A fortune-teller at the carnival offered to ___ my palm and ___ my fortune for five pounds.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0115", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): It ___ on the ticket that doors close fifteen minutes before the concert starts.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0116", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The museum warden politely ___ the visitors to switch off their camera flashes.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0117", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Why didn't you ___ sorry when you stepped on that man's foot in the lift?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0118", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I've already ___ you three times that the spare charger is in the top drawer.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0119", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The club rules ___ that all guests must be signed in by a member at the reception desk.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0120", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The driving instructor ___ Liam to check his blind spot before changing lanes.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0121", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): She was so touched by the surprise gift that she couldn't ___ a word for a whole minute.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0122", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): If they offer you the internship in Madrid, are you going to ___ yes?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): (none yet)
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: (none yet)

## Final self-check (last line of the answer)
`# check: time_markers=<N>/33, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=33, formats=<gap/mini/mc/fix/which/transform>, levels=<b/m/a>`


# Batch SP15 · cell S2 · 30 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 30 tasks** of batch SP15 for cell **S2**.

## Distribution (must match exactly)
- Formats: gap 12, mini 7, mc 4, fix 4, which 2, transform 1
- Levels: basic 9, medium 12, advanced 9
- `id`: `SP15-01` … `SP15-30`

### S2. speak or talk

**What is trained:** speak a language / to someone / about; talk to / with / about / over; speak vs talk in formal/informal use.

**The decision:** language, formality, and the preposition.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** talk English; speak with my friends about it (fine but mark); say English; talk to me about.

**Example of the level (do not copy its storyline):** Can you (to speak) slowly? I'd like to (to talk) to you about the trip, but I don't (to speak) Italian well.

**Typical format mix:** gap 40%, mini 22%, mc 15%, fix 12%, which 6%, transform 5%


## Scenario seeds for this batch
Below are 36 seeds — more than you need. Choose the 30 that best fit cell S2 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "sl-0123", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Rarely does one encounter a classicist who can speak Modern Greek as fluently as they read Homer.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0124", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Does anyone at this hotel reception speak Spanish or Portuguese?", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0125", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Having lived in Kyoto for six years, Clara now speaks Japanese almost like a native.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0126", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Anyone claiming that inflation will vanish overnight without interest rate adjustments is clearly talking through their hat.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0127", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Don't listen to Paul when he's in that mood — he's just talking nonsense.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0128", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Why do you let the lawyers talk shop all evening when we're supposed to be celebrating Anna's birthday?", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0129", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Paramedics noticed that the driver's speech was slurred and that he was struggling to speak coherently.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0130", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Please speak more slowly — I'm only a beginner in Italian and can't catch every word.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0131", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The witness was so shaken by the explosion that for several minutes he wasn't able to speak at all.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0132", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Having spoken at three consecutive climate forums that week, the minister had almost lost her voice by Friday.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0133", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Whenever my uncles get together on Sundays, they talk politics for hours.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0134", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): When the receptionist put the call through, a polite voice said, “Hello, Arthur Pendelton speaking.”", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0135", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Applicants for the consular post in Algiers are required to speak both French and Standard Arabic.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0136", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): How many languages does your new classmate from Switzerland speak?", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0137", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): If you want the voice assistant to understand your accent, try to speak clearly into the microphone.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0138", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): At the gala dinner, the venture capitalists spent the entire main course talking politics instead of enjoying the music.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0139", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): At last night's dinner, the engineers promised not to talk shop, but they soon started discussing engines.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0140", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The librarian tapped her pencil on the desk and asked the teenagers in the corner to stop talking.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0141", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): So acute was the soprano's laryngitis before the premiere that she could scarcely speak, let alone sing.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0142", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): When Liam saw the scratch on his brand-new car, he was too angry to speak.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0143", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Nobody in our hiking group spoke Georgian, so we used a translation app in remote villages.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0144", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): For the first time in months, the rival factions agreed to sit down for informal peace talks in Oslo.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0145", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Finally someone on the committee is talking sense about how to fix the school roof!", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0146", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Has the keynote guest already spoken at the morning session, or is her lecture after lunch?", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0147", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Growing up in a trilingual household in Luxembourg, Matteo learned to speak French, German, and Luxembourgish simultaneously.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0148", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Both of my cousins in Montreal speak French and English at home.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0149", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): After throat surgery, patients are told not to speak above a whisper for a week.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0150", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): If the board wants to salvage the company, they should listen to the chief accountant — she's the only one talking sense.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0151", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Good morning, this is Mia from City Dental Clinic — who's speaking, please?", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0152", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Both delegations have arrived in Geneva for a new round of peace talks aimed at ending the border dispute.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0153", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Without a microphone in the vaulted chapel, the officiant had to speak slowly and clearly to be heard at the back.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0154", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Could you speak a little louder, please? The connection is very poor today.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0155", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Although my grandfather moved to Canada in the fifties, he still speaks Ukrainian with his sister.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0156", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): He knows nothing about marine biology, so when he lectures us on coral reefs, he's just ___ through his hat.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0157", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): After dinner, the guests moved to the terrace and started talking business over coffee.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0158", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My sister is the only person in our family who consistently talks sense when everyone else is panicking.", "hooks": ["a phone call"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): (none yet)
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: (none yet)

## Final self-check (last line of the answer)
`# check: time_markers=<N>/30, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=30, formats=<gap/mini/mc/fix/which/transform>, levels=<b/m/a>`
