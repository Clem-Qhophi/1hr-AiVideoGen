// vibes — complete art direction per product category.
//
// THE PROBLEM THIS SOLVES: every video used to render on ONE backdrop (`RMBg`: dark navy gradient +
// dot grid) with only the glow colour swapped. A fintech ad, a beauty ad and a car ad all looked the
// same. That reads as a template, not art direction, and it is the fastest way for a client to
// clock the work as generic.
//
// A vibe bundles the palette AND the atmosphere AND the energy for a category, so one line
// (`<VibeBg vibe="coldDrink" />`) gives a beat that already feels like the product: cold drinks get
// bubbles + condensation + cool light, cars get speed streaks + embers + a hard vignette, beauty
// gets a LIGHT airy palette with soft bokeh.
//
// Pick the vibe from the CLIENT'S vertical, never by habit. Per-video override is expected: a vibe
// is a strong starting point, not a straitjacket — tune the palette to the client's actual brand
// colours (pull them off their real site screenshots).
import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  Particles, Smoke, LightRays, Bokeh, Condensation, SpeedLines, Grain, Vignette, GlowWash,
} from './atmosphere';
import { EvidenceBackdrop } from './evidence';

export type VibeName =
  | 'coldDrink' | 'hotDrink' | 'food'
  | 'automotive' | 'fitness' | 'gaming'
  | 'beauty' | 'luxury' | 'nature'
  | 'fintech' | 'techAI';

type AtmoLayer =
  | { kind: 'particles'; props?: React.ComponentProps<typeof Particles> }
  | { kind: 'smoke'; props?: React.ComponentProps<typeof Smoke> }
  | { kind: 'rays'; props?: React.ComponentProps<typeof LightRays> }
  | { kind: 'bokeh'; props?: React.ComponentProps<typeof Bokeh> }
  | { kind: 'condensation'; props?: React.ComponentProps<typeof Condensation> }
  | { kind: 'speedlines'; props?: React.ComponentProps<typeof SpeedLines> }
  | { kind: 'glow'; props?: React.ComponentProps<typeof GlowWash> }
  | { kind: 'vignette'; props?: React.ComponentProps<typeof Vignette> }
  | { kind: 'grain'; props?: React.ComponentProps<typeof Grain> };

export type Vibe = {
  label: string;
  /** background gradient stops */
  bg: readonly [string, string];
  /** true when the palette is light — text/panels flip to dark-on-light */
  light?: boolean;
  glow: string;
  accent: string;
  accent2: string;
  text: string;
  muted: string;
  panel: string;
  line: string;
  energy: 'calm' | 'medium' | 'high';
  /** narration guidance, so the VO matches what the eye is being told */
  voiceHint: string;
  atmosphere: readonly AtmoLayer[];
};

