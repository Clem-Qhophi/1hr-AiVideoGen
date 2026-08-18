// Bulk renderer: bundles once, renders every shot in the manifest — IN PARALLEL.
//   node scripts/render-all.mjs                 -> render all
//   node scripts/render-all.mjs LevelsOverview  -> render only these ids
//   node scripts/render-all.mjs --still         -> render a poster PNG per shot instead of video
//   node scripts/render-all.mjs --jobs=1        -> force sequential (debugging a crashy shot)
// Opaque shots -> out/<id>.mp4 (h264). transparent:true shots -> out/<id>.mov (ProRes 4444 + alpha).
// Default scale 1 (2026-08-01: every channel deliverable is 1080p, so scale-2 previews were 4x
// wasted pixels that then got downscaled in bake). Pass --scale=2 only for a genuine 4K FINAL.
//
// PARALLELISM (2026-08-05): this loop used to be strictly sequential — 16 shots of a 14-min video
// took ~55 min wall-clock on an 8-core box while most cores idled. renderMedia's own `concurrency`
// (headless Chrome tabs rendering frames) only parallelizes WITHIN one shot, and a single short
// composition can't saturate 8 cores: every shot pays browser launch + teardown + a serial ffmpeg
// encode tail, and those gaps are dead time. Running a few shots at once fills them. The bundle is
// built ONCE and shared by every worker (that part was already right), so parallelism costs no
// extra bundling. Total tabs are kept at ~cores so this doesn't thrash: JOBS * CONCURRENCY <= cores.
//
// MEASURED on 8 cores, ai-agents-explained's 16 shots (855s of content):
//   sequential (old)           ~55 min
//   JOBS=2 x 3 tabs (default)   29 min   <- 1.9x; 56 min of summed shot time in 29 min wall clock
// Do NOT "tune this up" without measuring: on a 4-shot subset JOBS=4 came out SLOWER than JOBS=2
// (335s vs 296s), because more jobs means fewer tabs EACH under the formula below (4x1 = 4 tabs vs
// 2x3 = 6), so the box ends up LESS utilised, not more. Throughput tracks TOTAL tabs, not job count.
import { bundle } from '@remotion/bundler';
import { selectComposition, renderMedia, renderStill } from '@remotion/renderer';
import { readFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import os from 'os';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const stillMode = args.includes('--still');
const scaleArg = args.find((a) => a.startsWith('--scale='));
const SCALE = scaleArg ? Number(scaleArg.split('=')[1]) : 1;
// veryfast is visually identical at these bitrates for previews; keep medium for 4K finals.
const X264_PRESET = SCALE >= 2 ? 'medium' : 'veryfast';
// --frame=90 or --frame=3.5s — check a specific CUE without rendering the whole clip.
// Repeatable (--frame=90 --frame=120) -> out/<id>@f<n>.png. Default stays the 60% poster.
const frameArgs = args.filter((a) => a.startsWith('--frame=')).map((a) => a.split('=')[1]);
const onlyIds = args.filter((a) => !a.startsWith('--'));

// How many shots to render at once, and how many Chrome tabs each one gets. Stills are cheap and
// have no encode tail, so they get more workers and a single tab each.
const CORES = Math.max(1, os.cpus().length);
const jobsArg = args.find((a) => a.startsWith('--jobs='));
const JOBS = jobsArg
  ? Math.max(1, Number(jobsArg.split('=')[1]))
  : (stillMode ? Math.min(6, CORES) : Math.min(3, Math.max(1, Math.floor(CORES / 3))));
// Leave headroom for the ffmpeg encode that runs alongside the tabs.
const PER_RENDER_CONCURRENCY = stillMode ? 1 : Math.max(1, Math.floor(CORES / JOBS) - 1);

const manifest = JSON.parse(readFileSync(path.join(root, 'src', 'shots.manifest.json'), 'utf8'));
const outDir = path.join(root, 'out');
mkdirSync(outDir, { recursive: true });

// Google Fonts can time out mid-render on a flaky network ("Timed out loading Google Font") — it's
// intermittent, so retry once before failing the batch (see EVOLUTION.md, Visuals/TSX).
async function withRetry(label, fn) {
  try {
    return await fn();
  } catch (e) {
    const msg = String((e && e.message) || e).split('\n')[0].slice(0, 140);
    console.warn(`\n  retry ${label} after: ${msg}`);
    await new Promise((r) => setTimeout(r, 2500));
    return await fn();
  }
}

console.log('bundling...');
// publicDir must be passed explicitly: remotion.config.ts only applies to the CLI,
// not the programmatic bundle() API. core/media is the public root (see MIGRATION.md).
const serveUrl = await bundle({ entryPoint: path.join(root, 'src', 'index.ts'), publicDir: path.join(root, '..', 'media') });

const queue = manifest.filter((shot) => !onlyIds.length || onlyIds.includes(shot.id));
console.log(`rendering ${queue.length} shot(s): ${JOBS} at a time, ${PER_RENDER_CONCURRENCY} tab(s) each (${CORES} cores)`);

let n = 0;
let started = 0;
const failures = [];

async function renderOne(shot) {
  const t0 = Date.now();
  const composition = await selectComposition({ serveUrl, id: shot.id, timeoutInMilliseconds: 60000 });

  if (stillMode) {
    // resolve each --frame= to a frame index; "3.5s" is seconds, bare numbers are frames
    const frames = frameArgs.length
      ? frameArgs.map((f) => (f.endsWith('s')
        ? Math.round(parseFloat(f) * composition.fps)
        : Math.round(Number(f))))
      : [Math.floor(composition.durationInFrames * 0.6)];
    for (const raw of frames) {
      const frame = Math.max(0, Math.min(composition.durationInFrames - 1, raw));
      const out = path.join(outDir, frameArgs.length ? `${shot.id}@f${frame}.png` : `${shot.id}.png`);
      await withRetry(shot.id, () => renderStill({
        serveUrl, composition, output: out, scale: SCALE, overwrite: true, frame,
        imageFormat: shot.transparent ? 'png' : 'jpeg',
        timeoutInMilliseconds: 120000,
      }));
      console.log(`  still f${frame} ->`, path.relative(root, out));
    }
  } else {
    const transparent = !!shot.transparent;
    const out = path.join(outDir, `${shot.id}.${transparent ? 'mov' : 'mp4'}`);
    await withRetry(shot.id, () => renderMedia({
      serveUrl, composition, outputLocation: out, scale: SCALE, overwrite: true,
      concurrency: PER_RENDER_CONCURRENCY,
      codec: transparent ? 'prores' : 'h264',
      proResProfile: transparent ? '4444' : undefined,
      pixelFormat: transparent ? 'yuva444p10le' : 'yuv420p',
      imageFormat: transparent ? 'png' : 'jpeg',
      crf: transparent ? undefined : 18,
      x264Preset: transparent ? undefined : X264_PRESET,
      timeoutInMilliseconds: 120000,
      // No live % here: with JOBS shots in flight a \r progress line from each one fights for the
      // same terminal row and renders as garbage. One line per completion is readable and enough.
    }));
    console.log(`  [${++n}/${queue.length}] ${shot.id} -> ${path.relative(root, out)}  (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    return;
  }
  n++;
}

// Fixed-size worker pool: each worker pulls the next shot off the shared queue until it's empty.
// A failing shot is recorded and the batch keeps going, so one bad composition doesn't cost you
// the other 15 renders — the exit code still turns non-zero at the end.
async function worker() {
  for (;;) {
    const shot = queue[started++];
    if (!shot) return;
    try {
      await renderOne(shot);
    } catch (e) {
      const msg = String((e && e.message) || e).split('\n')[0].slice(0, 200);
      console.error(`  FAILED ${shot.id}: ${msg}`);
      failures.push(shot.id);
    }
  }
}

const wallT0 = Date.now();
await Promise.all(Array.from({ length: Math.min(JOBS, queue.length) }, worker));
const wallMin = ((Date.now() - wallT0) / 60000).toFixed(1);

if (failures.length) {
  console.error(`\ndone with ${failures.length} FAILURE(S): ${failures.join(', ')}  [${wallMin} min]`);
  process.exit(1);
}
console.log(`done: ${n} shot(s) rendered to out/  [${wallMin} min]`);
