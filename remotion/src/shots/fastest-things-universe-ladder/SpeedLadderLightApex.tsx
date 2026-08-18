import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { Arena3DBackdrop, SpeedometerGauge } from '../../lib/comparisonkit';
import { COLORS } from '../../brand';

export const compositionConfig = {
  id: 'SpeedLadderLightApex',
  durationInSeconds: 40,
  fps: 30,
  width: 1920,
  height: 1080,
};

const SpeedLadderLightApex: React.FC = () => {
  return (
    <AbsoluteFill>
      <Arena3DBackdrop
        primaryGlow={COLORS.accent}
        secondaryGlow={COLORS.danger}
        accentTitle="LEVEL 10 — THE COSMIC SPEED LIMIT & APEX"
        videoSrc={staticFile('projects/fastest-things-universe-ladder/006-particle-physics-laboratory-neon-lights--0.mp4')}
        videoOpacity={0.4}
      />
      <SpeedometerGauge
        title="SPEED OF LIGHT (c)"
        speedValue={670616629}
        maxSpeed={670616629}
        unit="MPH"
        color={COLORS.danger}
        startFrame={0}
        duration={90}
      />
    </AbsoluteFill>
  );
};

export default SpeedLadderLightApex;