export const VIBES: Record<VibeName, Vibe> = {
  // ---- consumable -------------------------------------------------------
  coldDrink: {
    label: 'Cold drink / refreshment',
    bg: ['#04141f', '#062b3d'],
    glow: '#38d6ff', accent: '#5fe3ff', accent2: '#9df0ff',
    text: '#eafaff', muted: '#8fb6c7', panel: '#0a2130cc', line: '#123445',
    energy: 'medium',
    voiceHint: 'crisp, refreshing, short clauses — let the visuals carry the "cold"',
    atmosphere: [
      { kind: 'glow', props: { color: '#38d6ff', opacity: 0.26, y: 12 } },
      { kind: 'rays', props: { color: '#bff2ff', opacity: 0.08, angle: 16, originX: 26, count: 6 } },
      { kind: 'particles', props: { count: 44, color: '#cdf3ff', direction: 'up', size: [3, 9], speed: 1.1, opacity: 0.55, sway: 10, glow: true, seed: 3 } },
      { kind: 'condensation', props: { count: 60, opacity: 0.34, seed: 7 } },
      { kind: 'vignette', props: { strength: 0.5 } },
      { kind: 'grain', props: { opacity: 0.06 } },
    ],
  },
  hotDrink: {
    label: 'Hot drink / coffee / cosy',
    bg: ['#150d07', '#2f1c0e'],
    glow: '#ffb46b', accent: '#ffb46b', accent2: '#ffd9a8',
    text: '#fff3e6', muted: '#c2a288', panel: '#241509cc', line: '#3d2716',
    energy: 'calm',
    voiceHint: 'warm, unhurried, lower register — comfort not urgency',
    atmosphere: [
      { kind: 'glow', props: { color: '#ffb46b', opacity: 0.24, y: 18 } },
      { kind: 'smoke', props: { count: 6, color: '#ffe8cf', opacity: 0.15, speed: 0.85, originY: 104, seed: 5 } },
      { kind: 'bokeh', props: { count: 7, colors: ['#ffcf9a', '#ffe8cf'], opacity: 0.16, speed: 0.6, seed: 9 } },
      { kind: 'vignette', props: { strength: 0.58 } },
      { kind: 'grain', props: { opacity: 0.08 } },
    ],
  },
  food: {
    label: 'Food / appetite',
    bg: ['#1a0f08', '#37220f'],
    glow: '#ff9a3c', accent: '#ffb861', accent2: '#ffd9a0',
    text: '#fff4e8', muted: '#c8a488', panel: '#26150acc', line: '#432a15',
    energy: 'medium',
    voiceHint: 'sensory, present-tense, appetite words — describe texture and heat',
    atmosphere: [
      { kind: 'glow', props: { color: '#ff9a3c', opacity: 0.26, y: 14 } },
      { kind: 'smoke', props: { count: 5, color: '#ffe0bd', opacity: 0.13, speed: 0.9, seed: 4 } },
      { kind: 'bokeh', props: { count: 8, colors: ['#ffb861', '#ffd9a0'], opacity: 0.18, seed: 6 } },
      { kind: 'vignette', props: { strength: 0.56 } },
      { kind: 'grain', props: { opacity: 0.07 } },
    ],
  },

  // ---- high energy ------------------------------------------------------
  automotive: {
    label: 'Automotive / power / speed',
    bg: ['#050506', '#151317'],
    glow: '#ff5a1f', accent: '#ff5a1f', accent2: '#ffd166',
    text: '#f6f6f8', muted: '#8f8f9c', panel: '#141317cc', line: '#2a2830',
    energy: 'high',
    voiceHint: 'clipped, confident, hard consonants — power and control',
    atmosphere: [
      { kind: 'glow', props: { color: '#ff5a1f', opacity: 0.22, y: 88 } },
      { kind: 'speedlines', props: { count: 20, color: '#ffb480', opacity: 0.22, speed: 1.5, seed: 2 } },
      { kind: 'particles', props: { count: 34, color: '#ff9a4d', direction: 'up', size: [2, 6], speed: 1.5, opacity: 0.6, sway: 14, glow: true, seed: 8 } },
      { kind: 'vignette', props: { strength: 0.72 } },
      { kind: 'grain', props: { opacity: 0.09 } },
    ],
  },
  fitness: {
    label: 'Fitness / performance',
    bg: ['#0a0a0c', '#17171e'],
    glow: '#c6ff2e', accent: '#c6ff2e', accent2: '#9ef01a',
    text: '#f4fbe8', muted: '#8f9683', panel: '#14141acc', line: '#2b2b34',
    energy: 'high',
    voiceHint: 'driving, imperative, second person — push the viewer',
    atmosphere: [
      { kind: 'glow', props: { color: '#c6ff2e', opacity: 0.18, y: 82 } },
      { kind: 'speedlines', props: { count: 18, color: '#e3ff9a', opacity: 0.18, speed: 1.7, seed: 11 } },
      { kind: 'particles', props: { count: 28, color: '#dfff8a', direction: 'up', size: [2, 5], speed: 1.6, opacity: 0.5, glow: true, seed: 12 } },
      { kind: 'vignette', props: { strength: 0.7 } },
      { kind: 'grain', props: { opacity: 0.08 } },
    ],
  },
  gaming: {
    label: 'Gaming / neon',
    bg: ['#0a0512', '#1c0a33'],
    glow: '#c026d3', accent: '#f0abfc', accent2: '#22d3ee',
    text: '#f7ecff', muted: '#a189bb', panel: '#170a29cc', line: '#33184f',
    energy: 'high',
    voiceHint: 'hyped but not cringe — short bursts, punchy verbs',
    atmosphere: [
      { kind: 'glow', props: { color: '#c026d3', opacity: 0.3, y: 14 } },
      { kind: 'glow', props: { color: '#22d3ee', opacity: 0.2, x: 78, y: 88, size: 900 } },
      { kind: 'particles', props: { count: 40, color: '#f0abfc', direction: 'drift', size: [2, 6], opacity: 0.55, glow: true, seed: 13 } },
      { kind: 'speedlines', props: { count: 12, color: '#22d3ee', opacity: 0.14, speed: 1.9, seed: 14 } },
      { kind: 'vignette', props: { strength: 0.66 } },
      { kind: 'grain', props: { opacity: 0.08 } },
    ],
  },

  // ---- soft / premium ---------------------------------------------------
  beauty: {
    label: 'Beauty / skincare (LIGHT palette)',
    bg: ['#fbf1ef', '#f1dcd7'],
    light: true,
    glow: '#f3c2c8', accent: '#c9647f', accent2: '#e0a3ae',
    text: '#2b1f23', muted: '#8a7076', panel: '#ffffffd9', line: '#e4cfca',
    energy: 'calm',
    voiceHint: 'warm, intimate, unhurried — reassurance, never hype',
    atmosphere: [
      { kind: 'glow', props: { color: '#ffffff', opacity: 0.5, y: 6, size: 1500 } },
      { kind: 'rays', props: { color: '#ffffff', opacity: 0.22, angle: 14, originX: 24, count: 6 } },
      { kind: 'bokeh', props: { count: 9, colors: ['#ffffff', '#f7d3d8'], opacity: 0.3, speed: 0.5, size: [110, 320], seed: 15 } },
      { kind: 'particles', props: { count: 26, color: '#ffffff', direction: 'drift', size: [2, 6], opacity: 0.5, glow: true, seed: 16 } },
      { kind: 'vignette', props: { strength: 0.22, color: '#b99a94' } },
      { kind: 'grain', props: { opacity: 0.05 } },
    ],
  },
  luxury: {
    label: 'Luxury / premium (black + gold)',
    bg: ['#07060a', '#161018'],
    glow: '#d4af37', accent: '#e8c874', accent2: '#f5e2ad',
    text: '#f7f2e6', muted: '#9c9284', panel: '#12101acc', line: '#2c2620',
    energy: 'calm',
    voiceHint: 'slow, few words, long pauses — confidence through restraint',
    atmosphere: [
      { kind: 'glow', props: { color: '#d4af37', opacity: 0.18, y: 10 } },
      { kind: 'bokeh', props: { count: 7, colors: ['#e8c874', '#f5e2ad'], opacity: 0.16, speed: 0.4, size: [120, 340], seed: 17 } },
      { kind: 'particles', props: { count: 22, color: '#f5e2ad', direction: 'drift', size: [1.5, 4], opacity: 0.45, glow: true, seed: 18 } },
      { kind: 'vignette', props: { strength: 0.74 } },
      { kind: 'grain', props: { opacity: 0.09 } },
    ],
  },
  nature: {
    label: 'Nature / outdoor / fresh',
    bg: ['#071a12', '#0f2e1f'],
    glow: '#7fe3a1', accent: '#7fe3a1', accent2: '#c8f5d8',
    text: '#eafff2', muted: '#8fb8a0', panel: '#0b2418cc', line: '#1b3d2a',
    energy: 'calm',
    voiceHint: 'open, airy, descriptive — space between phrases',
    atmosphere: [
      { kind: 'glow', props: { color: '#a8f0c4', opacity: 0.2, y: 8 } },
      { kind: 'rays', props: { color: '#dcffe9', opacity: 0.13, angle: 22, originX: 22, count: 7 } },
      { kind: 'particles', props: { count: 38, color: '#dcffe9', direction: 'drift', size: [2, 6], opacity: 0.5, sway: 18, glow: true, seed: 19 } },
      { kind: 'vignette', props: { strength: 0.5 } },
      { kind: 'grain', props: { opacity: 0.06 } },
    ],
  },

  // ---- trust / authority ------------------------------------------------
  fintech: {
    label: 'Fintech / trading / authority',
    bg: ['#070d14', '#0d1c26'],
    glow: '#22c55e', accent: '#22c55e', accent2: '#6ee7a8',
    text: '#eaf5ef', muted: '#8ba396', panel: '#0b1720cc', line: '#1c2c36',
    energy: 'medium',
    voiceHint: 'authoritative, measured, no hype — trust is the product',
    atmosphere: [
      { kind: 'glow', props: { color: '#22c55e', opacity: 0.18, y: 10 } },
      { kind: 'particles', props: { count: 26, color: '#9fe8bf', direction: 'drift', size: [1.5, 4], opacity: 0.35, seed: 21 } },
      { kind: 'vignette', props: { strength: 0.62 } },
      { kind: 'grain', props: { opacity: 0.07 } },
    ],
  },
  techAI: {
    label: 'Tech / AI / software',
    bg: ['#0d1117', '#161b2e'],
    glow: '#22d3ee', accent: '#22d3ee', accent2: '#818cf8',
    text: '#eef4f8', muted: '#8b98a9', panel: '#131a26cc', line: '#232b3a',
    energy: 'medium',
    voiceHint: 'clear, confident, specific — numbers and sources carry it',
    atmosphere: [
      { kind: 'glow', props: { color: '#22d3ee', opacity: 0.2, y: 8 } },
      { kind: 'particles', props: { count: 30, color: '#a5e9f5', direction: 'drift', size: [1.5, 4], opacity: 0.34, seed: 23 } },
      { kind: 'vignette', props: { strength: 0.6 } },
      { kind: 'grain', props: { opacity: 0.07 } },
    ],
  },
};

