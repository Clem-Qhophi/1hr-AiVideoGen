# Anti-Slop Quality Watchdog & Auto-Remediation Standard

## 1. Core Principle
Never deliver or present an initial video cut blindly without performing an **autonomous self-reflection & defect remediation loop**. The goal is zero human-noticeable slop, zero blank spaces, zero visual fatigue, broadcast-calibrated audio, 100% subtitle sync, and >= 90/100 viral packaging.

## 2. Automated Multi-Vector Quality Checks
Every generated deliverable must pass `python tools/auto_qa_remedy.py videos/<slug>`:

1. **Visual Density & Diversity**:
   - **No Static Holds**: Max consecutive beats with the same asset $\le 2$ (no static screen $> 6\text{s}$).
   - **Asset Richness**: Minimum $\ge 8\text{–}10$ unique visual assets across the video.
   - **Zero Generic Blank Frames**: Generic background templates restricted to $\le 15\%$ total runtime.
   - **Evidence Grounding**: Real screenshots, dark-mode syntax editor stills, and benchmark spec cards must match narration context.
2. **Audio Calibration**:
   - **Integrated Loudness**: $-14.0 \pm 1.0\text{ LUFS}$ (YouTube standard).
   - **True Peak**: $\le -1.0\text{ dBTP}$ ceiling (zero digital clipping).
   - **Sound Effects**: Auditable SFX risers/whooshes at transitions and ducked background music bed.
3. **Caption Continuity**:
   - Word-level ASS subtitles running from opening hook ($0\text{s}$) to tail ($100\%$ voice coverage).
4. **Viral Packaging Standard**:
   - 1M-view brainstormer with strict $\ge 90/100$ probability score gate.

## 3. Batch Remediation Policy (All-At-Once Healing)
**CRITICAL EFFICIENCY RULE**: Defects must NEVER be fixed piecemeal (e.g., fixing one issue, re-rendering, finding another issue, re-rendering again). This wastes CPU, time, and disk storage.

1. **Complete Diagnostic Sweep**: The system must run a complete scan across ALL 5 vectors (Visuals, Audio, Captions, Packaging, Assets) to aggregate every existing defect into one diagnostic manifest.
2. **Consolidated Remediation Plan**:
   - Step 1: Pre-render fixes in parallel (synthesize all missing assets + plan beats + generate ASS captions + brainstorm 90+ packaging).
   - Step 2: **SINGLE Consolidated Video Render Pass** (`tools/build_longform.py`).
   - Step 3: **SINGLE Audio Remastering Pass** (`tools/final_mix.py`).
3. **Follow-Up Sweep**: Re-scan the master video to verify that 100% of issues are resolved in that single pass.

*Never stop until 0 defects remain.*
