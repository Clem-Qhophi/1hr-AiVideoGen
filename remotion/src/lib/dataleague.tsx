// THE DATA LEAGUE chart-kit — shared broadcast components for every showdown shot.
// NOT a shot itself (no compositionConfig; lives outside src/shots so gen-registry
// never scans it). Frame-based only: monotonic interpolate ranges + clamp.
// Combatant colors are fixed per match and passed in — never random per frame.
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../fonts';

export const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
export const fmt = (n: number): string => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  if (n < 10 && n % 1 !== 0) return n.toFixed(n >= 1 ? 1 : 2);
  return `${Math.round(n)}`;
};

export type Combatant = {
  id: string;
  name: string;
  short: string;
  color: string;
  dark?: string;
};

// =============================================================================
// Arena backdrop — the dark studio floor + combatant glow
// =============================================================================
export const ArenaBg: React.FC<{ glowA?: string; glowB?: string }> = ({ glowA = COLORS.accent, glowB = COLORS.accent2 }) => (
  <>
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }} />
    <AbsoluteFill style={{ background: `radial-gradient(1100px 700px at 22% -10%, ${glowA}26, transparent 55%), radial-gradient(1100px 700px at 82% 110%, ${glowB}1f, transparent 55%)` }} />
    <AbsoluteFill style={{ backgroundImage: `linear-gradient(${COLORS.line}14 1px, transparent 1px), linear-gradient(90deg, ${COLORS.line}14 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
    <AbsoluteFill style={{ background: 'radial-gradient(900px 500px at 50% 120%, rgba(0,0,0,0.55), transparent 70%)' }} />
  </>
);

// =============================================================================
// Combatant chip — name + color block, used in headers and scoreboards
// =============================================================================
export const CombatantChip: React.FC<{
  c: Combatant;
  score?: number;
  leading?: boolean;
  align?: 'left' | 'right';
  start?: number;
}> = ({ c, score, leading, align = 'left', start = 0 }) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [start, start + 10], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const y = interpolate(frame, [start, start + 10], [20, 0], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <div style={{
      opacity: rise, transform: `translateY(${y}px)`,
      display: 'flex', alignItems: 'center', gap: 16, flexDirection: align === 'right' ? 'row-reverse' : 'row',
    }}>
      <div style={{ width: 14, height: 14, borderRadius: 4, background: c.color, boxShadow: `0 0 14px ${c.color}88` }} />
      <div style={{ textAlign: align }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 34, color: COLORS.ink, lineHeight: 1 }}>{c.name}</div>
        {score !== undefined && (
          <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: leading ? c.color : COLORS.muted, marginTop: 4 }}>
            {score} {leading ? '●' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// MatchHeader — two combatants facing off with the VS mark
// =============================================================================
export const MatchHeader: React.FC<{ a: Combatant; b: Combatant; start?: number; top?: number }> = ({ a, b, start = 0, top = 64 }) => (
  <div style={{ position: 'absolute', top, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 110px' }}>
    <CombatantChip c={a} align="left" start={start} />
    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 46, color: COLORS.muted, letterSpacing: 2 }}>VS</div>
    <CombatantChip c={b} align="right" start={start + 3} />
  </div>
);

// =============================================================================
// Scoreboard — the permanent top-right broadcast scoreline
// =============================================================================
export const Scoreboard: React.FC<{
  a: Combatant; b: Combatant;
  scoreA: number; scoreB: number;
  round?: string;
  flash?: 'A' | 'B' | null;
  start?: number;
}> = ({ a, b, scoreA, scoreB, round, flash, start = 0 }) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [start, start + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const y = interpolate(frame, [start, start + 12], [-16, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const pop = (flash: 'A' | 'B' | null | undefined, color: 'A' | 'B') =>
    flash === color ? 1 + 0.22 * Math.max(0, Math.min(1, (start + 8 - frame) / 8)) : 1;
  const popA = pop(flash, 'A');
  const popB = pop(flash, 'B');
  return (
    <div style={{
      position: 'absolute', top: 30, right: 60, opacity: rise, transform: `translateY(${y}px)`,
      display: 'flex', alignItems: 'center', gap: 0,
      background: `${COLORS.d900}f2`, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.panel,
      boxShadow: SHADOW.card, overflow: 'hidden',
    }}>
      <div style={{ padding: '10px 22px', background: flash === 'A' ? `${a.color}22` : 'transparent', transform: `scale(${popA})`, textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: a.color, lineHeight: 1 }}>{a.short}</div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 30, color: COLORS.ink, lineHeight: 1.15 }}>{scoreA}</div>
      </div>
      <div style={{ width: 2, height: 46, background: COLORS.line }} />
      <div style={{ padding: '10px 22px', background: flash === 'B' ? `${b.color}22` : 'transparent', transform: `scale(${popB})`, textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: b.color, lineHeight: 1 }}>{b.short}</div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 30, color: COLORS.ink, lineHeight: 1.15 }}>{scoreB}</div>
      </div>
      {round && (
        <>
          <div style={{ width: 2, height: 46, background: COLORS.line }} />
          <div style={{ padding: '10px 16px', textAlign: 'center' }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLORS.muted, letterSpacing: 1, textTransform: 'uppercase' }}>Round</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: COLORS.warn, lineHeight: 1.1 }}>{round}</div>
          </div>
        </>
      )}
    </div>
  );
};

// =============================================================================
// H2HMeter — the head-to-head split bar (share of the category)
// =============================================================================
export const H2HMeter: React.FC<{
  a: Combatant; b: Combatant;
  valueA: number; valueB: number;
  start?: number;
}> = ({ a, b, valueA, valueB, start = 0 }) => {
  const frame = useCurrentFrame();
  const total = valueA + valueB || 1;
  const pctA = (valueA / total) * 100;
  const grow = interpolate(frame, [start, start + 24], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const appear = interpolate(frame, [start, start + 8], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const fillA = pctA * grow;
  return (
    <div style={{ opacity: appear, width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 26, color: a.color }}>{fmt(valueA)}</div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 26, color: b.color }}>{fmt(valueB)}</div>
      </div>
      <div style={{ position: 'relative', width: '100%', height: 22, background: COLORS.d900, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.pill, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fillA}%`,
          background: a.color, borderRadius: RADIUS.pill, boxShadow: `0 0 18px ${a.color}66`,
        }} />
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: `${100 - fillA}%`,
          background: `${b.color}aa`,
        }} />
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: `${fillA}%`, width: 3,
          background: COLORS.ink, transform: 'translateX(-1.5px)',
        }} />
      </div>
    </div>
  );
};

