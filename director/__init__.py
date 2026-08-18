"""
director — the headless orchestrator (Stage 1, Slice 1) for the AI Video OS.

Turns the /make-video Director skill into a resumable, dependency-aware JOB runner with a tiered
provider layer and a UI-agnostic gate protocol. Orchestrator-first, UI-last: this package is the
spine a CLI (now) and a web app (later) both drive. See docs/STAGE-1-DESIGN.md.

Entry point: `python -m director` (providers | status <slug> | run <slug> [--go]).
"""
from .job import Job, STAGES, Stage
from .providers import health_all, pick, CostMeter, Health

__all__ = ["Job", "STAGES", "Stage", "health_all", "pick", "CostMeter", "Health"]
