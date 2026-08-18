// THE DATA LEAGUE brand tokens. Import these in every shot so all videos stay
// consistent; change a value here and every shot updates.
//
// Dark-arena broadcast identity: deep navy-black floor, volt scoreboard green
// and electric cyan as the neon, Anton condensed caps for the wordmark.
// Combatant colors are per-match (see lib/dataleague.tsx) — never hardcoded here.
import { Easing } from 'remotion';

export const BRAND = {
  wordmark: ['THE DATA', 'LEAGUE', ''] as readonly string[],
  signoff: 'And the numbers have spoken',
} as const;

export const COLORS = {
  accent: '#C8FF30',
  accent2: '#29D8FF',
  signal: '#3DDB8A',
  signalAlt: '#3DDB8A',
  warn: '#FFB547',
  danger: '#FF4D5E',
  ink: '#F2F5FA',
  muted: '#8B97AC',
  paper: '#0A0F1E',
  cream: '#111B2E',
  line: '#1E2B45',
  d900: '#070C16',
  d800: '#0A0F1E',
  d600: '#1E2B45',
  d400: '#8B97AC',
  d300: '#C7D0E0',
} as const;

export const GRADIENT = `linear-gradient(120deg, ${COLORS.accent}, ${COLORS.accent2})`;

export const RADIUS = { card: 16, panel: 14, window: 10, pill: 999 } as const;

export const SHADOW = {
  soft: '0 8px 32px rgba(7,12,22,0.55)',
  card: '0 10px 40px rgba(7,12,22,0.5)',
} as const;

export const EASINGS = {
  easeOut: Easing.bezier(0.33, 1, 0.68, 1),
  easeIn: Easing.bezier(0.32, 0, 0.67, 0),
  easeInOut: Easing.bezier(0.37, 0, 0.63, 1),
  overshoot: Easing.bezier(0.34, 1.4, 0.64, 1),
} as const;