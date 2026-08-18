import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import SpeedHook from './SpeedHook';
import SpeedLadderBio from './SpeedLadderBio';
import SpeedLadderMach from './SpeedLadderMach';
import SpeedLadderRelativistic from './SpeedLadderRelativistic';
import SpeedLadderLightApex from './SpeedLadderLightApex';
import SpeedVerdict from './SpeedVerdict';

export const compositionConfig = {
  id: 'SpeedFullVideo',
  durationInSeconds: 169.47,
  fps: 30,
  width: 1920,
  height: 1080,
};

const SpeedFullVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#020617' }}>
      {/* 0.00s to 18.20s (546 frames) - Cold Open Hook & Cosmic Roadmap */}
      <Sequence from={0} durationInFrames={546}>
        <SpeedHook />
      </Sequence>

      {/* 18.20s to 55.40s (1116 frames) - Levels 1 to 3 Biological Velocity (Cheetah, Falcon) */}
      <Sequence from={546} durationInFrames={1116}>
        <SpeedLadderBio />
      </Sequence>

      {/* 55.40s to 93.80s (1152 frames) - Levels 4 to 6 Mechanical Monsters & Mach Speeds */}
      <Sequence from={1662} durationInFrames={1152}>
        <SpeedLadderMach />
      </Sequence>

      {/* 93.80s to 127.50s (1011 frames) - Levels 7 to 8 Relativistic & Particle Speed */}
      <Sequence from={2814} durationInFrames={1011}>
        <SpeedLadderRelativistic />
      </Sequence>

      {/* 127.50s to 157.00s (885 frames) - Level 10 Cosmic Speed Limit (Speed of Light Apex) */}
      <Sequence from={3825} durationInFrames={885}>
        <SpeedLadderLightApex />
      </Sequence>

      {/* 157.00s to 169.47s (374 frames) - Settled It & Outro Victory CTA */}
      <Sequence from={4710} durationInFrames={374}>
        <SpeedVerdict />
      </Sequence>
    </AbsoluteFill>
  );
};

export default SpeedFullVideo;
