"""Framewright API — FastAPI backend for the video generator/editor.

DEPRECATED (2026-07-24): this is the LEGACY template pipeline. It generates videos by mechanically
filling shot templates (see server/shot_templates.py + orchestrator._plan_shots_from_timestamps),
which produces the "animated text instead of the real thing" output EVOLUTION.md flags as the #1
problem. The canonical pipeline is director/ + .claude/skills/ (agent-driven, high quality). See the
repo-root CLAUDE.md and docs/VIDEO-OS-ROADMAP.md. Kept for reference; do not add new features here.

Run: venv/Scripts/python -m uvicorn server.main:app --reload --port 8000
"""
import os
import subprocess
import threading
import time
import shutil
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from . import settings
from . import orchestrator
from . import prompt_improver
from . import url_fetcher
from . import llm
from . import brand_config

ROOT = Path(__file__).resolve().parent.parent

app = FastAPI(title="Framewright API", version="1.0.0")

# CORS — allow the frontend to call us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated videos
media_dir = ROOT / "media"
videos_dir = ROOT / "videos"
if not videos_dir.exists():
    videos_dir.mkdir()
app.mount("/media", StaticFiles(directory=str(media_dir)), name="media")
app.mount("/videos", StaticFiles(directory=str(videos_dir)), name="videos")


# --- Models ---

class GenerateRequest(BaseModel):
    prompt: str
    delivery_mode: str = "breaking-news"
    goal: str = "followers"
    voice: str = ""
    duration_minutes: int = 3
    urls: list[str] = []
    improved_prompt: str | None = None


class ImprovePromptRequest(BaseModel):
    prompt: str
    delivery_mode: str = "breaking-news"
    goal: str = "followers"


class BrandUpdate(BaseModel):
    wordmark: list[str] | None = None
    accent_color: str | None = None
    accent2_color: str | None = None
    signal_color: str | None = None
    warn_color: str | None = None
    danger_color: str | None = None
    ink_color: str | None = None
    paper_color: str | None = None
    bg_style: str | None = None


class UrlFetchRequest(BaseModel):
    url: str


class SettingsUpdate(BaseModel):
    llm_provider: str | None = None
    llm_api_key: str | None = None
    llm_model: str | None = None
    llm_base_url: str | None = None
    elevenlabs_api_key: str | None = None
    gemini_api_key: str | None = None
    default_voice: str | None = None
    default_delivery_mode: str | None = None
    default_goal: str | None = None


# --- Endpoints ---

@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}


@app.get("/api/settings")
def get_settings():
    s = settings.load()
    # mask keys for security
    masked = {}
    for k, v in s.items():
        if "key" in k and v:
            masked[k] = v[:6] + "..." + v[-4:] if len(v) > 10 else "***"
        else:
            masked[k] = v
    return masked


@app.post("/api/settings")
def update_settings(req: SettingsUpdate):
    updated = settings.save(req.dict(exclude_none=True))
    return {"status": "saved", "settings": {k: (v[:6] + "..." + v[-4:] if "key" in k and v and len(v) > 10 else v) for k, v in updated.items()}}


@app.get("/api/voices")
def list_voices():
    """List available ElevenLabs voices."""
    s = settings.load()
    key = s.get("elevenlabs_api_key", "")
    if not key:
        return {"voices": [], "error": "No ElevenLabs API key set"}
    try:
        import requests
        r = requests.get("https://api.elevenlabs.io/v1/voices",
                        headers={"xi-api-key": key}, timeout=30)
        r.raise_for_status()
        voices = []
        for v in r.json().get("voices", []):
            voices.append({
                "id": v.get("voice_id", ""),
                "name": v.get("name", ""),
                "category": v.get("category", ""),
                "labels": v.get("labels", {}),
            })
        return {"voices": voices}
    except Exception as e:
        return {"voices": [], "error": str(e)}


@app.post("/api/generate")
def generate_video(req: GenerateRequest):
    """Start a video generation job."""
    s = settings.load()
    voice = req.voice or s.get("default_voice", "onwK4e9ZLuTAKqWW03F9")

    # Fetch URL content + screenshots SYNCHRONOUSLY (Playwright sync API
    # is not thread-safe — must not run inside the background pipeline thread)
    url_results = []
    if req.urls:
        import uuid as _uuid
        temp_project = f"video-{str(_uuid.uuid4())[:8]}"
        for url in req.urls:
            try:
                result = url_fetcher.fetch_url_content(url, temp_project)
                url_results.append(result)
            except Exception as e:
                print(f"  URL fetch failed for {url}: {e}")

    job_id = orchestrator.create_job(
        prompt=req.prompt,
        delivery_mode=req.delivery_mode,
        goal=req.goal,
        voice=voice,
        duration_minutes=req.duration_minutes,
        urls=req.urls,
        improved_prompt=req.improved_prompt,
        url_results=url_results,
    )

    # run pipeline in background thread
    thread = threading.Thread(target=orchestrator.run_pipeline, args=(job_id,), daemon=True)
    thread.start()

    return {"job_id": job_id, "status": "queued"}