// =============================================================================
// CategoryCard — the round intro card
// =============================================================================
export const CategoryCard: React.FC<{
  n: string; title: string; note?: string;
  color?: string; start?: number; exit?: number;
}> = ({ n, title, note, color = COLORS.accent, start = 0, exit }) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [start, start + 10], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const y = interpolate(frame, [start, start + 10], [30, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const sweep = interpolate(frame, [start + 12, start + 22], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const out = exit !== undefined ? interpolate(frame, [exit, exit + 8], [1, 0], { ...CLAMP, easing: EASINGS.easeIn }) : 1;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', fontFamily: FONT_DISPLAY, opacity: rise * out, transform: `translateY(${y}px)` }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 18,
        border: `1px solid ${color}55`, background: `${COLORS.d900}cc`, borderRadius: RADIUS.card,
        padding: '34px 56px', boxShadow: SHADOW.card, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: `${sweep * 100}%`,
          background: `linear-gradient(90deg, ${color}2e, transparent)`,
        }} />
        <div style={{ fontFamily: FONT_MONO, fontSize: 30, color, letterSpacing: 3 }}>R{n}</div>
        <div style={{ width: 3, height: 52, background: color }} />
        <div>
          <div style={{ fontSize: 64, color: COLORS.ink, lineHeight: 1 }}>{title}</div>
          {note && <div style={{ fontFamily: FONT_BODY, fontSize: 24, color: COLORS.muted, marginTop: 8 }}>{note}</div>}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// RaceLine — THE hero graphic. Two lines racing through time.
// points: [{ label, a, b }] — label is the time axis, a/b the two values.
// start: frame where the race begins drawing. duration: frames for full draw.
// =============================================================================
export const RaceLine: React.FC<{
  a: Combatant; b: Combatant;
  points: { label: string; a: number; b: number }[];
  start?: number;
  duration?: number;
  height?: number;
  source?: string;
}> = ({ a, b, points, start = 0, duration = 90, height = 380, source }) => {
  const frame = useCurrentFrame();
  const W = 1500, H = height, PAD = { l: 90, r: 160, t: 40, b: 56 };
  const iw = W - PAD.l - PAD.r, ih = H - PAD.t - PAD.b;
  const max = Math.max(...points.map((p) => Math.max(p.a, p.b)), 1);
  const progress = interpolate(frame, [start, start + duration], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  const appear = interpolate(frame, [start, start + 8], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const xAt = (i: number) => PAD.l + (i / (points.length - 1)) * iw;
  const yAt = (v: number) => PAD.t + ih - (v / max) * ih;
  const drawTo = Math.max(2, Math.floor(progress * points.length));
  const lastA = points[Math.min(drawTo, points.length - 1)].a;
  const lastB = points[Math.min(drawTo, points.length - 1)].b;
  const lineA = points.slice(0, drawTo).map((p, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${yAt(p.a).toFixed(1)}`).join(' ');
  const lineB = points.slice(0, drawTo).map((p, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${yAt(p.b).toFixed(1)}`).join(' ');
  const gridVals = [0.25, 0.5, 0.75, 1].map((f) => max * f);
  return (
    <div style={{
      opacity: appear, width: W, height: H,
      background: `${COLORS.d900}cc`, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card,
      boxShadow: SHADOW.card, position: 'relative', padding: '26px 30px',
    }}>
      {/* gridlines + labels */}
      {gridVals.map((gv) => (
        <React.Fragment key={gv}>
          <div style={{ position: 'absolute', left: PAD.l, right: PAD.r, top: yAt(gv), height: 1, background: `${COLORS.line}55` }} />
          <div style={{ position: 'absolute', left: 14, top: yAt(gv) - 12, fontFamily: FONT_MONO, fontSize: 16, color: COLORS.muted }}>{fmt(gv)}</div>
        </React.Fragment>
      ))}
      {/* time labels */}
      {[0, Math.floor(points.length / 2), points.length - 1].map((i) => (
        <div key={i} style={{ position: 'absolute', left: xAt(i) - 40, top: H - 30, width: 80, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 16, color: COLORS.muted }}>
          {points[i].label}
        </div>
      ))}
      <svg width={W - 60} height={H} style={{ position: 'absolute', left: 30, top: 26 }}>
        {lineA && <path d={lineA} fill="none" stroke={a.color} strokeWidth={5} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${a.color}66)` }} />}
        {lineB && <path d={lineB} fill="none" stroke={b.color} strokeWidth={5} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${b.color}66)` }} />}
      </svg>
      {/* live end labels */}
      <div style={{ position: 'absolute', left: PAD.l + iw + 20, top: yAt(lastA) - 30, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{ width: 14, height: 14, borderRadius: 4, background: a.color, boxShadow: `0 0 12px ${a.color}` }} />
        <div style={{ fontFamily: FONT_MONO, fontSize: 26, color: a.color, lineHeight: 1.15 }}>{fmt(lastA)}</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 17, color: COLORS.muted }}>{a.short}</div>
      </div>
      <div style={{ position: 'absolute', left: PAD.l + iw + 20, top: yAt(lastB) + 6, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{ width: 14, height: 14, borderRadius: 4, background: b.color, boxShadow: `0 0 12px ${b.color}` }} />
        <div style={{ fontFamily: FONT_MONO, fontSize: 26, color: b.color, lineHeight: 1.15 }}>{fmt(lastB)}</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 17, color: COLORS.muted }}>{b.short}</div>
      </div>
      {source && (
        <div style={{ position: 'absolute', bottom: 12, right: 18, fontFamily: FONT_BODY, fontSize: 14, color: COLORS.muted, opacity: 0.7 }}>
          Source: {source}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// Counter — big count-up number (for "then vs now" and category reveals)
// =============================================================================
export const Counter: React.FC<{
  value: number; color?: string; label?: string;
  start?: number; duration?: number; fontSize?: number;
}> = ({ value, color = COLORS.accent, label, start = 0, duration = 40, fontSize = 120 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [start, start + duration], [0, value], { ...CLAMP, easing: EASINGS.easeOut });
  const appear = interpolate(frame, [start, start + 8], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <div style={{ opacity: appear, textAlign: 'center' }}>
      <div style={{ fontFamily: FONT_MONO, fontSize, fontWeight: 700, color, lineHeight: 1, textShadow: `0 0 30px ${color}55` }}>
        {fmt(Math.round(t))}
      </div>
      {label && <div style={{ fontFamily: FONT_BODY, fontSize: 22, color: COLORS.muted, marginTop: 8 }}>{label}</div>}
    </div>
  );
};

// =============================================================================
// BeltReveal — the celebration: trophy belt + winner name + confetti burst
// =============================================================================
export const BeltReveal: React.FC<{
  winner: Combatant; scoreline: string;
  start?: number;
}> = ({ winner, scoreline, start = 0 }) => {
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [start, start + 10], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });
  const scale = interpolate(frame, [start, start + 10], [0.6, 1], { ...CLAMP, easing: EASINGS.overshoot });
  const shake = frame > start + 10 && frame < start + 16 ? (frame % 2 === 0 ? 3 : -3) : 0;
  const flash = interpolate(frame, [start, start + 6], [1, 0], { ...CLAMP });
  const part = (seed: number) => {
    const i = seed;
    const x = 940 + Math.cos(i * 2.399) * 320 * interpolate(frame, [start, start + 30], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
    const y = 540 + Math.sin(i * 1.618) * 260 * interpolate(frame, [start, start + 30], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
    return { x, y, rot: i * 60, color: [COLORS.accent, COLORS.accent2, COLORS.signal, COLORS.warn][i % 4] };
  };
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(700px 500px at 50% 45%, ${winner.color}33, transparent 65%)`, opacity: flash }} />
      {Array.from({ length: 26 }, (_, i) => i).map((i) => {
        const p = part(i);
        return (
          <div key={i} style={{
            position: 'absolute', left: p.x, top: p.y, width: 10, height: 10, background: p.color,
            transform: `rotate(${p.rot}deg)`, borderRadius: 2, opacity: flash,
          }} />
        );
      })}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: appear, transform: `translateX(${shake}px)` }}>
        <div style={{
          width: 300, height: 300, borderRadius: '50%',
          border: `10px solid ${winner.color}`, boxShadow: `0 0 60px ${winner.color}88, inset 0 0 40px ${winner.color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 30,
          transform: `scale(${scale})`,
        }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 110, color: winner.color, lineHeight: 1 }}>🏆</div>
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 72, color: winner.color, lineHeight: 1, textShadow: `0 0 40px ${winner.color}66` }}>
          {winner.name.toUpperCase()}
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 30, color: COLORS.ink, marginTop: 12 }}>{scoreline}</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 20, color: COLORS.muted, marginTop: 14, letterSpacing: 3 }}>TAKES THE BELT</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =============================================================================
// SuddenDeath — tie-break overlay
// =============================================================================
export const SuddenDeath: React.FC<{ start?: number }> = ({ start = 0 }) => {
  const frame = useCurrentFrame();
  const pulse = interpolate(frame, [start, start + 30], [1, 1.04], { ...CLAMP, easing: Easing.out(Easing.sin) });
  const appear = interpolate(frame, [start, start + 8], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: appear }}>
      <div style={{ border: `3px solid ${COLORS.danger}`, borderRadius: RADIUS.card, padding: '30px 70px', background: `${COLORS.d900}f0`, transform: `scale(${pulse})`, boxShadow: `0 0 50px ${COLORS.danger}55` }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 80, color: COLORS.danger, lineHeight: 1, letterSpacing: 4 }}>SUDDEN DEATH</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 24, color: COLORS.muted, marginTop: 12, textAlign: 'center' }}>Level after {`8 rounds`} — one category. Winner takes it all.</div>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// WordmarkShot — the league brand card (video open / end)
