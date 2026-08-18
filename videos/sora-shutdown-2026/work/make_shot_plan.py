#!/usr/bin/env python3
"""Build the FINAL shot plan for sora-shutdown-2026 and emit shot-local cue frames
for TSX authoring. Reads beat-plan.json (beat spans + aligned words)."""
import json
import re

ROOT = "videos/sora-shutdown-2026/work"
plan = json.load(open(f"{ROOT}/beat-plan.json", encoding="utf-8"))
words = json.load(open(f"{ROOT}/edited-transcript.json", encoding="utf-8"))["words"]
VO_END = 416.0

# shot -> [beats merged in order]
SHOTS = [
    ("SoraHook",        ["cold-open-claim"]),
    ("SoraContext",     ["context"]),
    ("SoraContext2",    ["context-2"]),
    ("SoraDisney",      ["context-3"]),
    ("SoraVerdict",     ["verdict"]),
    ("SoraBurnRate",    ["verdict-2"]),
    ("SoraUsers",       ["verdict-3"]),
    ("SoraBlindside",   ["verdict-4"]),
    ("SoraMeans",       ["verdict-5"]),
    ("SoraEvidence1",   ["evidence-open", "evidence-1"]),
    ("SoraEvidence2",   ["evidence-2"]),
    ("SoraEvidence3",   ["evidence-3"]),
    ("SoraEvidence4",   ["evidence-4"]),
    ("SoraEvidence5",   ["evidence-5"]),
    ("SoraEvidence6",   ["evidence-6"]),
    ("SoraEvidence7",   ["evidence-7"]),
    ("SoraMidroll",     ["mid-roll-cta"]),
    ("SoraEvidenceSays",["evidence-8"]),
    ("SoraHonest2",     ["honest-gap", "honest-gap-2"]),
    ("SoraHonest3",     ["honest-gap-3"]),
    ("SoraHonest4",     ["honest-gap-4"]),
    ("SoraHonest5",     ["honest-gap-5"]),
    ("SoraClose",       ["close"]),
    ("SoraAction",      ["close-2"]),
    ("SoraOutro",       ["close-3", "close-4"]),
]

CUE_HINTS = {
    "SoraHook":         ["six weeks", "deleting your clips", "million dollars a day", "two point one million"],
    "SoraContext":      ["GPT-1 moment", "type a sentence", "get film-quality footage"],
    "SoraContext2":     ["went public", "sound, real physics", "star in your own clips"],
    "SoraDisney":       ["Disney signed on", "One billion dollars", "gets turned off"],
    "SoraVerdict":      ["verdict, right now", "catastrophic"],
    "SoraBurnRate":     ["roughly a million dollars a day", "two days of burn", "entire lifetime"],
    "SoraUsers":        ["around a million users", "below half a million", "six point one million in November", "one point one million by March"],
    "SoraBlindside":    ["Disney got blindsided", "two hundred characters", "big rug-pull", "No money ever changed hands"],
    "SoraMeans":        ["Here's what it means for you", "permanently deletes the data", "not on your side"],
    "SoraEvidence1":    ["show you the receipts", "goodbye to Sora", "ten billion dollars", "one decision", "IPO"],
    "SoraEvidence2":    ["the autopsy", "one million dollars a day", "expensive to run", "coding and enterprise"],
    "SoraEvidence3":    ["Claude Code", "eating OpenAI's lunch", "side quests are over"],
    "SoraEvidence4":    ["four point eight million", "six point one", "one point one by March", "went down anyway"],
    "SoraEvidence5":    ["And Disney", "more than two hundred characters", "a Monday evening", "big rug-pull"],
    "SoraEvidence6":    ["MiniMax", "half the price", "ByteDance", "own the moment"],
    "SoraEvidence7":    ["few billion dollars", "twenty percent", "finished clips", "left the one modality"],
    "SoraMidroll":      ["subscribe", "verdict in the first three minutes", "drop it in the comments"],
    "SoraEvidenceSays": ["four stacked ones", "brutal compute costs", "IPO clock", "they were fatal"],
    "SoraHonest2":      ["straight with you", "estimates", "several times higher", "reported number, not a bank statement"],
    "SoraHonest3":      ["Sora 2 wasn't bad", "world-simulation research", "robots that understand the physical world"],
    "SoraHonest4":      ["not total", "permanently deleted", "sora.chatgpt.com/sunset", "word if is doing real work"],
    "SoraHonest5":      ["side-quests quote", "not confirmed", "reporting, not confession"],
    "SoraClose":        ["catch, in one line", "two point one million", "deleting the data"],
    "SoraAction":       ["export it now", "migration deadline", "moving fastest"],
    "SoraOutro":        ["while the deadline still matters", "verdict lands here first", "two-million-versus-two-days", "MiniMax, ByteDance, or Google", "next one"],
}


def norm_phrase(t):
    return [re.sub(r"[^a-z0-9]+", "", w.lower()) for w in t.split()]


def cue_frames(beat):
    """all word start times in beat-local frames: [(phrase_text, frame)]"""
    out = []
    text = beat["text"].split()
    base = beat["start_wi"]
    for i, w in enumerate(text):
        st = words[base + i]["start"] / 1000.0
        out.append((norm_phrase(w)[0] if norm_phrase(w) else "", round((st - beat["start"]) * 30)))
    return out


result = []
prev_end = 0.0
for shot_id, beat_ids in SHOTS:
    beats = [b for b in plan if b["beat"] in beat_ids]
    start = min(b["start"] for b in beats)
    # shots tile the VO: extend start to previous shot's end (0.0 for the first)
    start = prev_end
    # contiguous spans from word positions; end = next beat's start, last = VO end
    first_words = [b for b in plan if b["beat"] in beat_ids]
    # find next beat start across ALL beats (in plan order) after the last merged beat
    idx_last = plan.index(beats[-1])
    end = plan[idx_last + 1]["start"] if idx_last + 1 < len(plan) else VO_END
    end = max(end, prev_end + 0.1)
    beats[0]["_local_start"] = start
    cues = {}
    for ph in CUE_HINTS.get(shot_id, []):
        # find phrase across the merged beats
        found = None
        for b in beats:
            text = [re.sub(r"[^a-z0-9]+", "", w.lower()) for w in b["text"].split()]
            want = norm_phrase(ph)
            for i in range(len(text) - len(want) + 1):
                if text[i:i + len(want)] == want:
                    st = words[b["start_wi"] + i]["start"] / 1000.0
                    found = round((st - start) * 30)
                    break
            if found is not None:
                break
        cues[ph] = found
    result.append({"shot": shot_id, "beats": beat_ids, "in": round(start, 2),
                   "out": round(end, 2), "dur": round(end - start, 2), "cues": cues})
    prev_end = end

json.dump(result, open(f"{ROOT}/shot-plan.json", "w", encoding="utf-8"), indent=1)
for s in result:
    print(f"{s['shot']:<16} {s['in']:>8.2f} {s['out']:>8.2f} dur {s['dur']:>6.2f}")
    for ph, f in s["cues"].items():
        print(f"    {ph!r}: f{f if f is not None else '???'}")