@app.post("/api/improve-prompt")
def improve_prompt(req: ImprovePromptRequest):
    """Enhance a rough prompt into a production-ready one."""
    improved = prompt_improver.improve_prompt(req.prompt, req.delivery_mode, req.goal)
    return {"improved_prompt": improved}


@app.post("/api/fetch-url")
def fetch_url(req: UrlFetchRequest):
    """Fetch content from a URL and take a screenshot."""
    try:
        # use a temp project name for the screenshot
        result = url_fetcher.fetch_url_content(req.url, "_preview")
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {e}")


@app.get("/api/jobs")
def get_jobs():
    """List all jobs."""
    return {"jobs": orchestrator.list_jobs()}


@app.get("/api/jobs/{job_id}")
def get_job(job_id: str):
    """Get job status."""
    job = orchestrator.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.get("/api/video/{job_id}")
def get_video(job_id: str):
    """Download/stream the generated video."""
    job = orchestrator.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] != "done" or not job["video_path"]:
        raise HTTPException(status_code=400, detail="Video not ready")
    video_path = ROOT / job["video_path"]
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video file not found")
    return FileResponse(str(video_path), media_type="video/mp4")


@app.get("/api/script/{job_id}")
def get_script(job_id: str):
    """Get the generated script."""
    job = orchestrator.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"script": job.get("script", "")}


# --- Screen recording upload ---

