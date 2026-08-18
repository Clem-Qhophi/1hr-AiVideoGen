#!/usr/bin/env python3
"""
video_broll_engine.py — High-fidelity Video B-Roll & Screen Recording Engine.

Generates real, dynamic 1080p 30/60fps MP4 video clips for AI video production:
1. Live Terminal & IDE Execution Video (streaming tokens, running benchmark suites, agent loops)
2. Web UI & Google AI Studio Playground Interaction Screencasts (slider adjustments, parameter tuning)
3. Animated Dynamic Metric & Benchmark Growth Charts (bars growing, counters ticking up)
4. Google Veo 3.1 AI Video Generation (cinematic concept b-roll)

Usage:
  python tools/video_broll_engine.py --project videos/gemini-3-7-release --all
  python tools/video_broll_engine.py --terminal --prompt "python test_agent.py" --out work/images/broll-terminal.mp4
  python tools/video_broll_engine.py --chart --data "DeepSWE:49.0:65.3,FrontierCode:34.4:43.6" --out work/images/broll-chart.mp4
  python tools/video_broll_engine.py --ui-sim "thinking-budget" --out work/images/broll-ui.mp4
"""
import argparse
import json
import math
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent

# Color Palette (Dark Technical Cyber Aesthetic)
BG_DARK = (10, 14, 20)        # #0a0e14
BG_PANEL = (17, 24, 39)       # #111827
BG_CARD = (30, 41, 59)        # #1e293b
TEXT_WHITE = (248, 250, 252)  # #f8fafc
TEXT_MUTED = (148, 163, 184)  # #94a3b8
ACCENT_CYAN = (6, 182, 212)   # #06b6d4
ACCENT_BLUE = (59, 130, 246)  # #3b82f6
ACCENT_GREEN = (34, 197, 94)  # #22c55e
ACCENT_AMBER = (245, 158, 11) # #f59e0b
ACCENT_PURPLE = (168, 85, 247)# #a855f7
BORDER_COLOR = (51, 65, 85)   # #334155


def get_font(size: int, bold: bool = False):
    # NOTE: consola.ttf is the REGULAR face, consolab.ttf the BOLD — the pair used to be
    # swapped (bold rendered regular and vice versa on every Windows box).
    candidates = [
        "C:/Windows/Fonts/consolab.ttf" if bold else "C:/Windows/Fonts/consola.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
    ]
    for c in candidates:
        if os.path.exists(c):
            try:
                return ImageFont.truetype(c, size)
            except Exception:
                continue
    return ImageFont.load_default()


