# media/library/backgrounds — pre-baked RMBg stills

**Generated, but committed on purpose: renders depend on them.** `RMBg` (in
`remotion/src/lib/reviewkit.tsx`) blits one of these PNGs instead of re-rasterising its three
gradient layers on every frame. If they are missing, `staticFile()` 404s and shots fail to render.

## Why they exist

`RMBg` is a linear gradient + a 1200x640 radial glow + a dot pattern tiled ~900 times across 1080p.
All of it is **static**, but every Remotion frame is a fresh paint, so Chrome re-drew the whole stack
30 times a second in all ~60 shots that use it.

Measured 2026-08-05 (8 cores, 1080p):

| Composition | Frames | Chrome render time |
|---|---|---|
| flat colour fill | 300 | 12.3s |
| live `RMBg` gradients | 300 | 18.8s |
| baked PNG (this dir) | 300 | 12.1s |
| **real shot `AAEHook`, live** | 610 | **59.4s** |
| **real shot `AAEHook`, baked** | 610 | **26.6s** |

`AAEHook` renders **2.23x faster** and the output is **bit-for-bit identical** (full-clip SSIM
1.000000 against the pre-change render). This is the same lesson as EVOLUTION.md's round-1 finding
that *a static mask must never be an expression*.

## Regenerating

```
cd remotion && npm run gen            # bakes only if the brand tokens changed
cd remotion && npm run gen:backgrounds # force a re-bake
```

`npm run gen` calls `scripts/bake-backgrounds.mjs`, which hashes the inputs (`RM.bg0`, `RM.bg1`,
`RM.line` and each glow colour) into `.stamp.json` and re-bakes only when that hash changes.

**This is the drift guard.** These PNGs are derived from the brand contract. Change `RM.*` in
`reviewkit.tsx` or `COLORS.accent` in `brand.ts` without re-baking and every shot would silently keep
rendering the OLD background — so the stamp exists to make that impossible. One PNG per glow colour
actually used in the shot library; a glow that is not in `BAKED_BG` falls back to the live gradient
stack, which is still correct, just slower.
