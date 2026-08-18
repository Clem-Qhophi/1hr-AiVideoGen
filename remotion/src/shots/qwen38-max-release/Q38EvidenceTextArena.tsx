import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceFrame } from '../../lib/evidence';
import { CLAMP } from '../../lib/kit';
import { EASINGS } from '../../brand';
import { RM, FONT_HOOK, useDrift } from '../../lib/reviewkit';

// master 215.54-233.09 · "not a clean sweep... fifth place, not first." The source image already has
// Qwen-3.8 Max's rank-5 row highlighted natively (Alibaba's own chart) - no extra highlight box needed.
// "Fifth place" f472, "Not first" f498.
export const compositionConfig = { id: 'Q38EvidenceTextArena', durationInSeconds: 17.55, fps: 30, width: 1920, height: 1080 };

const Slam: React.FC = () => {
  const frame = useCurrentFrame();
  const start = 460;
  const op = interpolate(frame, [start, start + 10], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const sc = interpolate(frame, [start, start + 14], [1.4, 1], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <div style={{
      position: 'absolute', bottom: 60, left: '50%', transform: `translateX(-50%) scale(${sc})`,
      opacity: op, fontFamily: FONT_HOOK, fontSize: 44, color: RM.amber,
      background: '#0d1117dd', border: `2px solid ${RM.amber}66`, borderRadius: 16, padding: '14px 40px',
      textAlign: 'center',
    }}>
      FIFTH PLACE. NOT FIRST.
    </div>
  );
};

const Q38EvidenceTextArena: React.FC = () => {
  const drift = useDrift(527);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <AbsoluteFill style={drift}>
        <EvidenceFrame
          image="projects/qwen38-max-release/evidence/alibaba-press-release.png"
          source="Alibaba Cloud Press Room, Aug 3 2026"
          label="TEXT ARENA LEADERBOARD"
          appearAt={0}
        />
      </AbsoluteFill>
      <Slam />
    </AbsoluteFill>
  );
};
export default Q38EvidenceTextArena;
