#!/usr/bin/env python3
import os
import sys
import json
import urllib.parse
import urllib.request
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
YT_DIR = REPO / ".youtube"
CLIENT_SECRET_FILE = YT_DIR / "client_secret.json"
TOKEN_HOME = YT_DIR / "token-home-hacks.json"
TOKEN_MAIN = YT_DIR / "token.json"

with open(CLIENT_SECRET_FILE, "r", encoding="utf-8") as f:
    secret_data = json.load(f)
    client_config = secret_data.get("installed") or secret_data.get("web")

CLIENT_ID = client_config["client_id"]
CLIENT_SECRET = client_config["client_secret"]
REDIRECT_URI = "http://localhost:8080/"
SCOPES = "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube"

AUTH_URL = (
    "https://accounts.google.com/o/oauth2/auth?"
    + urllib.parse.urlencode({
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": SCOPES,
        "access_type": "offline",
        "prompt": "consent"
    })
)

captured_code = None

class OAuthCallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        global captured_code
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        
        if "code" in params:
            captured_code = params["code"][0]
            self.send_response(200)
            self.send_header("Content-type", "text/html; charset=utf-8")
            self.end_headers()
            html = """
            <html>
            <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #0f172a; color: #f8fafc;">
                <h1 style="color: #22c55e;">✅ Authorization Received!</h1>
                <p style="font-size: 18px;">Exchanging token and verifying channel...</p>
                <p style="color: #94a3b8;">You can now close this tab and return to the terminal.</p>
            </body>
            </html>
            """
            self.wfile.write(html.encode("utf-8"))
        else:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"No code received.")
            
    def log_message(self, format, *args):
        pass

def exchange_code_for_token(code):
    data = urllib.parse.urlencode({
        "code": code,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code"
    }).encode("utf-8")
    
    req = urllib.request.Request("https://oauth2.googleapis.com/token", data=data, method="POST")
    with urllib.request.urlopen(req) as resp:
        tokens = json.loads(resp.read().decode("utf-8"))
    
    token_json = {
        "token": tokens.get("access_token"),
        "refresh_token": tokens.get("refresh_token"),
        "token_uri": "https://oauth2.googleapis.com/token",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "scopes": SCOPES.split()
    }
    
    YT_DIR.mkdir(exist_ok=True)
    TOKEN_HOME.write_text(json.dumps(token_json, indent=2), encoding="utf-8")
    TOKEN_MAIN.write_text(json.dumps(token_json, indent=2), encoding="utf-8")
    print("SUCCESS: Saved tokens to token-home-hacks.json and token.json")
    
    # Verify channel title
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    creds = Credentials.from_authorized_user_info(token_json)
    yt = build("youtube", "v3", credentials=creds)
    r = yt.channels().list(part="snippet", mine=True).execute()
    items = r.get("items", [])
    if items:
        title = items[0]["snippet"]["title"]
        cid = items[0]["id"]
        print(f"\n=======================================================")
        print(f"AUTHENTICATED CHANNEL: '{title}' (ID: {cid})")
        print(f"=======================================================\n")
    return token_json

def main():
    print("\n--- OAUTH URL ---")
    print(AUTH_URL)
    print("-----------------\n")
    
    # Try opening browser
    try:
        webbrowser.open(AUTH_URL)
    except:
        pass
        
    server = HTTPServer(("localhost", 8080), OAuthCallbackHandler)
    print("Listening on http://localhost:8080/ for OAuth callback...")
    while not captured_code:
        server.handle_request()
        
    print("Received code, exchanging with Google...")
    exchange_code_for_token(captured_code)

if __name__ == "__main__":
    main()
