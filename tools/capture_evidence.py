#!/usr/bin/env python3
"""
capture_evidence.py — capture real screenshots for video authenticity.

Captures screenshots from URLs (tweets, Reddit posts, news articles, benchmark
pages, websites, research papers) and saves them as evidence images for use in
Remotion shots. This is the "proof" layer — real screenshots beat animated text
when the script makes a factual claim.

Supports:
  --url <url>              capture the full page (or an element if --selector given)
  --selector <css>         capture only this element (e.g., a specific tweet, a table)
  --project <name>         save to media/projects/<project>/evidence/
  --name <name>            filename (e.g., "bloomberg-article", "gemini-tweet")
  --source <text>          source citation text (e.g., "Bloomberg, Jul 2026")
  --scroll <px>            scroll down before capturing (for elements below the fold)
  --wait <ms>              extra wait before capturing (for lazy-loaded content)
  --full-page              capture the entire scrollable page (not just viewport)
  --viewport <WxH>         viewport size (default 1920x1080)
  --headed                 show the browser (for debugging)
  --crop x,y,w,h           pixel-crop the saved screenshot to this rect after capture (needs Pillow).
                            Use this to isolate a claims-clean sub-region of a section that also
                            contains marketing copy you don't have approval to show (promo banners,
                            stat blocks, testimonials, pricing). Cropping AFTER capture, not instead
                            of it, keeps the full original + a provenance trail in the manifest.

Usage:
  python tools/capture_evidence.py --url "https://example.com" --project gemini-release --name "homepage" --source "example.com"
  python tools/capture_evidence.py --url "https://x.com/user/status/123" --project gemini-release --name "tweet" --source "@user on X" --selector "article"
  python tools/capture_evidence.py --url "https://reddit.com/..." --project gemini-release --name "reddit-post" --source "r/ai" --selector "[data-testId='post-container']"

Outputs:
  media/projects/<project>/evidence/<name>.png    the screenshot
  media/projects/<project>/evidence/manifest.json  appended with {name, file, url, source, captured_at}

Needs Playwright + Chromium: pip install playwright && playwright install chromium
"""
import argparse
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def rp(p):
    return p if os.path.isabs(p) else os.path.join(ROOT, p)


def parse_viewport(s):
    if "x" in s:
        w, h = s.split("x")
        return int(w), int(h)
    return 1920, 1080


def main():
    ap = argparse.ArgumentParser(description="Capture evidence screenshots for video authenticity")
    ap.add_argument("--url", required=True, help="URL to capture")
    ap.add_argument("--selector", default=None, help="CSS selector for element-specific capture")
    ap.add_argument("--project", required=True, help="project name (e.g., gemini-release)")
    ap.add_argument("--name", required=True, help="screenshot filename (without extension)")
    ap.add_argument("--source", default="", help="source citation text")
    ap.add_argument("--scroll", type=int, default=0, help="scroll down N px before capturing")
    ap.add_argument("--wait", type=int, default=2000, help="extra wait in ms before capturing")
    ap.add_argument("--full-page", action="store_true", help="capture entire scrollable page")
    ap.add_argument("--viewport", default="1920x1080", help="viewport size (WxH)")
    ap.add_argument("--headed", action="store_true", help="show browser window")
    ap.add_argument("--crop", default=None, help="pixel rect x,y,w,h to crop the saved screenshot to")
    args = ap.parse_args()

    out_dir = rp(f"media/projects/{args.project}/evidence")
    os.makedirs(out_dir, exist_ok=True)

    vw, vh = parse_viewport(args.viewport)
    screenshot_path = os.path.join(out_dir, f"{args.name}.png")

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sys.exit("Playwright not installed. Run: pip install playwright && playwright install chromium")

    print(f"capturing: {args.url}")
    print(f"  project: {args.project}  name: {args.name}")
    if args.selector:
        print(f"  selector: {args.selector}")
    print(f"  viewport: {vw}x{vh}  full_page: {args.full_page}")

    with sync_playwright() as pw:
        # Try in order: Playwright's full chromium, system Chrome, default
        pw_chromium = os.path.join(os.environ.get("LOCALAPPDATA", ""),
                                   "ms-playwright", "chromium-1228", "chrome-win64", "chrome.exe")
        sys_chrome = os.path.join(os.environ.get("PROGRAMFILES", ""),
                                  "Google", "Chrome", "Application", "chrome.exe")
        launch_opts = {"headless": not args.headed}
        if os.path.exists(pw_chromium):
            launch_opts["executable_path"] = pw_chromium
        elif os.path.exists(sys_chrome):
            launch_opts["channel"] = "chrome"
        browser = pw.chromium.launch(**launch_opts)
        page = browser.new_page(viewport={"width": vw, "height": vh}, device_scale_factor=2)

        try:
            page.goto(args.url, wait_until="domcontentloaded", timeout=30000)
        except Exception as e:
            print(f"  WARNING: navigation issue: {e}")

        # wait for content to settle
        page.wait_for_timeout(args.wait)

        # scroll if needed
        if args.scroll > 0:
            page.evaluate(f"window.scrollTo(0, {args.scroll})")
            page.wait_for_timeout(500)

        # capture
        if args.selector:
            try:
                element = page.query_selector(args.selector)
                if element:
                    element.screenshot(path=screenshot_path)
                    print(f"  element captured: {args.selector}")
                else:
                    print(f"  selector not found, capturing full viewport")
                    page.screenshot(path=screenshot_path)
            except Exception as e:
                print(f"  element capture failed ({e}), capturing full viewport")
                page.screenshot(path=screenshot_path)
        elif args.full_page:
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"  full page captured")
        else:
            page.screenshot(path=screenshot_path)
            print(f"  viewport captured")

        browser.close()

    # verify the file
    if not os.path.exists(screenshot_path):
        sys.exit(f"  ERROR: screenshot was not saved to {screenshot_path}")

    if args.crop:
        try:
            from PIL import Image
        except ImportError:
            sys.exit("--crop needs Pillow. Run: pip install Pillow")
        x, y, w, h = (int(v) for v in args.crop.split(","))
        with Image.open(screenshot_path) as im:
            im.crop((x, y, x + w, y + h)).save(screenshot_path)
        print(f"  cropped to {w}x{h} at ({x},{y})")

    size_kb = os.path.getsize(screenshot_path) // 1024
    print(f"  saved: {os.path.relpath(screenshot_path, ROOT)} ({size_kb} KB)")

    # append to manifest
    manifest_path = os.path.join(out_dir, "manifest.json")
    manifest = []
    if os.path.exists(manifest_path):
        try:
            manifest = json.loads(Path(manifest_path).read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            manifest = []

    entry = {
        "name": args.name,
        "file": f"{args.name}.png",
        "url": args.url,
        "source": args.source,
        "selector": args.selector,
        "crop": args.crop,
        "captured_at": datetime.now().isoformat(timespec="seconds"),
    }

    # replace if same name exists, otherwise append
    manifest = [m for m in manifest if m.get("name") != args.name]
    manifest.append(entry)
    Path(manifest_path).write_text(json.dumps(manifest, indent=1), encoding="utf-8")
    print(f"  manifest: {len(manifest)} evidence item(s)")


if __name__ == "__main__":
    main()
