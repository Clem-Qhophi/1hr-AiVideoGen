import React from 'react';
import { AbsoluteFill } from 'remotion';
import { EvidenceBrowser } from '../../lib/evidence';

export const compositionConfig = { id: 'AAEvidenceLevels', durationInSeconds: 35, fps: 30, width: 1920, height: 1080 };

const AAEvidenceLevels: React.FC = () => (
  <AbsoluteFill>
    <EvidenceBrowser
      image="projects/ai-agent-company/evidence/levels-blog.png"
      url="levels.io/blog"
      source="Pieter Levels - $420K/mo, 0 employees"
      label="PIETER LEVELS: $420K/MO"
      appearAt={0}
      scale={1}
    />
  </AbsoluteFill>
);
export default AAEvidenceLevels;
