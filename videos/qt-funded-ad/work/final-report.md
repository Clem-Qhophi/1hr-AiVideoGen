# QT Funded ad — final report

Client: Quant Tekel. Campaign: QT Funded (simulated prop-evaluation product). Session date: 2026-08-08/09.
This report closes out the audit-and-rebuild engagement described in `v1-audit-report.md` and `claims-register.md`.

---

## 1. Existing-video audit (v1)

Full detail in [`v1-audit-report.md`](v1-audit-report.md). Summary: v1 (`videos/qt-funded-ad/`) was a
technically rigorous build — ASR-aligned VO, calibrated SFX, two-pass loudnorm mastering, a full
9:16/16:9/1:1 × captioned/clean deliverable matrix, `check_deliverable.py` 17/17 PASS — with a script
that genuinely contained zero performance claims. **The defect was invisible to every automated
check**: seven shot files across seven beats (opening, closing, and five in between) used full,
uncropped screenshots of the live QT Funded marketing site as backgrounds. Those pages carry exactly
the claims the project's own approval document lists as excluded pending approval — "up to 90% profit
share," "$300K simulated," "55% off + free account, code QT," "7% — the lowest profit targets in the
industry" (a banned competitor comparison), a live Trustpilot review wall with real customer names,
and "trusted by 120,000 traders / $16M+ paid out" with real payout certificates. All of it was
legible on screen, dimmed but not hidden, in the master file already marked "ready for client review."

## 2. Research summary

Verified directly against the live site (screenshots + a direct page read, not a search-engine
summary) on 2026-08-08: current programs (QT 2 Step, QT 2 Step Elite, QT Instant, QT 1 Step, QT
Power), platforms (MetaTrader 5, cTrader, TradeLocker), account sizes $2.5K–$200K, QT Instant's real
drawdown/profit-split figures (3%/6%/80%), the 55%-off promo code, the "trusted by 120,000 traders /
$16M+ paid out / 110+ countries" stat block, and the restricted-country list already on file from v1.
Full claim-by-claim table with sources and approval status: [`claims-register.md`](claims-register.md).

## 3. Version-two creative rationale

v1's "every trader has a plan → consistency → structured evaluation → discipline → simulated funded
account → CTA" arc already matches the brief's own recommended "Consistency Is the Edge" concept —
rebuilding a different narrative from scratch would have been redundant work, not improvement. v2
extends that same approved backbone to 56s (from a stated 45s–90s brief) rather than replacing it,
adding three beats that go deeper on what "structured evaluation" and "discipline" actually mean day
to day (risk management, position sizing, session-by-session progress) without adding a single
performance number. The 30s length was dropped as a **new** creative track for the same reason: v1's
existing approved 30s script needed the same evidence-image fix, not a rewrite, so that became
`qt-funded-ad-v1fix` instead of a second from-scratch script.

## 4. Script

- 56s hero (v2): [`script-v2-60s.md`](script-v2-60s.md) — 138 words, includes the beat map.
- 30s (v1fix): unchanged from v1's Gate-A-approved [`script.md`](script.md) — same words, same VO,
  same timing. Only the on-screen evidence changed.

## 5. Shot list

- **v2 (56s, 9:16 primary):** `remotion/src/shots/qt-funded-ad-v2/` — QTHookV2, QTPathV2,
  QTDisciplineV2, QTRiskV2, QTConsistencyV2, QTPlatformsV2, QTEndCardV2 (+ EmphasisCaptions overlay).
- **v2 16:9 adaptation:** `remotion/src/shots/qt-funded-ad-v2-169/` — same 7 beats, row/split layout.
- **v2 1:1 adaptation:** `remotion/src/shots/qt-funded-ad-v2-11/` — same 7 beats, compact stack.
- **v1fix (30s, 9:16):** `remotion/src/shots/qt-funded-ad-v1fix/` — QTHookFix, QTConsistencyFix,
  QTStructureFix, QTChooseFix, QTDisciplineFix, QTProgressFix, QTEndCardFix, plus v1's own
  `QTDiscover` reused unmodified (it was already safe — logo + text only, no screenshot).

