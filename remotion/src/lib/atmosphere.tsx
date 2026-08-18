// atmosphere — physical/environmental FX layers so a shot FEELS like the thing it is selling.
//
// A cold drink should feel cold (bubbles rising, condensation, cool light). A car should feel fast
// and hot (speed streaks, embers, hard vignette). A beauty product should feel soft (bokeh, sparkle,
// warm haze). Before this file every video used ONE backdrop (RMBg: dark gradient + dot grid), so a
// fintech ad and a beauty ad looked identical. These layers are the fix.
//
// RULES (inherited from vidtsx-2d-generator):
//   - Frame-based only. No useState/useEffect/setTimeout. Every layer is a pure function of `frame`.
//   - Randomness is DETERMINISTIC (hash of the particle index) so a re-render is pixel-identical.
//   - Loops use a phase in [0,1) + a sine fade, NOT modulo jumps, so nothing pops at the wrap.
//
// PERF: particle layers are plain divs (cheap, use freely). Layers that use CSS `filter: blur()`
// (Smoke, Bokeh, LightRays) cost real render time — keep their counts low (<= ~10) and prefer one
// blurred layer over three.
//
// NOTE for tools/lint_pacing.py: these layers animate with raw math, not `interpolate(frame, ...)`,
// so the linter cannot see them and may report a beat as "static". That is a linter blind spot, not
// a dead shot — see EVOLUTION.md.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

/** Deterministic pseudo-random in [0,1) from an integer index (+ salt for independent streams). */
const rnd = (i: number, salt = 0): number => {
  const x = Math.sin(i * 127.1 + salt * 311.7 + 13.37) * 43758.5453;
  return x - Math.floor(x);
};

/** Smooth 0->1->0 over a [0,1) phase, so looping particles fade in/out instead of popping. */
const edgeFade = (t: number): number => Math.sin(Math.max(0, Math.min(1, t)) * Math.PI);

const LAYER: React.CSSProperties = { overflow: 'hidden', pointerEvents: 'none' };

