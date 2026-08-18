"""
director.web — Slice 2, the local web UI over the orchestrator.

A dependency-free stdlib HTTP server: it serves the single-page dashboard, a small JSON API over the
SAME orchestrator core (job state machine, tiered providers, gate protocol, Agent SDK wiring), and the
project artifacts (baked previews, thumbnails) so gate cards can play/show them inline. No new creative
code — this is a renderer for the gate_event protocol. See docs/STAGE-1-DESIGN.md.

Run:  venv/Scripts/python -m director.web           (serves http://127.0.0.1:8770)
"""
from __future__ import annotations
import os
import io
import json
import contextlib
import mimetypes
import dataclasses
from urllib.parse import urlparse, parse_qs, unquote
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import time
import threading

from .job import Job, STAGES, STAGE_BY_NAME, AGENT, ROOT
from . import providers as P
from . import agent as A
from . import engine as E
from .__main__ import AUTO_EXEC

HERE = os.path.dirname(os.path.abspath(__file__))
PORT = int(os.environ.get("DIRECTOR_WEB_PORT", "8770"))

# ---- background runs (server-side, decoupled from any client) --------------
# A run advances ONE stage in a worker thread, appending log events to an in-memory buffer.
# Clients subscribe over SSE and can join/leave freely — closing the tab does NOT stop the run,
# and reconnecting replays the buffer then tails. One active run per slug.
RUNS: dict = {}
RUNS_LOCK = threading.Lock()


RUNS_KEEP = 20   # how many run logs to retain per project


def _runs_dir(slug) -> str:
    return os.path.join(ROOT, "videos", slug, "work", "runs")


