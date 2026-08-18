# A/B testing on YouTube — what is real, what is not

**Verified live 2026-08-02** against Google's own help page
([support.google.com/youtube/answer/16391400](https://support.google.com/youtube/answer/16391400))
plus the December 2025 rollout coverage. Re-verify before trusting this file a year from now — this
is the exact area where memorized knowledge goes stale silently, and `SKILL.md` already carried a
wrong "thumbnail-only" rule for months because nobody re-checked.

---

## 1. What YouTube actually tests natively

| Element | Natively A/B testable? | Notes |
|---|---|---|
| **Thumbnail** | **Yes** | The original feature (2023). Up to 3 variants. |
| **Title** | **Yes, since Dec 2025** | Global rollout to creators with Advanced Features. |
| **Title + thumbnail combo** | **Yes** | Up to 3 combinations. |
| **Description** | **No** | No native mechanism. See §4. |
| **Tags / chapters / end screens** | **No** | No native mechanism. |

**Up to 3 variants.** Not 4, not 10.

### How the test runs
- Variants are shown **evenly** across home, watch page, and other surfaces. A given viewer keeps
  seeing the *same* variant, so nobody sees the video flip identities.
- YouTube holds back **a small control group** that only sees the default, excluded from the maths.
- Duration: **a few days up to 2 weeks**, depending on impression volume and how recently you posted.

### How the winner is chosen — this is the part people get wrong
**The metric is WATCH TIME, not click-through rate.**

A variant that wins the click and loses the viewer **loses the test**. This has a strategic
consequence worth stating plainly: on this channel's niches, `honesty_guard` and *winning the A/B
test* point the same direction. Overclaiming in a thumbnail is not merely a trust risk — it is a
losing move on YouTube's own scoreboard, because the inflated clicks it buys are exactly the clicks
that bounce.

Results come back labelled:
- **Winner** — beat the others with statistical confidence.
- **Performed Same** — no meaningful difference.
- **Inconclusive** — not enough signal; **defaults to the first option uploaded**. So put your genuine
  best bet first, not a throwaway.

### Eligibility / restrictions
- **Desktop YouTube Studio only.** No mobile.
- **Advanced Features must be enabled** on the channel.
- **Ineligible:** Shorts, scheduled Lives, Premieres (until the premiere ends), made-for-kids,
  age-restricted (18+), and private videos.

---

## 2. Test ONE dimension at a time

Three title+thumbnail combos vary two things at once. If a combo wins, you have learned that *that
combo* won — not whether the title or the image did the work, and nothing you can carry to the next
video. With traffic split three ways, you also raise the odds of landing on *Inconclusive*.

**Default protocol for this portfolio:**

1. **Videos 1–N (packaging still unproven):** one fixed title × **3 thumbnail bets**, each pulling a
   different lever. Thumbnail is the higher-variance lever and the faster lesson.
2. **Once a channel has a repeatable thumbnail winner:** run a **title test** as its own experiment,
   holding the winning thumbnail fixed.
3. **Only with real impression volume:** combo tests, and only to confirm an interaction you already
   suspect.

Record every result in `channel-calibration.md`. Three bets that produced no recorded learning is
three bets wasted.

---

## 3. Making the test worth running

- **Three genuinely different bets, never three flavours of one.** If all three lead with the same
  number in the same layout, the test resolves *Performed Same* and you burned two weeks.
- **Put the strongest bet first** — *Inconclusive* silently defaults to it.
- **Change one variable per bet** so the lever is attributable.
- **Every bet must be payable by the video.** Since watch time decides, a bet the video does not
  honour is self-defeating. If a bet needs a beat the script does not have, either build the beat or
  drop the bet.

---

## 4. Descriptions: no native test, so be honest about it

There is **no** description A/B test on YouTube. Anything claiming otherwise is describing either a
third-party tool doing sequential swaps or wishful thinking.

**Sequential testing is the only option, and it is weak.** Ship description A, wait, swap to B,
compare. It is confounded by everything that moves between the two windows: the video's own age
curve (impressions decay steeply after launch), algorithmic promotion changes, seasonality, and any
other change you shipped. **Two sequential periods are not an A/B test and must never be reported as
one.**

**What to do instead — spend the effort where it pays:**
- Treat the description as a **fixed craft artifact**, not a test surface: first 1–2 lines carry the
  hook and the primary keyword (that is what shows above the fold and what search indexes), sources
  cited where the niche's `honesty_guard` requires it, CTA consistent with the niche.
- If you genuinely want description signal, look at **search-traffic share and impressions from
  search over time** in Studio, and treat any read as directional, never causal.
- Log the reasoning, not a fake win.

---

## 5. What this repo automates

`tools/ab_test.py` manages the variant set as data and records outcomes so results actually feed back
into packaging rules instead of evaporating:

```bash
python tools/ab_test.py new  videos/<slug> --title "..." --thumb a.png b.png c.png --lever ...
python tools/ab_test.py show videos/<slug>
python tools/ab_test.py result videos/<slug> --winner b --label winner --note "..."
python tools/ab_test.py report --niche real-estate
```

It does **not** start the test on YouTube — the YouTube Data API exposes no A/B endpoint, so starting
a test is a manual step in desktop Studio. The tool tracks *what you tested and what happened*, which
is the part that otherwise gets lost. It refuses to record a description "test" as an A/B result, for
the reason in §4.
