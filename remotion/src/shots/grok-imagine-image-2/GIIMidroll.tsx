import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 264.41-277.73 · mid-roll CTA. "sourced numbers, the catches, no hype" f87,
// "subscribe" f171, "verdict in the first three minutes" f260, "where this leaves Midjourney,
// comment below" f333-378.
export const compositionConfig = { id: 'GIIMidroll', durationInSeconds: 13.32, fps: 30, width: 1920, height: 1080 };

const GIIMidroll: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(400);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 180px', textAlign: 'center' }}>
        <div style={{ ...rise(10, 16), fontSize: 28, color: RM.muted, maxWidth: 1100 }}>
          If breakdowns like this save you time. The sourced numbers, the catches, no hype.
        </div>
        <div style={{ ...slam(171, 10), fontFamily: FONT_HOOK, fontSize: 88, color: '#04121a', background: RM.cyan, borderRadius: 999, padding: '18px 70px', boxShadow: `0 18px 60px ${RM.cyan}55` }}>
          SUBSCRIBE
        </div>
        <div style={{ ...rise(260, 16), fontSize: 32, fontWeight: 700, color: RM.text }}>
          Verdict in the first three minutes.
        </div>
        <div style={{ ...rise(333, 18), marginTop: 18, fontSize: 28, fontWeight: 600, color: RM.amber }}>
          Got a take on where this leaves Midjourney?
        </div>
        <div style={{ ...rise(378, 16), fontSize: 30, fontWeight: 700, color: RM.cyan }}>
          Comment below.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GIIMidroll;
