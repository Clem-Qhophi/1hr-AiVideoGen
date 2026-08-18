# QT Funded ad — Claims register

Every factual claim considered for this campaign, its source, and its approval status. Nothing in
this table may appear in a shipped video (in VO, on-screen text, OR baked into a screenshot used as
a background) without moving to "Approved" in writing from Quant Tekel.

Sources marked ✅ Verified-2026-08-08 were confirmed by direct inspection of the live site (either a
`capture_evidence.py` screenshot with recorded URL/selector/timestamp, or a direct page read) on the
date shown — not from an AI search summary.

## Verified from official sources (qtfunded.quanttekel.com, 2026-08-08)

| # | Exact wording / figure | Source | Program | Countries | Where it could appear | Approval status |
|---|---|---|---|---|---|---|
| 1 | "Trusted by 120,000 traders" | Homepage hero stat block (`section.cert-trusted`, `trust.png`) | All / brand-wide | Global | Not used in script; **appears legibly in the `trust.png` background of the QTConsistency beat in v1** | ❌ Not approved — pending Q9 in client-approval-package |
| 2 | "$16M+ paid out to traders" | Same block | All | Global | Same as above — visible in v1 background | ❌ Not approved |
| 3 | "110+ countries served" | Same block | All | Global | Same as above — visible in v1 background | ❌ Not approved |
| 4 | Real payout certificates (named individuals + $ amounts, e.g. "Dhanesh P. — $1,075.20") | Same block | All | Global | Not scripted; **appears legibly, real names included, in `trust.png` background** | ❌ Not approved — client-approval-package Q9 explicitly excludes payout certificates |
| 5 | "Up to 90% profit share" | Homepage hero marquee (`hero.png`) | Unclear which program — see note | Global | **Legible in `hero.png` background, used in QTHook + QTEndCard (opening AND closing) across all formats** | ❌ Not approved. **Also unreconciled**: QT Instant's own pricing table (below) shows 80% profit split, not 90% — needs Quant Tekel to confirm which program (if any) actually pays 90% before this number goes anywhere, even a background. |
| 6 | "Trade up to $300K simulated" | Homepage hero marquee (`hero.png`) | Unclear which program | Global | Legible in `hero.png` background, same beats as #5 | ❌ Not approved |
| 7 | "Get 55% off + free account half the size with code QT" | Homepage hero marquee AND repeated on every card of the QT Instant pricing table (`programs.png`) | QT Instant (confirmed repeated on $2.5K–$100K tiers) | Global | Legible in `hero.png` (opening/closing) and `programs.png` (Progress beat) backgrounds | ❌ Not approved — client-approval-package Q4 excludes discount codes; also promo codes expire, so a "current" claim risks going stale in the ad |
| 8 | "7% — the lowest profit targets in the industry" | Homepage features section (`features.png`) | Framed as company-wide | N/A | Legible in `features.png` background, used in QTStructure beat, all formats | ❌ Not approved — explicit comparison-vs-competitors claim, banned outright by client-approval-package §4 |
| 9 | "Excellent, 3.9 out of 5 based on 13,012 reviews · Trustpilot" | Homepage testimonials section (`testimonials.png`) | N/A | N/A | Legible in `testimonials.png` background, used in QTDiscipline beat, all formats, with real reviewer names/text | ❌ Not approved — client-approval-package Q7 ("which Trustpilot profile is current?") is still an OPEN question the client hasn't answered, yet a specific profile/rating/count is already baked into the shipped master |
| 10 | QT 2 Step / $25K: Step 1 target 7%, Step 2 target 5%, daily drawdown 4%, max drawdown 10%, price $51 (was $114) | `qtfunded.quanttekel.com/evaluations`, direct screenshot (`evaluations.png`) | QT 2 Step | N/A | Not currently in video | Not requested for v1/v2 script; record for a possible future proof beat, needs written OK |
| 11 | QT Instant (pay-when-funded), all sizes $2.5K–$100K: daily drawdown 3%, max drawdown 6%, payouts every 14 days, profit split 80%, prices $18–$292 | `qtfunded.quanttekel.com`, direct screenshot (`programs.png`) | QT Instant | N/A | Legible in `programs.png` background (Progress beat) | ❌ Not approved — numbers are real but unvetted for ad use, and directly contradicts the "up to 90%" marquee claim (#5) |
| 12 | Programs: QT 2 Step, QT 2 Step Elite, QT Instant, QT 1 Step (pay-when-funded), QT Power | Site nav / program selector, cross-checked against client-approval-package §6 | All | N/A | Named in script only as "structured evaluation," no program names spoken | Neutral — describing that programs exist, without numbers, is low-risk and already how v1's script handles it |
| 13 | Platforms: MetaTrader 5, cTrader, TradeLocker | `evaluations.png` footer + client-approval-package §6 | All | N/A (US: MT5/cTrader unavailable, TradeLocker available per client note) | Not in video | Not used |
| 14 | Landing URL `https://qtfunded.quanttekel.com/evaluations/` | Client-confirmed (client-approval-package §3, item 3 marked approved) | All | N/A | End card CTA | ✅ Approved |
| 15 | "Simulated funded account, subject to the program rules" wording | Client-confirmed (client-approval-package, Gate A) | All | N/A | VO + on-screen, end card | ✅ Approved |

## Self-reported by Quant Tekel (marketing copy, not independently auditable)

These are the site's own claims about itself — recorded here because they are exactly the kind of
copy that reads as a "fact" on screen even though nobody outside the company has verified it:
"Performance Promise — receive up to 10% of your profits or a full refund on your first 3 breaches"
(features.png). Self-reported, not third-party-verified. Not approved for use.

## Reported by third parties / unverified / not checked this session

- Any propfirmscompare.com or similar third-party pricing/ranking data — explicitly excluded per
  client-approval-package §4, not independently checked here either. Do not use.
- Restricted/target countries beyond what client-approval-package §6 already lists (Cyprus, Iran,
  North Korea, Sudan, Syria, Russia + FAQ list of Iraq, Myanmar, Belarus, South Korea, Pakistan,
  Egypt) — that list came from the client's own FAQ read on 2026-08-08; not re-verified this session
  page-by-page. Treat as current pending a fresh FAQ check before media buying.

## Not safe to use in advertising without written approval

Everything in the "Verified from official sources" table above is unapproved by default. In
addition, per client-approval-package §4 and the brief's own compliance rules, never use:
"Most traders fail," "most firms hide the rules," "guaranteed payouts," "risk-free," "anyone can
pass," "get rich," "make money every day," or any claim implying QT Funded provides live trading
capital, that the brokerage licence covers the prop product, or that all programs share identical
payout terms.

## The core problem this register exists to catch

**The approved 30s/15s scripts (VO + foreground text) contain zero performance claims — that part
of v1 is genuinely clean.** But claim rows #1–#9 above are not in the script; they're pixels, baked
into full-page marketing screenshots (`hero.png`, `features.png`, `testimonials.png`, `trust.png`)
that were captured for "real evidence" and then used as full-bleed, only-dimmed backgrounds behind
nearly every beat, including the opening 3 seconds and the final CTA. `check_deliverable.py` has no
way to catch this — it verifies technical delivery (LUFS, caption coverage, motion count, screenshot
count ≥3), not the content of what's inside a screenshot. A human visual pass against this register,
frame by frame, is the only check that exists today. See `v1-audit-report.md` for the full finding.
