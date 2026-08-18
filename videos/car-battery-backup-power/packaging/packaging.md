# Packaging — car-battery-backup-power (The Forgotten Fix, video 1)

**Cold start note:** this channel has no CTR data yet. These are uncalibrated defaults per
`.claude/skills/packaging/SKILL.md` — start logging Studio CTR from this video and calibrate
`references/channel-calibration.md` after ~10 long-form videos.

## Ceiling + promise

- **Topic ceiling: HIGH** — broad demand (power outages hit every homeowner), validated GO (9/12)
  via `tools/validate_topic.py`, with real small-channel breakouts up to 33x on this exact angle.
- **Promise (plain):** your car can safely back up your fridge/phone/medical devices during an
  outage, for a lot less than a generator — and here are the two safety rules almost nobody tells
  you, that make the difference between helpful and dangerous.
- **Implied expectation:** viewer expects a real how-to (wattage math, wiring, safety) they can
  actually follow, not just a teaser. The video pays this off in the Method section (5:21-12:23).

## Locked title

**"The Generator You Already Own (The Safe Way To Use It During A Blackout)"**

Checklist: concrete promise (car = generator) - outcome-framed (viewer's blackout, not the
inverter's specs) - zero unknown/brand names - authenticity rider ("The Safe Way") directly answers
the skepticism this topic invites, since the dangerous backfeeding myth is common - specific nouns
(Generator, Blackout), not vague curiosity. Deliberately NO fabricated dollar figure in the title -
no capturable source confirmed a specific inverter price (3 retailers bot-blocked capture; see
work/plan.json asset_manifest note), so the honest anchor is "already own" (the car), not a number.

## Thumbnail bets (3, one fixed title, different levers)

| | Image | Headline | Emphasis | Lever | Honesty check |
|---|---|---|---|---|---|
| A | car in driveway, warm dusk | STILL RUNS | NO GENERATOR | object/curiosity-anchored | Video genuinely shows the car running as the power source - true |
| B | hands connecting jumper cables | 2 RULES | KEEP IT SAFE | number lead (a count, not a $ claim) | Video structurally delivers exactly 2 safety rules (CO + backfeed) - true |
| C | home breaker panel wiring | NEVER | DO THIS | barrier-drop/authenticity | Video explicitly warns against backfeeding the panel - true |

All 3 stay true under the fixed title and the video keeps every promise made.

**Rebuilt 2026-08-04** to match @EliasYoderAmish's real thumbnail pattern (user shared an actual
screenshot, not guessed). First attempt (small circular face bug, then a bigger circular bug) was
rejected by the user as not matching - the real pattern is Walt integrated directly into the scene,
large, no circle around him. Fixed by background-removing Walt's photo locally (`rembg`/U2Net
segmentation - not AI generation, just isolates the existing real photo from its background) and
rendering the cutout large/bottom-anchored via new `face`/`faceCutout`/`faceAt` props on
`remotion/src/lib/thumbnail.tsx`. B/C add a red circle callout on the specific danger detail (the
jumper-cable clamp, the panel wiring) — the same "look here" job his pointing hand does in the
reference, since our Walt cutout has no visible hands for a literal pointing gesture. See
`channel-persona.home-hacks.json` → `thumbnail_template` for the now-standing per-video formula and
its full iteration history. Live draft's thumbnail update via API returned 403 (channel likely not
phone-verified yet - Studio Settings -> Channel -> Feature eligibility) - set manually in Studio
until that's done.

## Description

See `description.txt` — 2-line value hook, subscribe CTA (conversion target: nothing), 7 chapter
timestamps derived from real word-timing-aligned section starts (not estimates), sources listed for
transparency, like/subscribe/comment nudge.

## Self-check

- Title: passes 6/7 checklist items (no explicit magnet word like Free/$ - deliberately omitted,
  no verified price to anchor one honestly).
- Thumbnails: 3 distinct levers, no overlapping bets, none promise a beat the video doesn't have.
- Baseline: cold start, no prediction crowned as winner - the A/B/C test decides.
