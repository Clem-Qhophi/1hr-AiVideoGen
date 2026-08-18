import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from 'remotion';
import { ArenaBg, MatchHeader, Scoreboard, CategoryCard, H2HMeter, CommentaryBar, BeltReveal, Combatant, CLAMP } from '../../lib/dataleague';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';

// DLR8Hattrick — Round 8, DOUBLE POINTS. The Hat-Trick. Ronaldo 66 - 61 Messi. The belt changes hands.
export const compositionConfig = { id: 'DLR8Hattrick', durationInSeconds: 43.6, fps: 30, width: 1920, height: 1080 };

const MESSI: Combatant = { id: 'messi', name: 'Lionel Messi', short: 'MESSI', color: '#5BB8F0' };
const RONALDO: Combatant = { id: 'ronaldo', name: 'Cristiano Ronaldo', short: 'RONALDO', color: '#E8475F' };

const DoublePulse: React.FC<{ start?: number; exit?: number }> = ({ start = 0, exit = 1e9 }) => {
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [start, start + 8], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const pulse = interpolate(frame, [start, start + 30], [1, 1.05], { ...CLAMP, easing: Easing.out(Easing.sin) });
  const out = interpolate(frame, [exit, exit + 8], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: appear * out }}>
      <div style={{
        border: `3px solid ${COLORS.danger}`, borderRadius: RADIUS.card, padding: '28px 64px',
        background: `${COLORS.d900}f0`, transform: `scale(${pulse})`, boxShadow: `0 0 50px ${COLORS.danger}55`,
      }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 74, color: COLORS.danger, lineHeight: 1, letterSpacing: 4 }}>DOUBLE POINTS</div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 24, color: COLORS.muted, marginTop: 12, textAlign: 'center' }}>
          WIN THIS ROUND · IT IS YOURS
        </div>
      </div>
    </AbsoluteFill>
  );
};

const DLR8Hattrick: React.FC = () => (
  <AbsoluteFill>
    <ArenaBg glowA={MESSI.color} glowB={RONALDO.color} />
    <MatchHeader a={MESSI} b={RONALDO} start={11} top={120} />
    <Scoreboard a={MESSI} b={RONALDO} scoreA={4} scoreB={5} round="8" flash="B" start={1083} />
    <CategoryCard n="8" title="THE HAT-TRICK" note="Three goals in one game · double points" start={0} exit={53} />
    <DoublePulse start={43} exit={189} />
    <div style={{ position: 'absolute', top: 340, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 1400 }}>
        <H2HMeter a={RONALDO} b={MESSI} valueA={66} valueB={61} start={663} />
      </div>
    </div>
    <CommentaryBar text="Sixty six beats sixty one. And the final round is worth two." start={797} exit={941} />
    <BeltReveal winner={RONALDO} scoreline="RONALDO 5 - 4 MESSI" start={941} />
  </AbsoluteFill>
);
export default DLR8Hattrick;
