# Seeds for topic «Verb tenses (времена глагола)», part 3 of 39

> Send after `master.md`. Save the answer as `content/bankgen/tenses/seeds/seeds-03.jsonl`.

Write **50 scenario seeds**: short, concrete situations from life. Each future task will be built on its own seed, so the storylines of the bank never repeat.

Domains for this part (about 10 seeds per domain, no more than 12): museums and art · science and discoveries · health and clinics (no diagnoses) · technology, apps and social media · crime and police (no violence).

Every seed must contain a **natural reason** for one of these scene features of the topic (`hooks`): `a habit or routine` | `an action in progress now` | `a story in the past` | `a result visible now` | `a duration up to now` | `an earlier event in a past story` | `a future plan or arrangement` | `a prediction` | `an action before a future moment` | `a state verb` | `a background action interrupted`.
Across the 50 seeds no hook may be used in more than 25% of them.

## A good seed
- Concrete: a place, people (or a role), an event, one vivid or unexpected detail. Realistic (funny is fine, nonsense is not).
- The seeds inside a domain are different: different places, ages, professions, countries, tones.
- Everyday vocabulary only (A2–B1). No jargon, no rare animals or professions. Ordinary life.
- Not a ready exercise sentence: 1–2 plain sentences, up to 30 words.
- No celebrities, politics, religion, war, deaths, injuries with details, diagnoses.
- Banned for this topic: «By the …» as an opening in more than 3% of tasks; a marker (yesterday / since / already) in more than 30% of tasks; the same «yesterday I (go) …» frame; long lists of tenses in one sentence.

## Format (JSONL, one line per seed)
```
{"seed_id":"tn-0301","domain":"school life","place":"a primary school in Leeds","who":"a class of nine-year-olds","situation":"…","hooks":["a question someone asked"],"tone":"funny","register":"dialogue"}
```
- `seed_id`: `tn-03NN` (NN = 01…50)
- `hooks`: 1–2 of the list above (copy the wording exactly)
- `tone`: funny | annoying | alarming | touching | neutral | good news | bad news | ironic
- `register`: dialogue | chat | email | notice | news | instructions | report | review | story

At the end one line: `# check: seeds=50, hooks={…}, tones={…}`.
