#!/usr/bin/env python3
import json
import sys
import requests
import pathlib
import urllib.parse

REPO = pathlib.Path(__file__).resolve().parent.parent
YT_DIR = REPO / ".youtube"
CLIENT_SECRET_FILE = YT_DIR / "client_secret.json"
TOKEN_HOME = YT_DIR / "token-home-hacks.json"
TOKEN_MAIN = YT_DIR / "token.json"

secret_data = json.loads(CLIENT_SECRET_FILE.read_text(encoding="utf-8"))["installed"]
client_id = secret_data["client_id"]
client_secret = secret_data["client_secret"]
token_uri = secret_data["token_uri"]

def get_auth_url():
    params = {
        "client_id": client_id,
        "redirect_uri": "http://localhost",
        "response_type": "code",
        "scope": "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube",
        "prompt": "select_account consent",
        "access_type": "offline"
    }
    return "https://accounts.google.com/o/oauth2/auth?" + urllib.parse.urlencode(params)

def exchange_code(raw_input):
    code = raw_input.strip()
    if "code=" in raw_input:
        parsed = urllib.parse.parse_qs(urllib.parse.urlparse(raw_input).query)
        if "code" in parsed:
            code = parsed["code"][0]
            
    res = requests.post(token_uri, data={
        "code": code,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": "http://localhost",
        "grant_type": "authorization_code"
    })
    
    if res.status_code != 200:
        print(f"[ERR] Exchange failed ({res.status_code}): {res.text}")
        return False
        
    token_data = res.json()
    creds_format = {
        "token": token_data.get("access_token"),
        "refresh_token": token_data.get("refresh_token"),
        "token_uri": token_uri,
        "client_id": client_id,
        "client_secret": client_secret,
        "scopes": ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"],
        "universe_domain": "googleapis.com"
    }
    
    YT_DIR.mkdir(exist_ok=True)
    TOKEN_HOME.write_text(json.dumps(creds_format, indent=2), encoding="utf-8")
    TOKEN_MAIN.write_text(json.dumps(creds_format, indent=2), encoding="utf-8")
    print("[OK] Token saved successfully to token-home-hacks.json and token.json!")
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        exchange_code(sys.argv[1])
    else:
        print("URL:", get_auth_url())
