#!/usr/bin/env python3
import os
import sys
import json
import time
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root / "tools"))
import yt_upload

projects = [
    ("diatomaceous-earth-truth", "$8 Powder Kills Bugs Without Poison"),
    ("garden-pest-truth", "Amish Secret to Banning Pests"),
    ("mosquito-trap-truth", "Why Your Mosquito Trap Doesn't Work"),
    ("water-heater-flush-truth", "Your Water Heater Is Quietly Overheating"),
    ("hydrogen-peroxide-truth", "The Brown Bottle In Your Cabinet"),
    ("fire-extinguisher-truth", "The Fire Extinguisher Under Your Sink Might Be Dead"),
    ("car-battery-backup-power", "The Generator You Already Own")
]

print("=" * 80)
print("     UPLOADING 28 SHORTS DIRECTLY TO 'THE FORGOTTEN FIX' (PRIVATE DRAFTS)")
print("=" * 80)

# 1. Confirm channel identity first
yt_service = yt_upload.service()
ch_resp = yt_service.channels().list(part="snippet", mine=True).execute()
items = ch_resp.get("items", [])
if not items:
    sys.exit("ERROR: No channel found for current credentials.")

channel_title = items[0]["snippet"]["title"]
channel_id = items[0]["id"]
print(f"AUTHENTICATED TARGET CHANNEL: '{channel_title}' (ID: {channel_id})\n")

if "Forgotten Fix" not in channel_title:
    sys.exit(f"ABORTED: Channel title '{channel_title}' is NOT 'The Forgotten Fix'!")

results = []
count = 0

for slug, parent_title in projects:
    print(f"\n📂 Project: [{slug}] '{parent_title}'")
    for cid in ["01", "02", "03", "04"]:
        count += 1
        plan_path = root / "videos" / slug / "shorts" / cid / "packaging" / "publish.json"
        
        if not plan_path.exists():
            print(f"  [{count}/28] Clip {cid}: ERROR plan not found: {plan_path}")
            continue
            
        plan = yt_upload.load_plan(plan_path)
        title = plan.get("title", "")
        print(f"\n[{count}/28] Uploading Short {cid}: '{title}' ...")
        
        # Check if already published
        published_path = plan_path.parent / "published.json"
        if published_path.exists():
            try:
                pub_data = json.loads(published_path.read_text(encoding="utf-8"))
                vid = pub_data.get("videoId")
                if vid:
                    print(f"  ⏩ ALREADY UPLOADED -> https://youtu.be/{vid}")
                    results.append({
                        "slug": slug,
                        "clip_id": cid,
                        "title": title,
                        "status": "ALREADY_UPLOADED",
                        "videoId": vid,
                        "url": f"https://studio.youtube.com/video/{vid}/edit",
                        "watch_url": f"https://youtu.be/{vid}"
                    })
                    continue
            except:
                pass
                
        start_t = time.time()
        try:
            yt_upload.do_upload(plan, plan_path=plan_path)
            elapsed = time.time() - start_t
            
            # Read generated published.json
            pub_data = json.loads(published_path.read_text(encoding="utf-8"))
            vid = pub_data.get("videoId")
            
            print(f"  ✅ SUCCESS ({elapsed:.1f}s) -> https://youtu.be/{vid}")
            results.append({
                "slug": slug,
                "clip_id": cid,
                "title": title,
                "status": "SUCCESS",
                "videoId": vid,
                "url": f"https://studio.youtube.com/video/{vid}/edit",
                "watch_url": f"https://youtu.be/{vid}",
                "time_sec": round(elapsed, 1)
            })
        except Exception as e:
            elapsed = time.time() - start_t
            print(f"  ❌ FAILED ({elapsed:.1f}s): {e}")
            results.append({
                "slug": slug,
                "clip_id": cid,
                "title": title,
                "status": "FAILED",
                "error": str(e)
            })

summary_file = root / "videos" / "shorts_upload_summary.json"
summary_file.write_text(json.dumps(results, indent=2), encoding="utf-8")

success_count = sum(1 for r in results if r.get("status") in ("SUCCESS", "ALREADY_UPLOADED"))
print("\n" + "=" * 80)
print(f"UPLOAD RUN COMPLETED: {success_count} / 28 UPLOADED TO '{channel_title}'")
print(f"Summary JSON: {summary_file}")
print("=" * 80)
