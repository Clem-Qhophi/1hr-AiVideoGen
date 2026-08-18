import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { EASINGS } from '../../brand';
import { CLAMP } from '../../lib/kit';
import { EvidenceBrowser } from '../../lib/evidence';

// master 10.72-21.44 · the real announcement page. slow push keeps the 10.7s beat alive.
export const compositionConfig = { id: 'OpDrop', durationInSeconds: 10.9, fps: 30, width: 1920, height: 1080 };

const OpDrop: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 327], [1.0, 1.05], { ...CLAMP, easing: EASINGS.easeInOut });
  return (
    <AbsoluteFill style={{ backgroundColor: '#0d1117' }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <EvidenceBrowser
          image="projects/opus5-review/evidence/announce.png"
          url="anthropic.com/news/claude-opus-5"
          label="LIVE TODAY · JUL 24, 2026"
          source="anthropic.com"
          appearAt={3}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default OpDrop;
