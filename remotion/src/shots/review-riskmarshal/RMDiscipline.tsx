import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceBrowser } from '../../lib/evidence';

// Beat 13: Discipline Card — 180s-195s (5400f-5850f)
// EvidenceBrowser discipline-card.png
export const compositionConfig = { id: 'RMDiscipline', durationInSeconds: 15, fps: 30, width: 1920, height: 1080 };

const RMDiscipline: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
    <EvidenceBrowser
      image="projects/review-riskmarshal/evidence/discipline-card.png"
      url="riskmarshal.com/discipline-card"
      source="Risk Marshal"
      label="DISCIPLINE CARD"
      appearAt={0}
    />
  </AbsoluteFill>
);
export default RMDiscipline;
