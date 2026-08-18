# Rule: Visual Density & Delivery Quality Gate

## Visual Pacing & Diversity Standards
1. **Zero Blank Spaces**:
   - Every 2.5–3.5s beat must have a rich, context-matching visual asset.
   - Run `python tools/visual_director.py plan videos/<slug>`.
2. **Anti-Fatigue Limits**:
   - `max_consecutive_same_asset <= 2` beats (no asset stays static > 6s).
   - `unique_visual_assets >= 10` distinct assets per video.
   - Generic background gradients (`rm-bg-*.png`) restricted to `<= 15%`.
3. **Delivery Gate**:
   - `python tools/check_deliverable.py videos/<slug> --file videos/<slug>/output/<slug>-MASTER.mp4`
   - Must pass all 18 checks with `[PASS] SHIPPABLE` before finalizing.
