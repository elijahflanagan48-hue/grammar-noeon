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


# Batch SP24 · cell S5 · 33 tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly 33 tasks** of batch SP24 for cell **S5**.

## Distribution (must match exactly)
- Formats: mini 23, mc 5, fix 5
- Levels: basic 10, medium 13, advanced 10
- `id`: `SP24-01` … `SP24-33`

### S5. Mini-texts and dialogues

**What is trained:** a short dialogue or story, 2–4 gaps with different speaking verbs and structures.

**The decision:** different verbs and structures in one story.

**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** all of the above.

**Example of the level (do not copy its storyline):** At the party Lena (to talk) to a stranger who (to say) he (to speak) three languages.

**Typical format mix:** mini 70%, mc 15%, fix 15%


## Scenario seeds for this batch
Below are 39 seeds — more than you need. Choose the 33 that best fit cell S5 and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Each seed is an OLD exercise ("Source example"). Rewrite it completely in NEW words, a new situation and new names; keep only the grammar point. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{"seed_id": "sl-0416", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We tested our new board game last night. My sister told us not to look at each other's cards, but Dad kept peeking. “I'm not cheating!” he said. Nobody believed him: his big smile spoke volumes. In the end we agreed that he should apologise and say sorry to everyone.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0417", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We were recording a song in the garage last night. The drummer told us to move the microphone closer. “I can't hear the singer,” he said. I asked her to speak up during the introduction, before the instruments started playing again.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0418", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): You can ___ me the address after lunch.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0419", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We organised a surprise breakfast for Ana's birthday. Her flatmate had to talk her into going for a walk while we decorated the kitchen. When she came back, she stood in the doorway and didn't say a word for almost a minute. Later she told us it was the best birthday she had ever had.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0420", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Last night our online quiz team got stuck on a question about languages. I told my teammates that the answer was Finnish. “Are you certain?” one said. Luckily, another player can speak Finnish and confirmed my answer before the timer ran out.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0421", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): They were ___ politics while waiting for the results.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0422", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Our head teacher asked me to read an announcement at the school concert. I was so nervous that I could hardly speak. My partner whispered that the parents at the back couldn't hear. “Just say the words slowly,” she added. Afterwards the head teacher told us that we had done a great job.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0423", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Our school hosted an exchange student last month. She can speak three languages and was learning a fourth. She told us about her home town. “The winters are very dark,” she said, showing us a picture taken on her way to school.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0424", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): “Leave the parcel outside,” I ___ to the courier yesterday.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0425", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): On yesterday's museum visit, the guide told us a story about a missing painting. “It was behind a cupboard all along,” she said. She could speak Dutch, so she also translated an old letter displayed beside the picture for our group.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0426", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): He is ___ to be the youngest chef in the city.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0427", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): At our neighbourhood meeting yesterday, the chair told residents to write down their suggestions. “We need practical ideas,” he said. One person chose to speak up for the children who wanted a safer crossing near the playground, and several parents applauded.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0428", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): To ___ the least, the landing was uncomfortable.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0429", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Yesterday our amateur theatre group tried on costumes. The director told us not to remove the labels. “They belong to another company,” she said. Frankly speaking, the jacket I was given looked terrible, but it fitted the character perfectly.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0430", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I can't ___ a genuine signature from a printed copy.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0431", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Needless to ___, we were relieved to find our passports.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0432", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My dentist ___ me yesterday that the tooth was fine.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0433", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): That silence ___ volumes about how unpopular the proposal is.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0434", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): You should ___ your mind before the decision becomes final.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0435", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Has the travel agent ___ you about the visa fee?", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0436", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): It's difficult to ___ the difference between these two recordings.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0437", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I tried a new recipe yesterday, but the sauce looked strange. The packet said “Add cold water”, which I had overlooked. My sister told me off for rushing. Then she talked me through the steps so we could save dinner before our guests arrived.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0438", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The hotel had given us the wrong room yesterday. I can speak Spanish, so I went down to reception myself. The receptionist told me that a larger room was available. “There's no extra charge,” she said, handing over a new key card.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0439", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): At the library yesterday, a visitor asked whether I could speak Korean. I couldn't, but my colleague could. She told him that the language books were upstairs. “I'll show you,” she said, leaving me to look after the returns desk for a moment.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0440", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): At our first pottery class yesterday, the tutor told us to keep the clay wet. She then talked us through making a simple bowl. “Don't worry about the shape yet,” she said, as mine slowly collapsed onto the spinning wheel in front of me.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0441", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): At yesterday's market, I found two nearly identical jackets. I couldn't tell them apart until the seller showed me the labels. “This one's handmade,” she said. She could speak Italian, which helped when another customer asked where the fabric came from.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0442", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My cousin rehearsed her wedding speech at our house yesterday. “It's much too long,” she said after timing it. I told her to cut the story about primary school. Frankly speaking, I was relieved: I was the embarrassing child in that story.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0443", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We took the wrong bus yesterday because the app said that it stopped outside the cinema. The driver told us to get off near the park instead. A couple beside us were talking football loudly, so we moved further down the bus.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0444", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): At yesterday's chess club, an older player told me how to use the clock. “Press this after your move,” he said. Although people around us were talking football, I managed to concentrate and finish my first competitive game without losing on time.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0445", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Yesterday I helped my grandmother set up a tablet. I told her not to share the password. “Write it in my notebook,” she said. Then I talked her through making a video call, and she rang my aunt before I had even finished explaining.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0446", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): At the station yesterday, a tourist couldn't understand the ticket machine. I can speak German, so I offered to help. He told me that he needed a return ticket. “The evening trains are cheaper,” I said, showing him the list on the screen.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0447", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The café had a new menu yesterday. It said that every sandwich came with soup. Our server told us that the tomato soup had sold out. “We still have mushroom,” she said. Generally speaking, I prefer tomato, but the mushroom was excellent.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0448", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): I volunteered at a charity shop yesterday. A customer told me that he wanted a jacket for an interview. He could speak very little English, so I also used gestures to help him. “Take your time,” I said, bringing out three different sizes for him to try.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0449", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Yesterday I joined a repair workshop with my broken toaster. The volunteer told me to unplug it before opening the case. Then he talked me through checking the cable. “There's your problem,” he said, pointing to a wire that had come loose inside.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0450", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): At yesterday's photography walk, our leader told us that the best light would last only ten minutes. “Head for the bridge,” he said. Two participants were still talking shop, comparing their office deadlines, while the rest of us hurried to set up our cameras.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0451", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): My friend brought a second-hand bike over yesterday. “I got a bargain,” he said. I told him that the brakes needed adjusting. Fortunately, a neighbour agreed to talk us through the repair, and we had it ready for a test ride before lunch.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0452", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): The gym's booking app crashed again yesterday. The screen said that every class was full, although the studio was empty. The receptionist told us to wait while she restarted the system. Meanwhile two members started talking politics so loudly that half the room joined in.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0453", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): Yesterday my housemate proposed adopting a second cat. I told her that our landlord allowed only one. “We could ask again,” she said. I couldn't talk her out of sending him a message, but at least she agreed to wait for his reply.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}
{"seed_id": "sl-0454", "domain": "everyday life", "place": "an ordinary place", "who": "the people in the example", "situation": "Source example (rewrite it in new words, keep the grammar point): We went kayaking yesterday, despite a doubtful forecast. The instructor told us that we would stay close to the shore. “Safety comes first,” she said. Her careful checks seemed to speak volumes about her experience, and even our most nervous friend relaxed.", "hooks": ["telling news"], "tone": "neutral", "register": "dialogue"}

## Already used in earlier batches — do not repeat
- Openings (first two words): (none yet)
- Verbs/words in brackets already used often (avoid unless required): (none yet)
- Names: (none yet)

## Final self-check (last line of the answer)
`# check: time_markers=<N>/33, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used=33, formats=<mini/mc/fix>, levels=<b/m/a>`
