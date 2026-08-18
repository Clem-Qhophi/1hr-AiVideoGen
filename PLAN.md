# Framewright — Product Master Plan

> ⚠️ **SUPERSEDED (2026-07-24).** This describes the **legacy template pipeline** (`server/` +
> `web/`), which fills shot templates mechanically. The project has since moved to an
> **agent-driven** architecture where the creative work is the AGENT driving `.claude/skills/`,
> orchestrated by `director/`. The current north star and staged plan live in
> **`docs/VIDEO-OS-ROADMAP.md`**; working rules are in the repo-root **`CLAUDE.md`**. Read those
> first. This file is kept for its competitor research and feature backlog, not as the live plan.

> The AI video generation + editing platform. Turn prompts, links, or screen
> recordings into publish-ready videos. No camera, no editing software.

## Research summary

### Competitor analysis

| Tool | Core feature | What they do well | What they lack |
|---|---|---|---|
| **Pictory** | Text/URL/script → video with stock footage | URL to video, blog to video, many input types, brand kits, templates | No custom animation engine, relies on stock footage, expensive ($19-99/mo) |
| **VideoMule** | Screen recording → AI script + voiceover | Screen recording analysis, zoom animations, callouts, translations, Chrome extension | No text-to-video generation, only works with screen recordings |
| **HeyGen** | AI avatars + voice cloning | Most realistic avatars, multi-language dubbing, voice clone | Expensive ($29-89/mo), avatar-focused, limited editing |
| **Synthesia** | AI avatars for corporate/training | Professional avatars, enterprise features | Very expensive ($29-89/mo), corporate-only feel |
| **InVideo AI** | Text prompt → video with stock + AI voice | Fast generation, good for social media, affordable | Generic stock footage, limited customization, no code-based visuals |
| **Fliki** | Text → video with AI voice | Simple, fast, good for social | Very basic, stock footage only, no custom animations |
| **Runway/Pika** | AI pixel generation (text-to-video) | True AI video generation (creates pixels) | Short clips only, no narration/structure, expensive, not for full videos |
| **CapCut** | AI-powered video editor | Free, powerful editing, AI features | Manual editing required, no auto-generation |

### Our competitive advantage

| Feature | Pictory | VideoMule | HeyGen | **Framewright** |
|---|---|---|---|---|
| Prompt → video (no recording) | Yes (stock) | No | No | **Yes (code-based animations)** |
| URL → video | Yes (stock) | No | No | **Yes (real screenshots + animations)** |
| Screen recording → video | No | Yes | No | **Yes** |
| AI script writing | Yes | Yes | No | **Yes (multi-provider LLM)** |
| AI voiceover | Yes | Yes | Yes | **Yes (ElevenLabs + free Edge TTS)** |
| Custom animation engine | No | Partial | No | **Yes (Remotion — code-based, infinite customization)** |
| Real screenshots for evidence | No | No | No | **Yes (Playwright browser capture)** |
| Translation | Yes | Yes | Yes (dubbing) | **Yes (LLM translation + multi-lang TTS)** |
| AI avatars | Yes | Yes | Yes | No (future) |
| Open source / self-hosted | No | No | No | **Yes** |
| Price | $19-99/mo | $19-199/mo | $29-89/mo | **Free (bring your own API keys)** |

**Key differentiator:** We use a code-based animation engine (Remotion) instead of
stock footage. Every visual is built as code — diagrams, UI mockups, browser frames,
terminal clones, text animations. This means infinite customization, no licensing
fees for stock footage, and visuals that are perfectly synced to the narration.

### YouTube video categories — what to optimize for

| Category | Video type | Framewright support | Optimization |
|---|---|---|---|
| **Science & Technology** | AI news, product reviews, tutorials | Full support | Breaking-news mode, evidence screenshots, code/terminal mockups |
| **Education** | Tutorials, explainers, courses | Full support | Calm-explainer mode, step-by-step structure, UI walkthroughs |
| **News & Politics** | AI news, current events | Full support | Breaking-news mode, multi-source evidence, urgency |
| **Howto & Style** | Tutorials, walkthroughs | Full support | Calm-explainer mode, screen recording pipeline, zoom animations |
| **People & Blogs** | Reviews, opinions, listicles | Full support | Sarcastic-review mode, comparison shots, list templates |
| **Entertainment** | Top 10s, listicles, hot takes | Full support | Views/CTR goal, bold claims, controversy |
| **Gaming** | Game reviews, news | Partial | Can do reviews/news, no gameplay footage |
| **Music** | Music videos | No | Not our target market |

## Product architecture

