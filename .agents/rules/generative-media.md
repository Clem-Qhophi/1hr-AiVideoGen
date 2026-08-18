# Rule: Generative Media & Veo Usage

## Strategic Placement & Judicious Quota Management
1. **Veo 3.1 & Gemini Image Budget**:
   - Limit Veo AI video generation to a maximum of **1 to 2 hero clips per video** (totaling 5–10s of runtime).
   - **Hero Spot 1**: Beat 0 (0–5s) — High-impact opening hook and visual metaphor.
   - **Hero Spot 2**: Beat Midpoint (~50% runtime) — Technical climax or abstract architecture explanation.
2. **Real Evidence Density**:
   - 80–90% of the video must use authentic evidence: real product captures, syntax-highlighted IDE code frames (`tools/visual_director.py`), and benchmark spec cards.
3. **Execution Tools**:
   - `python tools/gen_veo_clip.py --prompt "<cinematic prompt>" --out videos/<slug>/work/images/veo-hook.mp4 --aspect 16:9`
   - `python tools/gen_gemini_media.py video --prompt "<prompt>" --out videos/<slug>/work/images/veo-turn.mp4`
   - `python tools/gen_gemini_media.py image --prompt "<prompt>" --out videos/<slug>/work/images/hero.png`
4. **Fallback Handling**:
   - If quota limits or billing errors are returned, fall back cleanly to Remotion code stills, PIL-generated IDE frames, or high-contrast stat cards. Never block or crash the build.
