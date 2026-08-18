import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ArenaBg, MatchHeader, Scoreboard, CategoryCard, Counter, CommentaryBar, Combatant, CLAMP } from '../../lib/dataleague';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';

// DLR3Ballon — Round 3, The Trophy Room. Ballon d'Or. Messi 8 - 5 Ronaldo. All-time record.
export const compositionConfig = { id: 'DLR3Ballon', durationInSeconds: 26.4, fps: 30, width: 1920, height: 1080 };

const MESSI: Combatant = { id: 'messi', name: 'Lionel Messi', short: 'MESSI', color: '#5BB8F0' };
const RONALDO: Combatant = { id: 'ronaldo', name: 'Cristiano Ronaldo', short: 'RONALDO', color: '#E8475F' };

const RecordBadge: React.FC<{ start?: number }> = ({ start = 0 }) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [start, start + 10], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });
  return (
    <div style={{
      opacity: rise, fontFamily: FONT_DISPLAY, fontSize: 24, letterSpacing: 3, color: COLORS.paper,
      background: COLORS.accent, borderRadius: RADIUS.pill, padding: '8px 22px', display: 'inline-block',
    }}>
      ALL-TIME RECORD
    </div>
  );
};

const DLR3Ballon: React.FC = () => (
  <AbsoluteFill>
    <ArenaBg glowA={MESSI.color} glowB={RONALDO.color} />
    <MatchHeader a={MESSI} b={RONALDO} start={11} top={120} />
    <Scoreboard a={MESSI} b={RONALDO} scoreA={2} scoreB={1} round="3" flash="A" start={693} />
    <CategoryCard n="3" title="THE TROPHY ROOM" note="Ballon d'Or" start={0} exit={66} />
    <div style={{ position: 'absolute', top: 360, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 160 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <Counter value={8} color={MESSI.color} label="BALLON D'OR" start={182} duration={50} fontSize={180} />
        <RecordBadge start={239} />
      </div>
      <div style={{ width: 4, height: 260, background: COLORS.line, marginTop: 20 }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <Counter value={5} color={RONALDO.color} label="BALLON D'OR" start={391} duration={40} fontSize={180} />
      </div>
    </div>
    <CommentaryBar text="Eight. The all-time record. Nobody is within three of him." start={182} exit={369} />
  </AbsoluteFill>
);
export default DLR3Ballon;