Evidence used across all four v2/v1fix builds: exactly two claims-clean real screenshots —
`media/projects/qt-funded-ad/evidence/clean/mobile-dropdowns.png` (program/platform/currency/size
selector UI) and `.../clean/mobile-platforms.png` (TradeLocker/cTrader/MetaTrader5 logo row) — both
freshly captured at a mobile viewport on 2026-08-08 specifically because they read cleanly in a
vertical frame, unlike the desktop captures v1 used.

## 6. Claims register

[`claims-register.md`](claims-register.md) — every claim considered, source, approval status. Zero
unapproved claims appear anywhere (VO, on-screen text, or screenshot pixels) in any v2 or v1fix output.

## 7. Files changed / created

**New projects (v1 untouched):**
- `videos/qt-funded-ad-v1fix/` — fixed 30s cutdown
- `videos/qt-funded-ad-v2/`, `-v2-169/`, `-v2-11/` — new 56s hero + adaptations

**New Remotion shots:** `remotion/src/shots/qt-funded-ad-v1fix/`, `-v2/`, `-v2-169/`, `-v2-11/`
(28 shot files + 4 caption overlays)

**New evidence assets:** `media/projects/qt-funded-ad/evidence/clean/*.png` (6 cropped/re-captured
images), `mobile-evaluations.png` (source capture), `manifest.json` updated with full provenance.

**System fixes (reusable, not one-off):**
- `tools/capture_evidence.py` — added `--crop x,y,w,h` (crop at capture time, with provenance)
- `tools/gen_captions_emphasis.py` — default `--id` is now `EmphasisCaptions-<project>` instead of
  the bare `EmphasisCaptions`, and the JS export name is sanitized separately from the composition-id
  string (hyphens broke the build under the old scheme). Root cause: this generic id collided across
  projects, and the registry generator was silently dropping the loser — see incident below.
- `tools/check_deliverable.py` — now prints a mandatory manual-check reminder (pointing at
  `claims-register.md`) whenever a project has one, since no automated check can read text baked into
  a screenshot's pixels.
- `remotion/src/lib/evidence.tsx` — added a compliance warning to `EvidenceBackdrop`'s doc comment.
- Flagged (not fixed, out of scope for this session): repo-wide composition-ID collisions on
  `CloseCTA` (3-way), `Hook`, `StatCard` — spawned as a separate background task, since started by you.

## 8. Tests run

- `check_deliverable.py` on all 5 masters: **17/17 PASS** each (v2, v2-clean n/a for captions check,
  v2-169, v2-11, v1fix).
- Manual frame-by-frame visual audit against `claims-register.md` on every build — twice on v2, after
  a caption cross-contamination bug was caught and fixed (see incident below).
