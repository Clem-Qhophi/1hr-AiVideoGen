import React from 'react';
import { AbsoluteFill } from 'remotion';
import { EvidenceFrame } from '../../lib/evidence';

export const compositionConfig = { id: 'EvidenceMoltbook', durationInSeconds: 32, fps: 30, width: 1920, height: 1080 };

const EvidenceMoltbook: React.FC = () => (
  <AbsoluteFill>
    <EvidenceFrame
      image="projects/ai-secret-language/evidence/arxiv-emergent-languages.png"
      source="arXiv 2605.31170, 2026"
      label="THE PAPER"
      appearAt={0}
      scale={1}
    />
  </AbsoluteFill>
);
export default EvidenceMoltbook;
