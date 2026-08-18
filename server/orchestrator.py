"""Pipeline orchestrator — runs the full video generation pipeline.

Flow: prompt → LLM script → TTS voiceover → master video → shot plan → render → bake
"""
import json
import os
import re
import subprocess
import sys
import time
import uuid
from pathlib import Path

from . import settings
from . import llm
from . import shot_templates
from . import url_fetcher
from . import web_search

ROOT = Path(__file__).resolve().parent.parent

# Job storage (in-memory for MVP; swap for Redis/DB later)
JOBS = {}


def create_job(prompt: str, delivery_mode: str, goal: str, voice: str,
               duration_minutes: int = 3, urls: list = None,
               improved_prompt: str = None, url_results: list = None) -> str:
    job_id = str(uuid.uuid4())[:8]
    project = f"video-{job_id}"
    JOBS[job_id] = {
        "id": job_id,
        "project": project,
        "prompt": improved_prompt or prompt,
        "original_prompt": prompt,
        "improved_prompt": improved_prompt,
        "delivery_mode": delivery_mode,
        "goal": goal,
        "voice": voice,
        "duration_minutes": duration_minutes,
        "urls": urls or [],
        "url_results": url_results or [],
        "status": "queued",
        "progress": 0,
        "step": "",
        "video_path": None,
        "script": None,
        "error": None,
        "created_at": time.time(),
    }
    return job_id


def get_job(job_id: str) -> dict:
    return JOBS.get(job_id)


def list_jobs() -> list[dict]:
    return sorted(JOBS.values(), key=lambda j: j["created_at"], reverse=True)


def _run(cmd: list, cwd: str = None) -> str:
    # On Windows, npm is a .cmd shim — needs shell=True to be found
    use_shell = os.name == "nt" and cmd[0] in ("npm", "npx")
    r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                       text=True, cwd=cwd or str(ROOT), shell=use_shell)
    if r.returncode != 0:
        raise RuntimeError(f"Command failed: {' '.join(cmd)}\n{r.stdout[-2000:]}")
    return r.stdout


def _venv_python() -> str:
    return str(ROOT / "venv" / "Scripts" / "python.exe")


def _extract_spoken_text(script: str) -> str:
    """Extract just the spoken narration from a script with ## headers."""
    lines = script.strip().split("\n")
    spoken = []
    for line in lines:
        line = line.strip()
        if line.startswith("##") or not line:
            continue
        spoken.append(line)
    return " ".join(spoken)


def _auto_gather_evidence(script: str, prompt: str, search_results: list, project: str) -> list[dict]:
    """Analyze the script and automatically gather evidence screenshots.

    Searches the web for products/sites/people mentioned in the script,
    captures screenshots, and returns evidence items for the shot plan.
    """
    evidence = []

    # 1. Capture screenshots from search results (already have URLs)
    for r in search_results[:3]:
        url = r.get("url", "")
        if not url:
            continue
        try:
            result = url_fetcher.fetch_url_content(url, project)
            if result.get("screenshot"):
                img_path = result["screenshot"].replace("\\", "/")
                if img_path.startswith("media/"):
                    img_path = img_path[6:]
                evidence.append({
                    "image": img_path,
                    "url": url,
                    "source": result.get("source_label", ""),
                    "title": result.get("title", ""),
                })
                print(f"  evidence: {result.get('source_label', '')}")
        except Exception as e:
            print(f"  evidence failed for {url[:50]}: {e}")

    # 2. Find product/company websites mentioned in the script
    import re
    domains = re.findall(r'(\w+\.(?:com|ai|io|org|net|dev))', script, re.IGNORECASE)
    for d in domains[:2]:
        d = d.lower()
        if d in [e.get("url", "").split("//")[-1].split("/")[0] for e in evidence]:
            continue
        try:
            result = url_fetcher.fetch_url_content(f"https://{d}", project)
            if result.get("screenshot"):
                img_path = result["screenshot"].replace("\\", "/")
                if img_path.startswith("media/"):
                    img_path = img_path[6:]
                evidence.append({
                    "image": img_path,
                    "url": f"https://{d}",
                    "source": d,
                    "title": result.get("title", d),
                })
                print(f"  evidence: {d}")
        except Exception as e:
            print(f"  evidence failed for {d}: {e}")

    return evidence


