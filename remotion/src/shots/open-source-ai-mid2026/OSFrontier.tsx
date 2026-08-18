import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { COLORS, EASINGS } from '../../brand';
import { CLAMP } from '../../lib/kit';
import { EvidenceFrame } from '../../lib/evidence';

// master 27.5-39.0 · aa-leaderboard, highlight top rows · "Claude Fable 5 ... at sixty" (sixty@30.2 -> f81)
// slow ken-burns so the 11.5s hold never goes static (tools/lint_pacing.py).
export const compositionConfig = { id: 'OSFrontier', durationInSeconds: 11.5, fps: 30, width: 1920, height: 1080 };

const OSFrontier: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 345], [1.0, 1.05], { ...CLAMP, easing: EASINGS.easeInOut });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.d900 }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <EvidenceFrame
          image="projects/open-source-ai-mid2026/evidence/aa-leaderboard.png"
          source="Artificial Analysis, Jul 2026"
          label="THE FRONTIER — ALL CLOSED, API ONLY"
          appearAt={4}
          highlight={{ x: 9, y: 47, w: 82, h: 15, startFrame: 78 }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default OSFrontier;
