import React from 'react';
import { AbsoluteFill } from 'remotion';
import { EvidenceBrowser } from '../../lib/evidence';

export const compositionConfig = { id: 'AACloseCTA', durationInSeconds: 30, fps: 30, width: 1920, height: 1080 };

const AACloseCTA: React.FC = () => (
  <AbsoluteFill>
    <EvidenceBrowser
      image="projects/ai-agent-company/evidence/crewai-arch.png"
      url="docs.crewai.com/concepts/architecture"
      source="CrewAI Architecture - The Future of Business"
      label="SUBSCRIBE: AI AGENT DEEP DIVES"
      appearAt={0}
      scale={1}
    />
  </AbsoluteFill>
);
export default AACloseCTA;