// ---------------------------------------------------------------------------
// Particles — the workhorse. One component, many materials.
//   'up'    rising: bubbles (drink), embers (fire/car), sparks
//   'down'  falling: snow, ash, glitter
//   'drift' suspended: dust motes, pollen, floating specks
// ---------------------------------------------------------------------------
export const Particles: React.FC<{
  count?: number;
  color?: string;
  direction?: 'up' | 'down' | 'drift';
  /** [min, max] diameter in px */
  size?: [number, number];
  /** cycles per 100 frames; higher = faster */
  speed?: number;
  opacity?: number;
  /** px of horizontal sway */
  sway?: number;
  glow?: boolean;
  seed?: number;
  style?: React.CSSProperties;
}> = ({
  count = 40, color = '#ffffff', direction = 'up', size = [2, 6],
  speed = 1, opacity = 0.6, sway = 8, glow = false, seed = 0, style,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ ...LAYER, ...style }}>
      {new Array(count).fill(0).map((_, i) => {
        const px = rnd(i, seed + 1) * 100;                       // column
        const phase0 = rnd(i, seed + 2);                          // stagger so they don't march
        const rate = 0.35 + rnd(i, seed + 3) * 0.9;               // per-particle speed
        const d = size[0] + rnd(i, seed + 4) * (size[1] - size[0]);
        const t = (phase0 + (frame * speed * rate) / 260) % 1;    // [0,1) loop
        const travel = direction === 'down' ? t : 1 - t;          // 0=top .. 1=bottom
        const py = direction === 'drift'
          ? rnd(i, seed + 5) * 100 + Math.sin(frame * 0.012 * rate + i) * 4
          : travel * 118 - 9;
        const dx = Math.sin(frame * 0.02 * rate + i * 1.7) * sway;
        const a = opacity * (direction === 'drift' ? 0.55 + 0.45 * Math.sin(frame * 0.03 + i) : edgeFade(t));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${px}%`,
              top: `${py}%`,
              width: d,
              height: d,
              marginLeft: dx,
              borderRadius: '50%',
              background: color,
              opacity: Math.max(0, a),
              boxShadow: glow ? `0 0 ${d * 3}px ${d * 0.6}px ${color}` : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Smoke / steam / fog — soft blurred puffs that rise and expand.
// Use for: hot drinks (steam), cars (exhaust), atmosphere/haze. Keep count low (blur is costly).
// ---------------------------------------------------------------------------
export const Smoke: React.FC<{
  count?: number;
  color?: string;
  opacity?: number;
  speed?: number;
  /** base puff diameter in px */
  scale?: number;
  /** where puffs originate, in % of frame */
  originY?: number;
  seed?: number;
}> = ({ count = 6, color = '#ffffff', opacity = 0.16, speed = 1, scale = 520, originY = 105, seed = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={LAYER}>
      {new Array(count).fill(0).map((_, i) => {
        const px = 12 + rnd(i, seed + 11) * 76;
        const phase0 = rnd(i, seed + 12);
        const rate = 0.5 + rnd(i, seed + 13) * 0.8;
        const t = (phase0 + (frame * speed * rate) / 420) % 1;
        const py = originY - t * (originY + 25);
        const grow = 0.6 + t * 1.1;
        const dx = Math.sin(frame * 0.01 * rate + i) * 40;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${px}%`,
              top: `${py}%`,
              width: scale,
              height: scale,
              marginLeft: dx - scale / 2,
              marginTop: -scale / 2,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
              opacity: opacity * edgeFade(t),
              filter: 'blur(28px)',
              transform: `scale(${grow})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// MEASURED DEAD END (2026-08-05) — do not re-attempt without new evidence. Drawing the blurred
// layers on a quarter-size surface and scaling the result up (the usual "cheap blur" trick) made NO
// difference in Remotion: 54.7s vs a 54.2s baseline on a 300-frame VibeBg composition. Chrome
// re-rasterises at the composited scale, so the pre-transform size buys nothing here, and the trick
// only adds px-unit bookkeeping and a visual-fidelity risk. The blur cost is real but this is not
// the lever. See EVOLUTION.md "Render SPEED, round 3".

// LightRays — god rays / volumetric shafts from an off-frame source.
// Use for: premium reveals, nature, anything that wants "light is hitting this".
// ---------------------------------------------------------------------------
export const LightRays: React.FC<{
  count?: number;
  color?: string;
  opacity?: number;
  /** degrees; 0 = from top, 25 = raking from upper-left */
  angle?: number;
  originX?: number;
  seed?: number;
}> = ({ count = 7, color = '#ffffff', opacity = 0.1, angle = 20, originX = 30, seed = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={LAYER}>
      {new Array(count).fill(0).map((_, i) => {
        const w = 60 + rnd(i, seed + 21) * 170;
        const off = (rnd(i, seed + 22) - 0.5) * 900;
        const breathe = 0.65 + 0.35 * Math.sin(frame * 0.014 + i * 0.9);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${originX}%`,
              top: '-40%',
              width: w,
              height: '190%',
              marginLeft: off,
              background: `linear-gradient(to bottom, ${color}, transparent 78%)`,
              opacity: opacity * breathe,
              filter: 'blur(26px)',
              transform: `rotate(${angle}deg)`,
              transformOrigin: 'top center',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Bokeh — soft out-of-focus orbs. Beauty, luxury, food, anything warm/premium.
// ---------------------------------------------------------------------------
export const Bokeh: React.FC<{
  count?: number;
  colors?: readonly string[];
  opacity?: number;
  size?: [number, number];
  speed?: number;
  seed?: number;
}> = ({ count = 9, colors = ['#ffffff'], opacity = 0.22, size = [90, 300], speed = 1, seed = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={LAYER}>
      {new Array(count).fill(0).map((_, i) => {
        const d = size[0] + rnd(i, seed + 31) * (size[1] - size[0]);
        const px = rnd(i, seed + 32) * 100;
        const py = rnd(i, seed + 33) * 100;
        const rate = 0.4 + rnd(i, seed + 34) * 0.8;
        const dx = Math.sin(frame * 0.006 * rate * speed + i) * 46;
        const dy = Math.cos(frame * 0.005 * rate * speed + i * 1.3) * 34;
        const c = colors[i % colors.length];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${px}%`,
              top: `${py}%`,
              width: d,
              height: d,
              marginLeft: dx - d / 2,
              marginTop: dy - d / 2,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${c} 0%, transparent 70%)`,
              opacity: opacity * (0.6 + 0.4 * Math.sin(frame * 0.02 + i)),
              filter: 'blur(14px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Condensation — droplets on cold glass. The single most "this drink is ice cold" cue.
// Most droplets cling; a few slide down and reset.
// ---------------------------------------------------------------------------
export const Condensation: React.FC<{
  count?: number;
  color?: string;
  opacity?: number;
  size?: [number, number];
  seed?: number;
}> = ({ count = 70, color = '#dff4ff', opacity = 0.5, size = [3, 11], seed = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={LAYER}>
      {new Array(count).fill(0).map((_, i) => {
        const px = rnd(i, seed + 41) * 100;
        const baseY = rnd(i, seed + 42) * 100;
        const d = size[0] + rnd(i, seed + 43) * (size[1] - size[0]);
        const slides = rnd(i, seed + 44) > 0.78;                 // ~22% slide
        const rate = 0.3 + rnd(i, seed + 45) * 0.7;
        const t = (rnd(i, seed + 46) + (frame * rate) / 300) % 1;
        const py = slides ? baseY + t * 42 : baseY;
        const a = opacity * (slides ? edgeFade(t) : 0.75 + 0.25 * Math.sin(frame * 0.02 + i));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${px}%`,
              top: `${py}%`,
              width: d,
              height: d * 1.25,
              borderRadius: '50%',
              background: `radial-gradient(circle at 34% 28%, #ffffff 0%, ${color} 42%, transparent 76%)`,
              opacity: Math.max(0, a),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// SpeedLines — horizontal motion streaks. Cars, fitness, gaming, "fast" claims.
// ---------------------------------------------------------------------------
export const SpeedLines: React.FC<{
  count?: number;
  color?: string;
  opacity?: number;
  speed?: number;
  direction?: 'left' | 'right';
  seed?: number;
}> = ({ count = 22, color = '#ffffff', opacity = 0.3, speed = 1, direction = 'left', seed = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={LAYER}>
      {new Array(count).fill(0).map((_, i) => {
        const py = rnd(i, seed + 51) * 100;
        const len = 90 + rnd(i, seed + 52) * 420;
        const h = 1 + rnd(i, seed + 53) * 2.5;
        const rate = 0.6 + rnd(i, seed + 54) * 1.4;
        const t = (rnd(i, seed + 55) + (frame * speed * rate) / 55) % 1;
        const x = direction === 'left' ? 115 - t * 135 : t * 135 - 20;
        const grad = direction === 'left'
          ? `linear-gradient(to left, ${color}, transparent)`
          : `linear-gradient(to right, ${color}, transparent)`;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${py}%`,
              width: len,
              height: h,
              background: grad,
              opacity: opacity * edgeFade(t),
              filter: 'blur(0.6px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Static, cheap finishing layers — these do a LOT for perceived production value.
// ---------------------------------------------------------------------------

/** Film grain. Static by design (animated grain is expensive and reads as noise). */
export const Grain: React.FC<{ opacity?: number; frequency?: number }> = ({ opacity = 0.07, frequency = 0.85 }) => (
  <AbsoluteFill style={{ ...LAYER, opacity, mixBlendMode: 'overlay' }}>
    <svg width="100%" height="100%">
      <filter id="fw-grain">
        <feTurbulence type="fractalNoise" baseFrequency={frequency} numOctaves={3} stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#fw-grain)" />
    </svg>
  </AbsoluteFill>
);

/** Edge darkening — focuses the eye and instantly reads as "shot", not "slide". */
export const Vignette: React.FC<{ strength?: number; color?: string }> = ({ strength = 0.55, color = '#000000' }) => (
  <AbsoluteFill
    style={{
      ...LAYER,
      background: `radial-gradient(ellipse 74% 66% at 50% 48%, transparent 42%, ${color} 100%)`,
      opacity: strength,
    }}
  />
);

/** A specular sweep that crosses once — the classic product-reveal "shine". */
export const LightSweep: React.FC<{
  startFrame?: number;
  durationFrames?: number;
  color?: string;
  opacity?: number;
  width?: number;
  angle?: number;
}> = ({ startFrame = 0, durationFrames = 34, color = '#ffffff', opacity = 0.3, width = 320, angle = 18 }) => {
  const frame = useCurrentFrame();
  const t = (frame - startFrame) / durationFrames;
  if (t < 0 || t > 1) return null;
  return (
    <AbsoluteFill style={LAYER}>
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          left: `${t * 145 - 25}%`,
          width,
          height: '160%',
          background: `linear-gradient(to right, transparent, ${color}, transparent)`,
          opacity: opacity * Math.sin(t * Math.PI),
          filter: 'blur(22px)',
          transform: `rotate(${angle}deg)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** A soft ambient colour wash that slowly breathes — cheap depth under any content. */
export const GlowWash: React.FC<{
  color?: string;
  opacity?: number;
  x?: number;
  y?: number;
  size?: number;
}> = ({ color = '#ffffff', opacity = 0.2, x = 50, y = 8, size = 1250 }) => {
  const frame = useCurrentFrame();
  const breathe = 0.82 + 0.18 * Math.sin(frame * 0.017);
  return (
    <AbsoluteFill
      style={{
        ...LAYER,
        background: `radial-gradient(${size}px ${size * 0.55}px at ${x}% ${y}%, ${color} 0%, transparent 64%)`,
        opacity: opacity * breathe,
      }}
    />
  );
};