// =============================================================================
export const WordmarkShot: React.FC<{ subtitle?: string; start?: number }> = ({ subtitle, start = 0 }) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [start, start + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const y = interpolate(frame, [start, start + 14], [40, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const glow = interpolate(frame, [start, start + 30], [0.4, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', fontFamily: FONT_DISPLAY, opacity: rise, transform: `translateY(${y}px)` }}>
      <div style={{ fontSize: 130, color: COLORS.ink, lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: 24 }}>
        <span>THE DATA</span>
        <span style={{ color: COLORS.accent, textShadow: `0 0 ${50 * glow}px ${COLORS.accent}66` }}>LEAGUE</span>
      </div>
      {subtitle && <div style={{ fontFamily: FONT_BODY, fontSize: 30, color: COLORS.muted, marginTop: 22, letterSpacing: 2 }}>{subtitle}</div>}
      <div style={{ width: 640, height: 3, background: `linear-gradient(90deg, transparent, ${COLORS.accent}, ${COLORS.accent2}, transparent)`, marginTop: 34 }} />
    </AbsoluteFill>
  );
};

// =============================================================================
// CommentaryBar — the broadcast caption under the scoreboard
// =============================================================================
export const CommentaryBar: React.FC<{ text: string; start?: number; exit?: number }> = ({ text, start = 0, exit }) => {
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [start, start + 6], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const out = exit !== undefined ? interpolate(frame, [exit, exit + 6], [1, 0], { ...CLAMP, easing: EASINGS.easeIn }) : 1;
  return (
    <div style={{
      position: 'absolute', bottom: 46, left: '50%', transform: 'translateX(-50%)',
      opacity: appear * out, maxWidth: 1500,
      background: `${COLORS.d900}ee`, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.pill,
      padding: '12px 34px', fontFamily: FONT_BODY, fontSize: 26, color: COLORS.ink,
      boxShadow: SHADOW.card, textAlign: 'center',
    }}>
      {text}
    </div>
  );
};