import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ArenaBg, MatchHeader, Scoreboard, CategoryCard, H2HMeter, CommentaryBar, Combatant, CLAMP } from '../../lib/dataleague';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_MONO, FONT_DISPLAY, FONT_BODY } from '../../fonts';

// DLR7Ratio — Round 7, The Efficiency. Goals per game. Messi 0.79 - 0.73 Ronaldo. The closest round.
export const compositionConfig = { id: 'DLR7Ratio', durationInSeconds: 31.0, fps: 30, width: 1920, height: 1080 };

const MESSI: Combatant = { id: 'messi', name: 'Lionel Messi', short: 'MESSI', color: '#5BB8F0' };
const RONALDO: Combatant = { id: 'ronaldo', name: 'Cristiano Ronaldo', short: 'RONALDO', color: '#E8475F' };

const RatioCallout: React.FC<{ start?: number }> = ({ start = 0 }) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [start, start + 12], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });
  const scale = interpolate(frame, [start, start + 12], [1.3, 1], { ...CLAMP, easing: EASINGS.overshoot });
  return (
    <div style={{
      opacity: rise, transform: `scale(${scale})`, display: 'flex', alignItems: 'center', gap: 34,
      border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card, padding: '24px 48px',
      background: `${COLORS.d900}ee`, boxShadow: `0 0 40px ${MESSI.color}33`,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 96, fontWeight: 700, color: MESSI.color, lineHeight: 1 }}>0.79</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: COLORS.muted, letterSpacing: 2, marginTop: 8 }}>MESSI</div>
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 40, color: COLORS.muted }}>vs</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 96, fontWeight: 700, color: RONALDO.color, lineHeight: 1 }}>0.73</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: COLORS.muted, letterSpacing: 2, marginTop: 8 }}>RONALDO</div>
      </div>
      <div style={{ width: 3, height: 90, background: COLORS.line }} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 52, fontWeight: 700, color: COLORS.accent, lineHeight: 1 }}>+0.06</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 18, color: COLORS.muted, letterSpacing: 2, marginTop: 8 }}>GOALS PER GAME</div>
      </div>
    </div>
  );
};

const DLR7Ratio: React.FC = () => (
  <AbsoluteFill>
    <ArenaBg glowA={MESSI.color} glowB={RONALDO.color} />
    <MatchHeader a={MESSI} b={RONALDO} start={11} top={120} />
    <Scoreboard a={MESSI} b={RONALDO} scoreA={4} scoreB={3} round="7" flash="A" start={720} />
    <CategoryCard n="7" title="THE EFFICIENCY" note="Goals per game" start={0} exit={65} />
    <div style={{ position: 'absolute', top: 320, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 1400 }}>
        <H2HMeter a={MESSI} b={RONALDO} valueA={0.79} valueB={0.73} start={247} />
      </div>
    </div>
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 165 }}>
      <RatioCallout start={458} />
    </AbsoluteFill>
    <CommentaryBar text="Zero point seven nine. The closest race of the night." start={169} exit={281} />
  </AbsoluteFill>
);
export default DLR7Ratio;