def _plan_shots_from_timestamps(script: str, transcript: dict, project: str,
                                evidence_items: list = None) -> list[dict]:
    """Plan shots using REAL word-level timestamps from the transcript.

    This replaces the crude word-count estimates with actual audio timing,
    so visuals sync precisely to the narration.
    """
    words = transcript.get("words", [])
    total_duration = transcript.get("duration_s", 60)
    evidence_items = evidence_items or []

    # Parse script into sections
    sections = re.split(r'^##\s+', script, flags=re.MULTILINE)
    sections = [s.strip() for s in sections if s.strip()]

    # Parse > VISUAL hints from each section
    plan = []
    evidence_idx = 0
    shot_counter = 0

    for sec_i, section in enumerate(sections):
        lines = section.split("\n")
        title = lines[0].strip().rstrip("()").split("(")[0].strip()
        body_lines = [l for l in lines[1:] if not l.strip().startswith(">") and l.strip()]
        body = " ".join(body_lines).strip()

        # Find the > VISUAL hint
        visual_hint = ""
        for l in lines:
            if l.strip().startswith(">"):
                visual_hint = l.strip().lstrip(">").strip()
                break

        # Find word timing for this section by matching the first few words
        section_start_s = 0.0
        section_end_s = total_duration

        first_words = body.split()[:5]
        if first_words and words:
            for wi, w in enumerate(words):
                if w["text"].lower().rstrip(".,!?") == first_words[0].lower().rstrip(".,!?"):
                    # Check if next words match too
                    match = True
                    for fi, fw in enumerate(first_words[1:], 1):
                        if wi + fi >= len(words):
                            match = False
                            break
                        if words[wi + fi]["text"].lower().rstrip(".,!?") != fw.lower().rstrip(".,!?"):
                            match = False
                            break
                    if match:
                        section_start_s = words[wi]["start"] / 1000.0
                        break

        # Find end: start of next section or end of video
        if sec_i < len(sections) - 1:
            next_body = " ".join(l for l in sections[sec_i + 1].split("\n") if not l.startswith(">") and l.strip()).strip()
            next_first = next_body.split()[:1]
            if next_first and words:
                for wi, w in enumerate(words):
                    if w["text"].lower().rstrip(".,!?") == next_first[0].lower().rstrip(".,!?"):
                        section_end_s = words[wi]["start"] / 1000.0
                        break
        else:
            section_end_s = total_duration

        section_duration = max(3, section_end_s - section_start_s)

        # Decide template based on position and visual hint
        if sec_i == 0:
            template = "hook"
            props = {
                "label": title.upper()[:30],
                "headline": _first_sentence(body)[:80],
                "subheadline": _second_sentence(body)[:100],
                "glow": "danger",
                "stat_1_label": "KEY POINT 1",
                "stat_1_value": _first_sentence(body)[:20] or "Breaking",
                "stat_2_label": "KEY POINT 2",
                "stat_2_value": _second_sentence(body)[:20] or "New",
                "stat_3_label": "KEY POINT 3",
                "stat_3_value": title[:20] or "Update",
            }
        elif sec_i == len(sections) - 1:
            template = "outro"
            props = {
                "main_text": _first_sentence(body)[:80],
                "cta_text": "Follow for more",
                "glow": "accent",
            }
        elif "screenshot" in visual_hint.lower() or "website" in visual_hint.lower() or "homepage" in visual_hint.lower():
            # Use evidence template if we have a screenshot, else statement
            if evidence_idx < len(evidence_items):
                ev = evidence_items[evidence_idx]
                evidence_idx += 1
                template = "evidence"
                props = {
                    "image": ev["image"],
                    "url": ev.get("url", ""),
                    "source": ev.get("source", ""),
                    "label": title.upper()[:20],
                }
            else:
                template = "statement"
                props = {
                    "label": title.upper()[:30],
                    "text": _first_sentence(body)[:100],
                    "glow": "accent",
                    "chip_1_label": "FACT",
                    "chip_1_value": _first_sentence(body)[:30] or "Key detail",
                    "chip_2_label": "IMPACT",
                    "chip_2_value": _second_sentence(body)[:30] or "Why it matters",
                }
        elif "comparison" in visual_hint.lower() or " vs " in visual_hint.lower():
            template = "statement"
            props = {
                "label": title.upper()[:30],
                "text": _first_sentence(body)[:100],
                "glow": "warn",
                "chip_1_label": "SIDE A",
                "chip_1_value": _first_sentence(body)[:25] or "First point",
                "chip_2_label": "SIDE B",
                "chip_2_value": _second_sentence(body)[:25] or "Second point",
            }
        else:
            template = "statement"
            props = {
                "label": title.upper()[:30],
                "text": _first_sentence(body)[:100],
                "glow": "accent",
                "chip_1_label": "DETAIL",
                "chip_1_value": _first_sentence(body)[:30] or "Key fact",
                "chip_2_label": "CONTEXT",
                "chip_2_value": _second_sentence(body)[:30] or "Background",
            }

        shot_id = f"{project.replace('-', '')}S{shot_counter:02d}"
        shot_counter += 1

        plan.append({
            "id": shot_id,
            "template": template,
            "duration_s": round(section_duration, 1),
            "props": props,
            "section": title,
            "master_in_s": round(section_start_s, 2),
            "master_out_s": round(section_end_s, 2),
        })

    # Insert remaining evidence shots between sections
    while evidence_idx < len(evidence_items):
        ev = evidence_items[evidence_idx]
        evidence_id = f"{project.replace('-', '')}E{evidence_idx:02d}"
        # Insert at a natural break point
        insert_at = min(len(plan), 2 + evidence_idx * 2)
        plan.insert(insert_at, {
            "id": evidence_id,
            "template": "evidence",
            "duration_s": 5,
            "props": {
                "image": ev["image"],
                "url": ev.get("url", ""),
                "source": ev.get("source", ""),
                "label": "EVIDENCE",
            },
            "section": f"Evidence: {ev.get('source', '')}",
        })
        evidence_idx += 1
        shot_counter += 1

    return plan
    """Create a simple shot plan from the script structure + word timings."""
    sections = re.split(r'^##\s+', script, flags=re.MULTILINE)
    sections = [s.strip() for s in sections if s.strip()]

    words = transcript.get("words", [])
    total_duration = transcript.get("duration_s", 180)
    plan = []
    current_time = 0.0

    for i, section in enumerate(sections):
        lines = section.split("\n", 1)
        title = lines[0].strip().rstrip("()").split("(")[0].strip()
        body = lines[1].strip() if len(lines) > 1 else ""

        # estimate section duration from word count
        word_count = len(body.split())
        section_duration = max(4, min(30, (word_count / 150) * 60))

        if i == 0:
            template = "hook"
            props = {"label": title.upper(), "headline": _first_sentence(body),
                     "subheadline": _second_sentence(body), "glow": "danger"}
        elif i == len(sections) - 1:
            template = "outro"
            props = {"main_text": _first_sentence(body), "cta_text": "Follow for more"}
        else:
            template = "statement"
            props = {"label": title.upper(), "text": _first_sentence(body), "glow": "accent"}

        shot_id = f"{project.replace('-', '')}S{i:02d}"
        plan.append({
            "id": shot_id,
            "template": template,
            "duration_s": round(section_duration, 1),
            "props": props,
            "section": title,
        })
        current_time += section_duration

    return plan


