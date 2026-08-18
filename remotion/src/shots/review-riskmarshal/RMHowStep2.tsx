import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceFrame } from '../../lib/evidence';

// Beat 6: How It Works Step 2 — 75s-85s (2250f-2550f)
// EvidenceFrame how-it-works.png highlight step 2
export const compositionConfig = { id: 'RMHowStep2', durationInSeconds: 10, fps: 30, width: 1920, height: 1080 };

const RMHowStep2: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
    <EvidenceFrame
      image="projects/review-riskmarshal/evidence/how-it-works-steps.png"
      source="Risk Marshal"
      label="STEP 2"
      appearAt={0}
      highlight={{ x: 35, y: 8, w: 30, h: 85, startFrame: 20 }}
    />
  </AbsoluteFill>
);
export default RMHowStep2;
