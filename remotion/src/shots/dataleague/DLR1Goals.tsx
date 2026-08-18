import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ArenaBg, MatchHeader, Scoreboard, CategoryCard, RaceLine, CommentaryBar, Combatant } from '../../lib/dataleague';
import { COLORS } from '../../brand';

// DLR1Goals — Round 1, The Record Book. Career goals. Ronaldo 976 - 919 Messi.
export const compositionConfig = { id: 'DLR1Goals', durationInSeconds: 31.8, fps: 30, width: 1920, height: 1080 };

const MESSI: Combatant = { id: 'messi', name: 'Lionel Messi', short: 'MESSI', color: '#5BB8F0' };
const RONALDO: Combatant = { id: 'ronaldo', name: 'Cristiano Ronaldo', short: 'RONALDO', color: '#E8475F' };

const POINTS = [
  { label: '2006', a: 60, b: 90 },
  { label: '2010', a: 200, b: 220 },
  { label: '2014', a: 370, b: 400 },
  { label: '2018', a: 560, b: 620 },
  { label: '2022', a: 760, b: 830 },
  { label: '2026', a: 919, b: 976 },
];

const DLR1Goals: React.FC = () => (
  <AbsoluteFill>
    <ArenaBg glowA={MESSI.color} glowB={RONALDO.color} />
    <MatchHeader a={MESSI} b={RONALDO} start={11} top={120} />
    <Scoreboard a={MESSI} b={RONALDO} scoreA={1} scoreB={0} round="1" flash="B" start={788} />
    <CategoryCard n="1" title="THE RECORD BOOK" note="Career goals · club and country" start={0} exit={60} />
    <div style={{ position: 'absolute', top: 290, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
      <RaceLine a={MESSI} b={RONALDO} points={POINTS} start={158} duration={131} source="Official records · Jul 2026" />
    </div>
    <CommentaryBar text="Nine hundred seventy six. No man in history has scored more." start={289} exit={457} />
  </AbsoluteFill>
);
export default DLR1Goals;
