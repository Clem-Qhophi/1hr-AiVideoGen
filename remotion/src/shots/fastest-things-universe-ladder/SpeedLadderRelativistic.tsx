import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { Arena3DBackdrop, ScaleLadder } from '../../lib/comparisonkit';
import { COLORS } from '../../brand';

export const compositionConfig = {
  id: 'SpeedLadderRelativistic',
  durationInSeconds: 90,
  fps: 30,
  width: 1920,
  height: 1080,
};

const TIERS = [
  { level: 7, title: 'NASA Parker Solar Probe', value: 430000, unit: ' MPH', note: 'Fastest man-made object in history (NYC to Tokyo in 1 min)', color: COLORS.accent },
  { level: 8, title: 'CERN LHC Protons', value: 670615000, unit: ' MPH', note: '99.9999991% of Light Speed (Time dilation active)', color: COLORS.danger },
];

const SpeedLadderRelativistic: React.FC = () => {
  return (
    <AbsoluteFill>
      <Arena3DBackdrop
        primaryGlow={COLORS.warn}
        secondaryGlow={COLORS.danger}
        accentTitle="LEVELS 7 & 8 — RELATIVISTIC & PARTICLE SPEED"
        videoSrc={staticFile('projects/fastest-things-universe-ladder/005-sun-solar-flare-corona-space-0.mp4')}
        videoOpacity={0.45}
      />
      <ScaleLadder tiers={TIERS} activeLevel={8} startFrame={0} />
    </AbsoluteFill>
  );
};

export default SpeedLadderRelativistic;
