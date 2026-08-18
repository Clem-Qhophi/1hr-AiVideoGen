#!/usr/bin/env python3
"""
OAuth flow for The Forgotten Fix channel.
Uses run_local_server() cleanly (no separate authorization_url call).
Force-opens browser via os.startfile on Windows as fallback.
"""
import os
import sys
import json
import pathlib
import webbrowser
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# run_local_server serves the callback on plain http://localhost — google-auth-oauthlib
# refuses insecure transport without this (same env convention as run_auth_flow.py).
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'

REPO = pathlib.Path(__file__).resolve().parent.parent
YT_DIR = REPO / ".youtube"
CLIENT_SECRET = YT_DIR / "client_secret.json"
TOKEN_HOME = YT_DIR / "token-home-hacks.json"
SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube"
]

# Monkey-patch webbrowser to also use os.startfile and print URL
_original_open = webbrowser.open
def _patched_open(url, new=0, autoraise=True):
    print()
    print("=" * 70)
    print("OPEN THIS URL IN YOUR BROWSER IF IT DOESN'T OPEN AUTOMATICALLY:")
    print("=" * 70)
    print(url)
    print("=" * 70)
    print()
    sys.stdout.flush()
    # Try os.startfile first (most reliable on Windows)
    try:
        os.startfile(url)
        print("[INFO] Browser opened via os.startfile")
    except Exception as e1:
        try:
            _original_open(url, new=new, autoraise=autoraise)
            print("[INFO] Browser opened via webbrowser.open")
        except Exception as e2:
            print(f"[WARN] Could not open browser: {e1} / {e2}")
            print("       Copy the URL above and open it in your browser.")
    sys.stdout.flush()
    return True

# Patch webbrowser module so run_local_server uses our version
webbrowser.open = _patched_open
# Also patch the get().open path
class _PatchedBrowser:
    def open(self, url, new=0, autoraise=True):
        return _patched_open(url, new, autoraise)
_orig_get = webbrowser.get
def _patched_get(using=None):
    return _PatchedBrowser()
webbrowser.get = _patched_get

print("Starting OAuth flow for The Forgotten Fix...")
print("A browser window will open. Please:")
print("  1. Select your Google account")
print("  2. Click 'Advanced' -> 'Go to ai-under-3 (unsafe)' if warned")
print("  3. Click 'Allow'")
print("  4. Pick 'The Forgotten Fix' channel if asked")
print()
sys.stdout.flush()

flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRET), SCOPES)

# run_local_server handles everything: URL generation, browser, callback, token exchange
creds = flow.run_local_server(
    port=8080,
    open_browser=True,
    authorization_prompt_message="Waiting for authorization on http://localhost:8080/ ...",
    success_message="Authorization complete! You can close this tab now.",
    prompt="consent"  # passed through to authorization_url via **kwargs
)

YT_DIR.mkdir(exist_ok=True)
TOKEN_HOME.write_text(creds.to_json(), encoding="utf-8")
print()
print("[OK] Token saved to .youtube/token-home-hacks.json")

# Verify which channel we authenticated as
yt = build('youtube', 'v3', credentials=creds)
r = yt.channels().list(mine=True, part='snippet').execute()
for ch in r.get('items', []):
    name = ch['snippet']['title']
    cid = ch['id']
    print(f"[OK] Authenticated as: {name} ({cid})")
    if "Forgotten Fix" in name:
        print("[SUCCESS] Correct channel! Ready to upload shorts.")
    else:
        print(f"[WARN] Got '{name}' instead of 'The Forgotten Fix'.")
        print("       Delete .youtube/token-home-hacks.json and re-run,")
        print("       selecting the correct Brand Account this time.")
