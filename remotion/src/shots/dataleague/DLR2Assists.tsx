import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ArenaBg, MatchHeader, Scoreboard, CategoryCard, H2HMeter, CommentaryBar, Combatant, CLAMP } from '../../lib/dataleague';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_MONO, FONT_BODY } from '../../fonts';

// DLR2Assists — Round 2, The Artist. Career assists. Messi 418 - 261 Ronaldo. A walk, not a race.
export const compositionConfig = { id: 'DLR2Assists', durationInSeconds: 35.9, fps: 30, width: 1920, height: 1080 };

const MESSI: Combatant = { id: 'messi', name: 'Lionel Messi', short: 'MESSI', color: '#5BB8F0' };
const RONALDO: Combatant = { id: 'ronaldo', name: 'Cristiano Ronaldo', short: 'RONALDO', color: '#E8475F' };

const GapCallout: React.FC<{ start?: number }> = ({ start = 0 }) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [start, start + 10], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });
  return (
    <div style={{
      opacity: rise, fontFamily: FONT_BODY, fontSize: 26, color: COLORS.ink,
      border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.pill, padding: '10px 26px',
      background: `${COLORS.d900}cc`, display: 'inline-block',
    }}>
      MESSI <span style={{ fontFamily: FONT_MONO, color: MESSI.color }}>157</span> CLEAR — THE CREATOR WINS
    </div>
  );
};

const DLR2Assists: React.FC = () => (
  <AbsoluteFill>
    <ArenaBg glowA={MESSI.color} glowB={RONALDO.color} />
    <MatchHeader a={MESSI} b={RONALDO} start={11} top={120} />
    <Scoreboard a={MESSI} b={RONALDO} scoreA={1} scoreB={1} round="2" flash="A" start={926} />
    <CategoryCard n="2" title="THE ARTIST" note="Career assists" start={0} exit={61} />
    <div style={{ position: 'absolute', top: 430, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 1400 }}>
        <H2HMeter a={MESSI} b={RONALDO} valueA={418} valueB={261} start={276} />
      </div>
    </div>
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 170 }}>
      <GapCallout start={642} />
    </AbsoluteFill>
    <CommentaryBar text="Sources differ by one assist. We're using four hundred eighteen." start={467} exit={583} />
  </AbsoluteFill>
);
export default DLR2Assists;
