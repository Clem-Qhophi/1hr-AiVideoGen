import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { Arena3DBackdrop, ScaleLadder } from '../../lib/comparisonkit';
import { COLORS } from '../../brand';

export const compositionConfig = {
  id: 'SpeedLadderBio',
  durationInSeconds: 57,
  fps: 30,
  width: 1920,
  height: 1080,
};

const TIERS = [
  { level: 1, title: 'Usain Bolt (Peak Sprint)', value: 27.78, unit: ' MPH', note: 'Fastest human in history', color: COLORS.signal },
  { level: 2, title: 'Cheetah Sprint', value: 70, unit: ' MPH', note: '0-60 in 3 seconds (Land Animal)', color: COLORS.accent2 },
  { level: 3, title: 'Peregrine Falcon Dive', value: 240, unit: ' MPH', note: 'Terminal velocity hunting dive', color: COLORS.warn },
];

const SpeedLadderBio: React.FC = () => {
  return (
    <AbsoluteFill>
      <Arena3DBackdrop
        primaryGlow={COLORS.signal}
        secondaryGlow={COLORS.accent2}
        accentTitle="LEVELS 1 TO 3 — BIOLOGICAL VELOCITY"
        videoSrc={staticFile('projects/fastest-things-universe-ladder/001-cheetah-running-0.mp4')}
        videoOpacity={0.45}
      />
      <ScaleLadder tiers={TIERS} activeLevel={3} startFrame={0} />
    </AbsoluteFill>
  );
};

export default SpeedLadderBio;
