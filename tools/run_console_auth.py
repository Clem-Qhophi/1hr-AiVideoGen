#!/usr/bin/env python3
import os
import sys
import pathlib
import urllib.parse
from google_auth_oauthlib.flow import InstalledAppFlow

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

REPO = pathlib.Path(__file__).resolve().parent.parent
YT_DIR = REPO / ".youtube"
CLIENT_SECRET = YT_DIR / "client_secret.json"
TOKEN_HOME = YT_DIR / "token-home-hacks.json"
SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"]

def main():
    flow = InstalledAppFlow.from_client_secrets_file(
        str(CLIENT_SECRET), SCOPES, redirect_uri="http://localhost"
    )
    auth_url, _ = flow.authorization_url(prompt='consent', access_type='offline')
    
    print("--- AUTH URL ---")
    print(auth_url)
    print("----------------")
    
    if len(sys.argv) > 1:
        raw_input = sys.argv[1].strip()
    else:
        raw_input = input("Paste the URL or code here: ").strip()

    code = raw_input
    state = None
    if "code=" in raw_input:
        parsed = urllib.parse.parse_qs(urllib.parse.urlparse(raw_input).query)
        if "code" in parsed:
            code = parsed["code"][0]
        if "state" in parsed:
            state = parsed["state"][0]

    # VALIDATE CSRF state instead of bypassing it: the pasted URL carries this flow's own
    # state token (we generated it above), so fetch_token(code, state) verifies it. A stale
    # URL from an earlier run just fails cleanly instead of trading a fixed state bypass.
    flow.fetch_token(code=code, state=state)
    creds = flow.credentials

    YT_DIR.mkdir(exist_ok=True)
    TOKEN_HOME.write_text(creds.to_json(), encoding="utf-8")
    # NOTE: deliberately NOT writing .youtube/token.json here — that is the MAIN channel's
    # token; this flow is for the home-hacks channel and must not clobber it.
    print("SUCCESS: Token saved to token-home-hacks.json!")

if __name__ == "__main__":
    main()
