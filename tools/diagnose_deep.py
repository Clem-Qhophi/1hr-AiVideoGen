#!/usr/bin/env python3
"""
Attempt to get a delegate token for The Forgotten Fix Brand Account
using the existing working credentials.

Strategy: Use the Google People API or YouTube API to check if
the current account manages The Forgotten Fix as a Brand Account,
then try to get credentials scoped to that channel.

Usage:
  python tools/diagnose_deep.py            # uses .youtube/token.json (repo root)
  python tools/diagnose_deep.py --token .youtube/token-home-hacks.json
"""
import argparse
import json
import pathlib
import sys
import requests
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

REPO = pathlib.Path(__file__).resolve().parent.parent


def main():
    ap = argparse.ArgumentParser(description="Deep channel-ownership diagnostics")
    ap.add_argument("--token", default=str(REPO / ".youtube" / "token.json"),
                    help="authorized-user token file (default .youtube/token.json)")
    args = ap.parse_args()

    token_file = pathlib.Path(args.token)
    if not token_file.exists():
        sys.exit(f"no token at {token_file} — run an auth flow first")
    creds = Credentials.from_authorized_user_file(str(token_file),
        ['https://www.googleapis.com/auth/youtube', 'https://www.googleapis.com/auth/youtube.upload'])

    if creds.expired and creds.refresh_token:
        creds.refresh(Request())

    headers = {"Authorization": f"Bearer {creds.token}"}

    # First: What does our current token's userinfo say?
    print("=== Checking userinfo with openid scope ===")
    # The token might not have openid scope, so let's try tokeninfo instead
    resp = requests.get(f"https://www.googleapis.com/oauth2/v3/tokeninfo?access_token={creds.token}")
    print(json.dumps(resp.json(), indent=2))

    # Method 4: Try YouTube API with delegation header
    # YouTube allows X-Goog-AuthUser header for Brand Account switching in some contexts
    FORGOTTEN_FIX_ID = "UCmxw_xOIA83c6PXoi9KNtig"
    print("\n=== Trying upload test with onBehalfOfContentOwnerChannel ===")
    from googleapiclient.discovery import build
    yt = build('youtube', 'v3', credentials=creds)

    # Check if we can update The Forgotten Fix channel (would prove ownership)
    print("\n=== Testing channel.update on The Forgotten Fix ===")
    try:
        # Try reading channel with elevated permissions
        r = yt.channels().list(id=FORGOTTEN_FIX_ID, part='snippet,statistics,contentDetails').execute()
        ch = r['items'][0]
        print(f"  Title: {ch['snippet']['title']}")
        print(f"  Subs: {ch.get('statistics', {}).get('subscriberCount', 'N/A')}")
        print(f"  Videos: {ch.get('statistics', {}).get('videoCount', 'N/A')}")
        print(f"  Views: {ch.get('statistics', {}).get('viewCount', 'N/A')}")
        print(f"  Uploads playlist: {ch.get('contentDetails', {}).get('relatedPlaylists', {}).get('uploads', 'N/A')}")
    except Exception as e:
        print(f"  Error: {e}")

    # The real question: is The Forgotten Fix under a DIFFERENT Google account?
    # If so, we need creds for THAT account.
    # Let's check the channel's published date and country
    print(f"\n=== Channel metadata clues ===")
    r2 = yt.channels().list(id=FORGOTTEN_FIX_ID, part='snippet').execute()
    ch2 = r2['items'][0]['snippet']
    print(f"  Country: {ch2.get('country', 'N/A')}")
    print(f"  Published: {ch2.get('publishedAt', 'N/A')}")
    print(f"  Custom URL: {ch2.get('customUrl', 'N/A')}")

    print("\n=== CONCLUSION ===")
    print(f"Token file: {token_file.name}")
    print("To upload to 'The Forgotten Fix', we need one of:")
    print("  1. A new OAuth token where user selects The Forgotten Fix Brand Account")
    print("  2. Upload to the main channel and transfer (not possible via API)")
    print("  3. The Forgotten Fix might be under a DIFFERENT Google account entirely")
    print()
    print("QUESTION: which Google account owns The Forgotten Fix?")


if __name__ == "__main__":
    main()