def _first_sentence(text: str) -> str:
    parts = re.split(r'[.!?]+', text.strip())
    return parts[0].strip() if parts else text.strip()


def _second_sentence(text: str) -> str:
    parts = re.split(r'[.!?]+', text.strip())
    return parts[1].strip() if len(parts) > 1 else ""


def run_pipeline(job_id: str):
    """Run the full pipeline. Called in a background thread."""
    job = JOBS[job_id]
    project = job["project"]
    project_dir = ROOT / "videos" / project

    try:
        # Step 0: Use pre-fetched URL content (fetched synchronously before pipeline started)
        url_contexts = []
        url_screenshots = []
        if job.get("url_results"):
            url_contexts = job["url_results"]
            url_screenshots = job["url_results"]
            # Move screenshots from the temp project to this project
            _migrate_screenshots(job["url_results"], project)
        job["progress"] = 5

        # Step 1: Web search for current information + write the script
        job["status"] = "running"
        job["step"] = "Researching topic"
        job["progress"] = 8

        # Search the web for current information about the prompt
        web_context = ""
        search_results = []
        try:
            research = web_search.research_topic(job["prompt"], max_results=5)
            web_context = research.get("summary", "")
            search_results = research.get("results", [])
            print(f"  found {len(search_results)} web results")
        except Exception as e:
            print(f"  web search failed (non-fatal): {e}")

        # Add URL context if user provided links
        if url_contexts:
            context_parts = [f"Content from {c['source_label']} ({c['title']}):\n{c['text'][:2000]}" for c in url_contexts]
            web_context = web_context + "\n\n=== USER-PROVIDED LINKS ===\n" + "\n\n".join(context_parts)

        job["step"] = "Writing script"
        job["progress"] = 12

        script = llm.generate_script(
            job["prompt"], job["delivery_mode"], job["goal"], job["duration_minutes"],
            web_context=web_context,
        )
        job["script"] = script

        # save script
        work_dir = project_dir / "work"
        work_dir.mkdir(parents=True, exist_ok=True)
        (work_dir / "script.md").write_text(script, encoding="utf-8")

        # extract spoken text
        spoken = _extract_spoken_text(script)
        (work_dir / "script_spoken.txt").write_text(spoken, encoding="utf-8")

        job["progress"] = 15

        # Step 2: TTS voiceover — try ElevenLabs first, fall back to free Edge TTS
        job["step"] = "Generating voiceover"
        s = settings.load()
        elevenlabs_key = s.get("elevenlabs_api_key", "") or os.environ.get("ELEVENLABS_API_KEY", "")

        # delivery mode speed settings
        mode_speeds = {"breaking-news": 1.15, "calm-explainer": 1.0,
                       "sarcastic-review": 1.05, "authoritative": 0.95}
        speed = mode_speeds.get(job["delivery_mode"], 1.0)

        # Edge TTS voice mapping (for when ElevenLabs isn't available)
        edge_voices = {
            "breaking-news": "en-US-GuyNeural",
            "calm-explainer": "en-US-AriaNeural",
            "sarcastic-review": "en-US-DavisNeural",
            "authoritative": "en-US-DavisNeural",
        }
        edge_voice = edge_voices.get(job["delivery_mode"], "en-US-GuyNeural")

        tts_success = False
        if elevenlabs_key:
            tts_cmd = [_venv_python(), "tools/tts.py", f"videos/{project}",
                       "--text-file", f"videos/{project}/work/script_spoken.txt",
                       "--voice", job["voice"]]
            if speed != 1.0:
                tts_cmd += ["--speed", str(speed)]
            try:
                _run(tts_cmd)
                tts_success = True
            except Exception as e:
                err_msg = str(e)
                if "quota_exceeded" in err_msg:
                    job["step"] = "Generating voiceover (ElevenLabs out of credits, using free Edge TTS)"
                else:
                    job["step"] = "Generating voiceover (ElevenLabs failed, using free Edge TTS)"
                print(f"  ElevenLabs TTS failed, falling back to Edge TTS: {err_msg[:200]}")

        if not tts_success:
            # Fall back to FREE Edge TTS (no API key needed)
            edge_cmd = [_venv_python(), "tools/tts_edge.py", f"videos/{project}",
                        "--text-file", f"videos/{project}/work/script_spoken.txt",
                        "--voice", edge_voice]
            if speed != 1.0:
                edge_cmd += ["--speed", str(speed)]
            _run(edge_cmd)

        job["progress"] = 35

        # Step 3: Create master
        job["step"] = "Creating master video"
        _run([_venv_python(), "tools/make_master.py", f"videos/{project}"])
        job["progress"] = 45

        # Step 4: Plan shots using REAL word timestamps + auto-gather evidence
        job["step"] = "Planning visual beats"
        transcript = json.loads((work_dir / "edited-transcript.json").read_text(encoding="utf-8"))

        # Auto-gather evidence screenshots from the script
        job["step"] = "Gathering evidence screenshots"
        job["progress"] = 40
        evidence_items = []
        try:
            evidence_items = _auto_gather_evidence(script, job["prompt"], search_results, project)
        except Exception as e:
            print(f"  evidence gathering failed (non-fatal): {e}")

        # Plan shots using real word-level timestamps
        job["step"] = "Planning visual beats"
        job["progress"] = 45
        plan = _plan_shots_from_timestamps(script, transcript, project, evidence_items)

        # Insert evidence shots from user-provided URL screenshots
        if url_screenshots:
            plan = _insert_evidence_shots(plan, url_screenshots, transcript, project)

        (work_dir / "shot-plan.json").write_text(json.dumps(plan, indent=2), encoding="utf-8")
        job["progress"] = 50

        # Step 5: Generate TSX shot files
        job["step"] = "Generating visual shots"
        shot_templates.generate_shots(plan, project)
        job["progress"] = 55

        # Step 6: Register + render (with caching — skip already-rendered shots)
        job["step"] = "Rendering shots"
        _run(["npm", "run", "gen"], cwd=str(ROOT / "remotion"))

        shot_ids = [p["id"] for p in plan]
        out_dir = ROOT / "remotion" / "out"
        for idx, sid in enumerate(shot_ids):
            job["progress"] = 55 + int((idx / max(len(shot_ids), 1)) * 20)
            job["step"] = f"Rendering shots ({idx + 1}/{len(shot_ids)})"
            # Skip if the shot file already exists (caching)
            shot_file = out_dir / f"{sid}.mp4"
            if shot_file.exists() and shot_file.stat().st_size > 1000:
                print(f"  cached: {sid}")
                continue
            rendered = False
            for attempt in range(3):
                try:
                    _run(["node", "scripts/render-all.mjs", "--scale=1", sid], cwd=str(ROOT / "remotion"))
                    rendered = True
                    break
                except Exception as e:
                    if attempt < 2:
                        print(f"  render retry {attempt + 1}/3 for {sid}: {str(e)[:100]}")
                        time.sleep(5)
                    else:
                        raise
        job["progress"] = 75

        # Step 7: Build timeline + bake
        job["step"] = "Baking final video"
        timeline = _build_timeline(plan, transcript, project)
        (work_dir / "timeline.json").write_text(json.dumps(timeline, indent=2), encoding="utf-8")

        _run([_venv_python(), "tools/bake.py", f"videos/{project}/work/timeline.json"])

        video_path = project_dir / "output" / f"{project}-preview.mp4"
        job["video_path"] = str(video_path.relative_to(ROOT))
        job["status"] = "done"
        job["progress"] = 100
        job["step"] = "Complete"

    except Exception as e:
        job["status"] = "failed"
        job["error"] = str(e)
        job["step"] = "Failed"


