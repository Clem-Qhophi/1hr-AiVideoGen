#!/usr/bin/env python3
"""
yt_comment.py — post the redirect comment on a published Short, and guide the pin.

The Short's description carries the long-form link on line 1 (written by
tools/clip_shorts.py package), but Shorts viewers read comments, not descriptions.
This posts a comment on the SHORT whose first words are the long-form link, so the
"watch the full video" redirect exists in the place a swiping viewer actually looks.

PINNING — there is no API for it. The YouTube Data API can insert a comment but cannot
pin one (pinning is a Studio/app-only action, unlike the API's mythos). So this tool
posts the comment and then tells you exactly where to tap to pin it. It posts nothing
without the video being PUBLIC — the comments API rejects comments on private drafts.

Setup (one-time, re-auth, needs the browser — adds youtube.force-ssl to the token):
  python tools/yt_comment.py auth --channel ai-news       # separate comment token

Usage:
  python tools/yt_comment.py post shorts/ai-kill-switch-1   # uses the Short's published.json
  python tools/yt_comment.py post --video-id _y6YnTFsNbM --text "..." --channel ai-news

The posted comment text defaults to:
  Full video: <long-form watch URL from the Short's clip.json source>

Writes the comment id next to the Short: shorts/<slug>/packaging/comment.json.
"""
import argparse
import datetime as dt
import json
import re
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

REPO = Path(__file__).resolve().parent.parent
YT_DIR = REPO / ".youtube"
CLIENT_SECRET = YT_DIR / "client_secret.json"
TOKEN = YT_DIR / "token.json"            # legacy single-channel token (ai-news etc.)
SHORTS = REPO / "shorts"
VIDEOS = REPO / "videos"

# commentThreads.insert requires youtube.force-ssl; also keep the existing scopes so re-authing
# for comments does not silently drop the upload permission the other tools rely on.
SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl",
          "https://www.googleapis.com/auth/youtube",
          "https://www.googleapis.com/auth/youtube.upload"]


def token_for(channel: str | None) -> Path:
    """One token FILE PER CHANNEL, same convention as tools/yt_upload.py — authorizing channel
    B must never overwrite channel A's refresh token."""
    return TOKEN if not channel else YT_DIR / f"token-{channel}.json"


def slug_source(slug: str) -> str:
    """The long-form source of a Short, from its clip.json manifest."""
    m = SHORTS / slug / "clip.json"
    if not m.exists():
        raise SystemExit(f"no shorts/{slug}/clip.json — run `clip_shorts.py clip` first")
    return json.loads(m.read_text(encoding="utf-8")).get("source") or ""


def short_published(slug: str) -> dict:
    p = SHORTS / slug / "packaging" / "published.json"
    if not p.exists():
        raise SystemExit(f"no shorts/{slug}/packaging/published.json — upload the Short first: "
                         "`python tools/yt_upload.py upload shorts/<slug>/packaging/publish.json "
                         "--channel <niche>`")
    return json.loads(p.read_text(encoding="utf-8"))


def longform_watch_url(source: str) -> str | None:
    pub = VIDEOS / source / "packaging" / "published.json"
    if pub.exists():
        try:
            return json.loads(pub.read_text(encoding="utf-8")).get("watch_url")
        except (json.JSONDecodeError, OSError):
            pass
    return None


def get_creds(channel: str | None = None):
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow

    tok = token_for(channel)
    creds = Credentials.from_authorized_user_file(str(tok), SCOPES) if tok.exists() else None
    if creds and creds.valid:
        return creds
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        if not CLIENT_SECRET.exists():
            sys.exit(f"missing {CLIENT_SECRET} — see tools/yt_upload_SETUP.md (step 2)")
        print(f"\nAuthorizing channel '{channel}' -> {tok.name}")
        creds = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRET),
                                                          SCOPES).run_local_server(port=0)
    YT_DIR.mkdir(exist_ok=True)
    tok.write_text(creds.to_json())
    return creds


def service(channel: str | None = None):
    from googleapiclient.discovery import build
    return build("youtube", "v3", credentials=get_creds(channel))