def render_terminal_video(
    lines_seq: list[list[str]],
    out_path: Path,
    duration_s: float = 6.0,
    fps: int = 30,
    title: str = "bash — gemini-3.7-agentic-loop — 1920x1080",
    header_badge: str = "LIVE AGENT EXECUTION"
):
    """
    Renders a dynamic 60/30fps video simulating real-time terminal code execution,
    token streaming, benchmark runs, and test pass/fail logs.
    """
    W, H = 1920, 1080
    total_frames = int(duration_s * fps)
    
    font_mono = get_font(26, bold=False)
    font_mono_bold = get_font(28, bold=True)
    font_header = get_font(22, bold=True)
    font_badge = get_font(18, bold=True)
    
    temp_dir = Path(tempfile.mkdtemp(prefix="broll_term_"))
    try:
        # Number of text states across duration
        n_states = len(lines_seq)
        
        for frame_i in range(total_frames):
            t = frame_i / total_frames
            state_idx = min(int(t * n_states), n_states - 1)
            curr_lines = lines_seq[state_idx]
            
            img = Image.new("RGB", (W, H), BG_DARK)
            draw = ImageDraw.Draw(img)
            
            # Subtle background grid & gradient glow
            for gy in range(0, H, 60):
                draw.line([(0, gy), (W, gy)], fill=(15, 23, 42), width=1)
            for gx in range(0, W, 60):
                draw.line([(gx, 0), (gx, H)], fill=(15, 23, 42), width=1)
                
            # Terminal Window Outer Frame
            win_x, win_y = 120, 90
            win_w, win_h = 1680, 900
            
            # Window Shadow
            draw.rectangle([win_x + 8, win_y + 8, win_x + win_w + 8, win_y + win_h + 8], fill=(5, 8, 15))
            # Window Body
            draw.rectangle([win_x, win_y, win_x + win_w, win_y + win_h], fill=BG_PANEL, outline=BORDER_COLOR, width=2)
            
            # Terminal Title Bar
            draw.rectangle([win_x, win_y, win_x + win_w, win_y + 54], fill=(23, 32, 51))
            draw.line([(win_x, win_y + 54), (win_x + win_w, win_y + 54)], fill=BORDER_COLOR, width=2)
            
            # Window Controls (macOS style dots)
            draw.ellipse([win_x + 20, win_y + 18, win_x + 36, win_y + 34], fill=(239, 68, 68))
            draw.ellipse([win_x + 46, win_y + 18, win_x + 62, win_y + 34], fill=(245, 158, 11))
            draw.ellipse([win_x + 72, win_y + 18, win_x + 88, win_y + 34], fill=(34, 197, 94))
            
            # Title Bar Text
            draw.text((win_x + 110, win_y + 14), title, font=font_header, fill=TEXT_MUTED)
            
            # Top-Right Badge
            badge_w = 230
            badge_x = win_x + win_w - badge_w - 20
            draw.rectangle([badge_x, win_y + 10, badge_x + badge_w, win_y + 42], fill=(6, 78, 59), outline=ACCENT_GREEN, width=1)
            # Pulsing green dot
            pulse_alpha = abs(math.sin(t * math.pi * 6))
            dot_color = (34, 197, 94) if pulse_alpha > 0.3 else (16, 185, 129)
            draw.ellipse([badge_x + 12, win_y + 21, badge_x + 22, win_y + 31], fill=dot_color)
            draw.text((badge_x + 32, win_y + 14), header_badge, font=font_badge, fill=(209, 250, 229))
            
            # Render Terminal Content Lines
            line_y = win_y + 80
            for line in curr_lines[-22:]:  # Keep last 22 lines visible
                color = TEXT_WHITE
                fnt = font_mono
                if line.startswith("$"):
                    color = ACCENT_CYAN
                    fnt = font_mono_bold
                elif "[PASS]" in line or "SUCCESS" in line or "DONE" in line or "✓" in line:
                    color = ACCENT_GREEN
                elif "[WARN]" in line or "WARNING" in line:
                    color = ACCENT_AMBER
                elif "[FAIL]" in line or "ERROR" in line:
                    color = (248, 113, 113)
                elif line.startswith("#") or line.startswith("//"):
                    color = TEXT_MUTED
                elif line.startswith(">") or line.startswith("│"):
                    color = (147, 197, 253)
                
                draw.text((win_x + 35, line_y), line, font=fnt, fill=color)
                line_y += 36
                
            # Blinking cursor at current position
            if int(frame_i / (fps * 0.4)) % 2 == 0:
                draw.rectangle([win_x + 35, line_y, win_x + 50, line_y + 26], fill=ACCENT_CYAN)
                
            frame_path = temp_dir / f"frame_{frame_i:05d}.png"
            img.save(frame_path)
            
        out_path.parent.mkdir(parents=True, exist_ok=True)
        # Encode frames to MP4 using ffmpeg
        cmd = [
            "ffmpeg", "-y", "-framerate", str(fps),
            "-i", str(temp_dir / "frame_%05d.png"),
            "-c:v", "libx264", "-pix_fmt", "yuv420p",
            "-crf", "18", "-preset", "fast",
            str(out_path)
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"[VIDEO B-ROLL] Rendered Terminal Clip: {out_path} ({duration_s}s, {total_frames} frames)")
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