- Independent loudness re-measurement (not just trusting the tool's own printout) on the v1 audit.

## 9. Render commands (for reproducing/extending)

```
python tools/tts_edge.py videos/qt-funded-ad-v2 --text-file videos/qt-funded-ad-v2/work/script.md --voice en-US-ChristopherNeural --speed 1.08
python tools/align_asr.py videos/qt-funded-ad-v2
cd remotion && node scripts/gen-registry.mjs && node scripts/render-all.mjs --scale=1 <ShotIds...>
python tools/bake.py videos/qt-funded-ad-v2/work/timeline.json
python tools/mix_sfx.py videos/qt-funded-ad-v2/work/sfx-plan.json
python tools/mix_music.py --bed tech-pulse --base <sfx.mp4> --out <sfx-tech-pulse.mp4> --bed-gain -6.0 --end 56
python tools/final_mix.py <sfx-tech-pulse.mp4>   # run twice, see EVOLUTION.md
python tools/check_deliverable.py videos/qt-funded-ad-v2 --file <master.mp4>
```

## 10. Technical validation results

| Build | Aspect | Duration | LUFS | True peak | Gate |
|---|---|---|---|---|---|
| v2 master | 1080×1920 | 56.0s | -14.30 | -1.29 dBTP | 17/17 PASS |
| v2 clean | 1080×1920 | 56.0s | -14.30 | -1.29 dBTP | (no-caption variant, mechanics verified) |
| v2 16:9 | 1920×1080 | 56.0s | -14.30 | -1.29 dBTP | 16/16 PASS |
| v2 1:1 | 1080×1080 | 56.0s | -14.30 | -1.29 dBTP | 16/16 PASS |
| v1fix master | 1080×1920 | 30.0s | -14.02 | -0.96 dBTP | 17/17 PASS |

## 11. A caught-and-fixed incident, disclosed for transparency

Mid-build, the v2 caption overlay was silently swapped for a **different, unrelated AI-news video's**
captions by a composition-ID collision in the shared Remotion registry (two projects both used the
generic id `EmphasisCaptions`; the registry generator kept one and dropped the other with only a
console warning, no build failure). This produced a technically valid but content-wrong 45-minute
render before a manual frame check caught it. Root cause fixed in `tools/gen_captions_emphasis.py`
(project-scoped ids by default); all affected renders were redone and re-verified. Two more real bugs
were caught the same way, post-caption-bake: a text overflow on "SIMULATED FUNDED ACCOUNT" and the
evidence frames overlapping the caption safe-zone — both only visible once the caption overlay is
composited, which is why the fix pattern (pin evidence well above the bottom ~450px on 9:16, ~180px
on 16:9/1:1) was applied pre-emptively to every later shot, including v1fix's.

## 12. Differences: v1 vs v2

| | v1 (original) | v2 (new) |
|---|---|---|
| Runtime | 30s / 15s | 56s (target 45–90s) |
| Script | 8 beats | 7 beats, extends v1's backbone with risk/consistency depth |
| Evidence images | 6 raw marketing screenshots, unapproved claims visible | 2 claims-clean mobile crops, zero unapproved claims |
| Formats | 9:16/16:9/1:1 × captioned/clean | Same matrix, rebuilt clean |
| Claims register | Did not exist until this audit | Formal register maintained, zero violations |

v1fix is the same script/VO/timing as v1's original 30s, with only the evidence images fixed —
the fastest path to something safe to actually send the client at the original length.

## 13. Remaining risks

- **The 90%-vs-80%-profit-share inconsistency is still unresolved** (claims-register.md row 5) —
  neither version uses this number, but it should be flagged to Quant Tekel regardless.
- **Promo codes expire.** Nothing in any deliverable references "55% off / code QT," by design — good
  for evergreen use, but confirm current offer language before any future version that does.
- **Repo-wide ID collisions** beyond the one that hit this project (CloseCTA, Hook, StatCard in other
  projects) are flagged but not fixed — a separate background task is running against them now.
- **v1's own files were never touched**, including its own (also currently collision-shadowed)
  `EmphasisCaptions` overlay — if v1 is ever re-rendered, regenerate its captions with the fixed tool
  first, or it will silently pick up someone else's captions the same way v2 briefly did.

## 14. Items requiring client approval before paid media

Everything in `claims-register.md`'s "Not approved" column — none of it appears in any deliverable,
but per the brief's own intake rule, get these in writing before scaling spend: target/restricted
countries for paid, current Trustpilot profile, payout-certificate/testimonial permission, and any
specific number (profit share, drawdown, account sizes) for a possible future proof beat.

## 15. Exact preview files for human review

| File | What it is |
|---|---|
| `videos/qt-funded-ad-v2/output/qt-funded-ad-v2-master.mp4` | **Primary deliverable** — 56s 9:16 hero, captioned |
| `videos/qt-funded-ad-v2/output/qt-funded-ad-v2-clean.mp4` | Same cut, no captions (organic/retargeting) |
| `videos/qt-funded-ad-v2-169/output/qt-funded-ad-v2-169-master.mp4` | 16:9 adaptation |
| `videos/qt-funded-ad-v2-11/output/qt-funded-ad-v2-11-master.mp4` | 1:1 adaptation |
| `videos/qt-funded-ad-v1fix/output/qt-funded-ad-v1fix-master.mp4` | Fixed 30s cutdown (v1's original script/VO) |
| `videos/qt-funded-ad/output/qt-funded-ad-master.mp4` | v1 original, **preserved unmodified** for comparison |

Do not publish or send to the client without your own final watch-through — this report and the
frame-by-frame checks behind it are thorough, but a fresh human eye on the actual finished file is
the last gate, same as it would be for any agency deliverable.