def run_screen_recording_pipeline(job_id: str):
    """Screen recording pipeline: analyze video → write script → TTS → composite voiceover over original video."""
    job = JOBS.get(job_id)
    if not job:
        return
    project = job["project"]
    project_dir = ROOT / "videos" / project
    work_dir = project_dir / "work"
    recording_path = ROOT / job.get("recording_path", "")

    try:
        # Step 1: Analyze the recording (extract keyframes + probe duration)
        job["status"] = "running"
        job["step"] = "Analyzing screen recording"
        job["progress"] = 5

        recording_str = str(recording_path)
        _run([_venv_python(), "tools/analyze_video.py", f"videos/{project}",
              "--recording", recording_str,
              "--description", job.get("description", job["prompt"]),
              "--delivery-mode", job["delivery_mode"],
              "--goal", job["goal"]])
        job["progress"] = 20

        # Step 2: Generate voiceover from the script
        job["step"] = "Generating voiceover"
        s = settings.load()
        elevenlabs_key = s.get("elevenlabs_api_key", "") or os.environ.get("ELEVENLABS_API_KEY", "")

        mode_speeds = {"breaking-news": 1.15, "calm-explainer": 1.0,
                       "sarcastic-review": 1.05, "authoritative": 0.95}
        speed = mode_speeds.get(job["delivery_mode"], 1.0)

        edge_voices = {
            "breaking-news": "en-US-GuyNeural",
            "calm-explainer": "en-US-AriaNeural",
            "sarcastic-review": "en-US-DavisNeural",
            "authoritative": "en-US-DavisNeural",
        }
        edge_voice = edge_voices.get(job["delivery_mode"], "en-US-GuyNeural")

        # Read the script
        script = (work_dir / "script.md").read_text(encoding="utf-8")
        job["script"] = script
        spoken = _extract_spoken_text(script)
        (work_dir / "script_spoken.txt").write_text(spoken, encoding="utf-8")

        tts_success = False
        if elevenlabs_key:
            tts_cmd = [_venv_python(), "tools/tts.py", f"videos/{project}",
                       "--text-file", f"videos/{project}/work/script_spoken.txt",
                       "--voice", job["voice"]]
            if speed != 1.0:
                tts_cmd += ["--speed", str(speed)]
            try:
                _run(tts_cmd)
                tts_success = True
            except Exception as e:
                print(f"  ElevenLabs failed, using Edge TTS: {str(e)[:200]}")

        if not tts_success:
            edge_cmd = [_venv_python(), "tools/tts_edge.py", f"videos/{project}",
                        "--text-file", f"videos/{project}/work/script_spoken.txt",
                        "--voice", edge_voice]
            if speed != 1.0:
                edge_cmd += ["--speed", str(speed)]
            _run(edge_cmd)

        job["progress"] = 50

        # Step 3: Composite the voiceover over the original recording
        job["step"] = "Compositing voiceover over recording"
        voiceover_path = work_dir / "audio" / "voiceover.mp3"
        master_path = project_dir / "reference" / "master.mp4"
        output_path = project_dir / "output" / f"{project}-preview.mp4"
        output_path.parent.mkdir(parents=True, exist_ok=True)

        # Replace the recording's audio with the voiceover (or mix if recording has audio)
        # For screen recordings, usually there's no audio — just replace
        _run([
            "ffmpeg", "-y", "-i", str(master_path), "-i", str(voiceover_path),
            "-map", "0:v:0", "-map", "1:a:0",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
            "-shortest", "-movflags", "+faststart",
            str(output_path)
        ])

        job["video_path"] = str(output_path.relative_to(ROOT))
        job["status"] = "done"
        job["progress"] = 100
        job["step"] = "Complete"

    except Exception as e:
        job["status"] = "failed"
        job["error"] = str(e)
        job["step"] = "Failed"


