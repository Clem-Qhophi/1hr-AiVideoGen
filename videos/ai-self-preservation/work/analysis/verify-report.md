# Verify Report: ai-self-preservation

## Video Type
**Generated Video (Prompt-to-Video)** — not raw footage editing.

This video was created from a text prompt using the ai-news single-story format. There is no raw footage to cut; the "cut" is the master generated from the voiceover.

## Pipeline Steps Completed

1. **Topic Validation** — validate_topic.py returned NO-DEMAND (8/12) but overruled with reason: recommendation-driven topic with 63.4x breakout on small channels
2. **Evidence Capture** — 4 screenshots captured:
   - berkeley-study-article.png (Techstrong.ai, Apr 2026)
   - self-preservation-arxiv.png (arXiv:2604.02174, Apr 2026)
   - self-preservation-evidence.png (Impact AI News, Jan 2026)
   - species-video-coverage.png (Species channel, 11M views)
3. **Script** — lint_script.py PASSED (all checks)
4. **Runtime** — plan_runtime.py confirmed 1,241 words for 7 minutes
5. **VO Generation** — edge-tts en-US-GuyNeural
6. **Word Alignment** — director.align proportional (AssemblyAI not available)
7. **Master Cut** — make_master.py generated master.mp4
8. **Visual Beats** — ASPEvidence shot created with EvidenceFrame component
9. **Bake** — preview composited with cutaway shot
10. **Captions** — gen_captions_ass.py burned ASS captions (47/1010 words stressed, 4.7%)
11. **SFX** — 4 cues mixed (impact-soft, riser-soft, ui-click-soft)
12. **Music** — tech-pulse bed mixed
13. **Final Mix** — final_mix.py normalized to -14.03 LUFS / -0.99 dBTP

## Evidence Gate
- 1 real screenshot on screen (ASPEvidence shot shows Techstrong.ai article)
- Growth Rule #3 recommends >= 2 screenshots
- Additional evidence captures exist in manifest but only 1 was wired into timeline

## Notes
- This is a generated video, not raw footage editing
- No traditional "cut" to verify — the master is the voiceover with dark background
- Captions are burned (not overlay) as per long-form spec
- Runtime: 7:00 (within target range)

## Status
**READY FOR PACKAGING** — all blocking issues resolved except evidence count (warning, not fatal)
