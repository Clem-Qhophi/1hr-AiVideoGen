#!/usr/bin/env python3
"""
Check if The Forgotten Fix channel is under the same Google account
by trying to list it via the existing token.

Usage:
  python tools/diagnose_channels.py                 # uses .youtube/token.json (main channel)
  python tools/diagnose_channels.py --token .youtube/token-home-hacks.json
"""
import argparse
import json
import pathlib
import sys
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

REPO = pathlib.Path(__file__).resolve().parent.parent
FORGOTTEN_FIX_ID = "UCmxw_xOIA83c6PXoi9KNtig"


def main():
    ap = argparse.ArgumentParser(description="Check channel access via an existing token")
    ap.add_argument("--token", default=str(REPO / ".youtube" / "token.json"),
                    help="authorized-user token file (default .youtube/token.json)")
    ap.add_argument("--channel-id", default=FORGOTTEN_FIX_ID,
                    help="channel to probe (default The Forgotten Fix)")
    args = ap.parse_args()

    token_file = pathlib.Path(args.token)
    if not token_file.exists():
        sys.exit(f"no token at {token_file} — run an auth flow first")
    creds = Credentials.from_authorized_user_file(str(token_file),
        ['https://www.googleapis.com/auth/youtube', 'https://www.googleapis.com/auth/youtube.upload'])

    if creds.expired and creds.refresh_token:
        creds.refresh(Request())

    yt = build('youtube', 'v3', credentials=creds)

    print(f"=== Channel details ({args.channel_id}) via {token_file.name} ===")
    r = yt.channels().list(id=args.channel_id, part='snippet,status,brandingSettings,contentOwnerDetails').execute()
    for ch in r.get('items', []):
        print(json.dumps(ch, indent=2))

    print("\n=== Trying forHandle=@TheForgottenFix ===")
    try:
        r2 = yt.channels().list(forHandle='@TheForgottenFix', part='snippet,id').execute()
        for ch in r2.get('items', []):
            print(f"  ID: {ch['id']}  Name: {ch['snippet']['title']}")
    except Exception as e:
        print(f"  Error: {e}")

    print("\n=== Current Google Account (via oauth2 userinfo) ===")
    import requests as req
    headers = {"Authorization": f"Bearer {creds.token}"}
    resp = req.get("https://www.googleapis.com/oauth2/v1/userinfo", headers=headers)
    if resp.status_code == 200:
        info = resp.json()
        print(f"  Email: {info.get('email', 'N/A')}")
        print(f"  Name: {info.get('name', 'N/A')}")
        print(f"  ID: {info.get('id', 'N/A')}")
    else:
        print(f"  Status {resp.status_code}: {resp.text}")


if __name__ == "__main__":
    main()
