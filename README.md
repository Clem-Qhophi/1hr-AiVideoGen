# Framewright

**Turn prompts, links, or screen recordings into publish-ready videos. No camera, no editing software.**

An open-source AI video generation + editing platform. Write a prompt, drop a link,
or upload a screen recording — Framewright writes the script, generates the voiceover,
builds animated visuals, captures real screenshots for evidence, and bakes the final video.

## Three ways to make a video

| Mode | What you provide | What happens |
|---|---|---|
| **Generate** | A topic or prompt | AI writes the script, generates voiceover, builds animated visuals |
| **Review** | A URL (or multiple) | System fetches + screenshots the page, AI writes a review script, evidence shots + animations |
| **Tutorial** | A screen recording + description | System extracts keyframes, AI writes narration, voiceover composited over your recording |

Plus **Edit mode** — drop raw footage and the cut/visuals/voice/SFX/packaging pipeline runs.

## Quickstart

**Requirements:** Python 3.10+ · Node 18+ · `ffmpeg` + `ffprobe` on PATH.

```bash
python -m venv venv
venv/Scripts/python -m pip install -r requirements.txt     # Windows

cd remotion && npm install && npm run gen && cd ..          # build the animation registry

cp .env.example .env                                        # add your keys (optional)

# Launch the app:
start.bat                                                   # opens both servers + browser
```

Then go to `http://localhost:5173`.

## API keys (all optional — works free without them)

| Key | For | Required? |
|---|---|---|
| **ElevenLabs** | Premium TTS voiceover | No — falls back to free Edge TTS |
| **LLM provider** | AI script writing | No — falls back to template script |
| **Gemini** | Thumbnail generation | No — only for packaging |

The app supports any OpenAI-compatible LLM endpoint, including the **opencode Go plan** ($10/mo).
Configure in Settings: provider, API key, model, base URL.

**Free mode:** Edge TTS (voiceover) + template scripts = $0 per video.
**Premium mode:** ElevenLabs + LLM = ~$0.20-1 per video depending on length.

## How it works

```
Prompt/URL/Recording
        ↓
   AI writes script         (LLM — your opencode Go plan or any provider)
        ↓
   TTS voiceover            (ElevenLabs premium OR Edge TTS free)
        ↓
   Branded master video     (dark gradient background + voiceover audio)
        ↓
   Animated visual beats    (Remotion — code-based animations, not stock footage)
        ↓
   Evidence screenshots      (real page captures for factual claims)
        ↓
   Baked final video        (composited, 1080p, ready to post)
```

## What makes Framewright different

| Feature | Pictory | VideoMule | HeyGen | **Framewright** |
|---|---|---|---|---|
| Prompt to video | Stock footage | No | No | **Code-based animations** |
| URL to video | Stock footage | No | No | **Real screenshots + animations** |
| Screen recording | No | Yes | No | **Yes** |
| Custom animation engine | No | Partial | No | **Yes (Remotion)** |
| Real evidence screenshots | No | No | No | **Yes (Playwright)** |
| Free tier | No | Trial only | Trial only | **Unlimited (Edge TTS + template scripts)** |
| Open source | No | No | No | **Yes** |

## Architecture

```
web/              React frontend (dark minimal UI)
server/           FastAPI backend (API + pipeline orchestration)
tools/            Python tools (TTS, rendering, baking, analysis)
remotion/         Animation engine (code-based visual shots)
media/            Generated videos + assets
videos/           Per-video project data
EVOLUTION.md      Pipeline memory (lessons learned, updated every video)
PLAN.md           Product master plan (features, roadmap, research)
```

## License

MIT — see [LICENSE](LICENSE).
