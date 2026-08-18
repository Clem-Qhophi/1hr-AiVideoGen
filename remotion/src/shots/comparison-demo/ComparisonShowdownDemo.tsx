import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Arena3DBackdrop, ScaleLadder, AuctionGavelTicker, SpeedometerGauge, MultiLeaderboardRace, BattleCard3D } from '../../lib/comparisonkit';
import { COLORS } from '../../brand';

export const compositionConfig = {
  id: 'ComparisonShowdownDemo',
  durationInSeconds: 10,
  fps: 30,
  width: 1920,
  height: 1080,
};

const TIERS = [
  { level: 1, title: 'Ordinary Millionaire', value: 1000000, unit: '$', color: COLORS.signal },
  { level: 2, title: 'Centimillionaire', value: 100000000, unit: '$', color: COLORS.accent2 },
  { level: 3, title: 'Single Billionaire', value: 1000000000, unit: '$', color: COLORS.warn },
  { level: 4, title: 'Top 10 Titan', value: 150000000000, unit: '$', color: COLORS.accent },
  { level: 5, title: 'Apex Trillionaire', value: 1000000000000, unit: '$', color: COLORS.danger },
];

const ComparisonShowdownDemo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Arena3DBackdrop primaryGlow={COLORS.accent} secondaryGlow={COLORS.accent2} accentTitle="THE COMPARISON ARENA" />
      <ScaleLadder tiers={TIERS} activeLevel={4} startFrame={0} />
    </AbsoluteFill>
  );
};

export default ComparisonShowdownDemo;
