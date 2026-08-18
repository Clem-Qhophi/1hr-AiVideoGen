import React from 'react';
import { AbsoluteFill } from 'remotion';
import { EvidenceBrowser } from '../../lib/evidence';

export const compositionConfig = { id: 'AAEvidenceForbes', durationInSeconds: 30, fps: 30, width: 1920, height: 1080 };

const AAEvidenceForbes: React.FC = () => (
  <AbsoluteFill>
    <EvidenceBrowser
      image="projects/ai-agent-company/evidence/forbes-solo.png"
      url="forbes.com/sites/joannechen/2025/08/28/from-prompt-to-profit..."
      source="Forbes - AI Agents Reshaping Solopreneur Economy"
      label="FORBES: SOLO FOUNDER REVOLUTION"
      appearAt={0}
      scale={1}
    />
  </AbsoluteFill>
);
export default AAEvidenceForbes;
