#!/usr/bin/env python3
"""
yt_set_branding.py — set a channel's banner via the YouTube Data API.

IMPORTANT LIMIT, not an oversight: the YouTube Data API has NO endpoint to set a channel's
profile picture (avatar). That icon is tied to the underlying Google/Brand Account photo and can
only be changed by hand — YouTube Studio -> Customization -> Branding -> Picture (drag the file
in, ~10 seconds), or myaccount.google.com. This tool does not pretend otherwise.

The BANNER is genuinely settable via API: channelBanners().insert() uploads the image and returns
a URL, then channels().update(part="brandingSettings") attaches it to the channel.

Reuses the exact auth/token scaffolding from yt_upload.py (one token file per channel niche id —
see its token_for()) so this never touches the wrong channel's credentials.

Setup: same as yt_upload.py — needs .youtube/client_secret.json and a token for this channel
(`python tools/yt_upload.py auth --channel <niche-id>` if not already authorized).

Usage:
  python tools/yt_set_branding.py --channel home-hacks --banner media/persona/forgotten-fix-banner.png
  python tools/yt_set_branding.py --channel home-hacks --banner path.png --dry-run
"""
import argparse
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, str(Path(__file__).resolve().parent))
from yt_upload import get_creds, rp, token_for  # noqa: E402


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--channel", help="niche id, e.g. home-hacks -> .youtube/token-home-hacks.json")
    ap.add_argument("--banner", required=True, help="path to the banner image (2048x1152 recommended)")
    ap.add_argument("--dry-run", action="store_true", help="validate only, no API calls")
    args = ap.parse_args()

    banner_path = rp(args.banner)
    if not banner_path.exists():
        sys.exit(f"banner not found: {banner_path}")

    tok = token_for(args.channel)
    if args.dry_run:
        print(f"would authorize via: {tok}")
        print(f"would upload banner: {banner_path}")
        print("would call channelBanners().insert(...) then channels().update(part='brandingSettings', ...)")
        print("\nNOTE: profile picture/avatar has NO API endpoint - set by hand in YouTube Studio ->")
        print("      Customization -> Branding -> Picture.")
        return

    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload

    yt = build("youtube", "v3", credentials=get_creds(args.channel))

    who = yt.channels().list(part="snippet", mine=True).execute()
    items = who.get("items", [])
    if not items:
        sys.exit("no channel found for this token - is it authorized for the right account?")
    ch_id = items[0]["id"]
    ch_title = items[0]["snippet"]["title"]
    print(f"authorized channel: {ch_title}  ({ch_id})")
    print("CONFIRM this is the intended channel before continuing - Ctrl+C now if not.")

    print(f"uploading banner: {banner_path} ...")
    media = MediaFileUpload(str(banner_path))
    banner_resp = yt.channelBanners().insert(media_body=media).execute()
    banner_url = banner_resp["url"]
    print(f"  banner uploaded -> {banner_url}")

    yt.channels().update(
        part="brandingSettings",
        body={
            "id": ch_id,
            "brandingSettings": {
                "image": {"bannerExternalUrl": banner_url},
            },
        },
    ).execute()
    print(f"\n✓ banner set on {ch_title}")
    print("Profile picture still needs setting by hand (no API for it):")
    print("  YouTube Studio -> Customization -> Branding -> Picture -> upload media/persona/walt-combs-photo.jpg")


if __name__ == "__main__":
    main()
