---
name: ai-release-intake
description: Audits an AI model/feature release candidate — surfaced by Gemini Spark's 24/7 watch, or found any other way — against the ai-news niche's real rules before it gets anywhere near a script. Use when the user pastes or forwards a release finding from Gemini Spark, asks "is this worth a video", or wants a candidate release checked before production starts. Verifies every claim against a primary source (never trusts Spark's or any AI-generated summary's numbers as-is), runs validate_topic.py for the topic gate, applies honesty_guard/recency_guard, and returns GO / GO-NARROW / NO-GO with an audited one-paragraph brief ready to hand to /prompt-to-video or /make-video. Not the monitor itself — that's Gemini Spark, external to this repo, briefed via references/spark-watch-brief.md — and not script writing, which is the next skill once this returns GO.
---

# ai-release-intake — audit a Spark finding before it becomes a video

**Why this exists:** Gemini Spark (Google's 24/7 cloud agent) can watch for AI releases far more
cheaply than a Claude-side poller — it runs on Google's infrastructure, not this session's token
budget. Decision made 2026-08-04: Spark owns continuous watching; this skill owns the gate. Do
**not** stand up a duplicate Claude-side scheduled poll for the same job — that would burn tokens
re-doing what Spark already does for free, which is exactly the inefficiency the user asked to avoid.

**Spark's brief lives at** `references/spark-watch-brief.md` — that's the text to paste into Spark's
own task/automation setup. This skill is the other half: what happens when a finding comes back.

## Input

A release candidate, however it arrives: pasted email text, a forwarded Spark digest, a shared doc,
or the user just describing what they saw. Extract: company, model/feature name, the claimed delta,
and any source URLs given.

## Steps — do all of these, every time, no exceptions

1. **Read the primary source directly.** WebFetch or browse every URL given. Per CLAUDE.md's
   standing rule ("before any number goes into a script, it must come from a page actually read
   start-to-finish"), this applies to Spark's output exactly as it applies to a WebSearch summary —
   Spark is also an AI agent summarizing, and can conflate or hallucinate the same way. If no primary
   source URL was given, find the company's own announcement/model card/pricing page before
   continuing. If none exists, that's an automatic **NO-GO** — nothing gets scripted from an
   unsourced claim.

2. **Check the "major enough" bar.** Compare against `niches/ai-news.json`'s `reference_titles` and
   `script.brand_promise` — a flagship release, a major version bump, a real pricing change on a
   widely-used model, or a benchmark-topping claim from a named lab. Filter out patch notes, minor
   fine-tunes, and anything without an official source (rumors, leaks with no confirmation).

3. **Run the topic gate:**
   ```
   python tools/validate_topic.py --topic "<exact phrase, as a viewer would type it>" --niche ai-news --recent 7d
   ```
   Use the tightest freshness window (`7d`) — this niche's `recency_guard` says it can go stale in
   hours, not months. Read the verdict **and** the confidence line, not just GO/NO-GO — a thin-sample
   GO is not the same as a confident one.

4. **Apply honesty_guard.** Every number attributed to its real source out loud (not laundered into
   narrator fact), staged/rollout caveats stated plainly, no target presented as an achievement. If
   Spark's write-up blurs "announced" into "shipped," fix it here — don't carry the blur forward.

5. **Cross-check "what people are saying."** If Spark reported sentiment, treat it as a lead, not a
   fact — spot-check one or two of the actual threads/comments it cites rather than trusting its
   characterization wholesale.

6. **Return a verdict**, not just a data dump:
   - **GO** — audited one-paragraph brief (what happened, the sourced numbers, the honest gap, why it
     clears the bar) + this niche's runtime range (`script.target_minutes` [3,10], hard max 12) +
     a proposed specific length per that release's actual depth. Ask the user whether to proceed
     straight into script drafting (`/prompt-to-video` or `/make-video`).
   - **GO-NARROW** — clears the bar only on a narrower angle than Spark proposed; say which angle.
   - **NO-GO** — say exactly why (stale, unsourced, too minor, saturated, `validate_topic` verdict) so
     the user can tell Spark to keep looking, or adjust `references/spark-watch-brief.md` if the same
     false-positive pattern keeps recurring.

## What this skill is not

- Not a poller. It only runs when the user brings it a candidate.
- Not a rewrite of `validate_topic.py`'s rubric — it calls the tool, it doesn't second-guess the
  rubric inline.
- Not permission to skip the script-approval gate (CLAUDE.md Growth Rule #5) — GO means "cleared to
  draft," not "cleared to publish."
