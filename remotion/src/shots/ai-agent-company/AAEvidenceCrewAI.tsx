import React from 'react';
import { AbsoluteFill } from 'remotion';
import { EvidenceBrowser } from '../../lib/evidence';

export const compositionConfig = { id: 'AAEvidenceCrewAI', durationInSeconds: 35, fps: 30, width: 1920, height: 1080 };

const AAEvidenceCrewAI: React.FC = () => (
  <AbsoluteFill>
    <EvidenceBrowser
      image="projects/ai-agent-company/evidence/crewai-docs.png"
      url="docs.crewai.com/introduction"
      source="CrewAI Documentation - Multi-Agent Orchestration"
      label="CREWAI: MULTI-AGENT FRAMEWORK"
      appearAt={0}
      scale={1}
    />
  </AbsoluteFill>
);
export default AAEvidenceCrewAI;
