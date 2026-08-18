import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceFrame } from '../../lib/evidence';

// Beat 11: Behavioral Learning — 155s-170s (4650f-5100f)
// EvidenceFrame features-full.png highlight pattern detection
export const compositionConfig = { id: 'RMBehavioral', durationInSeconds: 15, fps: 30, width: 1920, height: 1080 };

const RMBehavioral: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
    <EvidenceFrame
      image="projects/review-riskmarshal/evidence/features-full-enforcement.png"
      source="Risk Marshal"
      label="BEHAVIORAL LEARNING"
      appearAt={0}
      highlight={{ x: 5, y: 5, w: 90, h: 35, startFrame: 20 }}
    />
  </AbsoluteFill>
);
export default RMBehavioral;
