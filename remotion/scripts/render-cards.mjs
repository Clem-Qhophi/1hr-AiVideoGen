// render-cards.mjs — render a cards.json array of SpecCard props to mp4 files.
//   node scripts/render-cards.mjs ../videos/<slug>/work/cards.json
//   node scripts/render-cards.mjs ../videos/<slug>/work/cards.json --scale=2
// Reads:  cards.json  [{id, kind, kicker, stat, unit, label, foot, left, right, accent, vibe}]
// Writes: ../videos/<slug>/work/cards/<id>.mp4
//
// Each card becomes a beat-ready mp4 that build_longform.py can splice into a
// long-form video (image field ending in .mp4).  The SpecCard composition reads
// props via inputProps, so one composition handles every card variant.
import { bundle } from '@remotion/bundler';
import { selectComposition, renderMedia } from '@remotion/renderer';
import { readFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const scaleArg = args.find((a) => a.startsWith('--scale='));
const SCALE = scaleArg ? Number(scaleArg.split('=')[1]) : 1;
const X264_PRESET = SCALE >= 2 ? 'medium' : 'veryfast';
const cardsPath = args.find((a) => !a.startsWith('--'));
if (!cardsPath) {
  console.error('usage: node render-cards.mjs <cards.json> [--scale=2]');
  process.exit(1);
}

const absCards = path.isAbsolute(cardsPath) ? cardsPath : path.resolve(process.cwd(), cardsPath);
const raw = readFileSync(absCards, 'utf8').replace(/^\uFEFF/, '');
const cards = JSON.parse(raw);
const outDir = path.join(path.dirname(absCards), 'cards');
mkdirSync(outDir, { recursive: true });

console.log('bundling...');
const serveUrl = await bundle({
  entryPoint: path.join(root, 'src', 'index.ts'),
  publicDir: path.join(root, '..', 'media'),
});

let n = 0;
for (const card of cards) {
  const inputProps = {
    kind: card.kind || card.type || 'stat',
    kicker: card.kicker || '',
    stat: String(card.stat || card.value || ''),
    unit: card.unit || '',
    label: card.label || '',
    foot: card.foot || '',
    left: card.left || undefined,
    right: card.right || undefined,
    accent: card.accent || 'cyan',
    vibe: card.vibe || 'techAI',
  };

  const comp = await selectComposition({
    serveUrl,
    id: 'SpecCard',
    inputProps,
    timeoutInMilliseconds: 60000,
  });

  const out = path.join(outDir, `${card.id}.mp4`);
  await renderMedia({
    serveUrl,
    composition: comp,
    outputLocation: out,
    scale: SCALE,
    overwrite: true,
    codec: 'h264',
    pixelFormat: 'yuv420p',
    imageFormat: 'jpeg',
    crf: 18,
    x264Preset: X264_PRESET,
    inputProps,
    timeoutInMilliseconds: 120000,
    onProgress: ({ progress }) => process.stdout.write(`\r  ${card.id}: ${Math.round(progress * 100)}%   `),
  });
  process.stdout.write('\n');
  console.log('  ->', path.relative(root, out));
  n++;
}
console.log(`done: ${n} card(s) rendered to ${path.relative(root, outDir)}/`);
