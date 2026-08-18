import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ArenaBg, MatchHeader, Scoreboard, CategoryCard, Counter, CommentaryBar, Combatant, CLAMP } from '../../lib/dataleague';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';

// DLR5Money — Round 5, The Money. Career earnings (estimates). Ronaldo $2.1B - $1.8B Messi.
export const compositionConfig = { id: 'DLR5Money', durationInSeconds: 33.33, fps: 30, width: 1920, height: 1080 };

const MESSI: Combatant = { id: 'messi', name: 'Lionel Messi', short: 'MESSI', color: '#5BB8F0' };
const RONALDO: Combatant = { id: 'ronaldo', name: 'Cristiano Ronaldo', short: 'RONALDO', color: '#E8475F' };

const EstTag: React.FC<{ color: string; start?: number }> = ({ color, start = 0 }) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [start, start + 10], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });
  return (
    <div style={{
      opacity: rise, fontFamily: FONT_MONO, fontSize: 18, letterSpacing: 3, color: COLORS.warn,
      border: `1px solid ${COLORS.warn}66`, borderRadius: RADIUS.pill, padding: '6px 18px', display: 'inline-block',
    }}>
      ESTIMATE · FORBES
    </div>
  );
};

const DLR5Money: React.FC = () => (
  <AbsoluteFill>
    <ArenaBg glowA={MESSI.color} glowB={RONALDO.color} />
    <MatchHeader a={MESSI} b={RONALDO} start={12} top={120} />
    <Scoreboard a={MESSI} b={RONALDO} scoreA={3} scoreB={2} round="5" flash="B" start={889} />
    <CategoryCard n="5" title="THE MONEY" note="Career earnings · pre-tax · estimate" start={0} exit={61} />
    <div style={{ position: 'absolute', top: 350, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 160 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <Counter value={2.1} color={RONALDO.color} label="CAREER EARNINGS ($B)" start={423} duration={50} fontSize={170} />
        <EstTag color={RONALDO.color} start={423} />
      </div>
      <div style={{ width: 4, height: 250, background: COLORS.line, marginTop: 20 }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <Counter value={1.8} color={MESSI.color} label="CAREER EARNINGS ($B)" start={528} duration={40} fontSize={170} />
        <EstTag color={MESSI.color} start={528} />
      </div>
    </div>
    <CommentaryBar text="The first active athlete ever past two billion. Estimate, per Forbes." start={297} exit={507} />
  </AbsoluteFill>
);
export default DLR5Money;
