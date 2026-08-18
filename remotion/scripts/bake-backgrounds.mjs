// Bakes RMBg's gradient stack to flat PNGs — one per glow colour used in the shot library.
//
// WHY: RMBg is three stacked full-screen layers (linear gradient + a 1200x640 radial glow + a dot
// pattern tiled ~900 times across 1080p). It is completely STATIC, but every Remotion frame is a
// fresh paint, so Chrome re-rasterised all of it 30 times a second in every shot that used it.
// Measured 2026-08-05 on a 300-frame 1080p composition: flat fill 12.3s, live RMBg 18.8s, baked
// PNG 12.1s — i.e. the background cost 53% on top of a trivial scene and the PNG makes it free.
// SSIM between live and baked is 0.9996 (8-bit gradient rounding; visually identical).
// This is the same lesson as EVOLUTION.md's "a static mask must never be an expression".
//
// STALENESS: the PNGs are derived from brand tokens (RM.bg0/bg1/line + the glow colour). If those
// change and the PNGs don't, shots silently render the OLD background — exactly the kind of quiet
// drift the brand-contract rule warns about. So we hash the inputs into a stamp file and re-bake
// only when the hash changes. `npm run gen` calls this, so it self-heals.
//
//   node scripts/bake-backgrounds.mjs          -> bake if stale
//   node scripts/bake-backgrounds.mjs --force  -> always re-bake
import { bundle } from '@remotion/bundler';
import { selectComposition, renderStill } from '@remotion/renderer';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, '..', 'media', 'library', 'backgrounds');
const stampPath = path.join(outDir, '.stamp.json');
const force = process.argv.includes('--force');

// Read the palette straight out of reviewkit so this can never disagree with the source of truth.
const kit = readFileSync(path.join(root, 'src', 'lib', 'reviewkit.tsx'), 'utf8');
const pick = (name) => {
  const m = kit.match(new RegExp(`${name}:\\s*'(#[0-9a-fA-F]{3,8})'`));
  if (!m) throw new Error(`could not read RM.${name} from reviewkit.tsx`);
  return m[1];
};
const RM = {
  bg0: pick('bg0'), bg1: pick('bg1'), line: pick('line'),
  cyan: pick('cyan'), green: pick('green'), red: pick('red'), amber: pick('amber'),
};
// COLORS.accent is used by a few shots as a glow; read it from brand.ts.
const brand = readFileSync(path.join(root, 'src', 'brand.ts'), 'utf8');
const accentMatch = brand.match(/accent:\s*'(#[0-9a-fA-F]{3,8})'/);
const ACCENT = accentMatch ? accentMatch[1] : null;

// Every glow the shot library actually uses. An unknown glow just falls back to live gradients.
const GLOWS = Object.entries({
  cyan: RM.cyan, red: RM.red, green: RM.green, amber: RM.amber,
  ...(ACCENT ? { accent: ACCENT } : {}),
});

const stamp = crypto.createHash('sha1')
  .update(JSON.stringify({ bg0: RM.bg0, bg1: RM.bg1, line: RM.line, glows: GLOWS, v: 1 }))
  .digest('hex');

mkdirSync(outDir, { recursive: true });
const prev = existsSync(stampPath) ? JSON.parse(readFileSync(stampPath, 'utf8')) : null;
const allPresent = GLOWS.every(([name]) => existsSync(path.join(outDir, `rm-bg-${name}.png`)));
if (!force && prev?.stamp === stamp && allPresent) {
  console.log('backgrounds: up to date');
  process.exit(0);
}

console.log(`backgrounds: baking ${GLOWS.length} (brand tokens changed or files missing)...`);
const serveUrl = await bundle({
  entryPoint: path.join(root, 'src', 'index.ts'),
  publicDir: path.join(root, '..', 'media'),
});
for (const [name, glow] of GLOWS) {
  const out = path.join(outDir, `rm-bg-${name}.png`);
  // selectComposition must be re-run PER GLOW with the same inputProps used for the render:
  // resolving it once and reusing it freezes the props, and every background comes out identical
  // (caught by checksumming the output — all five files were byte-for-byte the same).
  const composition = await selectComposition({
    serveUrl, id: 'BrandBg', inputProps: { glow }, timeoutInMilliseconds: 60000,
  });
  await renderStill({
    serveUrl, composition, output: out, frame: 0, overwrite: true,
    imageFormat: 'png', inputProps: { glow },
    timeoutInMilliseconds: 120000,
  });
  console.log(`  rm-bg-${name}.png  (${glow})`);
}
writeFileSync(stampPath, JSON.stringify({ stamp, glows: Object.fromEntries(GLOWS), baked: new Date().toISOString() }, null, 2));
console.log('backgrounds: done');