def render_animated_benchmark_video(
    metrics: list[dict],
    out_path: Path,
    duration_s: float = 6.0,
    fps: int = 30,
    title: str = "MODEL — BENCHMARK LEAP",
    baseline_name: str = "Baseline",
    new_name: str = "New Model",
    footer: str = "Sources: Official benchmark suites · verified project evidence"
):
    """
    Renders a 60/30fps video of animated growing benchmark bars, dynamic percentage counters,
    and side-by-side delta callouts.
    """
    W, H = 1920, 1080
    total_frames = int(duration_s * fps)
    
    font_title = get_font(42, bold=True)
    font_label = get_font(26, bold=True)
    font_val = get_font(32, bold=True)
    font_delta = get_font(22, bold=True)
    font_footer = get_font(18, bold=False)
    
    temp_dir = Path(tempfile.mkdtemp(prefix="broll_chart_"))
    try:
        for frame_i in range(total_frames):
            t = frame_i / total_frames
            # Ease out quint curve
            progress = 1.0 - math.pow(1.0 - min(1.0, t * 1.35), 4)
            
            img = Image.new("RGB", (W, H), BG_DARK)
            draw = ImageDraw.Draw(img)
            
            # Subtle grid
            for gy in range(0, H, 50):
                draw.line([(0, gy), (W, gy)], fill=(15, 23, 42), width=1)
            for gx in range(0, W, 50):
                draw.line([(gx, 0), (gx, H)], fill=(15, 23, 42), width=1)
                
            # Header Card
            draw.rectangle([140, 70, 1780, 160], fill=BG_PANEL, outline=BORDER_COLOR, width=2)
            draw.rectangle([140, 70, 150, 160], fill=ACCENT_CYAN) # Left Accent Bar
            draw.text((180, 85), title, font=font_title, fill=TEXT_WHITE)
            draw.text((180, 130), "VERIFIED OFFICIAL TEST SUITES · ZERO SHOT / AGENTIC EXECUTION", font=font_footer, fill=TEXT_MUTED)
            
            # Render Benchmark Rows
            row_y = 200
            bar_max_w = 950
            
            for m in metrics:
                name = m["name"]
                prev_v = float(m["prev"])
                curr_v = float(m["curr"])
                unit = m.get("unit", "%")
                delta_str = m.get("delta") or f"+{curr_v - prev_v:.1f}{unit}"
                
                # Active values animated
                display_prev = prev_v * progress
                display_curr = curr_v * progress
                
                # Container Box
                draw.rectangle([140, row_y, 1780, row_y + 145], fill=BG_PANEL, outline=(30, 41, 59), width=1)
                
                # Label
                draw.text((170, row_y + 20), name, font=font_label, fill=TEXT_WHITE)
                
                # Baseline Bar
                base_w = int((display_prev / 100.0) * bar_max_w) if unit == "%" else int((display_prev / 1800.0) * bar_max_w)
                draw.rectangle([550, row_y + 20, 550 + bar_max_w, row_y + 50], fill=(30, 41, 59))
                if base_w > 0:
                    draw.rectangle([550, row_y + 20, 550 + base_w, row_y + 50], fill=(100, 116, 139))
                draw.text((550 + bar_max_w + 30, row_y + 20), f"{baseline_name}: {display_prev:.1f}{unit}", font=get_font(20, False), fill=TEXT_MUTED)
                
                # New Model Bar
                curr_w = int((display_curr / 100.0) * bar_max_w) if unit == "%" else int((display_curr / 1800.0) * bar_max_w)
                draw.rectangle([550, row_y + 70, 550 + bar_max_w, row_y + 115], fill=(30, 41, 59))
                if curr_w > 0:
                    draw.rectangle([550, row_y + 70, 550 + curr_w, row_y + 115], fill=ACCENT_CYAN)
                draw.text((550 + bar_max_w + 30, row_y + 75), f"{new_name}: {display_curr:.1f}{unit}", font=font_val, fill=TEXT_WHITE)
                
                # Delta Pill Badge
                if progress > 0.4:
                    pill_x = 1620
                    draw.rectangle([pill_x, row_y + 40, pill_x + 130, row_y + 95], fill=(6, 78, 59), outline=ACCENT_GREEN, width=2)
                    draw.text((pill_x + 18, row_y + 52), delta_str, font=font_delta, fill=ACCENT_GREEN)
                    
                row_y += 165
                
            # Footer Legend
            draw.text((140, 1010), footer, font=font_footer, fill=TEXT_MUTED)
            
            frame_path = temp_dir / f"frame_{frame_i:05d}.png"
            img.save(frame_path)
            
        out_path.parent.mkdir(parents=True, exist_ok=True)
        cmd = [
            "ffmpeg", "-y", "-framerate", str(fps),
            "-i", str(temp_dir / "frame_%05d.png"),
            "-c:v", "libx264", "-pix_fmt", "yuv420p",
            "-crf", "18", "-preset", "fast",
            str(out_path)
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"[VIDEO B-ROLL] Rendered Benchmark Chart Clip: {out_path} ({duration_s}s, {total_frames} frames)")
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


