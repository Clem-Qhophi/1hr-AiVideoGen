import React from 'react';
import { AbsoluteFill } from 'remotion';
import { EvidenceBrowser } from '../../lib/evidence';

export const compositionConfig = { id: 'AAEvidenceAutoGen', durationInSeconds: 30, fps: 30, width: 1920, height: 1080 };

const AAEvidenceAutoGen: React.FC = () => (
  <AbsoluteFill>
    <EvidenceBrowser
      image="projects/ai-agent-company/evidence/autogen.png"
      url="autogen.microsoft.com"
      source="Microsoft AutoGen - Conversational Multi-Agent"
      label="AUTOGEN: MICROSOFT'S FRAMEWORK"
      appearAt={0}
      scale={1}
    />
  </AbsoluteFill>
);
export default AAEvidenceAutoGen;