class Run:
    """One background stage-advance. Events are appended to an in-memory buffer AND to a JSONL file
    (flushed per line) so a run log survives a server restart / crash."""

    def __init__(self, slug, run_id=None, persist=True):
        self.slug = slug
        self.run_id = run_id or time.strftime("%Y%m%d-%H%M%S")
        self.events = []          # list of {type,line} log frames
        self.result = None        # final result dict
        self.state = "running"    # running | done | interrupted
        self.started_at = time.time()
        self.cond = threading.Condition()
        self.path = os.path.join(_runs_dir(slug), f"{self.run_id}.jsonl")
        self._fh = None
        if persist:
            os.makedirs(_runs_dir(slug), exist_ok=True)
            self._fh = open(self.path, "a", encoding="utf-8")
            self._write({"type": "meta", "run_id": self.run_id, "slug": slug,
                         "started_at": self.started_at})

    def _write(self, obj):
        if self._fh:
            try:
                self._fh.write(json.dumps(obj) + "\n")
                self._fh.flush()   # per-line flush: a crash keeps everything emitted so far
            except (OSError, ValueError):
                pass

    def emit(self, ev):
        with self.cond:
            self.events.append(ev)
            self._write(ev)
            self.cond.notify_all()

    def finish(self, result):
        with self.cond:
            self.result = result
            self.state = "done"
            self._write({"type": "done", "result": result, "ended_at": time.time()})
            if self._fh:
                try:
                    self._fh.close()
                except OSError:
                    pass
                self._fh = None
            self.cond.notify_all()

    @classmethod
    def from_file(cls, slug, path) -> "Run":
        """Rebuild a run from its JSONL log. A log with no 'done' line means the worker died with the
        previous server process — surface that as `interrupted`, never as still-running."""
        run = cls(slug, run_id=os.path.basename(path)[:-len(".jsonl")], persist=False)
        run.path = path
        try:
            with open(path, encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        obj = json.loads(line)
                    except ValueError:
                        continue
                    t = obj.get("type")
                    if t == "log":
                        run.events.append(obj)
                    elif t == "done":
                        run.result = obj.get("result")
                        run.state = "done"
                    elif t == "meta":
                        run.started_at = obj.get("started_at", run.started_at)
        except OSError:
            pass
        if run.state == "running":
            run.state = "interrupted"
            run.result = {"interrupted": True,
                          "note": "the server restarted while this run was in flight"}
        return run


def load_runs() -> int:
    """Restore the most recent run per project from disk (called at server start)."""
    base = os.path.join(ROOT, "videos")
    n = 0
    if not os.path.isdir(base):
        return 0
    for slug in sorted(os.listdir(base)):
        rd = _runs_dir(slug)
        if not os.path.isdir(rd):
            continue
        files = sorted(f for f in os.listdir(rd) if f.endswith(".jsonl"))
        if not files:
            continue
        try:
            RUNS[slug] = Run.from_file(slug, os.path.join(rd, files[-1]))
            n += 1
        except Exception:  # noqa: BLE001
            pass
    return n


def _prune_runs(slug):
    rd = _runs_dir(slug)
    try:
        files = sorted(f for f in os.listdir(rd) if f.endswith(".jsonl"))
        for f in files[:-RUNS_KEEP]:
            os.remove(os.path.join(rd, f))
    except OSError:
        pass


def _is_running(slug) -> bool:
    r = RUNS.get(slug)
    return bool(r and r.state == "running")


def start_run(slug) -> "Run":
    """Start (or return the already-active) background run advancing the next stage."""
    with RUNS_LOCK:
        cur = RUNS.get(slug)
        if cur and cur.state == "running":
            return cur
        run = Run(slug)
        RUNS[slug] = run
    _prune_runs(slug)
    threading.Thread(target=_advance_worker, args=(run,), daemon=True).start()
    return run


def _advance_worker(run: "Run"):
    """Advance the job by ONE stage in the background, streaming events into the run buffer."""
    slug = run.slug
    try:
        job = Job.load(slug)
        st = job.next_pending()
        if st is None:
            run.finish({"done": True}); return
        if st.kind == AGENT:
            avail, reason = A.available()
            run.emit({"type": "log", "line": f"stage '{st.name}' — creative (Claude Agent SDK)"})
            if avail:
                run.emit({"type": "log", "line": "launching Agent SDK worker (can take minutes)…"})
                A.run_stage_sync(slug, st.name, on_event=lambda s: run.emit({"type": "log", "line": str(s)}))
                job.detect(); job.save()
                done = job.stages.get(st.name, {}).get("status") == "done"
                run.finish({"stage": st.name, "kind": "agent", "ok": done, "gate": st.gate if done else None})
            else:
                run.finish({"stage": st.name, "kind": "agent",
                            "agent": {"available": False, "reason": reason, "plan": A.plan_stage(slug, st.name)}})
        else:
            ok, cost, note = E.run_deterministic(job, st.name, run.emit)
            job.detect(); job.cost_usd = round(job.cost_usd + cost, 4); job.save()
            done = job.stages.get(st.name, {}).get("status") == "done"
            run.finish({"stage": st.name, "kind": "auto", "ok": done,
                        "gate": st.gate if done else None, "note": note, "cost": cost})
    except Exception as e:  # noqa: BLE001
        run.emit({"type": "log", "line": f"! error: {e}"})
        run.finish({"error": str(e)})


# ---- data helpers ----------------------------------------------------------

def _plan(slug: str) -> dict:
    p = os.path.join(ROOT, "videos", slug, "work", "plan.json")
    if os.path.exists(p):
        try:
            return json.load(open(p, encoding="utf-8"))
        except Exception:
            return {}
    return {}


def list_jobs() -> list[dict]:
    base = os.path.join(ROOT, "videos")
    out = []
    if not os.path.isdir(base):
        return out
    for slug in sorted(os.listdir(base)):
        if not os.path.isdir(os.path.join(base, slug, "work")):
            continue
        job = Job.load(slug)
        plan = _plan(slug)
        done = sum(1 for s in STAGES if job.stages.get(s.name, {}).get("status") == "done")
        nxt = job.next_pending()
        out.append({
            "slug": slug,
            "source": (plan.get("source") or {}).get("type"),
            "persona": (plan.get("persona") or {}).get("delivery_mode"),
            "goal": plan.get("goal"),
            "done": done, "total": len(STAGES),
            "next": nxt.name if nxt else None,
            "cost_usd": job.cost_usd,
            "running": _is_running(slug),
        })
    return out


def _first_existing(slug: str, *rels) -> str | None:
    for rel in rels:
        if os.path.exists(os.path.join(ROOT, rel)):
            return rel
    return None


def job_detail(slug: str) -> dict:
    job = Job.load(slug)
    nxt = job.next_pending()
    preview = _first_existing(
        slug,
        f"videos/{slug}/output/{slug}-sfx.mp4",
        f"videos/{slug}/output/{slug}-preview.mp4",
    )
    thumbs = []
    tdir = os.path.join(ROOT, "videos", slug, "packaging", "thumbs")
    if os.path.isdir(tdir):
        for f in sorted(os.listdir(tdir)):
            if f.lower().endswith((".png", ".jpg", ".jpeg")):
                thumbs.append(f"videos/{slug}/packaging/thumbs/{f}")
    return {
        "slug": slug,
        "plan": _plan(slug),
        "cost_usd": job.cost_usd,
        "next": nxt.name if nxt else None,
        "running": _is_running(slug),
        "last_run": ({"run_id": r.run_id, "state": r.state, "events": len(r.events),
                      "stage": (r.result or {}).get("stage")} if (r := RUNS.get(slug)) else None),
        "preview_path": preview,
        "thumbs": thumbs,
        "stages": [{
            "name": s.name, "kind": "agent" if s.kind == AGENT else "auto",
            "gate": s.gate, "status": job.stages.get(s.name, {}).get("status", "pending"),
            "note": job.stages.get(s.name, {}).get("note", ""),
        } for s in STAGES],
    }


# ---- HTTP ------------------------------------------------------------------

def _safe_path(rel: str) -> str | None:
    """Resolve an artifact path and confine it to the repo root (no traversal)."""
    ap = os.path.abspath(os.path.join(ROOT, rel))
    if ap == ROOT or ap.startswith(ROOT + os.sep):
        return ap if os.path.isfile(ap) else None
    return None


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a):  # quiet
        pass

    def _json(self, obj, code=200):
        body = json.dumps(obj, default=lambda o: dataclasses.asdict(o) if dataclasses.is_dataclass(o) else str(o)).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        u = urlparse(self.path)
        path = u.path
        if path == "/" or path == "/index.html":
            return self._file(os.path.join(HERE, "web_ui.html"), "text/html")
        if path == "/api/providers":
            return self._json([dataclasses.asdict(h) for h in P.health_all()])
        if path == "/api/jobs":
            return self._json(list_jobs())
        if path.startswith("/api/jobs/") and path.endswith("/run-stream"):
            return self._stream_run(path[len("/api/jobs/"):-len("/run-stream")])
        if path.startswith("/api/jobs/"):
            return self._json(job_detail(path.split("/api/jobs/")[1]))
        if path == "/api/artifact":
            rel = unquote((parse_qs(u.query).get("path") or [""])[0])
            ap = _safe_path(rel)
            if not ap:
                return self._json({"error": "not found"}, 404)
            ctype = mimetypes.guess_type(ap)[0] or "application/octet-stream"
            return self._file(ap, ctype)
        return self._json({"error": "not found"}, 404)

    def do_POST(self):
        path = urlparse(self.path).path
        if path.startswith("/api/jobs/") and path.endswith("/run"):
            slug = path[len("/api/jobs/"):-len("/run")]
            try:  # fire-and-forget: start the background run, return immediately
                run = start_run(slug)
                return self._json({"started": True, "state": run.state, "events": len(run.events)})
            except Exception as e:  # noqa: BLE001
                return self._json({"error": str(e)}, 500)
        return self._json({"error": "not found"}, 404)

    def _stream_run(self, slug):
        """SSE *subscriber* to a background run. `?start=1` starts one if idle (the Run-next button);
        without it, attaches only if a run is already active (re-attach after refresh / 2nd viewer).
        Replays the buffer from the beginning, then tails. Disconnecting does NOT stop the run."""
        q = parse_qs(urlparse(self.path).query)
        start = q.get("start", ["0"])[0] == "1"
        run = RUNS.get(slug)

        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()

        def emit(ev):
            self.wfile.write(f"data: {json.dumps(ev)}\n\n".encode())
            self.wfile.flush()

        try:
            if run is None or run.state != "running":
                if start:
                    run = start_run(slug)
                elif run is not None:
                    # finished run — replay its log + final result (it completed while the tab was away)
                    for ev in run.events:
                        emit(ev)
                    emit({"type": "done", "result": run.result})
                    return
                else:
                    emit({"type": "done", "result": {"idle": True}})
                    return
            idx = 0
            while True:
                with run.cond:
                    while idx >= len(run.events) and run.state == "running":
                        run.cond.wait(timeout=12)
                    new = run.events[idx:]
                    idx = len(run.events)
                    terminal = run.state != "running"
                    result = run.result
                for ev in new:
                    emit(ev)
                if terminal:
                    emit({"type": "done", "result": result})
                    break
                if not new:
                    emit({"type": "ping"})   # heartbeat: keeps the socket alive + detects disconnect
            time.sleep(0.3)  # let the client close on 'done' before we drop the socket
        except (BrokenPipeError, ConnectionResetError):
            return  # viewer left — the background worker keeps running
        except Exception as e:  # noqa: BLE001
            try:
                emit({"type": "done", "result": {"error": str(e)}})
            except Exception:
                pass

    def _file(self, ap, ctype):
        try:
            with open(ap, "rb") as f:
                data = f.read()
        except OSError:
            return self._json({"error": "not found"}, 404)
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        self.wfile.write(data)


def main():
    try:
        import sys
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    restored = load_runs()
    srv = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"director web UI -> http://127.0.0.1:{PORT}   (Ctrl+C to stop)", flush=True)
    print(f"restored {restored} persisted run log(s) from videos/*/work/runs/", flush=True)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        srv.shutdown()


if __name__ == "__main__":
    main()
