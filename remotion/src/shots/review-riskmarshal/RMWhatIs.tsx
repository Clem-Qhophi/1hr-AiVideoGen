import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { EvidenceBrowser } from '../../lib/evidence';

// Beat 3: What It Is — 36s-55s (1080f-1650f)
// EvidenceBrowser hero-landing.png
export const compositionConfig = { id: 'RMWhatIs', durationInSeconds: 19, fps: 30, width: 1920, height: 1080 };

const RMWhatIs: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
    <EvidenceBrowser
          image="projects/review-riskmarshal/evidence/hero-landing-hero.png"
      url="riskmarshal.com"
      source="Risk Marshal"
      label="THE PRODUCT"
      appearAt={0}
    />
  </AbsoluteFill>
);
export default RMWhatIs;
