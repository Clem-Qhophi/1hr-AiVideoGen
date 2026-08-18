import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Arena3DBackdrop, ScaleLadder } from '../../lib/comparisonkit';
import { COLORS } from '../../brand';

export const compositionConfig = {
  id: 'RichestLadderModern',
  durationInSeconds: 57,
  fps: 30,
  width: 1920,
  height: 1080,
};

const TIERS = [
  { level: 1, title: 'Tech Millionaire', value: 10000000, unit: '$', note: 'Standard high-net-worth retirement', color: COLORS.signal },
  { level: 2, title: 'Cristiano Ronaldo', value: 250000000, unit: '$', note: 'Sports icon & global endorsements', color: COLORS.accent2 },
  { level: 3, title: 'Silicon Valley Unicorn', value: 1000000000, unit: '$', note: 'Three-comma tech founder threshold', color: COLORS.warn },
];

const RichestLadderModern: React.FC = () => {
  return (
    <AbsoluteFill>
      <Arena3DBackdrop primaryGlow={COLORS.signal} secondaryGlow={COLORS.accent2} accentTitle="LEVELS 1 TO 3 — THE MODERN FORTUNES" />
      <ScaleLadder tiers={TIERS} activeLevel={3} startFrame={0} />
    </AbsoluteFill>
  );
};

export default RichestLadderModern;
