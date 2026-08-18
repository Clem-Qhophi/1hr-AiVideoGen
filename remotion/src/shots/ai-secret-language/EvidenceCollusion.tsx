import React from 'react';
import { AbsoluteFill } from 'remotion';
import { EvidenceFrame } from '../../lib/evidence';

export const compositionConfig = { id: 'EvidenceCollusion', durationInSeconds: 26, fps: 30, width: 1920, height: 1080 };

const EvidenceCollusion: React.FC = () => (
  <AbsoluteFill>
    <EvidenceFrame
      image="projects/ai-secret-language/evidence/emergentmind-collusion.png"
      source="EmergentMind: Secret Collusion in AI Agents"
      label="STEGANOGRAPHY"
      appearAt={0}
      scale={1}
    />
  </AbsoluteFill>
);
export default EvidenceCollusion;
