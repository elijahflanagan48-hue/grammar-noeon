# Stage 0. Catalogue of scenario seeds

> Paste after `00-master.md`. Run **5 times** in the same chat, changing only the `PART` line (1…5). The result of each run goes into the file `content/passive-bank/v7/seeds/seeds-PART.jsonl`.

---

PART = 1   ← change to 2, 3, 4, 5

Before writing the exercises, we are building a catalogue of **scenario seeds**: short, concrete situations from life. Each future task will be built on its own seed, so that the storylines of the bank never repeat. The quality of the whole bank depends on this stage.

Write **200 seeds** for the domains of this part (40 for each of the 5 domains):

| PART | Domains |
|---|---|
| 1 | weather and natural phenomena · animals and pets · food and restaurants · cooking and recipes · school life |
| 2 | university and exams · work and the office · jobs, interviews, dismissals · shopping and online orders · travel and airports |
| 3 | hotels and holidays · transport and roads · sport and competitions · music and concerts · film, TV and theatre (behind the scenes) |
| 4 | museums, art and auctions · science and discoveries · medicine and clinics (no diagnoses) · technology, apps and social media · crime and police (no violence or victims) |
| 5 | history and archaeology · family and home · friends and celebrations · city life and local news · environment, farming, space and aviation |

### What makes a good seed

- **Concrete:** there is a place, people (or a role), an event and one unexpected or vivid detail.
- **There is a natural reason for the passive or for a trap:** the doer is unknown, unimportant or obvious; or the focus is on the person affected ("I was offered…", "she was asked…"); or there is a rumour/report ("is said to…"); or a service is done by someone else ("had it fixed"); or the opposite — something happens by itself (arrived, disappeared, broke).
- **The seeds within a domain are not alike:** different places, ages, professions, countries, tones (funny, irritating, alarming, touching, neutral). 40 seeds in "animals" are not 40 lost cats: a parrot repeating a password, a stork nest on a power pole, a dog listed as a "staff member" at a library, a seal in a canal in Rotterdam, a hedgehog census in a village…
- **Banned** (see the master instruction): repair/painting/building of houses, bridges, schools, museums; "the meeting was cancelled"; "the car was stolen"; "letters are delivered"; "the cake was eaten"; "English is spoken"; and similar default storylines. Every seed must be **different from these** in its own way.
- Realistic, not absurd. Funny is fine; nonsense is not.
- No celebrities, politics, religion, war, deaths, injuries with details, or diagnoses.

### Seed format (JSONL, one line per seed)

```
{"seed_id":"S1-001","domain":"weather","place":"a campsite in the Lake District","who":"a family of four on their first camping trip","situation":"A storm in the night blew their tent into a neighbouring field; a farmer brought it back at breakfast, folded.","hooks":["agent unknown/unimportant","something happened by itself"],"tone":"funny","register":"chat"}
```

- `seed_id`: `S<PART>-NNN` (001–200);
- `situation`: 1–2 sentences in English, up to 35 words, written in plain past or present — **not** a ready exercise sentence;
- `hooks`: 1–3 of: `agent unknown/unimportant`, `focus on affected person`, `report/rumour`, `service by someone else`, `something happened by itself`, `rule/obligation`, `process/steps`, `deduction about the past`, `state vs action`, `two objects (give/offer/send)`, `phrasal/prepositional verb`;
- `tone`: funny | annoying | alarming | touching | neutral | good news | bad news | ironic;
- `register`: dialogue | chat | email | notice | news | instructions | report | history | review | process.

Across the 200 seeds the `hooks` should be balanced: no single hook in more than 25% of the seeds; `something happened by itself` and `focus on affected person` — at least 15% each.

At the end: `# check: seeds=200, per_domain=40×5, hooks={...}, tones={...}`.
