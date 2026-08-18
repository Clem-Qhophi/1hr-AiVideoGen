import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import RichestHook from './RichestHook';
import RichestLadderModern from './RichestLadderModern';
import RichestLadderTitans from './RichestLadderTitans';
import RichestLadderBarons from './RichestLadderBarons';
import RichestLadderApex from './RichestLadderApex';
import RichestVerdict from './RichestVerdict';

export const compositionConfig = {
  id: 'RichestFullVideo',
  durationInSeconds: 155.63,
  fps: 30,
  width: 1920,
  height: 1080,
};

const RichestFullVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#020617' }}>
      {/* 0.00s to 15.60s (468 frames) - Cold Open Hook & Roadmap */}
      <Sequence from={0} durationInFrames={468}>
        <RichestHook />
      </Sequence>

      {/* 15.60s to 47.00s (942 frames) - Levels 1 to 3 Modern Fortunes */}
      <Sequence from={468} durationInFrames={942}>
        <RichestLadderModern />
      </Sequence>

      {/* 47.00s to 81.00s (1020 frames) - Levels 4 to 6 Modern Titans */}
      <Sequence from={1410} durationInFrames={1020}>
        <RichestLadderTitans />
      </Sequence>

      {/* 81.00s to 117.50s (1095 frames) - Levels 7 to 9 Industrial Barons */}
      <Sequence from={2430} durationInFrames={1095}>
        <RichestLadderBarons />
      </Sequence>

      {/* 117.50s to 147.50s (900 frames) - Level 10 Apex (Mansa Musa) */}
      <Sequence from={3525} durationInFrames={900}>
        <RichestLadderApex />
      </Sequence>

      {/* 147.50s to 155.63s (245 frames) - Verdict & Outro CTA */}
      <Sequence from={4425} durationInFrames={245}>
        <RichestVerdict />
      </Sequence>
    </AbsoluteFill>
  );
};

export default RichestFullVideo;
