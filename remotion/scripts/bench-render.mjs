// Diagnostic: where does a shot render actually spend its time?
//   node scripts/bench-render.mjs <ShotId> [--hw]
// Reports Chrome frame-rendering progress vs ffmpeg encoding progress, so you can tell whether a
// shot is bound by the BROWSER (drawing frames) or the ENCODER — the same "time the filtergraph
// before you optimise the codec" lesson from EVOLUTION.md, applied to the Remotion side.
import { bundle } from '@remotion/bundler';
import { selectComposition, renderMedia } from '@remotion/renderer';
import { fileURLToPath } from 'url';
import os from 'os';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const hw = args.includes('--hw');
const id = args.find((a) => !a.startsWith('--'));
const concArg = args.find((a) => a.startsWith('--concurrency='));
const CONC = concArg ? Number(concArg.split('=')[1]) : Math.max(1, os.cpus().length - 1);
// Remotion defaults to SwiftShader (CPU rasterisation). On a box with a usable GPU, 'angle' /
// 'egl' can hand rasterisation to the hardware. --gl=angle to try it.
const glArg = args.find((a) => a.startsWith('--gl='));
const GL = glArg ? glArg.split('=')[1] : null;

const serveUrl = await bundle({
  entryPoint: path.join(root, 'src', 'index.ts'),
  publicDir: path.join(root, '..', 'media'),
});
const composition = await selectComposition({ serveUrl, id, timeoutInMilliseconds: 60000 });

let firstEncodeAt = null;
let lastRenderAt = null;
let renderDoneAt = null;
const t0 = Date.now();

await renderMedia({
  serveUrl, composition,
  outputLocation: path.join(root, 'out', `__bench_${id}.mp4`),
  scale: 1, overwrite: true, codec: 'h264',
  pixelFormat: 'yuv420p', imageFormat: 'jpeg', crf: 18, x264Preset: 'veryfast',
  concurrency: CONC,
  hardwareAcceleration: hw ? 'if-possible' : 'disable',
  ...(GL ? { chromiumOptions: { gl: GL } } : {}),
  timeoutInMilliseconds: 300000,
  onProgress: ({ renderedFrames, encodedFrames }) => {
    const now = Date.now();
    if (encodedFrames > 0 && firstEncodeAt === null) firstEncodeAt = now;
    if (renderedFrames > 0) lastRenderAt = now;
    if (renderedFrames >= composition.durationInFrames && renderDoneAt === null) renderDoneAt = now;
  },
});

const total = (Date.now() - t0) / 1000;
const renderPhase = renderDoneAt ? (renderDoneAt - t0) / 1000 : NaN;
console.log(JSON.stringify({
  id,
  hardwareAcceleration: hw ? 'if-possible' : 'disable',
  gl: GL || 'default(swiftshader)',
  concurrency: CONC,
  frames: composition.durationInFrames,
  totalSeconds: +total.toFixed(1),
  framesDoneAtSeconds: +renderPhase.toFixed(1),
  encodeTailSeconds: +(total - renderPhase).toFixed(1),
}, null, 2));
