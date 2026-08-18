#!/usr/bin/env python3
"""
Simple manual auth: opens browser, user copies the redirect URL back.
No local server needed. Optional --login-hint pre-selects the Google account.
"""
import os
import sys
import json
import pathlib
import urllib.parse
import requests as req

REPO = pathlib.Path(__file__).resolve().parent.parent
YT_DIR = REPO / ".youtube"
SECRET = json.loads((YT_DIR / "client_secret.json").read_text(encoding="utf-8"))["installed"]
TOKEN_HOME = YT_DIR / "token-home-hacks.json"

CLIENT_ID = SECRET["client_id"]
CLIENT_SECRET = SECRET["client_secret"]
TOKEN_URI = SECRET["token_uri"]
REDIRECT_URI = "http://localhost"  # No server needed - just catches the URL

SCOPES = "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube"

def get_auth_url(login_hint=None):
    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": SCOPES,
        "access_type": "offline",
        "prompt": "consent",
    }
    # optional pre-selection; when absent Google shows the account picker
    if login_hint:
        params["login_hint"] = login_hint
    return "https://accounts.google.com/o/oauth2/auth?" + urllib.parse.urlencode(params)

def exchange(code):
    resp = req.post(TOKEN_URI, data={
        "code": code,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code",
    })
    if resp.status_code != 200:
        print(f"[ERR] Token exchange failed: {resp.status_code} {resp.text}")
        return False

    data = resp.json()
    token = {
        "token": data["access_token"],
        "refresh_token": data.get("refresh_token"),
        "token_uri": TOKEN_URI,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "scopes": SCOPES.split(),
        "universe_domain": "googleapis.com",
    }
    YT_DIR.mkdir(exist_ok=True)
    TOKEN_HOME.write_text(json.dumps(token, indent=2), encoding="utf-8")
    print("[OK] Token saved to .youtube/token-home-hacks.json!")

    # Verify channel
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    creds = Credentials.from_authorized_user_file(str(TOKEN_HOME))
    yt = build("youtube", "v3", credentials=creds)
    r = yt.channels().list(mine=True, part="snippet").execute()
    for ch in r.get("items", []):
        print(f"[OK] Channel: {ch['snippet']['title']} ({ch['id']})")
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Called with the redirect URL or code
        raw = sys.argv[1].strip()
        code = raw
        if "code=" in raw:
            parsed = urllib.parse.parse_qs(urllib.parse.urlparse(raw).query)
            if "code" in parsed:
                code = parsed["code"][0]
        exchange(code)
    else:
        hint = None
        for i, a in enumerate(sys.argv):
            if a == "--login-hint" and i + 1 < len(sys.argv):
                hint = sys.argv[i + 1]
        url = get_auth_url(login_hint=hint)
        print("Opening browser...")
        try:
            os.startfile(url)
        except Exception:
            pass
        print()
        print("SIGN-IN URL:")
        print(url)
        print()
        if hint:
            print(f"Pre-selected account: {hint}")
        else:
            print("Tip: pass --login-hint <email> to pre-select the channel's Google account")
        print()
        print("After clicking Allow, your browser will redirect to")
        print("http://localhost/?code=... (page won't load, that's OK)")
        print()
        print("Copy the FULL URL from the address bar and run:")
        print(f'  venv\\Scripts\\python tools/auth_manual.py "PASTE_URL_HERE"')
