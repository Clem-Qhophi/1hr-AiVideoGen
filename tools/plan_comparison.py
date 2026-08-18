#!/usr/bin/env python3
"""
plan_comparison.py — Automated Project Scaffolding for Extreme Comparison Videos.

Creates a complete project folder with:
  - work/data-sheet.md (2-source stat verification matrix)
  - work/script.md (Commentator / Auctioneer structured script)
  - work/spec.json (Render & channel configuration)
  - work/sfx-plan.json (Arena sound effects: gavels, roars, whistles, ticks)

Usage:
  python tools/plan_comparison.py "Top 10 Richest People in History" --format ladder --project rich-history-ladder
  python tools/plan_comparison.py "Bugatti Chiron vs F-16 Jet" --format showdown --project bugatti-vs-f16
  python tools/plan_comparison.py "Billionaire Mega-Yacht Bidding War" --format auction --project yacht-bidding-war
  python tools/plan_comparison.py "Messi vs Ronaldo Final Showdown" --format showdown --shorts
"""

import argparse
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Windows console encoding fix
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


LADDER_SCRIPT_TEMPLATE = """# {topic} — Narration Script

Format: The Escalation Ladder (1-to-10 Scale Climb)
Voice: THE ARENA COMMENTATOR (High-octane, dynamic speedup, dramatic pauses)
Niche: comparisons-showdown

## Hook & Roadmap — 0:00-0:18 [C0_COLD_OPEN]

Level one starts simple. But by Level eight, things get completely illegal. And Level ten will break your brain.

This is the ultimate {topic_lower} comparison.

Let's start the countdown!

[beat: ladder title card, arena lights flare, countdown stinger]

## Level 1 to 3 — The Human Scale — 0:18-1:30 [C2_LADDER_CLIMB]

Level one: [ITEM 1].
Coming in at [VALUE 1].
It looks impressive to the average person, but compared to what's coming, it is practically zero!

Level two: [ITEM 2].
Jumping to [VALUE 2]! That is ten times bigger in a single step!

Level three: [ITEM 3].
[VALUE 3]! Now we are leaving ordinary territory behind!

[beat: scale ladder zoom, animated bars rising rapidly]

## Level 4 to 6 — The Planetary Tier — 1:30-3:00 [C2_LADDER_CLIMB] [C1_AUCTION_BID]

Level four: [ITEM 4] at [VALUE 4]!
Look at that bar explode past the previous records!

Level five: [ITEM 5].
[VALUE 5]! The sheer scale is starting to bend the charts!

Level six: [ITEM 6].
[VALUE 6]! We are now at a level where only the top point-zero-one percent can even compete!

[beat: dynamic 3D scale zoom, stadium roars, particle pulse]

## Level 7 to 9 — The Insane Zone — 3:00-5:00 [C4_MIND_BENDER] [C3_GOAL_CLIMAX]

Level seven: [ITEM 7] at [VALUE 7]!
Let that number sink in. If you counted this out one second at a time, it would take centuries!

Level eight: [ITEM 8].
[VALUE 8]! HE HAS OBLITERATED THE ENTIRE CHART!

Level nine: [ITEM 9] at [VALUE 9]!
This isn't just huge — this is a statistical anomaly that shouldn't even exist!

[beat: leaderboard frenzy, siren stinger, bass drop]

## Level 10 — The Ultimate Apex — 5:00-6:30 [C4_MIND_BENDER] [C5_GAVEL_SLAM]

And now... Level ten. The final apex.

[ITEM 10].
A staggering, incomprehensible [VALUE 10]!

That is more than all previous nine levels combined.

The debate is over. The champion has been crowned.

And the numbers have settled it.

## Verdict & Community CTA — 6:30-7:00

Which level surprised you the most? Drop your vote in the comments below, subscribe for the next extreme showdown, and tell us who should enter the arena next!
"""

