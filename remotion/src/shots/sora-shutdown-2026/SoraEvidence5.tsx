import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 212.83-232.32 · evidence-5: Reuters deal-dispute (capture blocked by Cloudflare —
// disclosure shown on screen instead of the frame). "And Disney" f0,
// "more than two hundred characters" f134, "a Monday evening" f358, "big rug-pull" f556.
export const compositionConfig = { id: 'SoraEvidence5', durationInSeconds: 19.49, fps: 30, width: 1920, height: 1080 };

const SoraEvidence5: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(585);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.amber} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 170px', textAlign: 'center' }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.amber}>REUTERS &middot; deal dispute</Eyebrow></div>
        <div style={{ ...rise(20, 18), fontSize: 40, fontWeight: 700, color: RM.text }}>
          And Disney: the deal never closed.
        </div>
        <div style={{ ...slam(134, 10), fontFamily: FONT_HOOK, fontSize: 72, color: RM.amber }}>
          more than 200 characters
        </div>
        <div style={{ ...rise(358, 18), fontSize: 32, color: RM.muted, maxWidth: 1150 }}>
          Reported on a Monday evening: the deal is off. No money ever changed hands.
        </div>
        <div style={{ ...slam(556, 10), fontFamily: FONT_HOOK, fontSize: 64, color: RM.red }}>
          THE BIG RUG-PULL
        </div>
        <div style={{ ...rise(500, 18), fontSize: 26, color: RM.muted, fontFamily: 'monospace' }}>
          live page capture blocked (Cloudflare) - source text verified directly
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default SoraEvidence5;
