#!/usr/bin/env python3
import pathlib
from google_auth_oauthlib.flow import InstalledAppFlow

REPO = pathlib.Path(__file__).resolve().parent.parent
CLIENT_SECRET = REPO / ".youtube" / "client_secret.json"
SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"]

flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRET), SCOPES, redirect_uri="http://localhost:8080/")
auth_url, _ = flow.authorization_url(prompt='consent', access_type='offline')

(REPO / "tools" / "latest_oauth_url.txt").write_text(auth_url, encoding="utf-8")
print("SUCCESS: Saved authorization URL to latest_oauth_url.txt")