def render_ui_interaction_video(
    out_path: Path,
    duration_s: float = 6.0,
    fps: int = 30,
    model_name: str = "model",
    studio_title: str = "AI Studio",
    prompt_text: str = "Solve benchmark instance #4928: Fix race condition in async worker thread pool"
):
    """
    Renders a screen recording simulation of an AI playground with parameter sliders,
    adjusting thinking budgets and streaming tokens live.
    """
    W, H = 1920, 1080
    total_frames = int(duration_s * fps)
    
    font_studio = get_font(30, bold=True)
    font_ui = get_font(22, bold=False)
    font_val = get_font(24, bold=True)
    font_code = get_font(20, bold=False)
    
    temp_dir = Path(tempfile.mkdtemp(prefix="broll_ui_"))
    try:
        for frame_i in range(total_frames):
            t = frame_i / total_frames
            
            img = Image.new("RGB", (W, H), (15, 20, 28))
            draw = ImageDraw.Draw(img)
            
            # App Header
            draw.rectangle([0, 0, W, 70], fill=(20, 27, 38), outline=BORDER_COLOR, width=1)
            draw.text((50, 18), studio_title, font=font_studio, fill=TEXT_WHITE)
            draw.text((320, 22), f"model: {model_name} (System Thinking)", font=font_ui, fill=ACCENT_CYAN)
            
            # Left Parameter Panel
            panel_w = 480
            draw.rectangle([50, 100, 50 + panel_w, 980], fill=BG_PANEL, outline=BORDER_COLOR, width=2)
            draw.text((80, 130), "Model Configuration", font=get_font(26, True), fill=TEXT_WHITE)
            
            # Slider 1: Thinking Budget
            draw.text((80, 190), "Thinking Budget (Tokens)", font=font_ui, fill=TEXT_MUTED)
            # Slider animates moving from 1,024 to 16,384 tokens
            budget_val = int(1024 + (16384 - 1024) * (0.5 + 0.5 * math.sin(t * math.pi * 2 - math.pi/2)))
            draw.text((420, 190), f"{budget_val:,}", font=font_val, fill=ACCENT_CYAN)
            draw.rectangle([80, 230, 80 + 400, 240], fill=(51, 65, 85))
            slider_knob_x = 80 + int(((budget_val - 1024) / (16384 - 1024)) * 400)
            draw.rectangle([80, 230, slider_knob_x, 240], fill=ACCENT_CYAN)
            draw.ellipse([slider_knob_x - 12, 225, slider_knob_x + 12, 245], fill=TEXT_WHITE, outline=ACCENT_CYAN, width=2)
            
            # Slider 2: Temperature
            draw.text((80, 280), "Temperature", font=font_ui, fill=TEXT_MUTED)
            draw.text((450, 280), "0.7", font=font_val, fill=TEXT_WHITE)
            draw.rectangle([80, 320, 80 + 400, 330], fill=(51, 65, 85))
            draw.rectangle([80, 320, 80 + 280, 330], fill=ACCENT_BLUE)
            draw.ellipse([80 + 280 - 10, 315, 80 + 280 + 10, 335], fill=TEXT_WHITE)
            
            # Toggle: Tool Calling (Active)
            draw.text((80, 370), "Dynamic Function Calling", font=font_ui, fill=TEXT_MUTED)
            draw.rectangle([430, 365, 480, 395], fill=ACCENT_GREEN)
            draw.ellipse([455, 368, 477, 392], fill=TEXT_WHITE)
            
            # Right Panel: Playground Prompt & Token Stream
            main_x = 560
            main_w = 1310
            draw.rectangle([main_x, 100, main_x + main_w, 980], fill=BG_PANEL, outline=BORDER_COLOR, width=2)
            
            # Prompt Box
            draw.rectangle([main_x + 30, 130, main_x + main_w - 30, 230], fill=(23, 32, 51), outline=(51, 65, 85), width=1)
            draw.text((main_x + 50, 145), "Prompt >", font=get_font(20, True), fill=ACCENT_AMBER)
            draw.text((main_x + 160, 145), prompt_text, font=font_ui, fill=TEXT_WHITE)
            
            # Reasoning & Output Stream
            draw.rectangle([main_x + 30, 260, main_x + main_w - 30, 950], fill=(13, 17, 23), outline=(51, 65, 85), width=1)
            draw.rectangle([main_x + 30, 260, main_x + main_w - 30, 305], fill=(20, 27, 38))
            draw.text((main_x + 50, 272), "THOUGHT CHAIN (Reasoning Stream)", font=get_font(18, True), fill=ACCENT_PURPLE)
            
            # Streamed code lines
            sample_stream = [
                "1. Analyzing concurrency model in ThreadPoolExecutor...",
                "2. Found unhandled Mutex lock acquisition in worker.py:142",
                "3. Applying atomic CAS spinlock with exponential backoff:",
                "",
                "```python",
                "class SafeWorkerPool(AsyncWorker):",
                "    def __init__(self, max_concurrency: int = 64):",
                "        self._lock = asyncio.Lock()",
                "        self._active_tasks: set[asyncio.Task] = set()",
                "        self.budget_tokens = 16384  # Gemini 3.7 Allocated Budget",
                "",
                "    async def dispatch(self, coro: Coroutine) -> TaskResult:",
                "        async with self._lock:",
                "            task = asyncio.create_task(coro)",
                "            self._active_tasks.add(task)",
                "            task.add_done_callback(self._active_tasks.discard)",
                "            return await task",
                "```",
                "4. Running regression test suite: 128 / 128 tests PASSED in 0.42s"
            ]
            
            stream_limit = min(len(sample_stream), int(t * (len(sample_stream) + 4)) + 3)
            curr_y = 325
            for line in sample_stream[:stream_limit]:
                col = ACCENT_GREEN if "PASSED" in line else (ACCENT_CYAN if line.startswith("class") or line.startswith("    ") else TEXT_WHITE)
                draw.text((main_x + 50, curr_y), line, font=font_code, fill=col)
                curr_y += 30
                
            frame_path = temp_dir / f"frame_{frame_i:05d}.png"
            img.save(frame_path)
            
        out_path.parent.mkdir(parents=True, exist_ok=True)
        cmd = [
            "ffmpeg", "-y", "-framerate", str(fps),
            "-i", str(temp_dir / "frame_%05d.png"),
            "-c:v", "libx264", "-pix_fmt", "yuv420p",
            "-crf", "18", "-preset", "fast",
            str(out_path)
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"[VIDEO B-ROLL] Rendered UI Interaction Clip: {out_path} ({duration_s}s, {total_frames} frames)")
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


