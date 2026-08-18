import React from 'react';
import { AbsoluteFill } from 'remotion';
import { EvidenceBrowser } from '../../lib/evidence';

export const compositionConfig = { id: 'AAHonestGap', durationInSeconds: 25, fps: 30, width: 1920, height: 1080 };

const AAHonestGap: React.FC = () => (
  <AbsoluteFill>
    <EvidenceBrowser
      image="projects/ai-agent-company/evidence/acm-multiagent.png"
      url="www.acm.org/articles/do/10.1145/3718559/full"
      source="ACM - Multi-Agent Systems Survey"
      label="THE HONEST GAP: ERRORS & LIMITS"
      appearAt={0}
      scale={1}
    />
  </AbsoluteFill>
);
export default AAHonestGap;
