# Packaging — money-archive-mortgage-payoff

Cold start: no channel CTR data yet (2 prior videos, no Studio data pulled). These are
uncalibrated defaults per the packaging skill — this channel's own CTR data should override
them once ~10 long-form videos have shipped.

## Ceiling
**HIGH** — validated GO (11/12) in `docs/CHANNEL-SETUP-finance.md` / `docs/research/topic-mortgage-payoff.json`,
the strongest of the 6 topics tested for this channel. Top performer 41,439 v/d, 3 small-channel
breakouts in 90 days, best 18.3x on a 2,160-sub channel.

## Promise
"$300 a month, on a real current mortgage rate, saves $155,461 in interest and pays the loan off
7.5 years early — the actual amortization math, not a rule of thumb." Concrete, quantified,
resolves in the title (not a curiosity gap) per this niche's title rules.

## Title (locked, one — per the 2026-08-04 standing single-thumbnail/title preference)
**$300 a Month Saves $155,461 in Mortgage Interest (Real Math)**

Checklist: concrete $ promise ✓ · resolves the claim, no curiosity gap ✓ · no unknown/brand names ✓
· no "secret"/hot-take framing ✓ · borrowed authority (real amortization math, real Freddie Mac
rate) over guru authority ✓ · leads with the outcome, not the mechanism ✓.

## Thumbnail (one, `--variant versus`)
Real photos both sides (Rule 1 hard gate) — a couple reviewing bills at the kitchen table (left,
the "no extra payments" scenario) vs. a piggy bank on a spread of cash (right, the "+$300/month"
scenario). Same-unit contrast ($525K vs $370K total interest), directly comparable, mirrors the
compound-interest video's proven versus template.

- Headline: "$300/MO SAVES THIS" · accent: lime (loud palette, not the muted in-video brand)
- kicker: "REAL MORTGAGE MATH" · badge: "7.5 YRS EARLY"
- value-a "$525K" / label-a "NO EXTRA PAYMENTS" · value-b "$370K" / label-b "+$300/MONTH"
- Rendered: `videos/money-archive-mortgage-payoff/packaging/thumbs/A.png` / `.jpg`
- Bug caught during generation: the first render's `--headline "$300/MO SAVES THIS"` lost the "$3"
  to bash's `$3` positional-parameter expansion inside the double-quoted string (rendered as
  "OO/MO SAVES THIS"). Fixed by escaping to `\$300`. Worth remembering for any future thumbnail
  headline that starts with a dollar amount: escape the `$`, don't rely on double quotes alone.
- Squint test at 246px: both dollar figures, "$300/MO SAVES THIS", and both pill labels stay
  legible — pass.

## Description
`videos/money-archive-mortgage-payoff/packaging/description.txt` — value hook, honesty
disclosure (general info, not advice, nothing sold), timestamps derived from the actual
card-reveal beat times in `work/beats.json` (not estimated), subscribe nudge.

## Self-check
- Promise the thumbnail/title make: $300/month saves $155,461 in interest and pays the loan off
  7.5 years early, on real amortization math. The video pays this off directly in the mechanism
  section (4:30), with the mid-roll subscribe ask placed right after the payoff reveal (8:18,
  ~43% into runtime) per the standing CTA rule — no bait.
- Honesty guard: no guaranteed-return language anywhere in title/thumbnail/description; the
  video's own honest-limits section (10:49) is signposted in the description, and the
  investing-vs-paydown tradeoff is stated plainly rather than resolved for the viewer.
- No 3-bet A/B/C test shipped — single title + single thumbnail per standing user preference.
