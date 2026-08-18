import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceFrame } from '../../lib/evidence';

// Beat 5: How It Works Step 1 — 65s-75s (1950f-2250f)
// EvidenceFrame how-it-works.png highlight step 1
export const compositionConfig = { id: 'RMHowStep1', durationInSeconds: 10, fps: 30, width: 1920, height: 1080 };

const RMHowStep1: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
    <EvidenceFrame
      image="projects/review-riskmarshal/evidence/how-it-works-steps.png"
      source="Risk Marshal"
      label="STEP 1"
      appearAt={0}
      highlight={{ x: 2, y: 8, w: 30, h: 85, startFrame: 20 }}
    />
  </AbsoluteFill>
);
export default RMHowStep1;
