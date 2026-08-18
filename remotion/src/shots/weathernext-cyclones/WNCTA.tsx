import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 223.67-240.00 · mid-roll CTA. never misses f19, 3 min f269, subscribe f376.
export const compositionConfig = { id: 'WNCTA', durationInSeconds: 16.3, fps: 30, width: 1920, height: 1080 };

const WNCTA: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(490);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.green} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.green}>What this channel never misses</Eyebrow></div>
        <div style={{ ...rise(60, 18), fontSize: 36, fontWeight: 500, color: RM.text, textAlign: 'center' }}>
          A release lands at 2 AM. By the time you see it, we've read the paper, pulled the receipts,
        </div>
        <div style={{ ...rise(269, 18), fontSize: 36, fontWeight: 500, color: RM.text, textAlign: 'center' }}>
          and got you the <span style={{ color: RM.cyan }}>verdict in the first 3 minutes</span>.
        </div>
        <div style={{ ...slam(376, 8), marginTop: 14, fontFamily: FONT_HOOK, fontSize: 92, color: RM.green, textShadow: `0 8px 36px ${RM.green}44` }}>
          SUBSCRIBE
        </div>
        <div style={{ ...rise(430, 18), fontSize: 26, fontWeight: 500, color: RM.muted }}>
          it costs nothing, and it's what keeps us doing this
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default WNCTA;
