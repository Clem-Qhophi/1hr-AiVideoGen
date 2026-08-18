import React from 'react';
import { AbsoluteFill } from 'remotion';
import { EvidenceBrowser } from '../../lib/evidence';

export const compositionConfig = { id: 'EvidenceGibberlink', durationInSeconds: 28, fps: 30, width: 1920, height: 1080 };

const EvidenceGibberlink: React.FC = () => (
  <AbsoluteFill>
    <EvidenceBrowser
      image="projects/ai-secret-language/evidence/forbes-gibberlink.png"
      url="forbes.com/sites/dianehamilton/2025/02/25/what-is-gibberlink-mode..."
      source="Forbes, Feb 2025"
      label="GIBBERLINK MODE"
      appearAt={0}
      scale={1}
    />
  </AbsoluteFill>
);
export default EvidenceGibberlink;
