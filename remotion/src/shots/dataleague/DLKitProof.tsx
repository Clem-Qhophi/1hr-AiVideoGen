import React from 'react';
import { AbsoluteFill } from 'remotion';
import {
  ArenaBg, MatchHeader, Scoreboard, H2HMeter, RaceLine, CommentaryBar, Combatant,
} from '../../lib/dataleague';

// =============================================================================
// DLKitProof — NOT a video beat. A utility shot proving the dataleague chart-kit
// renders as one coherent broadcast scene: arena, match header, scoreboard,
// H2HMeter, the hero RaceLine, and the commentary bar. MOCK DATA ONLY — the real
// numbers for a video live in the video folder's data.json and are user-verified.
//
//   cd remotion && npx remotion still src/index.ts DLKitProof out/dl-kit.png --frame=200
// =============================================================================
export const compositionConfig = { id: 'DLKitProof', durationInSeconds: 8, fps: 30, width: 1920, height: 1080 };

const MESSI: Combatant = { id: 'messi', name: 'Lionel Messi', short: 'MESSI', color: '#5BB8F0' };
const RONALDO: Combatant = { id: 'ronaldo', name: 'Cristiano Ronaldo', short: 'RONALDO', color: '#E8475F' };

const POINTS = [
  { label: '2012', a: 45, b: 42 },
  { label: '2014', a: 76, b: 88 },
  { label: '2016', a: 122, b: 150 },
  { label: '2018', a: 158, b: 210 },
  { label: '2020', a: 210, b: 265 },
  { label: '2022', a: 372, b: 431 },
  { label: '2024', a: 482, b: 620 },
  { label: '2026', a: 560, b: 730 },
];

const DLKitProof: React.FC = () => (
  <AbsoluteFill>
    <ArenaBg glowA={MESSI.color} glowB={RONALDO.color} />
    <MatchHeader a={MESSI} b={RONALDO} start={8} />
    <Scoreboard a={MESSI} b={RONALDO} scoreA={5} scoreB={3} round="8" flash="A" start={14} />
    <div style={{ position: 'absolute', top: 330, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
      <RaceLine a={MESSI} b={RONALDO} points={POINTS} start={30} duration={120} source="Mock — proof only" />
    </div>
    <div style={{ position: 'absolute', top: 430, left: 110, width: 1300 }}>
      <H2HMeter a={MESSI} b={RONALDO} valueA={62} valueB={38} start={160} />
    </div>
    <CommentaryBar text="RONALDO is coming — the gap is down to 1.2 million!" start={180} />
  </AbsoluteFill>
);
export default DLKitProof;