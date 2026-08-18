import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Arena3DBackdrop, ScaleLadder } from '../../lib/comparisonkit';
import { COLORS } from '../../brand';

export const compositionConfig = {
  id: 'RichestLadderTitans',
  durationInSeconds: 75,
  fps: 30,
  width: 1920,
  height: 1080,
};

const TIERS = [
  { level: 4, title: 'Warren Buffett', value: 140000000000, unit: '$', note: 'Berkshire Hathaway & compounding', color: COLORS.accent2 },
  { level: 5, title: 'Jeff Bezos', value: 210000000000, unit: '$', note: 'Amazon global logistics monopoly', color: COLORS.accent },
  { level: 6, title: 'Elon Musk', value: 250000000000, unit: '$', note: 'Tesla, SpaceX, modern apex titan', color: COLORS.warn },
];

const RichestLadderTitans: React.FC = () => {
  return (
    <AbsoluteFill>
      <Arena3DBackdrop primaryGlow={COLORS.accent} secondaryGlow={COLORS.warn} accentTitle="LEVELS 4 TO 6 — THE MODERN TITANS" />
      <ScaleLadder tiers={TIERS} activeLevel={6} startFrame={0} />
    </AbsoluteFill>
  );
};

export default RichestLadderTitans;