SHOWDOWN_SCRIPT_TEMPLATE = """# {topic} — Narration Script

Format: 1v1 Showdown (Head-to-Head Clash)
Voice: THE ARENA COMMENTATOR (High-octane, dynamic speedup, dramatic pauses)
Niche: comparisons-showdown

## Cold Open — 0:00-0:20 [C0_COLD_OPEN]

Two undisputed titans. One arena. And a mountain of verified data.

This is {topic}.

Forget opinions. Forget hype. The numbers are about to settle this once and for all!

[beat: 3D battle card clash, neon sparks, whistle stinger]

## Tale of the Tape — 0:20-0:50

On the left: [COMBATANT A].
On the right: [COMBATANT B].

We are scoring them across five high-stakes categories. Every round decided by verified metrics.

The referee has the cards. Round one starts NOW!

## Round 1 — Raw Volume & Power — 0:50-1:50 [C3_GOAL_CLIMAX]

Round one: [CATEGORY 1].
[COMBATANT A] opens strong with [VALUE A1]!
AND [COMBATANT B] FIRES BACK WITH [VALUE B1]!

Look at the surge! [WINNER 1] takes the first round! One to nothing!

[beat: split bar meter animation, scoreboard point flash]

## Round 2 — Speed & Efficiency — 1:50-3:00 [C1_AUCTION_BID]

Round two: [CATEGORY 2].
This is where the contest gets intense.
[COMBATANT A] hits [VALUE A2]. [COMBATANT B] clocks in at [VALUE B2]!

The lead changes hands! We are tied up!

[beat: speedometer gauge revving into redline]

## Round 3 — The Contested Marquee — 3:00-4:30 [C6_PHOTO_FINISH]

Round three: [CATEGORY 3].
The closest category in the entire matchup.
Look at the margin! They are neck and neck, separated by a razor-thin fraction!

And by the slimmest edge... [WINNER 3] pulls ahead!

## Round 4 & 5 — The Climax & Final Verdict — 4:30-6:00 [C4_MIND_BENDER] [C5_GAVEL_SLAM]

Final round. Double stakes.

Everything comes down to this single metric: [FINAL CATEGORY].
[COMBATANT A] posts [VALUE A_FINAL].
AND [COMBATANT B] OBLITERATES THE RECORD WITH [VALUE B_FINAL]!

THE FINAL WHISTLE BLOWS! [OVERALL WINNER] TAKES THE CHAMPIONSHIP BELT!

And the numbers have settled it.

## Outro & CTA — 6:00-6:30

Did the right side take the belt? Let us know in the comments, subscribe to The Comparison Arena, and drop your matchup requests for the next title fight!
"""

AUCTION_SCRIPT_TEMPLATE = """# {topic} — Narration Script

Format: High-Stakes Auction Bidding War
Voice: THE AUCTIONEER & SCOREKEEPER
Niche: comparisons-showdown

## Opening Gavel Strike — 0:00-0:20 [C0_COLD_OPEN] [C5_GAVEL_SLAM]

[beat: gavel slam impact, shockwave ring, cash register chime]

Ladies and gentlemen, welcome to the auction floor. Today, we are putting the most extreme assets on the block.

Starting bids open at [STARTING VALUE].

Fasten your seatbelts, because this bidding war is about to get insane!

## The Bidding Frenzy — 0:20-2:30 [C1_AUCTION_BID]

Opening bid: [BIDDER 1] with [VALUE 1]!
Do I hear [VALUE 2]? YES! [BIDDER 2] jumps in at [VALUE 2]!

Look at the ticker climb! We got [VALUE 3] on the left, [VALUE 4] on the right!
Going up, climbing fast! Look at the numbers race past the billion-dollar mark!

[beat: auction ticker rolling furiously, bidder badges flashing]

## The Titan Showdown — 2:30-4:00 [C1_AUCTION_BID] [C4_MIND_BENDER]

We are now in uncharted territory!
[BIDDER A] bids [INSANE VALUE A]!
CAN ANYONE MATCH THAT?

[BIDDER B] COUNTERS AT [INSANE VALUE B]!
The entire floor is in shock! That is the largest bid in recorded history!

## Final Warning & Gavel Slam — 4:00-5:00 [C5_GAVEL_SLAM]

Fair warning to the floor!

Going once at [FINAL VALUE]...
Going twice...

[beat: silence 0.6s, heartbeat thump]

SOLD! To [WINNING BIDDER] for [FINAL VALUE]!

[beat: gavel strike, confetti burst, crowd cheer]

And the gavel has spoken.
"""


