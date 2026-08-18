"""
director — the headless orchestrator CLI (Slice 1).

Commands:
  python -m director providers                 live health of every capability (pro + free)
  python -m director status <slug>             the job's stage table (detected from disk)
  python -m director run <slug> [--go]         advance the job; --dry by default (prints the plan)

Co-pilot design: the runner executes DETERMINISTIC stages, but STOPS at AGENT tasks (script, shots,
sfx, packaging — these need the model / the Agent SDK) and at human GATES. It never fakes a creative
step. Providers auto-select pro->free with a cost meter. See docs/STAGE-1-DESIGN.md.
"""
from __future__ import annotations
import os
import sys
import json
import subprocess

from .job import Job, STAGES, STAGE_BY_NAME, AGENT, AUTO
from .providers import health_all, pick, CostMeter, ROOT


# ---- gate protocol (UI-agnostic) ------------------------------------------

def gate_event(gate: str, title: str, presentation: str, options: list[str]) -> dict:
    """The orchestrator emits these; a CLI/UI renders them. Today: printed. Later: UI cards."""
    return {"gate": gate, "title": title, "presentation": presentation, "options": options}


def render_gate(ev: dict):
    print(f"\n  ┌─ GATE: {ev['title']}  [{ev['gate']}]")
    for line in ev["presentation"].splitlines():
        print(f"  │ {line}")
    print(f"  └─ decide: {' | '.join(ev['options'])}")


# ---- deterministic stage executors (wrap existing tools) ------------------

def _run(cmd: list[str]) -> int:
    print("    $ " + " ".join(os.path.relpath(c, ROOT) if os.path.isabs(c) else c for c in cmd))
    return subprocess.run(cmd, cwd=ROOT).returncode


def exec_voiceover(job: Job, meter: CostMeter, go: bool) -> str:
    h = pick("voiceover")
    P = os.path.join("videos", job.slug)
    spoken = os.path.join(P, "work", "script_spoken.txt")
    if h.impl == "elevenlabs":
        cmd = [sys.executable, "tools/tts.py", P, "--text-file", spoken, "--voice",
               "onwK4e9ZLuTAKqWW03F9", "--speed", "1.15", "--stability", "0.4", "--style", "0.3"]
        note = "ElevenLabs (pro)"
    else:
        cmd = [sys.executable, "tools/tts_edge.py", P, "--text-file", spoken, "--voice", "en-US-AndrewNeural"]
        note = "edge-tts (free fallback)"
    if go:
        _run(cmd)
        meter.add("voiceover", h.impl, 0.6 if h.tier == "pro" else 0.0, note)
    return f"voiceover via {note}"


def exec_word_timing(job: Job, meter: CostMeter, go: bool) -> str:
    h = pick("word_timing")
    # If a pro VO already wrote real word times, keep them. Else align free.
    if h.impl == "assemblyai":
        return "word_timing: AssemblyAI (pro) — not wired in Slice 1; falls through to proportional"
    if go:
        from .align import align_proportional
        n = align_proportional(os.path.join(ROOT, "videos", job.slug))
        meter.add("word_timing", "proportional", 0.0, f"{n} words aligned (approx)")
    return "word_timing via proportional (free, approximate)"


def exec_master(job: Job, meter: CostMeter, go: bool) -> str:
    if go:
        _run([sys.executable, "tools/make_master.py", os.path.join("videos", job.slug), "--bg", "dark"])
    return "master via make_master.py"


def exec_bake(job: Job, meter: CostMeter, go: bool) -> str:
    if go:
        _run([sys.executable, "tools/bake.py", os.path.join("videos", job.slug, "work", "timeline.json")])
    return "bake via bake.py"


AUTO_EXEC = {
    "voiceover": exec_voiceover, "word_timing": exec_word_timing,
    "master": exec_master, "bake": exec_bake,
    "intake": lambda j, m, g: "intake (plan.json present)",
    "upload": lambda j, m, g: "upload: yt_upload draft (manual publish)",
}

AGENT_HINT = {
    "assets":    "recon + capture evidence (/review-site or capture_evidence.py), resolve asset-manifest",
    "script":    "write the grounded script (the model) -> work/script.md + script_spoken.txt",
    "shots":     "author + render the TSX beats (/make-tsx) -> timeline.json + remotion/out/*.mp4",
    "sfx":       "sound design (/suggest-sfx) -> work/sfx-plan.json (has its own audit gate)",
    "packaging": "title + thumbnails + description (/packaging)",
}


# ---- commands --------------------------------------------------------------

def cmd_providers():
    print("capability   tier impl             detail")
    print("-" * 74)
    for h in health_all():
        mark = "OK " if h.available else "•  "
        print(f"{mark}{h.capability:12} {h.tier:4} {h.impl:16} {h.detail}  [{h.est_cost_note}]")


