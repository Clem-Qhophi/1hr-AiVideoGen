#!/usr/bin/env python3
"""
yt_upload.py — upload a short or long-form video to YouTube from a declarative plan.

One tool for both formats: YouTube auto-classifies a Short by its shape (vertical, ≤3 min)
+ metadata — there is no separate Shorts endpoint. The tool uploads the file, sets
title/description/tags/category, sets the custom thumbnail, and sets privacy/schedule.

DRAFT MODE (default): uploads land as PRIVATE drafts; publish or schedule
them in YouTube Studio with one click. This also sidesteps the API's unaudited-project
restriction, which force-locks every upload from an unaudited project to private anyway.
(To later schedule public directly from the API, the Google Cloud project must pass YouTube's
one-time compliance audit; then set "privacy":"private" + a "publishAt" RFC3339 time.)

Setup (one-time, needs your browser — see tools/yt_upload_SETUP.md):
  1. Google Cloud project + enable "YouTube Data API v3".
  2. OAuth "Desktop app" credential → download as .youtube/client_secret.json.
  3. `python tools/yt_upload.py auth`  (opens a browser once; saves .youtube/token.json)

Usage:
  python tools/yt_upload.py auth
  python tools/yt_upload.py upload shorts/ch-3-honeypot/publish.json
  python tools/yt_upload.py upload <plan> --dry-run     # validate plan + preview, no API call
  python tools/yt_upload.py whoami                        # confirm which channel is authorized

Requires (real upload only; --dry-run needs none of these):
  pip install google-api-python-client google-auth-oauthlib google-auth-httplib2

Quota: standard = 10,000 units/day; an upload costs ~100 units (cut from 1,600 on 2025-12-04)
→ ~100 uploads/day. Some new projects start at 0 "Queries per day" and must request quota via
the YouTube API Services Audit & Quota Extension form (or use an older project that has 10,000).
"""
import argparse
import hashlib
import json
import sys
import time
from pathlib import Path

# Windows consoles default to cp1252 — force UTF-8 so box/✓ glyphs print
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

REPO = Path(__file__).resolve().parent.parent   # repo root, holds .youtube/ creds
# ROOT used to be REPO.parent, on an assumed core/ + sibling-monorepo layout that does not exist in
# this checkout — the actual repo has no parent-level siblings, it's a single flat repo. That made
# every plan-relative path (video, description_file, thumbnail) resolve one directory too high and
# fail with a plain FileNotFoundError, discovered live while uploading re-closing-costs (2026-08-03).
# Every other tool here (yt_research.py, plan_runtime.py, build_longform.py, ...) already treats the
# repo root as ROOT directly — this just brings yt_upload.py in line with that convention.
ROOT = REPO
YT_DIR = REPO / ".youtube"
CLIENT_SECRET = YT_DIR / "client_secret.json"
TOKEN = YT_DIR / "token.json"          # legacy single-channel token; still honoured, see token_for()
SCOPES = ["https://www.googleapis.com/auth/youtube.upload",
          "https://www.googleapis.com/auth/youtube"]  # .../youtube covers thumbnails.set + edits


def token_for(channel: str | None) -> Path:
    """One token FILE PER CHANNEL — `.youtube/token-<channel>.json`.

    This used to be a single hardcoded `token.json`, which is silently destructive on a multi-channel
    portfolio: authorizing channel B overwrites channel A's refresh token, and nothing warns you until
    an upload lands on the wrong channel or fails. With five channels planned that is a matter of
    when, not if. `--channel <id>` (use the niche id, e.g. real-estate) keeps them separate.

    No --channel falls back to the legacy path so the already-authorized ai-news token keeps working.
    """
    return TOKEN if not channel else YT_DIR / f"token-{channel}.json"

TITLE_MAX, DESC_MAX, TAGS_CHARS_MAX = 100, 5000, 460
# common categories: 27 Education · 28 Science & Technology · 22 People & Blogs
DEFAULT_CATEGORY = 28


def rp(p: str) -> Path:
    q = Path(p)
    return q if q.is_absolute() else ROOT / q


def load_plan(path: Path) -> dict:
    plan = json.loads(path.read_text(encoding="utf-8"))
    if "description_file" in plan and "description" not in plan:
        plan["description"] = rp(plan["description_file"]).read_text(encoding="utf-8").strip()
    return plan


