import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { EvidenceBrowser } from '../../lib/evidence';
import { EASINGS } from '../../brand';
import { CLAMP } from '../../lib/kit';

export const compositionConfig = {
  id: 'EvidenceVergeDelay',
  durationInSeconds: 6,
  fps: 30,
  width: 1920,
  height: 1080,
};

const EvidenceVergeDelay: React.FC = () => {
  const frame = useCurrentFrame();
  const exitOp = interpolate(frame, [160, 180], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });

  return (
    <AbsoluteFill style={{ opacity: exitOp }}>
      <EvidenceBrowser
        image="projects/gemini-release/evidence/verge-gemini-delay.png"
        url="theverge.com/tech/966899/gemini-3-5-pro-was-supposed-to-launch..."
        source="The Verge, Jul 2026"
        label="THE DELAY"
        appearAt={0}
        scale={1}
      />
    </AbsoluteFill>
  );
};

export default EvidenceVergeDelay;
