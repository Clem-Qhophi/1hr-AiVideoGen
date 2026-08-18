#!/usr/bin/env python3
import os
import sys
import json
import pathlib
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'

REPO = pathlib.Path(__file__).resolve().parent.parent
YT_DIR = REPO / ".youtube"
CLIENT_SECRET = YT_DIR / "client_secret.json"
TOKEN_HOME = YT_DIR / "token-home-hacks.json"
TOKEN_MAIN = YT_DIR / "token.json"
SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"]

def main():
    print("Starting OAuth authorization for 'The Forgotten Fix' channel...")
    flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRET), SCOPES)
    creds = flow.run_local_server(port=8080, prompt='consent')
    
    YT_DIR.mkdir(exist_ok=True)
    TOKEN_HOME.write_text(creds.to_json(), encoding="utf-8")
    TOKEN_MAIN.write_text(creds.to_json(), encoding="utf-8")
    print("\nToken saved to token-home-hacks.json and token.json!")
    
    # Confirm channel
    yt = build("youtube", "v3", credentials=creds)
    resp = yt.channels().list(part="snippet", mine=True).execute()
    items = resp.get("items", [])
    if items:
        title = items[0]["snippet"]["title"]
        print(f"AUTHENTICATED CHANNEL: '{title}' (ID: {items[0]['id']})")
    else:
        print("WARNING: No channel returned.")

if __name__ == "__main__":
    main()
