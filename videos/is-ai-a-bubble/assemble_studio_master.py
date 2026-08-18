import os
import subprocess
import json

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROJECT_DIR = os.path.join(ROOT, "videos", "is-ai-a-bubble")
OUT_DIR = os.path.join(ROOT, "remotion", "out")
AUDIO_MASTER = os.path.join(PROJECT_DIR, "studio_master_audio.mp3")
OUTPUT_MASTER = os.path.join(PROJECT_DIR, "is_ai_a_bubble_master.mp4")

# 18 distinct scene shots in exact chronological order matching storyboard_beats.json
SHOT_NAMES = [
    "ai-bubble-Beat01CapexGap",
    "ai-bubble-Beat02AcemogluModel",
    "ai-bubble-Beat03CoreQuestion",
    "ai-bubble-Beat04ThreeWalls",
    "ai-bubble-Beat05EpochDataWall",
    "ai-bubble-Beat06ModelAutophagy",
    "ai-bubble-Beat07NuclearGrid",
    "ai-bubble-Beat08ParadigmPivot",
    "ai-bubble-Beat09ReasoningSearchTree",
    "ai-bubble-Beat10AgenticSWEBench",
    "ai-bubble-Beat11JevonsParadox",
    "ai-bubble-Beat12PrecisionScaling",
    "ai-bubble-Beat13PostTransformerSSM",
    "ai-bubble-Beat14EnterpriseVerifiers",
    "ai-bubble-Beat15MultipolarTrap",
    "ai-bubble-Beat16EpistemicAtrophy",
    "ai-bubble-Beat17FinalVerdict",
    "ai-bubble-Beat18OutroEndCard",
]

def get_audio_duration(path: str) -> float:
    cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", path
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, text=True, check=True)
    return float(res.stdout.strip())

def main():
    print("=" * 60)
    print("ASSEMBLING STUDIO GRADE MASTER VIDEO (18 UNIQUE SCENES)")
    print("=" * 60)

    total_audio_dur = get_audio_duration(AUDIO_MASTER)
    print(f"Total audio duration: {total_audio_dur:.2f} s ({total_audio_dur/60:.2f} min)")

    # Distribute scene durations proportional to storyboard beats
    beat_weights = [
        45, # 01 Capex Gap
        45, # 02 Acemoglu
        45, # 03 Core Question
        60, # 04 Three Walls
        45, # 05 Epoch Data Wall
        45, # 06 Model Autophagy
        45, # 07 Nuclear Grid
        60, # 08 Paradigm Pivot
        60, # 09 Reasoning Search Tree
        60, # 10 Agentic SWEBench
        45, # 11 Jevons Paradox
        45, # 12 Precision Scaling
        45, # 13 Post-Transformer SSM
        45, # 14 Enterprise Verifiers
        60, # 15 Multipolar Trap
        60, # 16 Epistemic Atrophy
        60, # 17 Final Verdict
        30, # 18 Outro End Card
    ]
    total_weight = sum(beat_weights)
    target_durations = [(w / total_weight) * total_audio_dur for w in beat_weights]

    inputs = []
    filter_parts = []
    
    for i, name in enumerate(SHOT_NAMES):
        clip_path = os.path.join(OUT_DIR, f"{name}.mp4")
        if not os.path.exists(clip_path):
            raise FileNotFoundError(f"Missing rendered clip: {clip_path}")
        
        dur = target_durations[i]
        inputs.extend(["-i", clip_path])
        
        # Scale to 1080p, hold last frame with tpad, trim exactly to beat duration
        filter_parts.append(
            f"[{i}:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,tpad=stop_mode=clone:stop=-1,trim=duration={dur:.3f},setpts=PTS-STARTPTS[v{i}];"
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
