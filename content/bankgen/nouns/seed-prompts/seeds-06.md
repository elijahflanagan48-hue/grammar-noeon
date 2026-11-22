# Seeds for topic «Nouns, articles and quantifiers (существительные)», part 6 of 13

> Send after `master.md`. Save the answer as `content/bankgen/nouns/seeds/seeds-06.jsonl`.

Write **50 scenario seeds**: short, concrete situations from life. Each future task will be built on its own seed, so the storylines of the bank never repeat.

Domains for this part (about 10 seeds per domain, no more than 12): university and exams · work and the office · jobs and interviews · shopping and online orders · travel and airports.

Every seed must contain a **natural reason** for one of these scene features of the topic (`hooks`): `counting things` | `uncountable stuff` | `belonging` | `a recipe or shopping list` | `a description of a place` | `a rule or instruction` | `a complaint about quantity` | `a unique or known object` | `a measure or container` | `family and people`.
Across the 50 seeds no hook may be used in more than 25% of them.

## A good seed
- Concrete: a place, people (or a role), an event, one vivid or unexpected detail. Realistic (funny is fine, nonsense is not).
- The seeds inside a domain are different: different places, ages, professions, countries, tones.
- Everyday vocabulary only (A2–B1). No jargon, no rare animals or professions. Ordinary life.
- Not a ready exercise sentence: 1–2 plain sentences, up to 30 words.
- No celebrities, politics, religion, war, deaths, injuries with details, diagnoses.
- Banned for this topic: short broken fragments like «The (teachers) meeting starts at four.»; every task about articles; mc with options that differ only in capital letters.

## Format (JSONL, one line per seed)
```
{"seed_id":"nn-0601","domain":"school life","place":"a primary school in Leeds","who":"a class of nine-year-olds","situation":"…","hooks":["a question someone asked"],"tone":"funny","register":"dialogue"}
```
- `seed_id`: `nn-06NN` (NN = 01…50)
- `hooks`: 1–2 of the list above (copy the wording exactly)
- `tone`: funny | annoying | alarming | touching | neutral | good news | bad news | ironic
- `register`: dialogue | chat | email | notice | news | instructions | report | review | story

At the end one line: `# check: seeds=50, hooks={…}, tones={…}`.
