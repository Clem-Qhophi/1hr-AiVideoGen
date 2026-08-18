import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SHOTS_DIR = os.path.join(ROOT, "shots")
AUDIO_FILE = os.path.join(ROOT, "narration_master.mp3")
THUMB_FILE = os.path.join(ROOT, "thumbnail.jpg")
OUTPUT_FILE = os.path.join(ROOT, "is_ai_a_bubble_master.mp4")

# Shots mapping to the 5 Acts
SHOT_1 = os.path.join(SHOTS_DIR, "ai-bubble-Scene1CapexGap.mp4")
SHOT_2 = os.path.join(SHOTS_DIR, "ai-bubble-Scene2ThreeWalls.mp4")
SHOT_3 = os.path.join(SHOTS_DIR, "ai-bubble-Scene3TestTimeSearch.mp4")
SHOT_4 = os.path.join(SHOTS_DIR, "ai-bubble-Scene4AgenticShift.mp4")
SHOT_5 = os.path.join(SHOTS_DIR, "ai-bubble-Scene5EndVerdict.mp4")

def build_video():
    print("=" * 60)
    print("AI VIDEO EDITOR: Assembling Master Broadcast MP4")
    print(f"Audio Source:  {AUDIO_FILE}")
    print(f"Output Target: {OUTPUT_FILE}")
    print("=" * 60)

    # 1. Check prerequisites
    for path in [AUDIO_FILE, THUMB_FILE, SHOT_1, SHOT_2, SHOT_3, SHOT_4, SHOT_5]:
        if not os.path.exists(path):
            print(f"Error: Missing required asset: {path}")
            sys.exit(1)

    # Construct the timeline clips using FFmpeg concat filter
    # Pacing:
    # 0s - 8s: Thumbnail Hook Intro (8s)
    # 8s - 135s: Act 1 ($600B Gap) -> Loop Shot 1 with cinematic fade
    # 135s - 330s: Act 2 (Three Walls) -> Loop Shot 2
    # 330s - 525s: Act 3 (Test-Time Search) -> Loop Shot 3
    # 525s - 690s: Act 4 (Agentic Shift) -> Loop Shot 4
    # 690s - 769.5s: Act 5 (Final Verdict) -> Loop Shot 5

    # We use FFmpeg to build a streamlined multi-input filter complex:
    cmd = [
        "ffmpeg", "-y",
        # Input 0: Audio
        "-i", AUDIO_FILE,
        # Input 1: Thumbnail Intro
        "-loop", "1", "-t", "8", "-i", THUMB_FILE,
        # Input 2: Scene 1
        "-stream_loop", "-1", "-t", "127", "-i", SHOT_1,
        # Input 3: Scene 2
        "-stream_loop", "-1", "-t", "195", "-i", SHOT_2,
        # Input 4: Scene 3
        "-stream_loop", "-1", "-t", "195", "-i", SHOT_3,
        # Input 5: Scene 4
        "-stream_loop", "-1", "-t", "165", "-i", SHOT_4,
        # Input 6: Scene 5
        "-stream_loop", "-1", "-t", "80", "-i", SHOT_5,
        # Filter Complex to scale, normalize fps, and concat
        "-filter_complex",
        "[1:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v0];"
        "[2:v]scale=1920:1080,setsar=1,fps=30[v1];"
        "[3:v]scale=1920:1080,setsar=1,fps=30[v2];"
        "[4:v]scale=1920:1080,setsar=1,fps=30[v3];"
        "[5:v]scale=1920:1080,setsar=1,fps=30[v4];"
        "[6:v]scale=1920:1080,setsar=1,fps=30[v5];"
        "[v0][v1][v2][v3][v4][v5]concat=n=6:v=1:a=0[vout]",
        "-map", "[vout]",
        "-map", "0:a",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        OUTPUT_FILE
    ]

    print("Running FFmpeg assembly pipeline...")
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, universal_newlines=True)
    for line in process.stdout:
        if "frame=" in line or "time=" in line:
            print(f"\r{line.strip()}", end="", flush=True)
    process.wait()

    if process.returncode != 0:
        print("\nFFmpeg assembly failed!")
        sys.exit(process.returncode)

    print("\n" + "=" * 60)
    print(f"[SUCCESS] Master video generated: {OUTPUT_FILE}")
    print(f"File size: {os.path.getsize(OUTPUT_FILE) / (1024 * 1024):.2f} MB")
    print("=" * 60)

if __name__ == "__main__":
    build_video()
