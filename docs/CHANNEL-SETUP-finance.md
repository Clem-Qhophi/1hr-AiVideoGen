# Channel setup — The Money Archive

> Working doc for the channel's naming, description, metadata, and launch research. Persona defaults
> (voice, delivery mode, target length) are in `channel-persona.finance.json` — this doc is the
> human-facing strategy behind those choices, per the multi-channel convention in
> `docs/CHANNEL-SETUP.md`. Niche mechanics (title formula, script structure, honesty_guard) live in
> `niches/finance.json` — this doc does not repeat those, it applies them to real topics.

## 1. Name & handle

- **Name:** The Money Archive
- **Handle:** `@TheMoneyArchive` (verify exact availability in YouTube's own channel handle search
  before locking it — automated search can miss brand-new channels)
- This was already the default pick in `niches/finance.json` (locked here, 2026-08-04) — the
  evergreen-reference framing matches the niche's `honesty_guard` and the finding that non-reactive
  finance content has the longest shelf life. One video has already shipped under this name and
  persona: `money-archive-401k-fee`.

## 2. Positioning (one sentence)

> Plain-English breakdowns of how your own money actually works — the fee, the mechanism, the real
> number — with no product to sell and no advice dressed up as a recommendation.

**The wedge, stated plainly:** this niche is full of two failure modes — guru-hype channels selling
a course, and dry institutional explainers nobody finishes. The Money Archive is neither: calm,
specific, sourced, and openly limited ("here's where this does NOT apply") in a niche where that
honesty is rare enough to be the differentiator itself.

## 3. Channel description (paste into Studio → Customization → Basic info, 1000-char cap)

```
The Money Archive breaks down exactly how your own money works — 401(k) fees, mortgage math, credit scores, emergency funds — with the real number, the real mechanism, and where it does NOT apply.

No hype, no guru pitch, no product to sell. Every dollar figure and rate is sourced on screen so you can check it yourself.

Built for people tired of finance content that either oversimplifies or tries to sell them something. If a claim can't be backed by a real source, we say so instead of guessing.

Covering:
— The hidden fees and mechanics inside your 401(k), mortgage, and credit score
— Myth vs. math: common money advice checked against the real numbers
— How financial products actually work, with a worked example using real figures

New videos on the mechanics of your own money. Subscribe if you want the number, not the sales pitch.
```

## 4. Keyword strategy

### Seed keywords (what the research below shows people actually search/watch)
`personal finance explained`, `401k fees explained`, `how does compound interest work`,
`compound interest explained`, `how to pay off your mortgage early`, `mortgage amortization
explained`, `emergency fund how much`, `credit score explained`, `hidden bank fees`, `money
explainer`, `financial literacy`

### Long-tail (from live autocomplete, lower competition)
`how compound interest works in a roth ira`, `how much should my emergency fund be`, `how big
should my emergency fund be`, `how to pay off your mortgage early with heloc`, `mortgage payoff vs
invest the difference`

### Tags per video (5-10, specific)
Mix the exact mechanism name (e.g. "amortization", "APY", "escrow") with the channel-level tags
`the money archive`, `personal finance explained`, `money explainer` — tags are a disambiguation
signal now, not a ranking one; title/description/transcript do the real work.

## 5. Intense research — what's actually converting in this niche right now

Methodology per `CLAUDE.md`'s INTAKE rules: `yt_research.py` for the landscape,
`yt_viral_analyze.py` for true outliers (views ÷ channel's own subscriber count, not raw views —
raw views just rewards big channels), then `validate_topic.py` per candidate for a real GO/NO-GO
verdict. Run 2026-08-04. Raw evidence: `docs/research/finance-landscape-365d-longonly.json`,
`docs/research/finance-viral-30d.json`, `docs/research/topic-*.json`.

**What the landscape actually looks like:** long-form finance explainers that got real traction run
a median ~28 min (p25 23 / p75 37) — inside this niche's `[15,25]` target but pulling toward the top
of it. 59% of high-performing titles include a number; 36% use a caps-shout word. The true breakouts
(≥2x the channel's own subscriber count) skew toward **personal-frame** ("I Built a 6-Month
Emergency Fund Without Making More Money" — 14.9x) and **plain question-hooks** ("What is Life
Insurance? Simple Explanation" — 617x, an extreme outlier off a 2,580-sub channel) over
caps-shout or superlative framing. Read: specificity and a real person's situation beat hype words
in this niche — which is good news, because it's also what `honesty_guard` already requires.

**Rejected up front so it doesn't get relitigated:** the one genuine mega-outlier in the raw data —
"Trump Just Quietly Replaced The 401k" (577K views on a 2.5M-sub channel) — is deliberately excluded
from everything below. It works by being reactive and politically-adjacent, which this channel's
evergreen positioning and `honesty_guard` rule out on purpose. That's a real tradeoff (durability
over that kind of peak), not a miss.