@app.post("/api/upload-recording")
async def upload_recording(
    file: UploadFile = File(...),
    description: str = Form(...),
    delivery_mode: str = Form("calm-explainer"),
    goal: str = Form("followers"),
    voice: str = Form(""),
):
    """Upload a screen recording and start the screen-recording pipeline.
    AI analyzes the video, writes a script, generates voiceover, and composites it."""
    import uuid as _uuid

    job_id = str(_uuid.uuid4())[:8]
    project = f"video-{job_id}"
    project_dir = ROOT / "videos" / project
    work_dir = project_dir / "work"
    work_dir.mkdir(parents=True, exist_ok=True)

    # Save the uploaded recording
    recording_path = project_dir / "recording.mp4"
    with open(recording_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    s = settings.load()
    final_voice = voice or s.get("default_voice", "onwK4e9ZLuTAKqWW03F9")

    # Create the job directly (not via create_job, which generates its own id)
    import time as _time
    orchestrator.JOBS[job_id] = {
        "id": job_id,
        "project": project,
        "prompt": description,
        "original_prompt": description,
        "improved_prompt": None,
        "delivery_mode": delivery_mode,
        "goal": goal,
        "voice": final_voice,
        "duration_minutes": 3,
        "urls": [],
        "url_results": [],
        "status": "queued",
        "progress": 0,
        "step": "",
        "video_path": None,
        "script": None,
        "error": None,
        "created_at": _time.time(),
        "mode": "screen-recording",
        "recording_path": str(recording_path.relative_to(ROOT)),
        "description": description,
    }

    # Run the screen-recording pipeline in background
    thread = threading.Thread(target=orchestrator.run_screen_recording_pipeline, args=(job_id,), daemon=True)
    thread.start()

    return {"job_id": job_id, "status": "queued"}


# --- Translation ---

class TranslateRequest(BaseModel):
    script: str
    target_language: str  # e.g., "es", "fr", "de", "ja"


@app.post("/api/translate")
def translate_script(req: TranslateRequest):
    """Translate a script to another language for multi-language voiceover."""
    s = settings.load()
    provider = s.get("llm_provider", "openai")
    key = s.get("llm_api_key", "")
    model = s.get("llm_model", "gpt-4o")
    base_url = s.get("llm_base_url", "")

    if not key:
        raise HTTPException(status_code=400, detail="No LLM API key set. Go to Settings to add one.")

    import requests as req_lib
    lang_names = {
        "es": "Spanish", "fr": "French", "de": "German", "ja": "Japanese",
        "zh": "Chinese", "hi": "Hindi", "pt": "Portuguese", "ar": "Arabic",
        "ko": "Korean", "ru": "Russian", "it": "Italian", "tr": "Turkish",
    }
    lang_name = lang_names.get(req.target_language, req.target_language)

    system = f"You are a professional translator. Translate the following video script to {lang_name}. Keep the ## section headers in English. Translate only the spoken narration. Maintain the same tone and urgency."
    user_msg = f"Translate to {lang_name}:\n\n{req.script}"

    if provider == "anthropic":
        r = req_lib.post("https://api.anthropic.com/v1/messages", headers={
            "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json",
        }, json={"model": model or "claude-sonnet-4-20250514", "max_tokens": 2000,
                 "system": system, "messages": [{"role": "user", "content": user_msg}]}, timeout=60)
        r.raise_for_status()
        translated = r.json()["content"][0]["text"]
    elif provider == "google":
        model_name = model or "gemini-2.0-flash"
        r = req_lib.post(f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={key}",
                        json={"contents": [{"parts": [{"text": system + "\n\n" + user_msg}]}]}, timeout=60)
        r.raise_for_status()
        translated = r.json()["candidates"][0]["content"]["parts"][0]["text"]
    else:
        url = (base_url or "https://api.openai.com/v1").rstrip("/") + "/chat/completions"
        r = req_lib.post(url, headers={"Authorization": f"Bearer {key}"}, json={
            "model": model, "messages": [{"role": "system", "content": system},
                                          {"role": "user", "content": user_msg}],
            "temperature": 0.3, "max_tokens": 2000,
        }, timeout=60)
        r.raise_for_status()
        translated = r.json()["choices"][0]["message"]["content"]

    return {"translated_script": translated, "language": lang_name}


# --- Voice preview ---

class VoicePreviewRequest(BaseModel):
    text: str = "Hello, this is a voice preview."
    voice: str = "onwK4e9ZLuTAKqWW03F9"
    speed: float = 1.0


@app.post("/api/voice-preview")
def voice_preview(req: VoicePreviewRequest):
    """Generate a short TTS preview clip for voice selection."""
    import subprocess as sp
    import tempfile

    s = settings.load()
    elevenlabs_key = s.get("elevenlabs_api_key", "")

    # Create a temp file for the preview
    preview_dir = ROOT / "media" / "previews"
    preview_dir.mkdir(parents=True, exist_ok=True)
    preview_id = f"preview_{int(time.time())}.mp3"
    preview_path = preview_dir / preview_id

    # Try ElevenLabs first, fall back to Edge TTS
    if elevenlabs_key:
        try:
            cmd = [_venv_python(), "-c",
                   f"""import sys; sys.path.insert(0, '.'); from tools.tts import synthesize_chunk, load_key; r = synthesize_chunk('{elevenlabs_key}', '{req.voice}', '{req.text[:200]}', 'eleven_multilingual_v2', 0.5, 0.75, 0.0); import base64; open('media/previews/{preview_id}', 'wb').write(base64.b64decode(r['audio_base64']))"""]
            sp.run(cmd, cwd=str(ROOT), stdout=sp.DEVNULL, stderr=sp.DEVNULL, timeout=30)
            if preview_path.exists() and preview_path.stat().st_size > 100:
                return {"url": f"/media/previews/{preview_id}", "provider": "elevenlabs"}
        except Exception:
            pass

    # Fall back to Edge TTS (free)
    try:
        cmd = [_venv_python(), "-c",
               f"""import asyncio, edge_tts; asyncio.run(edge_tts.Communicate('{req.text[:200]}', 'en-US-GuyNeural').save('media/previews/{preview_id}'))"""]
        sp.run(cmd, cwd=str(ROOT), stdout=sp.DEVNULL, stderr=sp.DEVNULL, timeout=30)
        if preview_path.exists() and preview_path.stat().st_size > 100:
            return {"url": f"/media/previews/{preview_id}", "provider": "edge-tts"}
    except Exception:
        pass

    raise HTTPException(status_code=500, detail="Voice preview failed")


def _venv_python():
    return str(ROOT / "venv" / "Scripts" / "python.exe")


# --- Auto-captions ---

class CaptionRequest(BaseModel):
    job_id: str


@app.post("/api/captions")
def generate_captions(req: CaptionRequest):
    """Generate word-level captions for a video and add them as an overlay."""
    job = orchestrator.get_job(req.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    project = job["project"]
    try:
        _run_sub([_venv_python(), "tools/generate_captions.py", f"videos/{project}"])
        return {"status": "ok", "message": "Captions generated. Re-bake to add them to the video."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _run_sub(cmd):
    import subprocess as sp
    use_shell = os.name == "nt" and cmd[0] in ("npm", "npx")
    r = sp.run(cmd, stdout=sp.PIPE, stderr=sp.STDOUT, text=True, shell=use_shell, cwd=str(ROOT))
    if r.returncode != 0:
        raise RuntimeError(r.stdout[-2000:])
    return r.stdout


# --- YouTube upload ---

class YouTubeUploadRequest(BaseModel):
    job_id: str
    title: str = ""
    description: str = ""
    tags: list[str] = []
    privacy: str = "private"  # private, unlisted, public


@app.post("/api/youtube-upload")
def youtube_upload(req: YouTubeUploadRequest):
    """Upload a generated video to YouTube as a draft."""
    job = orchestrator.get_job(req.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] != "done" or not job["video_path"]:
        raise HTTPException(status_code=400, detail="Video not ready")

    video_path = ROOT / job["video_path"]
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video file not found")

    # Create a publish.json for yt_upload.py
    import json as _json
    import tempfile

    publish_data = {
        "title": req.title or job.get("prompt", "Untitled")[:100],
        "description": req.description or f"Generated by Framewright from prompt: {job.get('prompt', '')[:200]}",
        "tags": req.tags or [],
        "privacy": req.privacy,
        "video_path": str(video_path),
    }

    publish_path = ROOT / "videos" / job["project"] / "work" / "publish.json"
    publish_path.parent.mkdir(parents=True, exist_ok=True)
    publish_path.write_text(_json.dumps(publish_data, indent=2), encoding="utf-8")

    # Try to run yt_upload.py
    try:
        result = _run_sub([_venv_python(), "tools/yt_upload.py", "upload", str(publish_path), "--dry-run"])
        return {"status": "dry-run-ok", "output": result[-500:], "publish_json": str(publish_path)}
    except Exception as e:
        # YouTube upload requires OAuth setup — return instructions if it fails
        return {
            "status": "needs-oauth",
            "message": "YouTube upload requires one-time OAuth setup. See tools/yt_upload_SETUP.md",
            "publish_json": str(publish_path),
            "error": str(e)[:300],
        }


# --- Thumbnail generation ---

class ThumbnailRequest(BaseModel):
    job_id: str
    title: str = ""


@app.post("/api/thumbnail")
def generate_thumbnail(req: ThumbnailRequest):
    """Generate a YouTube thumbnail using Gemini (if key configured)."""
    s = settings.load()
    gemini_key = s.get("gemini_api_key", "")

    if not gemini_key:
        raise HTTPException(status_code=400, detail="No Gemini API key set. Add one in Settings.")

    job = orchestrator.get_job(req.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Check for face reference images
    faces_dir = ROOT / "media" / "library" / "faces"
    face_refs = []
    if faces_dir.exists():
        face_refs = [str(f) for f in sorted(faces_dir.glob("face-ref-*.jpg"))[:4]]

    import subprocess as sp
    thumb_dir = ROOT / "media" / "projects" / job["project"] / "thumbnails"
    thumb_dir.mkdir(parents=True, exist_ok=True)

    title = req.title or job.get("prompt", "Untitled")[:80]

    try:
        cmd = [_venv_python(), "tools/gen_thumbnail.py", "--title", title,
               "--out", str(thumb_dir / "thumbnail.png")]
        if face_refs:
            cmd += ["--faces"] + face_refs

        r = sp.run(cmd, stdout=sp.PIPE, stderr=sp.STDOUT, text=True, cwd=str(ROOT), timeout=120)
        if r.returncode == 0:
            return {"status": "ok", "thumbnail": f"/media/projects/{job['project']}/thumbnails/thumbnail.png"}
        else:
            return {"status": "error", "output": r.stdout[-500:]}
    except Exception as e:
        return {"status": "error", "error": str(e)[:300]}


# --- Multi-URL comparison ---

@app.post("/api/compare-urls")
async def compare_urls(urls: list[str] = Form(...)):
    """Fetch multiple URLs for comparison video mode."""
    import uuid as _uuid
    temp_project = f"compare-{str(_uuid.uuid4())[:8]}"
    results = []
    for url in urls:
        try:
            result = url_fetcher.fetch_url_content(url, temp_project)
            results.append(result)
        except Exception as e:
            results.append({"url": url, "error": str(e), "title": url, "text": "", "screenshot": ""})
    return {"results": results, "project": temp_project}


# --- Brand configuration ---

@app.get("/api/brand")
def get_brand():
    """Get current brand configuration."""
    return brand_config.get_brand_config()


@app.post("/api/brand")
def update_brand(req: BrandUpdate):
    """Update brand configuration and rewrite brand.ts."""
    updated = brand_config.update_brand_config(req.dict(exclude_none=True))
    return {"status": "saved", "brand": updated}
