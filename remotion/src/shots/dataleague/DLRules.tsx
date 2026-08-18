import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ArenaBg, MatchHeader, CommentaryBar, Combatant, CLAMP } from '../../lib/dataleague';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_MONO, FONT_DISPLAY, FONT_BODY } from '../../fonts';

// DLRules — two legends, eight rounds, the belt on the line. Slot 8 glows: double points.
export const compositionConfig = { id: 'DLRules', durationInSeconds: 20.1, fps: 30, width: 1920, height: 1080 };

const MESSI: Combatant = { id: 'messi', name: 'Lionel Messi', short: 'MESSI', color: '#5BB8F0' };
const RONALDO: Combatant = { id: 'ronaldo', name: 'Cristiano Ronaldo', short: 'RONALDO', color: '#E8475F' };

const Slot: React.FC<{ n: number; double?: boolean; start?: number; doubleStart?: number }> = ({ n, double, start = 0, doubleStart }) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [start, start + 10], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });
  const scale = interpolate(frame, [start, start + 10], [0.7, 1], { ...CLAMP, easing: EASINGS.overshoot });
  const ds = doubleStart ?? start;
  const pop = double ? interpolate(frame, [ds, ds + 10], [1, 0], { ...CLAMP, easing: EASINGS.easeIn }) : 0;
  const glow = double ? interpolate(frame, [ds + 4, ds + 16], [0, 1], { ...CLAMP, easing: EASINGS.overshoot }) : 1;
  const x2 = double ? interpolate(frame, [ds + 12, ds + 22], [0, 1], { ...CLAMP, easing: EASINGS.overshoot }) : 1;
  return (
    <div style={{
      opacity: rise, transform: `scale(${scale * (1 - 0.5 * pop)})`, width: 150, height: 110,
      border: `2px solid ${double ? COLORS.danger : COLORS.line}`,
      borderRadius: RADIUS.card, background: double ? `${COLORS.danger}14` : `${COLORS.d900}cc`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
      boxShadow: double ? `0 0 ${30 * glow}px ${COLORS.danger}${Math.round(0x44 * glow).toString(16)}` : undefined,
    }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 34, color: double ? COLORS.danger : COLORS.ink }}>R{n}</div>
      {double && <div style={{ fontFamily: FONT_MONO, fontSize: 16, color: COLORS.danger, letterSpacing: 2, opacity: x2 }}>x2</div>}
    </div>
  );
};

const Belt: React.FC<{ start?: number }> = ({ start = 0 }) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [start, start + 12], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });
  const scale = interpolate(frame, [start, start + 12], [0.6, 1], { ...CLAMP, easing: EASINGS.overshoot });
  return (
    <div style={{
      opacity: rise, transform: `scale(${scale})`, display: 'flex', alignItems: 'center', gap: 22,
      border: `2px solid ${COLORS.accent}`, borderRadius: RADIUS.pill, padding: '14px 36px',
      background: `${COLORS.d900}e6`, boxShadow: `0 0 40px ${COLORS.accent}33`,
    }}>
      <div style={{ width: 26, height: 26, borderRadius: '50%', border: `5px solid ${COLORS.accent}` }} />
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, color: COLORS.accent, letterSpacing: 4 }}>CHAMPIONSHIP BELT ON THE LINE</div>
    </div>
  );
};

const DLRules: React.FC = () => (
  <AbsoluteFill>
    <ArenaBg glowA={MESSI.color} glowB={RONALDO.color} />
    <MatchHeader a={MESSI} b={RONALDO} start={7} top={120} />
    <div style={{ position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 26 }}>
      {[1, 2, 3, 4].map((n) => <Slot key={n} n={n} start={46 + n * 7} />)}
    </div>
    <div style={{ position: 'absolute', top: 440, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 26 }}>
      {[5, 6, 7, 8].map((n) => <Slot key={n} n={n} double={n === 8} start={145 + n * 8} doubleStart={380} />)}
    </div>
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 170 }}>
      <Belt start={457} />
    </AbsoluteFill>
    <CommentaryBar text="Every category decided by verified numbers, not opinions." start={130} exit={218} />
    <CommentaryBar text="Round eight is worth double. The first belt in Data League history." start={380} />
  </AbsoluteFill>
);
export default DLRules;
