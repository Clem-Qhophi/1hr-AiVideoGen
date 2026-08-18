"""URL fetcher — fetches page content and takes screenshots via Playwright.

Used when the user drops a link: we fetch the page's text content (for the LLM
to write a script from) and take a screenshot (for the evidence shot).
"""
import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def fetch_url_content(url: str, project: str, wait_ms: int = 4000) -> dict:
    """Fetch a URL's text content and take a screenshot.

    Returns:
        {
            "url": str,
            "title": str,
            "text": str,           # main text content (truncated)
            "screenshot": str,     # path relative to repo root
            "source_label": str,   # e.g., "theverge.com"
        }
    """
    from playwright.sync_api import sync_playwright

    # Prepare screenshot output dir
    out_dir = ROOT / "media" / "projects" / project / "evidence"
    out_dir.mkdir(parents=True, exist_ok=True)

    # Generate a name from the URL
    domain = re.sub(r"[^a-zA-Z0-9]", "-", url.split("//")[-1].split("/")[0]).strip("-")
    page_slug = re.sub(r"[^a-zA-Z0-9]", "-", url.split("/")[-1][:60]).strip("-") or "page"
    name = f"{domain}-{page_slug}"

    # Launch browser
    pw_chromium = os.path.join(os.environ.get("LOCALAPPDATA", ""),
                               "ms-playwright", "chromium-1228", "chrome-win64", "chrome.exe")
    sys_chrome = os.path.join(os.environ.get("PROGRAMFILES", ""),
                              "Google", "Chrome", "Application", "chrome.exe")

    launch_opts = {"headless": True}
    if os.path.exists(pw_chromium):
        launch_opts["executable_path"] = pw_chromium
    elif os.path.exists(sys_chrome):
        launch_opts["channel"] = "chrome"

    with sync_playwright() as pw:
        browser = pw.chromium.launch(**launch_opts)
        page = browser.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=2)

        try:
            page.goto(url, wait_until="domcontentloaded", timeout=30000)
        except Exception as e:
            print(f"  navigation warning: {e}")

        page.wait_for_timeout(wait_ms)

        # Extract text content
        try:
            title = page.title()
        except Exception:
            title = url

        # Get main text content — try article/main first, then body
        text = ""
        try:
            for selector in ["article", "main", "[role='main']", ".content", "body"]:
                try:
                    el = page.query_selector(selector)
                    if el:
                        text = el.inner_text()
                        if len(text) > 200:
                            break
                except Exception:
                    continue
        except Exception:
            pass

        # Truncate text to a reasonable length for the LLM
        if len(text) > 4000:
            text = text[:4000] + "..."

        # Take screenshot
        screenshot_path = str(out_dir / f"{name}.png")
        try:
            page.screenshot(path=screenshot_path, full_page=False)
        except Exception as e:
            print(f"  screenshot failed: {e}")
            screenshot_path = ""

        browser.close()

    source_label = url.split("//")[-1].split("/")[0].replace("www.", "")

    # Update manifest
    manifest_path = out_dir / "manifest.json"
    manifest = []
    if manifest_path.exists():
        try:
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        except Exception:
            manifest = []
    manifest = [m for m in manifest if m.get("name") != name]
    manifest.append({
        "name": name,
        "file": f"{name}.png",
        "url": url,
        "source": source_label,
        "title": title,
        "captured_at": datetime.now().isoformat(timespec="seconds"),
    })
    manifest_path.write_text(json.dumps(manifest, indent=1), encoding="utf-8")

    return {
        "url": url,
        "title": title,
        "text": text.strip(),
        "screenshot": os.path.relpath(screenshot_path, ROOT) if screenshot_path else "",
        "screenshot_name": name,
        "source_label": source_label,
    }
