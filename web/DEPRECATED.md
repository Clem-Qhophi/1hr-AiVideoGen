# DEPRECATED — legacy template UI

This React app (`web/`) is the frontend for the **legacy Framewright template pipeline** (`server/`).
It generates videos by mechanically filling shot templates, which produces the "animated text
instead of the real thing" output `EVOLUTION.md` flags as the #1 problem to fix.

**The canonical pipeline is `director/` + `.claude/skills/`** (see the repo root `CLAUDE.md` and
`docs/VIDEO-OS-ROADMAP.md`). The canonical local UI is `director/web.py` + `director/web_ui.html`
(`venv/Scripts/python -m director.web`), which drives the real skills through the tiered provider
layer with human gates.

Kept for reference only. Do not build new features here.