def main():
    parser = argparse.ArgumentParser(description="Scaffold an Extreme Comparison Video Project")
    parser.add_argument("topic", help="Title / topic of the comparison (e.g. 'Top 10 Richest Tech Titans')")
    parser.add_argument("--format", choices=["ladder", "showdown", "auction"], default="ladder", help="Comparison format")
    parser.add_argument("--project", help="Custom project slug (defaults to slugified topic)")
    parser.add_argument("--shorts", action="store_true", help="Generate for 9:16 vertical Shorts")

    args = parser.parse_args()

    slug = args.project or args.topic.lower().replace(" ", "-").replace(":", "").replace("'", "")
    project_dir = ROOT / "videos" / slug
    work_dir = project_dir / "work"
    audio_dir = work_dir / "audio"
    images_dir = work_dir / "images"
    packaging_dir = project_dir / "packaging"

    for d in [work_dir, audio_dir, images_dir, packaging_dir]:
        d.mkdir(parents=True, exist_ok=True)

    # 1. Generate Script
    if args.format == "ladder":
        script_text = LADDER_SCRIPT_TEMPLATE.format(topic=args.topic, topic_lower=args.topic.lower())
    elif args.format == "showdown":
        script_text = SHOWDOWN_SCRIPT_TEMPLATE.format(topic=args.topic)
    else:
        script_text = AUCTION_SCRIPT_TEMPLATE.format(topic=args.topic)

    (work_dir / "script.md").write_text(script_text, encoding="utf-8")

    # 2. Generate Data Sheet
    data_sheet_text = f"""# Data Sheet — {args.topic}

> Mandatory Two-Source Rule: Every metric must be verified against at least 2 independent verified sources before production.

| Entity / Level | Metric / Value | Unit | Source 1 (URL/Citation) | Source 2 (URL/Citation) | Verified By |
|---|---|---|---|---|---|
| Level 1 / Entity A | | | | | |
| Level 2 / Entity B | | | | | |
| Level 3 / Entity C | | | | | |
| Level 4 / Entity D | | | | | |
| Level 5 / Entity E | | | | | |

## Verification Notes
- All financial figures date-stamped as of current year.
- Uncertain estimates labeled as 'estimate' on screen and in narration.
"""
    (work_dir / "data-sheet.md").write_text(data_sheet_text, encoding="utf-8")

    # 3. Generate Spec
    spec = {
        "project": slug,
        "niche": "comparisons-showdown",
        "format": args.format,
        "aspect_ratio": "9:16" if args.shorts else "16:9",
        "fps": 60 if args.shorts else 30,
        "width": 1080 if args.shorts else 1920,
        "height": 1920 if args.shorts else 1080,
        "voice": {
            "name": "Christopher (Edge-TTS)",
            "voice_id": "en-US-ChristopherNeural",
            "speed": 1.25,
            "pitch": "+6Hz"
        },
        "audio": {
            "music_bed": "arena-pulse",
            "bed_gain_db": -7,
            "sfx_density": "high"
        }
    }
    (work_dir / "spec.json").write_text(json.dumps(spec, indent=2), encoding="utf-8")

    # 4. Generate SFX Plan
    sfx_plan = {
        "palette": ["gavel-strike", "crowd-roar", "stadium-chant", "whistle-blast", "cash-register", "countdown-tick", "bass-drop"],
        "cues": [
            {"time_sec": 0.0, "sfx": "whistle-blast", "volume": 0.8},
            {"time_sec": 0.5, "sfx": "crowd-roar", "volume": 0.6},
            {"time_sec": 15.0, "sfx": "countdown-tick", "volume": 0.5},
            {"time_sec": 45.0, "sfx": "cash-register", "volume": 0.7},
            {"time_sec": 90.0, "sfx": "gavel-strike", "volume": 0.9}
        ]
    }
    (work_dir / "sfx-plan.json").write_text(json.dumps(sfx_plan, indent=2), encoding="utf-8")

    print(f"🎯 Extreme Comparison Project Scaffolding Created!")
    print(f"   Directory: {project_dir.relative_to(ROOT)}")
    print(f"   Format:    {args.format.upper()} ({spec['aspect_ratio']})")
    print(f"\nNext Steps:")
    print(f"   1. Fill data points in {work_dir.relative_to(ROOT)}/data-sheet.md")
    print(f"   2. Polish narration in  {work_dir.relative_to(ROOT)}/script.md")
    print(f"   3. Synthesize VO:       python tools/tts_commentator.py {project_dir.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
