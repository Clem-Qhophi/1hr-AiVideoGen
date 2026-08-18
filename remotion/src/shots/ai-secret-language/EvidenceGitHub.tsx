import React from 'react';
import { AbsoluteFill } from 'remotion';
import { EvidenceBrowser } from '../../lib/evidence';

export const compositionConfig = { id: 'EvidenceGitHub', durationInSeconds: 18, fps: 30, width: 1920, height: 1080 };

const EvidenceGitHub: React.FC = () => (
  <AbsoluteFill>
    <EvidenceBrowser
      image="projects/ai-secret-language/evidence/github-gibberlink.png"
      url="github.com/PennyroyalTea/gibberlink"
      source="GitHub: Gibberlink"
      label="THE CODE"
      appearAt={0}
      scale={1}
    />
  </AbsoluteFill>
);
export default EvidenceGitHub;
