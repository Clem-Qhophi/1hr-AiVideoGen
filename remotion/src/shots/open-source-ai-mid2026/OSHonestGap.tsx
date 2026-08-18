import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { COLORS, EASINGS } from '../../brand';
import { CLAMP } from '../../lib/kit';
import { EvidenceBrowser } from '../../lib/evidence';

// master 78.5-101.5 · lmarena-text · "the very top is still proprietary" (Fable 5 tops Text 1507)
// 23s hold — slow ken-burns keeps it from going static (tools/lint_pacing.py).
export const compositionConfig = { id: 'OSHonestGap', durationInSeconds: 23.0, fps: 30, width: 1920, height: 1080 };

const OSHonestGap: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 690], [1.0, 1.07], { ...CLAMP, easing: EASINGS.easeInOut });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.d900 }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <EvidenceBrowser
          image="projects/open-source-ai-mid2026/evidence/lmarena-text.png"
          url="lmarena.ai/leaderboard"
          source="LMArena, Jul 2026"
          label="HUMAN PREFERENCE · THE VERY TOP IS STILL CLOSED"
          appearAt={6}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default OSHonestGap;