def validate(plan: dict) -> list[str]:
    errs = []
    if not plan.get("video"):
        errs.append("plan.video is required")
    elif not rp(plan["video"]).exists():
        errs.append(f"video not found: {plan['video']}")
    if not plan.get("title"):
        errs.append("plan.title is required")
    elif len(plan["title"]) > TITLE_MAX:
        errs.append(f"title is {len(plan['title'])} chars (max {TITLE_MAX})")
    if "|" in plan.get("title", "") or "<" in plan.get("title", "") or ">" in plan.get("title", ""):
        errs.append("title cannot contain < > | (YouTube rejects these)")
    if any(ch in plan.get("description", "") for ch in ("<", ">", "->", "|")):
        errs.append("description cannot contain < > | or a literal -> arrow (YouTube rejects these, HTTP 400 invalidDescription — EVOLUTION.md)")
    if len(plan.get("description", "")) > DESC_MAX:
        errs.append(f"description is {len(plan['description'])} chars (max {DESC_MAX})")
    tags = plan.get("tags", [])
    if sum(len(t) for t in tags) + max(0, len(tags) - 1) > TAGS_CHARS_MAX:
        errs.append(f"tags exceed ~{TAGS_CHARS_MAX} total chars")
    thumb = plan.get("thumbnail")
    if thumb:
        tp = rp(thumb)
        if not tp.exists():
            errs.append(f"thumbnail not found: {thumb}")
        elif tp.stat().st_size > 2 * 1024 * 1024:
            errs.append(f"thumbnail is {tp.stat().st_size / 1e6:.1f} MB (YouTube max 2 MB) — use a JPG")
    if plan.get("publishAt") and plan.get("privacy", "private") != "private":
        errs.append("publishAt requires privacy=private (YouTube holds it private until that time)")
    return errs


def deliverable_receipt_problem(video_path: Path) -> str | None:
    """`tools/check_deliverable.py` is the documented hard gate before a video ships — but nothing
    ever enforced that it actually RAN. 2026-08-06: 6 of 12 videos in one batch reached
    packaging/publish.json without it, including two where the video track ended ~45% before the
    audio did. Refuse by default; --skip-deliverable-check is the explicit, visible opt-out for
    layouts this gate doesn't apply to (Shorts, ad work) rather than a silent gap."""
    receipt_path = video_path.parent.parent / "work" / "deliverable-check.json"
    if not receipt_path.exists():
        return (f"no {rel_repo(receipt_path)} — tools/check_deliverable.py has not been run "
                f"(or failed) for this file")
    try:
        receipt = json.loads(receipt_path.read_text(encoding="utf-8"))
        h = hashlib.sha1()
        with open(video_path, "rb") as f:
            for chunk in iter(lambda: f.read(1 << 20), b""):
                h.update(chunk)
        if h.hexdigest() != receipt.get("sha1"):
            return (f"{rel_repo(receipt_path)} is stale — checked at {receipt.get('checked_at')} "
                    f"but this file's content has changed since (re-rendered after the check?)")
    except (json.JSONDecodeError, OSError) as e:
        return f"could not verify {rel_repo(receipt_path)}: {type(e).__name__} {e}"
    return None


def rel_repo(p: Path) -> str:
    try:
        return str(p.relative_to(REPO))
    except ValueError:
        return str(p)


def build_body(plan: dict) -> dict:
    status = {
        "privacyStatus": plan.get("privacy", "private"),
        "selfDeclaredMadeForKids": bool(plan.get("madeForKids", False)),
    }
    if plan.get("publishAt"):
        status["publishAt"] = plan["publishAt"]
    return {
        "snippet": {
            "title": plan["title"],
            "description": plan.get("description", ""),
            "tags": plan.get("tags", []),
            "categoryId": str(plan.get("categoryId", DEFAULT_CATEGORY)),
        },
        "status": status,
    }


def preview(plan: dict, body: dict) -> None:
    s, st = body["snippet"], body["status"]
    thumb = plan.get("thumbnail")
    print("── upload preview ─────────────────────────────")
    print(f"video      : {plan['video']}  ({rp(plan['video']).stat().st_size / 1e6:.1f} MB)")
    print(f"title      : {s['title']}  ({len(s['title'])}/{TITLE_MAX})")
    print(f"category   : {s['categoryId']}   privacy: {st['privacyStatus']}   kids: {st['selfDeclaredMadeForKids']}")
    print(f"publishAt  : {st.get('publishAt', '(none — stays private draft until you publish)')}")
    print(f"tags       : {', '.join(s['tags']) or '(none)'}")
    print(f"thumbnail  : {thumb or '(none)'}" + ("" if not thumb else f"  ({rp(thumb).stat().st_size / 1e3:.0f} KB)"))
    print(f"description: {len(s['description'])} chars")
    print("   " + "\n   ".join(s["description"].splitlines()[:4]) + (" …" if len(s['description'].splitlines()) > 4 else ""))
    print("───────────────────────────────────────────────")


