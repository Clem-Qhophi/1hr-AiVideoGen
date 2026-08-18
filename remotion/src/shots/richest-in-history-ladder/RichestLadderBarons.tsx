import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Arena3DBackdrop, ScaleLadder } from '../../lib/comparisonkit';
import { COLORS } from '../../brand';

export const compositionConfig = {
  id: 'RichestLadderBarons',
  durationInSeconds: 90,
  fps: 30,
  width: 1920,
  height: 1080,
};

const TIERS = [
  { level: 7, title: 'John D. Rockefeller', value: 340000000000, unit: '$', note: 'Standard Oil (90% of US Oil supply)', color: COLORS.accent },
  { level: 8, title: 'Andrew Carnegie', value: 370000000000, unit: '$', note: 'Carnegie Steel & Industrial monopoly', color: COLORS.warn },
  { level: 9, title: 'Jakob Fugger', value: 400000000000, unit: '$', note: 'Renaissance Banking Dynasty (1520s)', color: COLORS.danger },
];

const RichestLadderBarons: React.FC = () => {
  return (
    <AbsoluteFill>
      <Arena3DBackdrop primaryGlow={COLORS.warn} secondaryGlow={COLORS.danger} accentTitle="LEVELS 7 TO 9 — THE HISTORICAL BARONS" />
      <ScaleLadder tiers={TIERS} activeLevel={9} startFrame={0} />
    </AbsoluteFill>
  );
};

export default RichestLadderBarons;
