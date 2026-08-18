import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { EASINGS } from '../../brand';
import { RM, CLAMP } from '../../lib/reviewkit';
import { EvidenceBrowser } from '../../lib/evidence';

// master 6.6-15.1 · real hero screenshot, slow ken-burns zoom
export const compositionConfig = { id: 'RMHero', durationInSeconds: 8.7, fps: 30, width: 1920, height: 1080 };

const RMHero: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 261], [1.0, 1.05], { ...CLAMP, easing: EASINGS.easeInOut });
  return (
    <AbsoluteFill style={{ backgroundColor: RM.bg0 }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <EvidenceBrowser
          image="projects/review-riskmarshal/evidence/hero-landing-hero.png"
          url="riskmarshal.com"
          source="riskmarshal.com, Jul 2026"
          label="WHAT IT IS  ·  A PROTECTION LAYER ON YOUR MT5"
          appearAt={4}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default RMHero;