def cmd_status(slug: str):
    job = Job.load(slug)
    print(f"job: {slug}   ({job.project_dir})")
    print("-" * 68)
    for st in STAGES:
        s = job.stages.get(st.name, {})
        status = s.get("status", "pending")
        mark = "✓" if status == "done" else ("•" if status == "pending" else "!")
        kind = "agent" if st.kind == AGENT else "auto "
        gate = f"  ⇢ gate:{st.gate}" if st.gate else ""
        note = f"  ({s['note']})" if s.get("note") else ""
        print(f"  {mark} {st.name:12} [{kind}]{gate}{note}")
    nxt = job.next_pending()
    print("-" * 68)
    print(f"next: {nxt.name if nxt else 'DONE — all stages complete'}")
    job.save()


def _agent_stage(job: Job, st, slug: str, go: bool, use_agent: bool) -> str:
    """Handle an AGENT (creative) stage. Returns 'gate' (stop at human gate), 'stop', or 'next'."""
    from . import agent as agentmod
    if use_agent:
        ok_avail, reason = agentmod.available()
        if ok_avail:
            print(f"  {'▶' if go else '·'} {st.name:12} agent stage → Claude Agent SDK worker")
            if not go:
                p = agentmod.plan_stage(slug, st.name)
                print(f"    (dry) model={p['model']} mode={p['permission_mode']} skills={p['loads_skills_from']}")
                print(f"    (dry) task: {p['prompt'][:150]}...")
                return "stop"
            success = agentmod.run_stage_sync(slug, st.name)
            job.detect(); job.save()
            done = job.stages.get(st.name, {}).get("status") == "done"
            print(f"    {st.name}: {'produced its artifacts' if done else 'did NOT complete (re-run or inspect)'}")
            if not done:
                return "stop"
            return "gate" if st.gate else "next"
        # unavailable → show what WOULD run, then fall back to the co-pilot pause
        p = agentmod.plan_stage(slug, st.name)
        print(f"  · {st.name:12} agent stage (SDK wired, not runnable here)")
        print(f"    would run: model={p['model']}  mode={p['permission_mode']}  tools={len(p['allowed_tools'])}")
        print(f"    loads: {p['loads_skills_from']}")
        print(f"    task: {p['prompt'][:150]}...")
        print(f"    ⏸ agent unavailable: {reason}")
        return "stop"
    # no --agent: Slice-1 pause behavior
    ev = gate_event("needs-agent", f"stage '{st.name}' needs the model",
                    AGENT_HINT.get(st.name, "author with the Agent SDK / the relevant skill"),
                    ["run the skill, then re-run director", "or pass --agent to drive it headless"])
    render_gate(ev)
    print(f"\n  ⏸ stopping: '{st.name}' is a creative step. Pass --agent to drive it via the Agent SDK,")
    print("     or run the skill above and re-run `director run`.")
    return "stop"


def cmd_run(slug: str, go: bool, use_agent: bool):
    job = Job.load(slug)
    meter = CostMeter()
    print(f"run: {slug}   mode={'EXECUTE' if go else 'DRY (plan only)'}   agent={'on' if use_agent else 'off'}")
    print("-" * 68)
    while True:
        st = job.next_pending()
        if st is None:
            print("  all stages complete.")
            break
        if st.kind == AGENT:
            outcome = _agent_stage(job, st, slug, go, use_agent)
            if outcome == "next":
                continue
            if outcome == "gate":
                ev = gate_event(st.gate, f"checkpoint after '{st.name}'",
                                "review the output, then approve to continue", ["approve", "edit", "stop"])
                render_gate(ev)
                print("  ⏸ human gate — decision required (co-pilot).")
            break
        # deterministic stage
        desc = AUTO_EXEC.get(st.name, lambda j, m, g: f"{st.name} (no-op)")(job, meter, go)
        print(f"  {'▶' if go else '·'} {st.name:12} {desc}")
        if go:
            job.detect()
            job.stages[st.name]["provider"] = desc
            job.cost_usd = meter.total
            job.save()
            if job.stages.get(st.name, {}).get("status") != "done":
                print(f"    ! {st.name} did not produce its artifact; stopping.")
                break
        else:
            # dry mode: don't loop forever on unbuilt stages
            print(f"    (dry: would execute; run with --go)")
            break
        if st.gate:
            ev = gate_event(st.gate, f"checkpoint after '{st.name}'",
                            "review the output, then approve to continue", ["approve", "edit", "stop"])
            render_gate(ev)
            print("  ⏸ human gate — decision required (co-pilot).")
            break
    if meter.entries:
        print("-" * 68)
        print(f"cost this run: ${meter.total}   " + "; ".join(f"{e['impl']} ${e['usd']}" for e in meter.entries))


def main(argv=None):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    argv = argv or sys.argv[1:]
    if not argv:
        print(__doc__)
        return
    cmd, rest = argv[0], argv[1:]
    if cmd == "providers":
        cmd_providers()
    elif cmd == "status" and rest:
        cmd_status(rest[0])
    elif cmd == "run" and rest:
        cmd_run(rest[0], go="--go" in rest, use_agent="--agent" in rest)
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
