import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { COLORS, EASINGS } from '../../brand';
import { CLAMP } from '../../lib/kit';
import { EvidenceBrowser } from '../../lib/evidence';

// master 11.0-27.5 · aa-leaderboard · "tracking over five hundred models", releases every few days
// 16.5s hold — slow ken-burns keeps it alive (tools/lint_pacing.py).
export const compositionConfig = { id: 'OSWhyNow', durationInSeconds: 16.5, fps: 30, width: 1920, height: 1080 };

const OSWhyNow: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 495], [1.0, 1.06], { ...CLAMP, easing: EASINGS.easeInOut });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.d900 }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <EvidenceBrowser
          image="projects/open-source-ai-mid2026/evidence/aa-leaderboard.png"
          url="artificialanalysis.ai/leaderboards/models"
          source="Artificial Analysis, Jul 2026"
          label="580+ MODELS TRACKED · NEW ONES EVERY FEW DAYS"
          appearAt={6}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default OSWhyNow;
