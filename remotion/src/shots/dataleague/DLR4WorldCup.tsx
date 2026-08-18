import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ArenaBg, MatchHeader, Scoreboard, CategoryCard, RaceLine, CommentaryBar, Combatant, CLAMP } from '../../lib/dataleague';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';

// DLR4WorldCup — Round 4, MARQUEE. The World Stage. World Cup goals. Messi 19 - 11 Ronaldo. One title each.
export const compositionConfig = { id: 'DLR4WorldCup', durationInSeconds: 30.77, fps: 30, width: 1920, height: 1080 };

const MESSI: Combatant = { id: 'messi', name: 'Lionel Messi', short: 'MESSI', color: '#5BB8F0' };
const RONALDO: Combatant = { id: 'ronaldo', name: 'Cristiano Ronaldo', short: 'RONALDO', color: '#E8475F' };

const POINTS = [
  { label: '06', a: 1, b: 1 },
  { label: '10', a: 1, b: 2 },
  { label: '14', a: 5, b: 3 },
  { label: '18', a: 6, b: 7 },
  { label: '22', a: 13, b: 8 },
  { label: '26', a: 19, b: 11 },
];

const TrophyRow: React.FC<{ start?: number }> = ({ start = 0 }) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [start, start + 10], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });
  return (
    <div style={{ opacity: rise, display: 'flex', gap: 24, alignItems: 'center' }}>
      <div style={{ border: `1px solid ${MESSI.color}66`, background: `${COLORS.d900}cc`, borderRadius: RADIUS.card, padding: '12px 30px', textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, color: MESSI.color }}>1 TITLE</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 18, color: COLORS.muted }}>World Cup 2022</div>
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: COLORS.muted }}>VS</div>
      <div style={{ border: `1px solid ${COLORS.line}`, background: `${COLORS.d900}cc`, borderRadius: RADIUS.card, padding: '12px 30px', textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, color: COLORS.muted }}>0 TITLES</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 18, color: COLORS.muted }}>The trophy never came home</div>
      </div>
    </div>
  );
};

const DLR4WorldCup: React.FC = () => (
  <AbsoluteFill>
    <ArenaBg glowA={MESSI.color} glowB={RONALDO.color} />
    <MatchHeader a={MESSI} b={RONALDO} start={11} top={120} />
    <Scoreboard a={MESSI} b={RONALDO} scoreA={3} scoreB={1} round="4" flash="A" start={771} />
    <CategoryCard n="4" title="THE WORLD STAGE" note="World Cup goals · all editions" start={0} exit={66} />
    <div style={{ position: 'absolute', top: 250, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
      <RaceLine a={MESSI} b={RONALDO} points={POINTS} start={182} duration={337} source="FIFA official records" />
    </div>
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 168 }}>
      <TrophyRow start={623} />
    </AbsoluteFill>
    <CommentaryBar text="Nineteen. The all-time record. The trophy lives with him." start={182} exit={342} />
  </AbsoluteFill>
);
export default DLR4WorldCup;
