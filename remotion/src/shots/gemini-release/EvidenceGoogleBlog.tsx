import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { EvidenceBrowser } from '../../lib/evidence';
import { COLORS, EASINGS } from '../../brand';
import { FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';

export const compositionConfig = {
  id: 'EvidenceGoogleBlog',
  durationInSeconds: 6,
  fps: 30,
  width: 1920,
  height: 1080,
};

const EvidenceGoogleBlog: React.FC = () => {
  const frame = useCurrentFrame();
  const exitOp = interpolate(frame, [160, 180], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });

  return (
    <AbsoluteFill style={{ opacity: exitOp }}>
      <EvidenceBrowser
        image="projects/gemini-release/evidence/google-gemini35-blog.png"
        url="blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/"
        source="Google Blog, May 2026"
        label="THE PROMISE"
        appearAt={0}
        scale={1}
      />
    </AbsoluteFill>
  );
};

export default EvidenceGoogleBlog;
