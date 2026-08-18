#!/usr/bin/env python3
"""
delete_misplaced_videos.py - Deletes the 4 mistakenly uploaded private drafts from the legacy channel.
"""
import os
import sys
from pathlib import Path
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

REPO = Path(__file__).resolve().parent.parent
YT_DIR = REPO / ".youtube"
TOKEN = YT_DIR / "token.json"
SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"]

VIDEO_IDS = ["TenryYi4kjc", "wEJl1LVbDLg", "2DQbk_JaTvQ", "cDrkC_0QGnM"]

def cleanup():
    if not TOKEN.exists():
        print("No legacy token found.")
        return
        
    creds = Credentials.from_authorized_user_file(TOKEN, SCOPES)
    yt = build("youtube", "v3", credentials=creds)
    
    for vid in VIDEO_IDS:
        try:
            yt.videos().delete(id=vid).execute()
            print(f"[OK] Deleted misplaced video {vid} from legacy channel.")
        except Exception as e:
            print(f"[ERR] Could not delete video {vid}: {e}")

if __name__ == "__main__":
    cleanup()
