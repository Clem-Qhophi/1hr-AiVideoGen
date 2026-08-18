import React from 'react';
import { AbsoluteFill } from 'remotion';
import { EvidenceBrowser } from '../../lib/evidence';

export const compositionConfig = { id: 'AAHook', durationInSeconds: 30, fps: 30, width: 1920, height: 1080 };

const AAHook: React.FC = () => (
  <AbsoluteFill>
    <EvidenceBrowser
      image="projects/ai-agent-company/evidence/levels-blog.png"
      url="levels.io/blog"
      source="Pieter Levels - $420K/mo solo founder"
      label="SOLO FOUNDER EMPIRE"
      appearAt={0}
      scale={1}
    />
  </AbsoluteFill>
);
export default AAHook;
