#!/usr/bin/env python3
"""
generate_captions.py — DEPRECATED. Use tools/gen_captions_emphasis.py instead.

Superseded 2026-07-25. This one builds its shot through server/shot_templates.py, the LEGACY
template MVP that CLAUDE.md says to stop building on, and it produces flat captions with no
emphasis. gen_captions_emphasis.py writes the TSX directly, stresses the words that carry the
point, and emits a hand-editable caption-plan.json. Kept only so old projects still regenerate.

Creates a Remotion caption shot file that displays word-by-word subtitles synced
to the voiceover timing. Burns the captions directly into the video (no .srt needed).

Usage:
  python tools/generate_captions.py videos/video-1

Reads:  <project>/work/edited-transcript.json
Writes: <project>/work/caption-plan.json   (word groups with timing)
"""
import json
import os
import sys
from pathlib import Path

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Import shot template generator
sys.path.insert(0, ROOT)
from server.shot_templates import generate_shots


def main():
    if len(sys.argv) < 2:
        sys.exit("usage: generate_captions.py <project>")

    project = sys.argv[1]
    repo_root = Path(ROOT)
    project_dir = repo_root / project
    work_dir = project_dir / "work"

    transcript_path = work_dir / "edited-transcript.json"
    if not transcript_path.exists():
        sys.exit(f"No transcript found: {transcript_path}")

    transcript = json.loads(transcript_path.read_text(encoding="utf-8"))
    words = transcript.get("words", [])
    duration_s = transcript.get("duration_s", 60)

    if not words:
        sys.exit("No words in transcript — cannot generate captions")

    # Keep the REAL word timings — captions must track the speech, not be evenly spaced.
    word_texts = [{"t": w["text"], "s": int(w["start"]), "e": int(w["end"])} for w in words]

    # Create the caption shot plan
    caption_plan = [{
        "id": f"captions",
        "template": "caption",
        "duration_s": round(duration_s, 1),
        "props": {
            "words": word_texts,
        },
        "section": "Captions",
    }]

    # Save the plan
    (work_dir / "caption-plan.json").write_text(json.dumps(caption_plan, indent=2), encoding="utf-8")

    # Generate the TSX shot file
    project_name = Path(project).name
    generate_shots(caption_plan, project_name)

    print(f"Captions: {len(word_texts)} words over {duration_s:.1f}s")
    print(f"Shot file generated in remotion/src/shots/{project_name}/")
    print(f"Add 'captions' as an overlay shot in timeline.json to enable subtitles.")


if __name__ == "__main__":
    main()
