"""
director.agent — drives the AGENT (creative) stages headless via the Claude Agent SDK.

The AGENT stages (assets, script, shots, sfx, packaging) each need the model to DO complex
multi-tool work — read files, write TSX, run render/bake, screenshot-verify — following one of
the repo's skills. That is exactly the Claude Agent SDK's job (Claude Code as a library, with
built-in Read/Write/Edit/Bash/Glob/Grep/WebSearch tools + auto-loaded `.claude/skills/*`). We
launch a stage worker with the repo as cwd and a stage-specific prompt that invokes the matching
skill for <slug>, run it autonomously to completion, then let the orchestrator handle the human
gate AFTER the stage (co-pilot design).

The app's "brain" is a paid dependency: needs ANTHROPIC_API_KEY and `pip install claude-agent-sdk`.
When either is missing, `available()` is False and the runner falls back to pausing + naming the
skill (Slice-1 behavior). See docs/STAGE-1-DESIGN.md.
"""
from __future__ import annotations
import os
import asyncio

from .providers import load_env, ROOT

# The Agent SDK is optional at import time so the package loads without it.
try:
    from claude_agent_sdk import query, ClaudeAgentOptions
    from claude_agent_sdk.types import AssistantMessage, TextBlock, ToolUseBlock, ResultMessage
    _SDK_OK = True
    _SDK_ERR = ""
except Exception as e:  # noqa: BLE001
    _SDK_OK = False
    _SDK_ERR = f"{type(e).__name__}: {e}"

MODEL = "claude-opus-4-8"  # the app's brain (claude-api skill default)

# Broad tool grant — a stage worker needs the full Claude Code toolset to author + render.
STAGE_TOOLS = ["Read", "Write", "Edit", "Bash", "Glob", "Grep", "WebSearch", "WebFetch",
               "Skill", "Agent", "TodoWrite"]

SYSTEM_APPEND = (
    "You are a single-stage worker in the AI Video OS director pipeline (docs/VIDEO-OS-ROADMAP.md). "
    "Complete EXACTLY the one stage you are asked to for the named project, using the repo's tools "
    "and the matching skill. Hard rule: never put a factual claim on screen without captured evidence "
    "+ a source (the evidence rule). Work autonomously to completion. Do NOT ask for confirmation or "
    "approval — the orchestrator runs the human review gate AFTER your stage. End by printing one line: "
    "'STAGE DONE: <what you produced>'."
)

# Per-stage task prompts. Each names the skill to run and the artifacts to produce.
STAGE_PROMPT = {
    "assets":
        "Stage = assets for project '{slug}'. Read videos/{slug}/work/plan.json. Do the recon + "
        "evidence capture the video needs (use /review-site or tools/capture_evidence.py): capture the "
        "public screenshots, write videos/{slug}/work/facts.json (each claim -> a source + evidence "
        "name), and resolve videos/{slug}/work/asset-manifest.json — mark anything you cannot capture "
        "as needs-you. Do NOT fabricate.",
    "script":
        "Stage = script for project '{slug}'. Using videos/{slug}/work/plan.json (persona/length/goal) "
        "and videos/{slug}/work/facts.json, write the narration per the /prompt-to-video (or "
        "/review-site) script rules: videos/{slug}/work/script.md AND a clean spoken-only "
        "videos/{slug}/work/script_spoken.txt (no headers/markers). Every factual sentence maps to "
        "facts.json. No em-dashes. Do NOT run TTS — that is a later deterministic stage.",
    "shots":
        "Stage = shots for project '{slug}'. Run the /make-tsx workflow: author the Remotion TSX beats "
        "in remotion/src/shots/{slug}/ synced to videos/{slug}/work/edited-transcript.json word times, "
        "update videos/{slug}/work/timeline.json, render the shots, and bake the preview with "
        "tools/bake.py. Verify by pulling composited frames at each cue and fixing what is off.",
    "sfx":
        "Stage = sfx for project '{slug}'. Run the /suggest-sfx workflow: author "
        "videos/{slug}/work/sfx-plan.json library-first, mix the SFX preview with tools/mix_sfx.py, and "
        "RMS-verify each cue actually lands. Keep everything under the voice (brand sound contract).",
    "packaging":
        "Stage = packaging for project '{slug}'. Run the /packaging workflow: one locked title + 3 "
        "distinct thumbnail concepts + a description, saved under videos/{slug}/packaging/. Render the "
        "thumbnails if Gemini image billing is available; otherwise produce concepts + prompts only and "
        "say so.",
}


def available() -> tuple[bool, str]:
    """(can_run, reason). Needs the SDK installed AND ANTHROPIC_API_KEY resolvable."""
    if not _SDK_OK:
        return False, f"claude-agent-sdk not importable ({_SDK_ERR})"
    key = load_env().get("ANTHROPIC_API_KEY", "")
    if not key:
        return False, "ANTHROPIC_API_KEY not set (the app's brain is a paid dependency)"
    return True, "ready"


def plan_stage(slug: str, stage_name: str) -> dict:
    """What a stage worker WOULD run — inspectable without a key (for --dry / no-key reporting)."""
    return {
        "stage": stage_name,
        "model": MODEL,
        "cwd": ROOT,
        "permission_mode": "bypassPermissions",
        "allowed_tools": STAGE_TOOLS,
        "loads_skills_from": ".claude/skills/* (Agent SDK setting_sources default)",
        "prompt": STAGE_PROMPT.get(stage_name, f"Stage = {stage_name} for '{slug}'.").format(slug=slug),
    }


async def run_stage(slug: str, stage_name: str, on_event=print) -> bool:
    """Launch a headless stage worker via the Agent SDK. Returns True if it finished without error.
    Caller re-detects artifacts to confirm the stage actually produced its outputs."""
    ok, reason = available()
    if not ok:
        raise RuntimeError(f"agent unavailable: {reason}")

    prompt = STAGE_PROMPT.get(stage_name, f"Stage = {stage_name} for '{slug}'.").format(slug=slug)
    options = ClaudeAgentOptions(
        model=MODEL,
        cwd=ROOT,
        permission_mode="bypassPermissions",   # autonomous within the stage; gate is AFTER it
        allowed_tools=STAGE_TOOLS,
        system_prompt={"type": "preset", "preset": "claude_code", "append": SYSTEM_APPEND},
    )

    result_ok = False
    async for message in query(prompt=prompt, options=options):
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if isinstance(block, TextBlock) and block.text.strip():
                    on_event(f"    · {block.text.strip()[:160]}")
                elif isinstance(block, ToolUseBlock):
                    on_event(f"    ▸ {block.name}")
        elif isinstance(message, ResultMessage):
            result_ok = getattr(message, "subtype", "") == "success"
            on_event(f"    = result: {getattr(message, 'subtype', '?')}")
    return result_ok


def run_stage_sync(slug: str, stage_name: str, on_event=print) -> bool:
    return asyncio.run(run_stage(slug, stage_name, on_event))
