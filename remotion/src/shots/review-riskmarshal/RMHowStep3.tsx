import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceFrame } from '../../lib/evidence';

// Beat 7: How It Works Step 3 — 85s-100s (2550f-3000f)
// EvidenceFrame how-it-works.png highlight step 3
export const compositionConfig = { id: 'RMHowStep3', durationInSeconds: 15, fps: 30, width: 1920, height: 1080 };

const RMHowStep3: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
    <EvidenceFrame
      image="projects/review-riskmarshal/evidence/how-it-works-steps.png"
      source="Risk Marshal"
      label="STEP 3"
      appearAt={0}
      highlight={{ x: 68, y: 8, w: 30, h: 85, startFrame: 20 }}
    />
  </AbsoluteFill>
);
export default RMHowStep3;
