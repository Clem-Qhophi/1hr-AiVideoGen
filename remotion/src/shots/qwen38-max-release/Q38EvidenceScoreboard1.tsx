import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceFrame } from '../../lib/evidence';
import { CLAMP } from '../../lib/kit';
import { EASINGS } from '../../brand';
import { RM, useDrift } from '../../lib/reviewkit';

// master 156.75-192.81 · scoreboard 1: Terminal Bench row (Qwen wins vs Claude, loses to GPT).
// highlight f180 (before "86.6" lands at f222). Mid-roll subscribe ask: badge f727-1082 (script-mandated CTA).
export const compositionConfig = { id: 'Q38EvidenceScoreboard1', durationInSeconds: 36.06, fps: 30, width: 1920, height: 1080 };

const SubscribeBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const start = 727;
  const op = interpolate(frame, [start, start + 16], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const y = interpolate(frame, [start, start + 16], [20, 0], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <div style={{
      position: 'absolute', bottom: 56, left: '50%', transform: `translateX(-50%) translateY(${y}px)`,
      opacity: op, display: 'flex', alignItems: 'center', gap: 12,
      fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24, color: '#04121a',
      background: RM.cyan, borderRadius: 999, padding: '14px 32px', boxShadow: `0 16px 46px ${RM.cyan}55`,
    }}>
      🔔 Subscribe for the real numbers, same day
    </div>
  );
};

const Q38EvidenceScoreboard1: React.FC = () => {
  const drift = useDrift(1082);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <AbsoluteFill style={drift}>
        <EvidenceFrame
          image="projects/qwen38-max-release/evidence/qwen-benchmark-table.png"
          source="qwen.ai official blog, Aug 3 2026"
          label="TERMINAL BENCH 2.1"
          appearAt={0}
          highlight={{ x: 40.95, y: 20.5, w: 27.45, h: 2.9, startFrame: 180 }}
        />
      </AbsoluteFill>
      <SubscribeBadge />
    </AbsoluteFill>
  );
};
export default Q38EvidenceScoreboard1;
