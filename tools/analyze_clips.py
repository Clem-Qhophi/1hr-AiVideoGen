#!/usr/bin/env python3
"""
analyze_clips.py — Deep Viral Analysis & Clip Extractor for Longform Video.

Aligns script sentences with word-level timestamps to identify ONLY THE STRONGEST clips.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def clean_word(w: str) -> str:
    return re.sub(r"[^\w\d]", "", w.lower())

def analyze_video_for_clips(project_slug: str):
    proj_dir = ROOT / "videos" / project_slug
    script_path = proj_dir / "work" / "script.md"
    trans_path = proj_dir / "work" / "edited-transcript.json"

    if not script_path.exists() or not trans_path.exists():
        sys.exit("Missing script.md or edited-transcript.json")

    script_text = script_path.read_text(encoding="utf-8")
    sections = {}
    curr_sec = "intro"
    for line in script_text.splitlines():
        line = line.strip()
        if line.startswith("##"):
            curr_sec = line.lstrip("#").strip()
            sections[curr_sec] = []
        elif line:
            if curr_sec not in sections:
                sections[curr_sec] = []
            # split sentences
            s_list = re.split(r'(?<=[.!?])\s+', line)
            for s in s_list:
                if s.strip():
                    sections[curr_sec].append(s.strip())

    words_data = json.loads(trans_path.read_text(encoding="utf-8")).get("words", [])
    
    # Simple word index walking
    w_idx = 0
    all_sentences = []

    for sec_name, s_list in sections.items():
        for s in s_list:
            s_words = [clean_word(w) for w in s.split() if clean_word(w)]
            if not s_words:
                continue
            
            # Find the best contiguous slice in words_data starting near w_idx
            start_ms = None
            end_ms = None
            
            # Search for first word
            search_window = min(len(words_data), w_idx + 100)
            first_w = s_words[0]
            start_pos = -1
            for k in range(w_idx, search_window):
                if first_w in clean_word(words_data[k]["text"]) or clean_word(words_data[k]["text"]) in first_w:
                    start_pos = k
                    break
            
            if start_pos != -1:
                start_ms = words_data[start_pos]["start"]
                # Approximate end
                end_pos = min(len(words_data) - 1, start_pos + len(s_words) - 1)
                end_ms = words_data[end_pos]["end"]
                w_idx = end_pos + 1
            elif w_idx < len(words_data):
                start_ms = words_data[w_idx]["start"]
                end_pos = min(len(words_data) - 1, w_idx + len(s_words) - 1)
                end_ms = words_data[end_pos]["end"]
                w_idx = end_pos + 1

            if start_ms is not None and end_ms is not None:
                all_sentences.append({
                    "section": sec_name,
                    "text": s,
                    "start_s": start_ms / 1000.0,
                    "end_s": end_ms / 1000.0,
                    "dur_s": (end_ms - start_ms) / 1000.0
                })

    print(f"\n=================================================================")
    print(f" [CLIP & SHORTS VIRAL AUDIT] Project: {project_slug}")
    print(f" Analyzed {len(all_sentences)} Spoken Sentences Across Video Timeline")
    print(f"=================================================================\n")

    for i, s in enumerate(all_sentences):
        print(f"[{i:02d}] [{s['section']:<17}] {s['start_s']:05.1f}s - {s['end_s']:05.1f}s ({s['dur_s']:04.1f}s) | {s['text']}")

    return all_sentences

if __name__ == "__main__":
    slug = sys.argv[1] if len(sys.argv) > 1 else "gemini-3-7-release"
    analyze_video_for_clips(slug)
