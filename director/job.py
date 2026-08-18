"""
director.job — the resumable job state machine.

A video is a long-running JOB, not a function call. Stages run in order; some are DETERMINISTIC
(wrap an existing tool), some are AGENT tasks (need the model to create — script, shots), and some
are followed by a human GATE (co-pilot checkpoint). State persists to work/job.json and is also
DETECTABLE from the artifacts on disk, so the runner can attach to an existing project (e.g. the
open-source-ai-mid2026 validation run) and resume.

Dependency-aware: re-running an upstream stage INVALIDATES downstream ones. The key edge discovered
on 2026-07-23 — voiceover -> word-timing -> shot sync — is encoded here, so swapping the free VO for
the paid one later re-runs only the timing + composite, not the whole video.
"""
from __future__ import annotations
import os
import json
from dataclasses import dataclass, field
from typing import Optional

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

AGENT = "agent"            # needs the model to author (creative)
AUTO = "deterministic"     # wraps a tool, no human/model needed


@dataclass
class Stage:
    name: str
    kind: str                       # AGENT | AUTO
    capability: Optional[str] = None  # provider capability this stage consumes, if any
    gate: Optional[str] = None        # human checkpoint AFTER this stage (co-pilot)
    invalidates: list = field(default_factory=list)  # downstream stages voided if this re-runs
    # artifact(s), relative to the project dir, that prove this stage is done:
    artifacts: list = field(default_factory=list)


# The pipeline, in order. Mirrors /make-video Stage C+D.
STAGES: list[Stage] = [
    Stage("intake",    AUTO,  artifacts=["work/plan.json"]),
    Stage("assets",    AGENT, gate="asset-upload-gate", artifacts=["work/asset-manifest.json"]),
    Stage("script",    AGENT, gate="script-gate", artifacts=["work/script.md", "work/script_spoken.txt"]),
    Stage("voiceover", AUTO,  capability="voiceover",
          invalidates=["word_timing", "shots", "bake", "sfx"], artifacts=["work/audio/voiceover.mp3"]),
    Stage("word_timing", AUTO, capability="word_timing",
          invalidates=["shots", "bake", "sfx"], artifacts=["work/edited-transcript.json"]),
    Stage("master",    AUTO,  artifacts=["reference/master.mp4"]),
    Stage("shots",     AGENT, invalidates=["bake"], artifacts=["work/timeline.json"]),  # + rendered mp4s (checked specially)
    Stage("bake",      AUTO,  gate="preview-gate", artifacts=["output/{slug}-preview.mp4"]),
    Stage("sfx",       AGENT, capability="sfx", gate="sfx-audit-gate", artifacts=["work/sfx-plan.json"]),
    Stage("packaging", AGENT, gate="packaging-gate", artifacts=["packaging/description.txt"]),
    Stage("upload",    AUTO,  artifacts=[]),  # yt_upload draft; no local artifact
]

STAGE_BY_NAME = {s.name: s for s in STAGES}


def _exists(project_dir: str, rel: str, slug: str) -> bool:
    return os.path.exists(os.path.join(project_dir, rel.replace("{slug}", slug)))


def _shots_rendered(project_dir: str, slug: str) -> bool:
    """shots stage is done only if timeline has shots AND each shot's mp4 exists in remotion/out."""
    tl_path = os.path.join(project_dir, "work", "timeline.json")
    if not os.path.exists(tl_path):
        return False
    try:
        tl = json.load(open(tl_path, encoding="utf-8"))
    except Exception:
        return False
    shots = tl.get("shots", [])
    if not shots:
        return False
    out_dir = os.path.join(ROOT, tl.get("remotion_out", "remotion/out"))
    for s in shots:
        ext = ".mov" if s.get("type") == "overlay" else ".mp4"
        if not os.path.exists(os.path.join(out_dir, s["id"] + ext)):
            return False
    return True


def _timing_ok(project_dir: str) -> bool:
    p = os.path.join(project_dir, "work", "edited-transcript.json")
    if not os.path.exists(p):
        return False
    try:
        d = json.load(open(p, encoding="utf-8"))
        return len(d.get("words", [])) > 0
    except Exception:
        return False


@dataclass
class Job:
    slug: str
    project_dir: str
    stages: dict = field(default_factory=dict)   # name -> {status, provider, cost_usd, note}
    cost_usd: float = 0.0

    @property
    def job_path(self):
        return os.path.join(self.project_dir, "work", "job.json")

    def save(self):
        os.makedirs(os.path.dirname(self.job_path), exist_ok=True)
        json.dump({"slug": self.slug, "stages": self.stages, "cost_usd": self.cost_usd},
                  open(self.job_path, "w", encoding="utf-8"), indent=2)

    @classmethod
    def load(cls, slug: str) -> "Job":
        project_dir = os.path.join(ROOT, "videos", slug)
        job = cls(slug=slug, project_dir=project_dir)
        if os.path.exists(job.job_path):
            d = json.load(open(job.job_path, encoding="utf-8"))
            job.stages = d.get("stages", {})
            job.cost_usd = d.get("cost_usd", 0.0)
        job.detect()   # always reconcile with what's actually on disk
        return job

    def detect(self):
        """Infer stage completion from artifacts on disk (so we can attach to any project)."""
        for st in STAGES:
            done = True
            if st.name == "shots":
                done = _shots_rendered(self.project_dir, self.slug)
            elif st.name == "word_timing":
                done = _timing_ok(self.project_dir)
            elif not st.artifacts:
                done = self.stages.get(st.name, {}).get("status") == "done"  # no artifact -> trust recorded
            else:
                done = all(_exists(self.project_dir, a, self.slug) for a in st.artifacts)
            prev = self.stages.get(st.name, {})
            prev["status"] = "done" if done else prev.get("status", "pending")
            if not done and prev.get("status") == "done":
                prev["status"] = "pending"
            self.stages.setdefault(st.name, prev)
            self.stages[st.name] = prev

    def next_pending(self) -> Optional[Stage]:
        for st in STAGES:
            if self.stages.get(st.name, {}).get("status") != "done":
                return st
        return None

    def invalidate(self, stage_name: str):
        """Mark a stage's downstream dependents as pending (they must re-run)."""
        st = STAGE_BY_NAME.get(stage_name)
        if not st:
            return
        for dep in st.invalidates:
            if dep in self.stages:
                self.stages[dep]["status"] = "pending"
                self.stages[dep]["note"] = f"invalidated by re-run of {stage_name}"