def get_creds(channel: str | None = None):
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow

    tok = token_for(channel)
    creds = Credentials.from_authorized_user_file(str(tok), SCOPES) if tok.exists() else None
    if creds and creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
        except Exception as e:
            print(f"Token refresh failed ({e}); re-authenticating channel...")
            tok.unlink(missing_ok=True)
            creds = None
    if not creds:
        if not CLIENT_SECRET.exists():
            sys.exit(f"missing {CLIENT_SECRET} — see tools/yt_upload_SETUP.md (step 2)")
        if channel:
            print(f"\nAuthorizing channel '{channel}' -> {tok.name}")
            print("IMPORTANT: on Google's account picker, choose the account/brand account that owns")
            print("THIS channel. Authorizing the wrong one writes a token that uploads to the wrong")
            print("place — run `whoami --channel %s` afterwards to confirm before uploading.\n" % channel)
        # run_local_server binds a localhost callback: the sign-in MUST complete in the browser that
        # receives that redirect, or this hangs forever (cost two dead auth attempts on 2026-08-01).
        creds = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRET), SCOPES).run_local_server(port=0)
    YT_DIR.mkdir(exist_ok=True)
    tok.write_text(creds.to_json())
    return creds


def service(channel: str | None = None):
    from googleapiclient.discovery import build
    return build("youtube", "v3", credentials=get_creds(channel))


def do_upload(plan: dict, channel: str | None = None, plan_path: Path | None = None) -> None:
    import datetime as _dt
    import socket
    import ssl
    import httplib2

    from googleapiclient.errors import HttpError
    from googleapiclient.http import MediaFileUpload

    yt = service(channel)
    body = build_body(plan)
    media = MediaFileUpload(str(rp(plan["video"])), chunksize=8 * 1024 * 1024, resumable=True)
    req = yt.videos().insert(part="snippet,status", body=body, media_body=media)

    # A large resumable upload can run many minutes over a real network, which means transient
    # drops (ConnectionResetError, SSL EOF, timeouts) are routine, not exceptional - the resumable
    # protocol is designed to survive them via next_chunk() re-requesting from the last confirmed
    # byte. The original retry only caught HttpError 5xx; a raw socket/SSL exception (observed:
    # WinError 10054 "An existing connection was forcibly closed by the remote host" at 42% on
    # car-battery-backup-power, 2026-08-03) crashed the whole upload instead of retrying, wasting
    # the bandwidth already spent. Catch the transport-level exceptions too.
    RETRYABLE = (ConnectionError, ConnectionResetError, TimeoutError, ssl.SSLError,
                 socket.timeout, socket.error, BrokenPipeError,
                 httplib2.HttpLib2Error, socket.gaierror)

    print("uploading… (resumable)")
    resp = None
    retries = 0
    while resp is None:
        try:
            status, resp = req.next_chunk()
            if status:
                print(f"  {int(status.progress() * 100)}%")
        except HttpError as e:
            if e.resp.status in (500, 502, 503, 504) and retries < 8:
                retries += 1
                wait = min(2 ** retries, 60)
                print(f"  ! server error {e.resp.status}, retry {retries}/8 in {wait}s")
                time.sleep(wait)
                continue
            raise
        except RETRYABLE as e:
            if retries < 8:
                retries += 1
                wait = min(2 ** retries, 60)
                print(f"  ! connection dropped ({e.__class__.__name__}), retry {retries}/8 in {wait}s")
                time.sleep(wait)
                continue
            raise
    vid = resp["id"]
    print(f"✓ uploaded (private draft): https://studio.youtube.com/video/{vid}/edit")

    thumb = plan.get("thumbnail")
    if thumb:
        try:
            from googleapiclient.http import MediaFileUpload as MFU
            yt.thumbnails().set(videoId=vid, media_body=MFU(str(rp(thumb)))).execute()
            print(f"• thumbnail API call sent: {thumb}")
            print("  ⚠ SHORTS CAVEAT: for a vertical ≤3-min video YouTube usually IGNORES this —")
            print("    the call returns success but the cover stays blank. If Studio shows")
            print("    'change the thumbnail in the YouTube mobile app', set the cover in the")
            print("    YouTube MOBILE APP (upload the .jpg). Desktop Studio + API can't do Shorts covers.")
        except HttpError as e:
            print(f"! thumbnail upload failed ({e.resp.status}) — set it in the YouTube mobile app.")

    # The API response only ever printed to stdout before this — nothing persisted the video ID,
    # so anything downstream (analytics, cross-linking, performance tracking) had no way to find the
    # video again short of scrolling terminal history. Write it next to the plan.
    if plan_path is not None:
        record_path = plan_path.parent / "published.json"
        record = {
            "videoId": vid,
            "url": f"https://studio.youtube.com/video/{vid}/edit",
            "watch_url": f"https://youtu.be/{vid}",
            "title": plan.get("title"),
            "privacy": plan.get("privacy", "private"),
            "channel": channel,
            "uploaded_at": _dt.datetime.now(_dt.timezone.utc).isoformat(timespec="seconds"),
        }
        record_path.write_text(json.dumps(record, indent=2), encoding="utf-8")
        print(f"• recorded video ID -> {record_path.relative_to(REPO)}")

    print(f"\nNext: open Studio, review, then Publish or Schedule.\n  https://studio.youtube.com/video/{vid}/edit")


