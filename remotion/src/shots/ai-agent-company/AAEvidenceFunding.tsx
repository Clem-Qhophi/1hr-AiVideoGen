import React from 'react';
import { AbsoluteFill } from 'remotion';
import { EvidenceBrowser } from '../../lib/evidence';

export const compositionConfig = { id: 'AAEvidenceFunding', durationInSeconds: 30, fps: 30, width: 1920, height: 1080 };

const AAEvidenceFunding: React.FC = () => (
  <AbsoluteFill>
    <EvidenceBrowser
      image="projects/ai-agent-company/evidence/crewai-funding.png"
      url="news.crunchbase.com/ai/crewai-agents-automation-funding/"
      source="Crunchbase - CrewAI $18M Series A"
      label="CREWAI: $18M SERIES A"
      appearAt={0}
      scale={1}
    />
  </AbsoluteFill>
);
export default AAEvidenceFunding;