### Validated topics, ranked

| # | Topic | Verdict | Score | Why |
|---|---|---|---|---|
| 1 | How to pay off your mortgage early (the amortization math) | **GO** | 11/12 | Strongest of everything tested — steady (not cooling) demand, top performer 41,439 v/d, 3 small-channel breakouts in 90 days, best 18.3x on a 2,160-sub channel |
| 2 | How compound interest actually works | **GO** | 9/12 | Real demand (autocompletes at 10/31 chars), a channel our size already broke out 33.9x on nearly this exact phrase 11 days before this research ran — proof the lane is open right now |
| 3 | How much should your emergency fund actually be | **GO** | 9/12 | Broad phrasing scored GO-NARROW (too much off-topic noise); the narrower autocomplete phrase scores clean GO — use the narrow phrasing, not the broad one |
| 4 | Debt snowball vs. avalanche | GO (weak) | 9/12 | Real demand and winnability, but low ceiling (best video only 354 v/d) — treat as a future filler topic, not a launch pick |
| 5 | How tax brackets actually work | **REJECTED** | 6/12 — NO-AUDIENCE | People search it, but nothing published on it is being watched (best 73 v/d). Demand without an audience for the format — do not produce until re-validated with a different angle |

### Title drafts (topic #1-3, ready to refine at scripting time)

Per `niches/finance.json` title rules: lead with a real sourced number, resolve the claim (don't
tease it), never "secret"/"they don't want you to know", borrow real authority over guru authority.
**Every number below is a placeholder for the actual worked example** — per `CLAUDE.md`'s GROWTH
RULES §3, the real figure must come from a primary source or a verified calculation before it goes
in a script, never from this research pass alone.

1. **Mortgage payoff:** *"One Extra Payment a Year Cuts Years Off a 30-Year Mortgage — Here's the
   Actual Math"* — or, once the worked example is verified: *"The [N]-Year Mortgage Trick Your Bank
   Never Explains (Real Amortization Math)"*
2. **Compound interest:** *"Why Starting at 25 Beats Starting at 35 — Even With Less Money (The Real
   Math)"* — mirrors the `money-archive-401k-fee` format that already shipped successfully
3. **Emergency fund:** *"Why 'Six Months of Expenses' Is the Wrong Number for Most People"* —
   myth-vs-math framing, matches this channel's strongest content pillar

**Recommended launch order:** #2 (compound interest) pairs naturally as a follow-up to the shipped
401(k) video and the lane is provably open right now; #1 (mortgage payoff) is the strongest single
topic found and should follow; #3 (emergency fund) rounds out the first three with the
myth-vs-math pillar. Re-run `validate_topic.py` on the exact chosen phrasing immediately before each
script, per `CLAUDE.md` — these verdicts are dated 2026-08-04 and demand shifts.

## 6. Logo & banner (rendered, ready to upload)

Faceless channel by design (`channel-persona.finance.json`: "the channel has no face and should not
invent one") — so both assets are a graphic ledger-seal mark, not an avatar, in a muted paper/ledger
palette distinct from every other channel in this repo (not the house indigo brand, not the
`vibes.tsx` neon-green fintech preset — that preset reads as a trading app, wrong tone for a calm
explainer channel).

- **Logo / profile picture:** `remotion/src/shots/persona/MoneyArchiveSeal.tsx` → rendered to
  `remotion/out/MoneyArchiveSeal.png` (1080×1080, exceeds YouTube's recommended 800×800)
- **Banner:** `remotion/src/shots/persona/MoneyArchiveBanner.tsx` → rendered to
  `remotion/out/MoneyArchiveBanner.png` (2048×1152, YouTube's exact recommended size; text sits
  inside the 1235×338 safe zone visible on all devices)
- Re-render either after an edit: `cd remotion && npm run still -- MoneyArchiveSeal
  MoneyArchiveBanner`

## 7. Immediate next steps

1. Confirm `@TheMoneyArchive` handle is actually available, then create/update the channel; upload
   `MoneyArchiveSeal.png` as profile picture and `MoneyArchiveBanner.png` as banner.
2. Paste the description from §3 into Studio.
3. Produce the next video from the ranked list in §5 — recommend topic #2 (compound interest) as the
   next upload, following the shipped `money-archive-401k-fee`.
4. Cadence not yet decided — see `docs/IMPROVEMENT-QUEUE.md` R6 on cadence reality before
   committing to a number.
