import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { VibeEvidenceBg } from '../../lib/vibes';
import { useRise, useSlam, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 4.48-11.44 (209f) · PROBLEM. "hundred/dollars/down" f65-106, "fee." f144.
// backdrop: challenge.png (grounds the fee claim in the real pricing table).
export const compositionConfig = { id: 'PFProblem', durationInSeconds: 7.1, fps: 30, width: 1920, height: 1080 };

const PFProblem: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <VibeEvidenceBg vibe="fintech" image="projects/ad-propfunding/evidence/challenge.png" dim={0.70} frames={209} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, textAlign: 'center' }}>
        <div style={{ ...rise(0, 18), fontSize: 42, fontWeight: 500, color: RM.muted }}>
          Before you've placed a single trade,
        </div>
        <div style={{ ...slam(65, 8), fontFamily: FONT_HOOK, fontSize: 128, lineHeight: 0.95, color: RM.red, textShadow: '0 10px 44px rgba(240,104,122,.4)' }}>
          YOU'RE ALREADY DOWN
        </div>
        <div style={{ ...rise(144, 16), fontSize: 32, fontWeight: 600, letterSpacing: 3, color: RM.muted, textTransform: 'uppercase' }}>
          that's the challenge fee
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default PFProblem;
