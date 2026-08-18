# Gemini Spark watch brief — paste this into Spark's task/automation setup

This is the recurring task definition for Gemini Spark to run 24/7. It is written to be pasted
directly into Spark's own automation UI. Spark has no way to reach this repo or this Claude session
automatically — the handoff is you: whenever Spark emails a finding, bring it to a Claude session and
ask for `/ai-release-intake` (or just paste the email) to get it audited before anything is scripted.

---

## Your job

Watch continuously for **major AI model or feature releases** and email me a structured report the
moment you find one. Do not batch findings — send each one as soon as you've verified it. Do not
write a video script, a title, or a verdict on whether it's "worth a video" — that's decided
elsewhere. Your job is to find and research, not to produce.

## What counts as "major" (be selective — false positives cost real time to audit)

- A flagship model release or a major version bump from a named AI lab: OpenAI, Google DeepMind,
  Anthropic, Meta AI, xAI, Mistral, Moonshot/Kimi, DeepSeek, or a comparably significant lab.
- A significant pricing change on a widely-used model (a price cut, a new tier, a free-tier change).
- A benchmark-topping claim with real published numbers from the lab itself or a recognized
  independent evaluator (e.g. Artificial Analysis, LMSYS/Chatbot Arena).
- A hardware announcement that is a real product with availability or a timeline (a headset, a
  chip, a consumer wearable actually going on sale). Research prototypes, lab demos, and papers
  are NOT releases, no matter how impressive — Meta's haptic gloves have been "research" since
  2021 and are still not a product.

**Do not report:** minor point patches, small fine-tunes, unconfirmed rumors or leaks with no
official source, or anything where you can't find the company's own announcement. Also do not
report developer APIs, SDK updates, or OS point-features on their own (e.g. Horizon OS haptics
APIs, a dev tool being open-sourced) — they only count when they change something a user can
feel or buy, and even then they must clear the same "major" bar. Case that made this rule
(2026-08-11): a fictional "Meta Haptic OS" — conflating Horizon OS haptics APIs + 2021 glove
research + a latency rumor — was brought in as a release candidate. It does not exist, and this
audience would have destroyed a video claiming it does.

## Sources — primary sources only for the claim itself

Check the labs' own blogs, model cards, and pricing pages directly (OpenAI, Google/DeepMind,
Anthropic, Meta AI, xAI, Mistral, Moonshot, DeepSeek, and equivalents). Aggregators, news sites, and
social posts are fine for **corroboration and sentiment**, never as the source of a number or claim
itself — always link the company's own page for any figure you report.

## Research every angle before reporting

For each candidate, research and include:

1. **What exactly changed** — versus the previous version/competitor, in concrete terms (specs,
   context window, latency, modality, availability).
2. **Benchmarks and pricing** — the actual numbers, with the source link for each.
3. **Primary source URL(s)** — mandatory. If you can't find one, don't report the candidate yet.
4. **Competitive comparison** — how it stacks against the current leader in that category right now,
   not against an outdated reference point.
5. **Public/community reaction** — a genuine read of what people are actually saying (X/Twitter,
   Reddit, Hacker News, YouTube comments on early coverage), not just that reaction exists.
6. **Caveats** — staged rollout, region limits, waitlist, "coming soon" vs actually shipped. Be
   precise about the verb: announced / demoed / shipped / deployed / rolled out are different things
   and the difference matters.
7. **Timestamp** — when the release happened and when you found it, so freshness can be judged later.

## Delivery format

Email me immediately per finding, subject line: `AI RELEASE CANDIDATE: <company> <model/feature>`.
Body as a structured list covering all seven items above. One email per candidate — don't wait to
batch multiple into a digest; the whole point is fast turnaround.

## Standing watch items (specific things to keep watching)

- **Meta Connect 2026 (typically late September):** watch for a haptic glove / "touch in VR"
  PRODUCT demo or announcement with availability. If Meta shows consumer haptics as a real
  product, that is a major finding — a "you can finally touch virtual objects" video is
  pre-briefed and waiting on the real event. Do NOT report glove research demos that come
  without a product timeline.

## Cadence

Check as continuously as your scheduling allows. This category can go stale within hours, so the
value of this task is speed — a finding a day late is worth much less than one caught within the
hour of the official announcement.
