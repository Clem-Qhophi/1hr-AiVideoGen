import React from 'react';
import { AbsoluteFill } from 'remotion';
import { EvidenceBrowser } from '../../lib/evidence';

export const compositionConfig = { id: 'AAEvidenceSwarms', durationInSeconds: 30, fps: 30, width: 1920, height: 1080 };

const AAEvidenceSwarms: React.FC = () => (
  <AbsoluteFill>
    <EvidenceBrowser
      image="projects/ai-agent-company/evidence/swarms-rise.png"
      url="marktechpost.com/2026/01/22/the-rise-of-ai-agent-swarms..."
      source="MarkTechPost - AI Agent Swarms Revolution"
      label="AGENT SWARMS: 100% ACTIONABLE"
      appearAt={0}
      scale={1}
    />
  </AbsoluteFill>
);
export default AAEvidenceSwarms;