def main() -> None:
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    au = sub.add_parser("auth", help="one-time browser OAuth")
    au.add_argument("--channel", help="niche id, e.g. real-estate -> .youtube/token-real-estate.json")
    wh = sub.add_parser("whoami", help="print the authorized channel")
    wh.add_argument("--channel", help="which stored token to check")
    wh.add_argument("--all", action="store_true", help="check every stored channel token")
    up = sub.add_parser("upload", help="upload a video from a publish.json plan")
    up.add_argument("plan")
    up.add_argument("--channel", help="which stored token to upload with")
    up.add_argument("--dry-run", action="store_true", help="validate + preview, no API call")
    up.add_argument("--skip-deliverable-check", action="store_true",
                     help="bypass the check_deliverable.py receipt gate — for layouts it doesn't "
                          "cover (Shorts, ad work), never to skip a check that would fail")
    args = ap.parse_args()

    if args.cmd == "auth":
        get_creds(args.channel)
        tok = token_for(args.channel)
        print(f"\n[OK] authorized -> {tok.relative_to(REPO)}")
        try:
            ch = service(args.channel).channels().list(part="snippet", mine=True).execute()
            it = ch.get("items", [])
            print(f"     channel: {it[0]['snippet']['title'] if it else '(none on this account)'}")
            print("     ^ if that is not the channel you intended, delete that token file and re-run.")
        except Exception as e:                      # noqa: BLE001 - report, never mask, an auth check
            print(f"     (could not confirm channel: {type(e).__name__} {e})")
        return
    if args.cmd == "whoami":
        toks = ([("(legacy)", TOKEN)] + [(p.stem.replace("token-", ""), p)
                                         for p in sorted(YT_DIR.glob("token-*.json"))]
                if args.all else [(args.channel or "(legacy)", token_for(args.channel))])
        for name, tok in toks:
            if not tok.exists():
                print(f"{name:<16} (no token — run: yt_upload.py auth"
                      f"{' --channel ' + name if name != '(legacy)' else ''})")
                continue
            try:
                key = None if name == "(legacy)" else name
                ch = service(key).channels().list(part="snippet", mine=True).execute()
                it = ch.get("items", [])
                print(f"{name:<16} {it[0]['snippet']['title'] if it else '(no channel)'}")
            except Exception as e:                  # noqa: BLE001
                print(f"{name:<16} ERROR {type(e).__name__}: {e}")
        return

    plan_path = rp(args.plan)
    if not plan_path.exists():
        sys.exit(f"plan not found: {args.plan}")
    plan = load_plan(plan_path)
    errs = validate(plan)
    if not args.skip_deliverable_check and plan.get("video") and not errs:
        problem = deliverable_receipt_problem(rp(plan["video"]))
        if problem:
            errs.append(f"check_deliverable.py gate: {problem} — run it and get a PASS first, "
                        f"or pass --skip-deliverable-check if this layout genuinely doesn't use "
                        f"that gate (e.g. a Short)")
    body = build_body(plan)
    if errs:
        print("PLAN ERRORS:")
        for e in errs:
            print(f"  ✗ {e}")
        sys.exit(1)
    preview(plan, body)
    if args.dry_run:
        print("dry-run OK — plan is valid. Remove --dry-run to upload.")
        return
    do_upload(plan, args.channel, plan_path)


if __name__ == "__main__":
    main()