/** Keyword → vibe, so a Director step can map "iced tea brand" to `coldDrink` without hardcoding. */
export const vibeFor = (subject: string): VibeName => {
  const s = subject.toLowerCase();
  const has = (...w: string[]) => w.some((k) => s.includes(k));
  if (has('coffee', 'espresso', 'tea', 'latte', 'cocoa', 'hot chocolate')) return 'hotDrink';
  if (has('drink', 'soda', 'juice', 'beer', 'cola', 'water', 'beverage', 'iced', 'smoothie')) return 'coldDrink';
  if (has('car', 'auto', 'vehicle', 'truck', 'ev', 'motorcycle', 'tyre', 'tire', 'engine')) return 'automotive';
  if (has('gym', 'fitness', 'workout', 'training', 'athlete', 'supplement', 'protein')) return 'fitness';
  if (has('game', 'gaming', 'esport', 'console')) return 'gaming';
  if (has('beauty', 'skincare', 'cosmetic', 'makeup', 'serum', 'lotion', 'hair', 'spa')) return 'beauty';
  if (has('luxury', 'watch', 'jewel', 'premium', 'designer', 'perfume', 'fragrance')) return 'luxury';
  if (has('nature', 'outdoor', 'eco', 'organic', 'garden', 'travel', 'hike')) return 'nature';
  if (has('food', 'restaurant', 'meal', 'snack', 'pizza', 'burger', 'recipe', 'kitchen')) return 'food';
  if (has('trading', 'prop', 'finance', 'fintech', 'bank', 'invest', 'crypto', 'loan', 'insurance')) return 'fintech';
  return 'techAI';
};