```
Framewright/
├── web/              React frontend (the product UI)
│   └── src/pages/    Home, Generate, Edit, Library, Settings, Translate
├── server/           FastAPI backend
│   ├── main.py       API endpoints
│   ├── orchestrator.py  Pipeline orchestration
│   ├── llm.py        Multi-provider LLM (OpenAI, Anthropic, Google, opencode Go)
│   ├── shot_templates.py  Template-based TSX shot generation
│   ├── url_fetcher.py  URL content + screenshot capture
│   ├── prompt_improver.py  Prompt enhancement
│   └── settings.py   API key management
├── tools/            Python tools (TTS, rendering, baking, analysis)
│   ├── tts.py        ElevenLabs TTS (paid)
│   ├── tts_edge.py   Edge TTS (free)
│   ├── make_master.py  Create branded master video
│   ├── bake.py       Composite shots over master
│   ├── analyze_video.py  Screen recording analysis
│   ├── capture_evidence.py  Screenshot capture
│   └── render tools  Remotion rendering scripts
├── remotion/         The animation engine (Remotion)
│   └── src/
│       ├── lib/      Reusable components (kit, browser, vscode, evidence)
│       ├── brand.ts  Brand tokens (colors, fonts, motion)
│       └── shots/    Generated shot files
├── media/            Generated videos + assets
├── videos/           Per-video project data
├── EVOLUTION.md      The pipeline's memory (lessons learned)
└── start.bat         One-click launcher
```

## Video generation modes

### 1. Prompt → Video
User types a topic → AI writes script → TTS voiceover → animated visuals → baked video
- Delivery modes: breaking-news, calm-explainer, sarcastic-review, authoritative
- Goals: followers, watch-time, authority, views
- Prompt enhancement: AI improves the prompt before generation

### 2. URL → Video (Review/Walkthrough)
User pastes URL(s) → system fetches content + screenshots → AI writes review script → evidence shots + animations → baked video
- Single URL: product review, website walkthrough, article summary
- Multiple URLs: comparison, roundup, "top 5" list

### 3. Screen Recording → Video (Tutorial)
User uploads screen recording + description → system extracts keyframes → AI writes narration → TTS voiceover composited over original video
- Zoom & focus animations
- Callouts & on-screen text

### 4. Edit Mode (existing pipeline)
User drops raw footage → cut → visuals → voice → SFX → packaging → upload
- [ ] Zoom & focus animation shot template
- [ ] Callout & annotation shot template
- [ ] Auto-caption generation (word-level subtitles)
- [ ] YouTube upload integration (from packaging)
- [ ] Thumbnail generation (Gemini API)
- [ ] Video preview editor (trim, reorder shots)
- [ ] Multi-URL comparison videos
- [ ] Voice preview (sample before generating)

## Features roadmap

### Phase 1 (DONE)
- [x] Prompt → video generation
- [x] ElevenLabs TTS + free Edge TTS fallback
- [x] Branded master video creation
- [x] Template-based shot generation (hook, statement, evidence, list, outro)
- [x] URL fetching + screenshot capture
- [x] Screen recording upload + analysis
- [x] Prompt improvement
- [x] Translation endpoint
- [x] Web app (dark minimal UI)
- [x] Settings page (API key management)
- [x] Multi-provider LLM (OpenAI, Anthropic, Google, opencode Go)
- [x] EVOLUTION.md memory file
- [x] Render retry logic
- [x] Delivery modes + goal-aware generation

### Phase 2 (NEXT)
- [ ] Rebrand: remove all original owner references
- [ ] Zoom & focus animation shot template
- [ ] Callout & annotation shot template
- [ ] Auto-caption generation (word-level subtitles)
- [ ] YouTube upload integration (from packaging)
- [ ] Thumbnail generation (Gemini API)
- [ ] Video preview editor (trim, reorder shots)
- [ ] Multi-URL comparison videos
- [ ] Voice preview (sample before generating)

### Phase 3 (FUTURE)
- [ ] AI avatar integration (HeyGen/D-ID API)
- [ ] Chrome extension for screen recording
- [ ] Timeline editor UI
- [ ] Team collaboration
- [ ] SaaS mode (subscriptions, user accounts)
- [ ] API for third-party integration
- [ ] Music bed generation
- [ ] SFX library + auto-placement

## TTS strategy

| Provider | Quality | Cost | When to use |
|---|---|---|---|
| ElevenLabs | Premium | $5-22/mo | When quality matters most, custom voices |
| Edge TTS | Good | FREE | Default, unlimited generation, no API key |
| Google TTS | Good | Pay-per-use | Fallback if Edge TTS is down |

**Default: Edge TTS (free).** The app automatically falls back to Edge TTS when
ElevenLabs is out of credits or not configured. This means users can generate
unlimited videos for $0 beyond their LLM cost.

## LLM strategy

| Provider | Models | Cost | When to use |
|---|---|---|---|
| opencode Go | GLM-5.2, Kimi K3, DeepSeek V4 | $10/mo | Default (best value) |
| OpenAI | GPT-4o, GPT-4o-mini | Pay-per-use | Best quality |
| Anthropic | Claude Sonnet/Opus | Pay-per-use | Best narrative writing |
| Google | Gemini 2.0 Flash | Pay-per-use | Fast, cheap, good quality |

**Default: opencode Go plan ($10/mo).** The app supports any OpenAI-compatible
endpoint, so the Go plan works perfectly. Model: `glm-5.2` for best quality,
`deepseek-v4-flash` for speed.