def parse_metrics(spec: str) -> list[dict]:
    """
    Parses '--data "DeepSWE:49.0:65.3:%,FrontierCode:34.4:43.6"' into metric dicts.
    Format per metric: Name:prev:curr[:unit][:delta]
    """
    out = []
    for part in spec.split(","):
        part = part.strip()
        if not part:
            continue
        bits = part.split(":")
        if len(bits) < 3:
            continue
        name, prev, curr = bits[0].strip(), float(bits[1]), float(bits[2])
        unit = bits[3].strip() if len(bits) > 3 else "%"
        delta = bits[4].strip() if len(bits) > 4 else None
        out.append({"name": name, "prev": prev, "curr": curr, "unit": unit, "delta": delta})
    return out


def generate_all_project_broll(project_dir: Path, model_name: str = "model", data_spec: str = ""):
    """
    Generates a full suite of diverse, high-impact video b-roll clips in `work/images/`
    for a project. Benchmark/pricing numbers come ONLY from `--data` — the tool refuses
    to fabricate "verified" figures; without it the suite renders the generic
    terminal / agent / playground clips only.
    """
    images_dir = project_dir / "work" / "images"
    images_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\n==========================================")
    print(f"[VIDEO B-ROLL] GENERATING DYNAMIC VIDEO B-ROLL SUITE")
    print(f"Project: {project_dir}")
    print(f"Model:   {model_name}")
    print(f"==========================================")
    
    # 1. Live Terminal Agent Execution Video (generic, model-driven)
    term_seq = [
        ["$ git clone https://github.com/example/repo.git", "Cloning into 'repo'...", "$ cd repo"],
        [f"$ python run_eval.py --model {model_name} --task swe-bench", "[INIT] Initializing benchmark tasks..."],
        [f"$ python run_eval.py --model {model_name} --task swe-bench", "[AGENT] Generating multi-step execution plan...", "[AGENT] Tool call: read_file('src/core/worker.py')", "[AGENT] Tool call: apply_patch('fix_race_condition.diff')"],
        [f"$ python run_eval.py --model {model_name} --task swe-bench", "[TEST] Executing test_worker_pool ... ✓ PASS", "[TEST] Executing test_async_dispatch ... ✓ PASS", "[TEST] Executing test_exception_propagation ... ✓ PASS"],
        [f"$ python run_eval.py --model {model_name} --task swe-bench", "[EVAL] Benchmark run complete — see project evidence", "✓ SUCCESS: All evaluation runs verified and logged."]
    ]
    render_terminal_video(term_seq, images_dir / "broll-terminal-agent.mp4", duration_s=6.5)
    
    # 2. Animated Benchmark Comparison Video (only with real --data numbers)
    if data_spec:
        benchmark_data = parse_metrics(data_spec)
        if benchmark_data:
            render_animated_benchmark_video(
                benchmark_data, images_dir / "broll-benchmark-motion.mp4", duration_s=7.0,
                title=f"{model_name.upper()} — BENCHMARK LEAP",
                baseline_name="Baseline", new_name=model_name,
                footer=f"Sources: official benchmark suites · {model_name} project evidence")
        else:
            print("[VIDEO B-ROLL] WARNING: --data given but no valid metrics parsed; skipping chart")
    else:
        print("[VIDEO B-ROLL] Skipping benchmark/pricing charts (no --data; refusing to fabricate numbers)")
    
    # 3. Web UI & Playground Interaction Video
    render_ui_interaction_video(
        images_dir / "broll-playground-sliders.mp4", duration_s=6.5,
        model_name=model_name, studio_title="AI Playground",
        prompt_text=f"Run {model_name} on benchmark instance #4928: fix the race condition in the async worker pool")
    
    # 4. Terminal Fast Latency & Token Rate Video
    rate_seq = [
        [f"$ {model_name}-benchmark --concurrency 32", "[MEASURE] Streaming output tokens across 32 concurrent sessions..."],
        ["[STREAM] Session 01: 242 tok/sec | TTFT: 184ms", "[STREAM] Session 02: 256 tok/sec | TTFT: 179ms", "[STREAM] Session 03: 249 tok/sec | TTFT: 191ms"],
        ["[STREAM] Session 04: 251 tok/sec | TTFT: 180ms", "[STREAM] Session 05: 248 tok/sec | TTFT: 185ms", "[STREAM] Session 06: 253 tok/sec | TTFT: 177ms"],
        ["[SUMMARY] Mean Output Rate: 249.4 tokens/second", "[SUMMARY] Time to First Token: 182.6ms", "[SIM] Demo figures for illustration — real numbers in project evidence", "✓ BENCHMARK COMPLETE"]
    ]
    render_terminal_video(rate_seq, images_dir / "broll-terminal-rate.mp4", duration_s=6.0, title="bash — token-latency-benchmark — 1920x1080", header_badge="LATENCY & TOKEN SPEED")

    # 5. Agent Tool Calling & Automated IDE Refactor Video
    tool_seq = [
        [f"$ claude-code --model {model_name}", "[STATUS] Initialized autonomous coding agent in workspace..."],
        ["[STEP 1/4] Scanning repo AST tree for bottleneck routines...", "Found 14 async database query points in server/models.py"],
        ["[STEP 2/4] Tool call: edit_file('server/models.py', line=84)", "Applied non-blocking connection pool query batching."],
        ["[STEP 3/4] Tool call: execute_command('pytest tests/test_db_perf.py')", "============================= test session starts =============================="],
        ["tests/test_db_perf.py::test_concurrent_writes PASSED [ 50%]", "tests/test_db_perf.py::test_latency_under_load PASSED [100%]", "============================== 2 passed in 0.81s ==============================="],
        ["[STEP 4/4] Commit & Push: git commit -m 'perf: batch db connection pool'", "✓ Agent task completed successfully in 3.4 seconds."]
    ]
    render_terminal_video(tool_seq, images_dir / "broll-agent-tool-calling.mp4", duration_s=6.5, title="bash — coding-agent — 1920x1080", header_badge="TOOL CALLING & REFACTORING")

    # 6. Pricing chart — only with real numbers via --data ($ units)
    if data_spec:
        pricing_data = parse_metrics(data_spec)
        dollar_metrics = [m for m in pricing_data if m.get("unit", "%") != "%"]
        if dollar_metrics:
            render_animated_benchmark_video(
                dollar_metrics, images_dir / "broll-pricing-motion.mp4", duration_s=6.5,
                title=f"{model_name.upper()} — PRICING ECONOMICS",
                baseline_name="Before", new_name="After",
                footer=f"Sources: official pricing pages · {model_name} project evidence")
    
    print(f"==========================================")
    print(f"[VIDEO B-ROLL] SUITE COMPLETE")
    print(f"==========================================\n")


