import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 208-218 · "hit subscribe" f0, "verdict in the first three minutes" f32. Mid-roll CTA.
export const compositionConfig = { id: 'GLCTA', durationInSeconds: 10.0, fps: 30, width: 1920, height: 1080 };

const GLCTA: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(300);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.amber} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 160px', textAlign: 'center' }}>
        <div style={{ ...slam(8, 10), fontFamily: FONT_HOOK, fontSize: 96, lineHeight: 1, color: RM.amber, textShadow: `0 10px 44px ${RM.amber}44` }}>
          HIT SUBSCRIBE
        </div>
        <div style={{ ...rise(60, 16), fontSize: 28, fontWeight: 500, color: RM.text }}>
          Every new model drop lands on this channel.
        </div>
        <div style={{ ...rise(120, 16), fontSize: 26, color: RM.muted }}>
          Verdict in the first three minutes, every time.
        </div>
        <div style={{ ...rise(190, 16), fontSize: 26, fontWeight: 700, color: RM.text }}>
          No hype. Every number sourced.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GLCTA;
