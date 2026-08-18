#!/usr/bin/env python3
import os
import pathlib
from google_auth_oauthlib.flow import InstalledAppFlow

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'

REPO = pathlib.Path(__file__).resolve().parent.parent
YT_DIR = REPO / ".youtube"
CLIENT_SECRET = YT_DIR / "client_secret.json"
TOKEN_HOME = YT_DIR / "token-home-hacks.json"
TOKEN_MAIN = YT_DIR / "token.json"
SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"]

def main():
    flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRET), SCOPES)
    creds = flow.run_local_server(port=8080, prompt='consent')
    
    YT_DIR.mkdir(exist_ok=True)
    TOKEN_HOME.write_text(creds.to_json())
    TOKEN_MAIN.write_text(creds.to_json())
    print("SUCCESS: Token saved to token-home-hacks.json and token.json!")

if __name__ == "__main__":
    main()
