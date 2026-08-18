#!/usr/bin/env python3
import sys
from pathlib import Path
from google_auth_oauthlib.flow import InstalledAppFlow

REPO = Path(__file__).resolve().parent.parent
CLIENT_SECRET = REPO / ".youtube" / "client_secret.json"
SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"]

def main():
    flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRET), SCOPES)
    auth_url, _ = flow.authorization_url(prompt='consent')
    print("--- OAUTH URL BELOW ---")
    print(auth_url)
    print("--- OAUTH URL ABOVE ---")

if __name__ == "__main__":
    main()
