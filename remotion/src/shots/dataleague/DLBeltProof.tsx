import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ArenaBg, Scoreboard, BeltReveal, Combatant } from '../../lib/dataleague';

// =============================================================================
// DLBeltProof — NOT a video beat. Proves the celebration kit: scoreboard flash
// + BeltReveal (trophy, winner, scoreline). MOCK DATA — real numbers live in the
// video folder's data.json and are user-verified.
//
//   cd remotion && npx remotion still src/index.ts DLBeltProof out/dl-belt.png --frame=120
// =============================================================================
export const compositionConfig = { id: 'DLBeltProof', durationInSeconds: 8, fps: 30, width: 1920, height: 1080 };

const MESSI: Combatant = { id: 'messi', name: 'Lionel Messi', short: 'MESSI', color: '#5BB8F0' };
const RONALDO: Combatant = { id: 'ronaldo', name: 'Cristiano Ronaldo', short: 'RONALDO', color: '#E8475F' };

const DLBeltProof: React.FC = () => (
  <AbsoluteFill>
    <ArenaBg glowA={RONALDO.color} />
    <Scoreboard a={MESSI} b={RONALDO} scoreA={4} scoreB={5} round="8" flash="B" start={6} />
    <BeltReveal winner={RONALDO} scoreline="RONALDO 5 — 4 MESSI" start={20} />
  </AbsoluteFill>
);
export default DLBeltProof;