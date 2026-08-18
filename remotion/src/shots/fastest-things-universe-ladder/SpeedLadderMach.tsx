import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { Arena3DBackdrop, ScaleLadder } from '../../lib/comparisonkit';
import { COLORS } from '../../brand';

export const compositionConfig = {
  id: 'SpeedLadderMach',
  durationInSeconds: 38,
  fps: 30,
  width: 1920,
  height: 1080,
};

const TIERS = [
  { level: 4, title: 'Bugatti Chiron Super Sport', value: 304.77, unit: ' MPH', note: 'Fastest production road car', color: COLORS.signal },
  { level: 5, title: 'SR-71 Blackbird', value: 2193, unit: ' MPH (Mach 3.3)', note: 'Fastest air-breathing manned jet', color: COLORS.accent2 },
  { level: 6, title: 'Apollo 10 Re-entry', value: 24791, unit: ' MPH (Mach 32)', note: 'Fastest human crew in history', color: COLORS.warn },
];

const SpeedLadderMach: React.FC = () => {
  return (
    <AbsoluteFill>
      <Arena3DBackdrop
        primaryGlow={COLORS.accent}
        secondaryGlow={COLORS.warn}
        accentTitle="LEVELS 4 TO 6 — MECHANICAL MONSTERS & MACH SPEEDS"
        videoSrc={staticFile('projects/fastest-things-universe-ladder/007-sports-car-acceleration-race-track-0.mp4')}
        videoOpacity={0.45}
      />
      <ScaleLadder tiers={TIERS} activeLevel={6} startFrame={0} />
    </AbsoluteFill>
  );
};

export default SpeedLadderMach;