def main():
    parser = argparse.ArgumentParser(description="Video B-Roll & Screen Recording Generator")
    parser.add_argument("--project", type=str, help="Path to video project directory")
    parser.add_argument("--all", action="store_true", help="Generate all standard b-roll video clips for project")
    parser.add_argument("--terminal", action="store_true", help="Render terminal screen recording video")
    parser.add_argument("--chart", action="store_true", help="Render animated benchmark growth chart video")
    parser.add_argument("--ui-sim", action="store_true", help="Render UI interaction screen recording video")
    parser.add_argument("--out", type=str, help="Output MP4 file path")
    parser.add_argument("--data", type=str, default="",
                        help='Real metrics for charts: "Name:prev:curr[:unit][:delta],Name2:...". '
                             'Charts are NEVER rendered without it (no fabricated figures).')
    parser.add_argument("--prompt", type=str, default="",
                        help="First terminal command line / playground prompt text")
    parser.add_argument("--model", type=str, default="model",
                        help="Model name used in simulated clips (default: 'model')")
    args = parser.parse_args()

    if args.all and args.project:
        generate_all_project_broll(Path(args.project), model_name=args.model, data_spec=args.data)
    elif args.terminal and args.out:
        prompt = args.prompt or f"$ python agent_demo.py --model {args.model}"
        sample_seq = [
            [prompt, f"[INIT] Model: {args.model}"],
            ["[RUN] Executing automated browser test...", "✓ Element found: #submit-btn"],
            ["[DONE] Test passed in 0.32s"]
        ]
        render_terminal_video(sample_seq, Path(args.out))
    elif args.chart and args.out:
        if not args.data:
            parser.error("--chart requires --data (real metrics: 'Name:prev:curr:%,...')")
        sample_data = parse_metrics(args.data)
        if not sample_data:
            parser.error(f"no valid metrics parsed from --data {args.data!r}")
        render_animated_benchmark_video(
            sample_data, Path(args.out),
            title=f"{args.model.upper()} — BENCHMARK LEAP",
            baseline_name="Baseline", new_name=args.model)
    elif args.ui_sim and args.out:
        render_ui_interaction_video(
            Path(args.out),
            model_name=args.model, studio_title="AI Playground",
            prompt_text=args.prompt or f"Run {args.model} on benchmark instance #4928")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