def post_comment(channel: str | None, video_id: str, text: str, dry_run: bool,
                 slug: str | None) -> None:
    if not text.strip():
        raise SystemExit("empty comment text")
    if len(text) >= 2000:
        raise SystemExit(f"comment is {len(text)} chars — YouTube caps at 2000")
    if dry_run:
        print("DRY-RUN — no API call, no auth. Would post:")
        print(f"  video   : {video_id}")
        print(f"  comment : {text[:200]}{'…' if len(text) > 200 else ''}")
        return
    yt = service(channel)
    body = {"snippet": {"videoId": video_id,
                        "topLevelComment": {"snippet": {"textOriginal": text}}}}
    try:
        resp = yt.commentThreads().insert(part="snippet", body=body).execute()
    except Exception as e:  # noqa: BLE001 - surface the API's real reason (privacy, held etc.)
        msg = str(e)
        if "commentsDisabled" in msg or "Forbidden" in msg or "quotasExceeded" in msg:
            hint = ("  HINT: the comments API rejects comments on PRIVATE videos. Flip the Short "
                    "to Public in Studio first, then re-run this command.")
        else:
            hint = "  (if the Short is still private, that is usually this error's real cause)"
        raise SystemExit(f"comment insert failed: {msg}\n{hint}")
    cid = resp["id"]
    print(f"✓ comment posted -> https://www.youtube.com/watch?v={video_id}&lc={cid}")
    if slug:
        out = SHORTS / slug / "packaging" / "comment.json"
        out.write_text(json.dumps({"commentId": cid, "videoId": video_id, "text": text,
                                   "posted_at": dt.datetime.now(dt.timezone.utc).isoformat(
                                       timespec="seconds"),
                                   "pinned": False}, indent=2), encoding="utf-8")
        print(f"  recorded -> shorts/{slug}/packaging/comment.json")
    print("\n  PIN IT NOW — the API cannot pin (Studio/app only):")
    print("    Mobile: YouTube app → Short → comment → ⋯ → Pin")
    print("    Desktop: Studio → Content → Short → Comments → your comment → Pin")
    print("  A pinned comment with the link is the highest-traffic redirect on a Short.")


def cmd_auth(a: argparse.Namespace) -> None:
    get_creds(a.channel)
    tok = token_for(a.channel)
    print(f"[OK] comment-able token -> {tok.relative_to(REPO)}")
    print("     (scope youtube.force-ssl added — upload tools keep working on the same token)")


def cmd_post(a: argparse.Namespace) -> None:
    if a.slug and a.video_id:
        raise SystemExit("pass EITHER --slug (reads its published.json) OR --video-id, not both")
    slug, video_id, text = a.slug, a.video_id, a.text

    if slug:
        pub = short_published(slug)
        video_id = pub.get("videoId")
        if not video_id:
            raise SystemExit(f"shorts/{slug}/packaging/published.json has no videoId")
        privacy = pub.get("privacy")
        if privacy and privacy != "public":
            print(f"! Note: shorts/{slug} was recorded {privacy!r} — the comments API only "
                  f"accepts PUBLIC videos. If you already flipped it, ignore this line; "
                  f"if not, flip it in Studio, then re-run.")
        if not a.text:
            source = slug_source(slug)
            link = longform_watch_url(source)
            if link:
                text = f"Full video: {link}"
            else:
                text = "Full breakdown on the channel — link in the description."
            print(f"  (composing the redirect comment from shorts/{slug}/clip.json source "
                  f"-> videos/{source})")
    if not video_id:
        raise SystemExit("no video to comment on — pass --video-id or --slug")
    if not text:
        raise SystemExit("no comment text — pass --text or use --slug (auto-composes the link)")
    if not re.search(r"https?://", text):
        print("  NOTE: no link in the comment — a Short comment without the long-form link is "
              "a redirect opportunity wasted. Add https://youtu.be/… if that is the point.")
    post_comment(a.channel, video_id, text, a.dry_run, slug)

def main() -> None:
    ap = argparse.ArgumentParser(
        description="post the redirect comment on a published Short (pinning is Studio/app-only — "
                    "the API has no pin endpoint)")
    sub = ap.add_subparsers(dest="cmd", required=True)

    au = sub.add_parser("auth", help="one-time browser OAuth (adds youtube.force-ssl)")
    au.add_argument("--channel", help="niche id, e.g. ai-news -> .youtube/token-ai-news.json")
    au.set_defaults(func=cmd_auth)

    po = sub.add_parser("post", help="post the comment; then pin it in the app/Studio yourself")
    po.add_argument("--slug", default=None, help="shorts/<slug> — reads its published.json")
    po.add_argument("--video-id", default=None, help="raw YouTube video id")
    po.add_argument("--text", default=None, help="comment body (default: 'Full video: <link>')")
    po.add_argument("--channel", default=None, help="which channel token to use")
    po.add_argument("--dry-run", action="store_true", help="print what would post, no API call")
    po.set_defaults(func=cmd_post)

    a = ap.parse_args()
    a.func(a)


if __name__ == "__main__":
    main()