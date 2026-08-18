import React from 'react';
import { AbsoluteFill } from 'remotion';
import { EvidenceFrame } from '../../lib/evidence';

export const compositionConfig = { id: 'EvidenceCyber', durationInSeconds: 30, fps: 30, width: 1920, height: 1080 };

const EvidenceCyber: React.FC = () => (
  <AbsoluteFill>
    <EvidenceFrame
      image="projects/ai-secret-language/evidence/irregular-cyber-behavior.png"
      source="Irregular Research, Mar 2026"
      label="AUTONOMOUS HACKING"
      appearAt={0}
      scale={1}
    />
  </AbsoluteFill>
);
export default EvidenceCyber;
