import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceFrame } from '../../lib/evidence';

// Beat 12: Accountability Partner — 170s-180s (5100f-5400f)
// EvidenceFrame features-full.png highlight accountability
export const compositionConfig = { id: 'RMAccountability', durationInSeconds: 10, fps: 30, width: 1920, height: 1080 };

const RMAccountability: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
    <EvidenceFrame
      image="projects/review-riskmarshal/evidence/features-full-enforcement.png"
      source="Risk Marshal"
      label="ACCOUNTABILITY PARTNER"
      appearAt={0}
      highlight={{ x: 5, y: 40, w: 90, h: 30, startFrame: 20 }}
    />
  </AbsoluteFill>
);
export default RMAccountability;
