import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { COLORS, EASINGS } from '../../brand';
import { CLAMP } from '../../lib/kit';
import { EvidenceBrowser } from '../../lib/evidence';

// master 55.0-78.5 · aa-open-weights · GLM-5.2 / DeepSeek V4 / MiniMax / Qwen — mostly Chinese labs
// 23.5s is a long hold: a slow ken-burns keeps it alive (flagged by tools/lint_pacing.py).
export const compositionConfig = { id: 'OSOpenLeaders', durationInSeconds: 23.5, fps: 30, width: 1920, height: 1080 };

const OSOpenLeaders: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 705], [1.0, 1.07], { ...CLAMP, easing: EASINGS.easeInOut });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.d900 }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <EvidenceBrowser
          image="projects/open-source-ai-mid2026/evidence/aa-open-weights.png"
          url="artificialanalysis.ai/models/open-source"
          source="Artificial Analysis, Jul 2026"
          label="OPEN-WEIGHT LEADERS · GLM-5.2 · DEEPSEEK V4 · MINIMAX · QWEN"
          appearAt={6}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default OSOpenLeaders;