def _migrate_screenshots(url_results: list, project: str):
    """Move screenshots from the temp project dir to the actual project dir,
    and update the screenshot paths in the results."""
    import shutil
    for r in url_results:
        old_path = r.get("screenshot", "")
        if not old_path:
            continue
        old_abs = ROOT / old_path.replace("/", os.sep)
        if not old_abs.exists():
            continue
        # new path: media/projects/<project>/evidence/<filename>
        new_dir = ROOT / "media" / "projects" / project / "evidence"
        new_dir.mkdir(parents=True, exist_ok=True)
        new_abs = new_dir / old_abs.name
        shutil.copy2(str(old_abs), str(new_abs))
        # update the path (strip media/ prefix for staticFile)
        new_rel = f"projects/{project}/evidence/{old_abs.name}"
        r["screenshot"] = new_rel
        r["screenshot_name"] = old_abs.stem


def _insert_evidence_shots(plan: list[dict], url_screenshots: list[dict],
                           transcript: dict, project: str) -> list[dict]:
    """Insert evidence shots from URL screenshots into the shot plan.

    For each URL screenshot, we find the best place to insert it — usually
    after the statement that references that source.
    """
    if not url_screenshots:
        return plan

    new_plan = list(plan)
    for i, screenshot in enumerate(url_screenshots):
        evidence_id = f"{project.replace('-', '')}E{i:02d}"
        # strip "media/" prefix — staticFile() already prepends it
        img_path = screenshot.get("screenshot", "").replace("\\", "/")
        if img_path.startswith("media/"):
            img_path = img_path[6:]
        evidence_shot = {
            "id": evidence_id,
            "template": "evidence",
            "duration_s": 6,
            "props": {
                "image": img_path,
                "url": screenshot.get("url", ""),
                "source": screenshot.get("source_label", ""),
                "label": "SOURCE",
            },
            "section": f"Evidence: {screenshot.get('source_label', '')}",
        }
        # Insert after the first statement shot (or after the hook)
        insert_at = min(1 + i, len(new_plan))
        new_plan.insert(insert_at, evidence_shot)

    return new_plan


