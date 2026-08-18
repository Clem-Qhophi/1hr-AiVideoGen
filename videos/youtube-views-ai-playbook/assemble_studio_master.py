import os
import subprocess
import json

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROJECT_DIR = os.path.join(ROOT, "videos", "youtube-views-ai-playbook")
OUT_DIR = os.path.join(ROOT, "remotion", "out")
AUDIO_MASTER = os.path.join(PROJECT_DIR, "studio_master_audio.mp3")
OUTPUT_MASTER = os.path.join(PROJECT_DIR, "youtube_views_master.mp4")

# 10 distinct scene shots in exact chronological order matching storyboard_beats.json
SHOT_NAMES = [
    "youtube-views-Beat01AugustReset",
    "youtube-views-Beat02RoadmapFOMO",
    "youtube-views-Beat03MetricEngineMatrix",
    "youtube-views-Beat04EngagedViewsStudio",
    "youtube-views-Beat05MonetizationFlow",
    "youtube-views-Beat06PlatformWarParity",
    "youtube-views-Beat07VisionLLMHookScorer",
    "youtube-views-Beat08AgenticVideoStack",
    "youtube-views-Beat09SponsorshipMultiplier",
    "youtube-views-Beat10ExecutionBlueprint",
]

def get_audio_duration(path: str) -> float:
    cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", path
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, text=True, check=True)
    return float(res.stdout.strip())

def render_remotion_shots(force=False):
    os.makedirs(OUT_DIR, exist_ok=True)
    missing = [name for name in SHOT_NAMES if not os.path.exists(os.path.join(OUT_DIR, f"{name}.mp4"))]
    if missing or force:
        print(f"Rendering {len(missing) if not force else len(SHOT_NAMES)} Remotion shots at native 1080p...")
        cmd = ["node", "scripts/render-all.mjs", "--scale=1", *(missing if not force else SHOT_NAMES)]
        subprocess.run(cmd, cwd=os.path.join(ROOT, "remotion"), check=True)
    else:
        print("[OK] All 10 Remotion shots already rendered in out/")

def main():
    print("=" * 60)
    print("ASSEMBLING STUDIO GRADE MASTER VIDEO (YOUTUBE VIEW COUNT OVERHAUL)")
    print("=" * 60)

    # First ensure all shots are rendered
    render_remotion_shots()

    total_audio_dur = get_audio_duration(AUDIO_MASTER)
    print(f"Total audio duration: {total_audio_dur:.2f} s ({total_audio_dur/60:.2f} min)")

    # Exact scene durations matching the 600.024s master audio track (18,000 frames @ 30fps)
    exact_durations = [
        60.0,    # 01 August Reset (1800 frames)
        55.0,    # 02 Roadmap FOMO (1650 frames)
        60.0,    # 03 Metric Engine Matrix (1800 frames)
        65.0,    # 04 Engaged Views Studio (1950 frames)
        60.0,    # 05 Monetization Flow (1800 frames)
        55.0,    # 06 Platform War Parity (1650 frames)
        72.0,    # 07 Vision LLM Hook Scorer (2160 frames)
        63.0,    # 08 Agentic Video Stack (1890 frames)
        54.0,    # 09 Sponsorship Multiplier (1620 frames)
        56.024,  # 10 Execution Blueprint & CTA (1680 frames)
    ]
    target_durations = exact_durations

    inputs = []
    filter_parts = []
    
    for i, name in enumerate(SHOT_NAMES):
        clip_path = os.path.join(OUT_DIR, f"{name}.mp4")
        if not os.path.exists(clip_path):
            raise FileNotFoundError(f"Missing rendered clip: {clip_path}")
        
        dur = target_durations[i]
        inputs.extend(["-i", clip_path])
        
        # Scale to 1080p, trim exactly to beat duration
        filter_parts.append(
            f"[{i}:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,trim=duration={dur:.3f},setpts=PTS-STARTPTS[v{i}];"
        )

    concat_inputs = "".join(f"[v{i}]" for i in range(len(SHOT_NAMES)))
    concat_filter = f"{concat_inputs}concat=n={len(SHOT_NAMES)}:v=1:a=0[vcat]"
    
    full_filter = "".join(filter_parts) + concat_filter

    cmd = [
        "ffmpeg", "-y",
        *inputs,
        "-i", AUDIO_MASTER,
        "-filter_complex", full_filter,
        "-map", "[vcat]",
        "-map", f"{len(SHOT_NAMES)}:a",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        OUTPUT_MASTER
    ]

    print(f"Executing master compilation to {OUTPUT_MASTER}...")
    subprocess.run(cmd, check=True)
    print("=" * 60)
    print(f"[SUCCESS] Studio grade master video generated: {OUTPUT_MASTER}")
    print(f"File size: {os.path.getsize(OUTPUT_MASTER) / (1024*1024):.2f} MB")
    print("=" * 60)

if __name__ == "__main__":
    main()