/**
 * Evidence backdrop, COLOUR-GRADED into the vibe.
 *
 * An ad has to stay evidence-backed (real screenshots behind the claims) AND art-directed. Dimming a
 * screenshot with flat black makes it read as a pasted-in slide; grading it toward the vibe's own
 * background colour and laying the vibe's ambient atmosphere over it makes it read as one film.
 *
 * Only AMBIENT layers are carried over (glow / particles / bokeh / rays / vignette / grain).
 * `condensation`, `smoke` and `speedlines` are deliberately skipped here — over a UI screenshot they
 * read as dirt or scratches rather than physics. Compose those manually on product beats instead.
 */
export const VibeEvidenceBg: React.FC<{
  vibe: VibeName;
  image: string;
  /** darkening/grade strength, 0-1 */
  dim?: number;
  frames?: number;
  drift?: boolean;
}> = ({ vibe, image, dim = 0.82, frames = 300, drift = true }) => {
  const v = VIBES[vibe];
  const ambient = v.atmosphere.filter(
    (l) => l.kind === 'glow' || l.kind === 'particles' || l.kind === 'bokeh' || l.kind === 'rays' || l.kind === 'vignette' || l.kind === 'grain',
  );
  return (
    <>
      <EvidenceBackdrop image={image} dim={dim} frames={frames} drift={drift} tint={v.bg[0]} />
      {ambient.map((layer, i) => {
        const k = `ve-${layer.kind}-${i}`;
        switch (layer.kind) {
          case 'glow': return <GlowWash key={k} {...layer.props} />;
          case 'particles': return <Particles key={k} {...layer.props} />;
          case 'bokeh': return <Bokeh key={k} {...layer.props} />;
          case 'rays': return <LightRays key={k} {...layer.props} />;
          // The backdrop dim is ALREADY darkening the frame; applying the vibe's full vignette on
          // top double-darkens it and buries the evidence. Soften it here so screenshots stay
          // readable — the whole point of an evidence beat is that you can SEE the proof.
          case 'vignette': return <Vignette key={k} {...layer.props} strength={(layer.props?.strength ?? 0.6) * 0.55} />;
          case 'grain': return <Grain key={k} {...layer.props} />;
          default: return null;
        }
      })}
    </>
  );
};

