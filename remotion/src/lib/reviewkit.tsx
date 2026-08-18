// reviewkit — dark, cyan-accented building blocks for /review-site videos, so
// branded beats sit cohesively next to dark product screenshots (EvidenceBrowser)
// and the dark master. Lives in src/lib so gen-registry never scans it.
// Frame-based only; monotonic interpolate + clamp.
import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { loadFont as loadHook } from '@remotion/google-fonts/Anton';
import { COLORS, EASINGS } from '../brand';

// heavy display face for big slam numbers/words (with a bold system fallback if the font is slow)
export const FONT_HOOK = `${loadHook('normal', { weights: ['400'], subsets: ['latin'] }).fontFamily}, 'Arial Black', Impact, sans-serif`;

export const RM = {
  bg0: '#0d1117', bg1: '#161b2e',
  cyan: '#22d3ee', cyanDim: '#0e7490',
  text: '#eef4f8', muted: '#8b98a9', line: '#232b3a', panel: '#131a26',
  green: '#34d399', red: '#f0687a', amber: '#f5c451',
  accent: COLORS.accent, accent2: COLORS.accent2, signal: COLORS.signal,
  warn: COLORS.warn, danger: COLORS.danger,
} as const;

export const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

// dark backdrop: gradient + soft cyan glow + faint dotted grid (matches make_master --bg dark)
//
// RMBgLive is the ORIGINAL three-layer stack. It is correct but expensive: it is fully static, yet
// every Remotion frame is a fresh paint, so Chrome re-rasterised a full-screen linear gradient, a
// 1200x640 radial glow and a dot pattern tiled ~900 times — 30 times a second, in every shot.
// Measured on a 300-frame 1080p composition (2026-08-05): flat fill 12.3s vs live RMBg 18.8s.
// Prefer RMBg (below), which blits a pre-baked PNG of exactly this. Use RMBgLive only when you
// need a glow colour that has not been baked, or inside the baker itself.
export const RMBgLive: React.FC<{ glow?: string }> = ({ glow = RM.cyan }) => (
  <>
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${RM.bg0}, ${RM.bg1})` }} />
    <AbsoluteFill style={{ background: `radial-gradient(1200px 640px at 50% -12%, ${glow}22, transparent 62%)` }} />
    <AbsoluteFill style={{ backgroundImage: `radial-gradient(${RM.line} 1.4px, transparent 1.4px)`, backgroundSize: '48px 48px', opacity: 0.35 }} />
  </>
);

// glow colour -> baked still in media/library/backgrounds/ (written by scripts/bake-backgrounds.mjs,
// which `npm run gen` keeps in sync with the brand tokens). Anything not in this map falls back to
// the live stack, so a one-off custom glow still renders correctly — just slower.
const BAKED_BG: Record<string, string> = {
  [RM.cyan]: 'cyan',
  [RM.red]: 'red',
  [RM.green]: 'green',
  [RM.amber]: 'amber',
  [COLORS.accent]: 'accent',
};

// Drop-in replacement for the old RMBg: BIT-IDENTICAL output (full-clip SSIM 1.000000 (inf) on a
// 610-frame shot re-rendered against its pre-change version) at a fraction of the per-frame cost.
// On the isolated bench: baked 12.1s vs live 18.8s per 300 frames. On the real shot AAEHook,
// which is background-dominated: 59.4s -> 26.6s, a 2.23x speedup for free.
export const RMBg: React.FC<{ glow?: string }> = ({ glow = RM.cyan }) => {
  const baked = BAKED_BG[glow];
  if (!baked) return <RMBgLive glow={glow} />;
  return (
    <AbsoluteFill>
      <Img
        src={staticFile(`library/backgrounds/rm-bg-${baked}.png`)}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </AbsoluteFill>
  );
};

// rise-in (fade + translateY), driven by the current frame
export const useRise = () => {
  const frame = useCurrentFrame();
  return (start: number, dist = 26, dur = 14) => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    transform: `translateY(${interpolate(frame, [start, start + dur], [dist, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
  });
};

// pop-in (scale overshoot) — punchy reveal for stat cards / steps
export const usePop = () => {
  const frame = useCurrentFrame();
  return (start: number, dur = 11) => ({
    opacity: interpolate(frame, [start, start + 7], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    transform: `scale(${interpolate(frame, [start, start + dur], [0.55, 1], { ...CLAMP, easing: EASINGS.overshoot })})`,
  });
};

// slam-in (big -> settle) — for the huge hero numbers/words landing on the beat
export const useSlam = () => {
  const frame = useCurrentFrame();
  return (start: number, dur = 8) => ({
    opacity: interpolate(frame, [start, start + 4], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    transform: `scale(${interpolate(frame, [start, start + dur], [1.6, 1], { ...CLAMP, easing: EASINGS.easeOut })})`,
  });
};

// slow continuous drift — keeps a long statement/chart beat ALIVE across its whole span.
// tools/lint_pacing.py counts a frame-spanning interpolate as motion, and the eye reads it as
// a gentle push. Apply to the CONTENT layer; keep source citations outside so they never scale
// off-frame (EVOLUTION: zooming a labelled evidence frame clips its label).
export const useDrift = (frames: number, from = 1.0, to = 1.045) => {
  const frame = useCurrentFrame();
  return {
    transform: `scale(${interpolate(frame, [0, frames], [from, to], { ...CLAMP, easing: EASINGS.easeInOut })})`,
  };
};

// eyebrow label (mono, spaced, cyan/muted)
export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = RM.muted, style }) => (
  <div style={{ fontFamily: 'monospace', fontSize: 26, letterSpacing: 6, color, textTransform: 'uppercase', ...style }}>{children}</div>
);
