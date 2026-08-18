# AGENTS.md — Master YouTube Production & Publishing Protocols

> [!CRITICAL]
> **UNBREACHABLE SYSTEM RULE — ZERO TOLERANCE FOR COMPROMISE**
> Every autonomous agent, subagent, and production workflow in this codebase **MUST** strictly obey these production rules at all times across **ALL** channels.
> Never rush or shortcut video production. Even if full multi-phase Remotion compilation and rendering takes extensive compute and time, full fidelity is mandatory.

---

## 1. Mandatory Channel Verification Protocol

Before publishing, uploading, or packaging any video or short to YouTube, you **MUST** always verify which topic/niche video is being created and match it to its designated channel token:

| Topic / Niche | Target YouTube Channel | OAuth Token File |
|---|---|---|
| **AI News / LLMs / Tech Demos / Dev Tools** | **AI Enthusiast** | `.youtube/token-ai-news.json` |
| **Home Hacks / DIY / Generators / Repairs** | **The Forgotten Fix** | `.youtube/token-home-hacks.json` |
| **Extreme Comparisons / Showdowns / Ladders** | **The Comparison Arena** | `.youtube/token-comparisons.json` |
| **Finance / Markets / Macroeconomics** | **Finance Channel** | `.youtube/token-finance.json` (if present) |
| **Real Estate / Property** | **Real Estate Channel** | `.youtube/token-real-estate.json` (if present) |

### Required Action Before ANY Upload:
1. Check the `publish.json` or command line arguments to confirm `channel` and `token` explicitly point to the appropriate niche token file (`token-ai-news.json` for AI topics, `token-home-hacks.json` for DIY/Home topics, `token-comparisons.json` for comparisons).
2. Confirm the target channel identity with `whoami` and explicit pre-upload channel verification printout.
3. **NEVER** upload an AI video to a DIY/Home channel, or a DIY video to the AI channel.

---

## 2. 🎬 Mandatory Production Standards (The 4 Core Pillars)

Every video produced across **ANY** niche (AI Enthusiast, The Forgotten Fix, The Comparison Arena, etc.) must strictly execute these four pillars:

### Pillar 1: Retention & The 90%+ Engaged Views Standard (>85% Hook Saliency)
- **The Dual-Layer Metric Mindset:** While public view counts register immediately at 0s, YouTube's recommendation engine and monetization algorithms are driven by **Engaged Views (30s+)** and watch time depth.
- **Target Retention Benchmark:** We design every video to achieve **90%+ retention through the first 30 seconds**.
- **The 85%+ Hook Saliency Rule (First 90 Frames / 0s–3s):**
  - Every video hook must pass an automated or audited **Hook Saliency Score of 85%+** evaluated against 4 core vectors:
    1. **Kinetic Motion Delta (<400ms):** High visual motion shift within the first 400ms to halt scrolling.
    2. **Text Cognitive Load (<600ms):** Clean, punchy typography parsed and understood in under 600ms.
    3. **High-Stakes Curiosity Gap:** Opening narrative creates immediate unresolved tension / loss-aversion.
    4. **Focal Isolation & Planar Alignment:** High contrast subject vs background with zero crooked/tilted slop.
  - Detailed in [`.agents/rules/hook_saliency_and_retention_protocol.md`](file:///c:/Users/O%20M%20E%20N/Downloads/claude-youtube-editor-main/.agents/rules/hook_saliency_and_retention_protocol.md).
- **The First 15–20 Seconds (High-Stakes Upfront Roadmap):**
  - **NO Generic "News Dropped" or "Welcome Back" Openers:** Never start with dry, passive statements.
  - **The Value Contract:** In the first 15 seconds, present the high-stakes roadmap of everything the video will uncover (*"Before this video ends, you'll see why the benchmark numbers lie, how the architecture was secretly rebuilt, and the exact shift that makes competitor models obsolete..."*).
  - **Psychological Loss-Aversion (FOMO):** Frame each section so compellingly that skipping any chapter feels like falling behind in the frontier race.

### Pillar 2: Visuals — High-End Documentary & Motion Graphics (Fern / Vox Style)
- **Strict Planar & Symmetrical Alignment (NO Crooked / Tilted Elements):**
  - Absolutely NO tilted 3D rotated cards (`rotateX/rotateY/skew`) that produce distorted or misaligned visuals.
  - All UI mockups, scorecards, metric funnels, and HUD cards must be crisp, planar, straight, and pixel-perfect.
- **Authentic UI & Domain Snapshots in Native Shells:**
  - Never display blank colored cards, flat slides, or abstract shapes.
  - Generate or supply high-resolution authentic snapshots of the actual tools, dashboards, blog announcements, code editors, or platforms being discussed, encased in realistic browser, IDE, or app window frames.
- **Continuous Dynamic Visual Activity (Zero Static Holds):**
  - Remotion shots MUST match the exact full duration of their audio beats (e.g. 50s–65s / 1,500–1,950 frames).
  - NEVER stretch a 5-second clip with `tpad=clone` to freeze on a static frame for 40–50 seconds.
  - The visual state MUST evolve every 3 to 5 seconds with 3–4 sub-phases per scene, sweeping highlight wipes, pulsing badges, live counter increments, and active metric transitions.

### Pillar 3: The "Top 1% Advantage" — Direct User Benefit & Execution Edge
- **Actionable Execution Over Passive News:** Don't just report news; bridge the gap to what the viewer can actually DO with this model, tool, or fix.
- **The "What 99% Won't Do" Promise:** Every video must explicitly answer: *"How does this benefit YOU right now, and what can you build, fix, or automate with this that 99% of practitioners are sleeping on?"*
- **Live Practical Use Cases:** Break down concrete, practical workflows (e.g., multi-agent tool loops, local sandbox setups, prompt caching optimizations, IDE integrations in Cursor/Copilot) that place the viewer into the **top 1% of practitioners**.

### Pillar 4: Engineering, Compilation & Zero-Tolerance QA
1. **Component & Icon Verification:** Always verify that every imported icon from `lucide-react` is a valid exported component (e.g., `Play`, `Video`, `CheckCircle2`, `Terminal`; `Youtube` is undefined and must NOT be imported).
2. **Native 1080p Scale:** Always render Remotion compositions at `--scale=1` for sharp 1920x1080 output.
3. **Exact Audio-Visual Locking:** Assemble video scenes to match the master audio track down to the exact millisecond with zero audio-visual drift.
4. **Pre-Upload Channel QA:** Confirm channel authentication before initiating any upload.

---

## 3. 🎙️ Master Voice Model Routing by Channel

To maintain distinctive brand authority and match the psychological archetype of each channel, every video MUST use its designated voice profile:

| YouTube Channel | Designated Voice Model | Pitch / Rate Settings | Timbre & Tone Profile |
|---|---|---|---|
| **AI Enthusiast** | `en-US-AndrewMultilingualNeural` | `rate=+11%, pitch=-1Hz` | Modern, highly articulate, intelligent Silicon Valley tech lead / AI engineer. |
| **The Forgotten Fix** | `en-US-BrianMultilingualNeural` / `en-US-EricNeural` | `rate=+0%, pitch=-2Hz` | Warm, gritty, deep authoritative workshop mentor. |
| **The Comparison Arena** | `en-US-ChristopherNeural` | `rate=+8%, pitch=+0Hz` | High-energy, commanding, fast-paced sports/tech commentator. |

### Mandatory Audio Mastering Chain:
- **Highpass Filter:** `f=80Hz` to eliminate mic boom / low rumble.
- **Presence EQ Boost:** `f=3200Hz, g=2.5dB, w=1.2` for vocal clarity and high-end air.
- **Dynamic Compand:** Broadcast multiband compression (`attacks=0.05:decays=0.2`).
- **Music Bed:** Background music ducked to `-24dB` (`volume=0.06`) under speech.

