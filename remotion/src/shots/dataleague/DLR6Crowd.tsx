import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ArenaBg, MatchHeader, Scoreboard, CategoryCard, RaceLine, CommentaryBar, Combatant, CLAMP } from '../../lib/dataleague';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';

// DLR6Crowd — Round 6, The Crowd. Instagram followers. Ronaldo 677M - 515M Messi. The overtake round.
export const compositionConfig = { id: 'DLR6Crowd', durationInSeconds: 38.1, fps: 30, width: 1920, height: 1080 };

const MESSI: Combatant = { id: 'messi', name: 'Lionel Messi', short: 'MESSI', color: '#5BB8F0' };
const RONALDO: Combatant = { id: 'ronaldo', name: 'Cristiano Ronaldo', short: 'RONALDO', color: '#E8475F' };

const POINTS = [
  { label: '13', a: 20, b: 22 },
  { label: '15', a: 60, b: 55 },
  { label: '17', a: 100, b: 110 },
  { label: '19', a: 150, b: 170 },
  { label: '21', a: 230, b: 260 },
  { label: '23', a: 430, b: 530 },
  { label: '26', a: 515, b: 677 },
];

const YTCards: React.FC<{ start?: number }> = ({ start = 0 }) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [start, start + 10], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });
  return (
    <div style={{ opacity: rise, display: 'flex', gap: 24, alignItems: 'center' }}>
      <div style={{ border: `1px solid ${RONALDO.color}66`, background: `${COLORS.d900}cc`, borderRadius: RADIUS.card, padding: '12px 30px', textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: RONALDO.color }}>YOUTUBE 82.1M</div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 16, color: COLORS.muted }}>UR · Cristiano</div>
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 20, color: COLORS.muted }}>vs</div>
      <div style={{ border: `1px solid ${COLORS.line}`, background: `${COLORS.d900}cc`, borderRadius: RADIUS.card, padding: '12px 30px', textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: MESSI.color }}>YOUTUBE 4.8M</div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 16, color: COLORS.muted }}>Leo Messi</div>
      </div>
    </div>
  );
};

const DLR6Crowd: React.FC = () => (
  <AbsoluteFill>
    <ArenaBg glowA={MESSI.color} glowB={RONALDO.color} />
    <MatchHeader a={MESSI} b={RONALDO} start={11} top={120} />
    <Scoreboard a={MESSI} b={RONALDO} scoreA={3} scoreB={3} round="6" flash="B" start={970} />
    <CategoryCard n="6" title="THE CROWD" note="Instagram followers" start={0} exit={70} />
    <div style={{ position: 'absolute', top: 230, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
      <RaceLine a={MESSI} b={RONALDO} points={POINTS} start={265} duration={109} source="Social Blade · Jul 2026" />
    </div>
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 168 }}>
      <YTCards start={663} />
    </AbsoluteFill>
    <CommentaryBar text="Six hundred seventy seven million. The most followed human on the planet." start={265} exit={463} />
  </AbsoluteFill>
);
export default DLR6Crowd;