def _build_timeline(plan: list[dict], transcript: dict, project: str) -> dict:
    """Build timeline.json from the shot plan. Uses real timestamps when available."""
    total_duration = transcript.get("duration_s", 180)
    shots = []

    for beat in plan:
        # Use real timestamps from the plan if available (from _plan_shots_from_timestamps)
        if "master_in_s" in beat and "master_out_s" in beat:
            shots.append({
                "id": beat["id"],
                "type": "cutaway",
                "master_in_s": beat["master_in_s"],
                "master_out_s": min(beat["master_out_s"], total_duration),
                "cue": beat.get("section", ""),
            })
        else:
            # Fall back to sequential timing
            dur = beat["duration_s"]
            if not shots:
                current = 0.0
            else:
                current = shots[-1]["master_out_s"]
            shots.append({
                "id": beat["id"],
                "type": "cutaway",
                "master_in_s": round(current, 2),
                "master_out_s": round(min(current + dur, total_duration), 2),
                "cue": beat.get("section", ""),
            })

    # if shots don't cover the full timeline, extend the last one
    if shots and shots[-1]["master_out_s"] < total_duration:
        shots[-1]["master_out_s"] = round(total_duration, 2)

    return {
        "master": f"videos/{project}/reference/master.mp4",
        "master_fps": 30,
        "remotion_out": "remotion/out",
        "shots": shots,
        "preview": {
            "end_s": round(total_duration, 2),
            "out": f"videos/{project}/output/{project}-preview.mp4",
            "width": 1920,
            "height": 1080,
            "fps": 30,
        },
    }