/**
 * One-line backdrop for a beat. Renders the vibe's gradient plus every atmosphere layer in order.
 * Put content in a sibling <AbsoluteFill> ABOVE this, never inside it.
 */
export const VibeBg: React.FC<{ vibe: VibeName; children?: React.ReactNode }> = ({ vibe, children }) => {
  const v = VIBES[vibe];
  return (
    <>
      <AbsoluteFill style={{ background: `linear-gradient(160deg, ${v.bg[0]}, ${v.bg[1]})` }} />
      {v.atmosphere.map((layer, i) => {
        const k = `${layer.kind}-${i}`;
        switch (layer.kind) {
          case 'particles': return <Particles key={k} {...layer.props} />;
          case 'smoke': return <Smoke key={k} {...layer.props} />;
          case 'rays': return <LightRays key={k} {...layer.props} />;
          case 'bokeh': return <Bokeh key={k} {...layer.props} />;
          case 'condensation': return <Condensation key={k} {...layer.props} />;
          case 'speedlines': return <SpeedLines key={k} {...layer.props} />;
          case 'glow': return <GlowWash key={k} {...layer.props} />;
          case 'vignette': return <Vignette key={k} {...layer.props} />;
          case 'grain': return <Grain key={k} {...layer.props} />;
          default: return null;
        }
      })}
      {children}
    </>
  );
};
