import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, usePop, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 183-196 · "one percent" f90. 4-bit compression claim.
export const compositionConfig = { id: 'GLQuant', durationInSeconds: 13.0, fps: 30, width: 1920, height: 1080 };

const GLQuant: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const pop = usePop();
  const drift = useDrift(390);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.amber} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '0 150px', textAlign: 'center' }}>
        <div style={rise(6, 14)}><Eyebrow color={RM.amber}>The fine print</Eyebrow></div>
        <div style={{ ...rise(24, 16), fontSize: 28, fontWeight: 500, color: RM.muted }}>
          That 4-bit compression costs, Meta says, about
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginTop: 6 }}>
          <div style={{ ...slam(70, 9), fontFamily: FONT_HOOK, fontSize: 130, lineHeight: 0.95, color: RM.green, textShadow: `0 10px 44px ${RM.green}44` }}>~1%</div>
          <div style={{ ...rise(100, 14), fontSize: 26, color: RM.muted, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 2 }}>
            avg. across 15 benchmarks
          </div>
        </div>
        <div style={{ ...pop(200), fontSize: 26, fontWeight: 600, color: RM.text }}>
          Most of the model&rsquo;s value, at a fifth of the size.
        </div>
        <div style={{ ...rise(270, 18), fontSize: 22, color: RM.amber, fontFamily: 'monospace' }}>
          Meta&rsquo;s own claim &mdash; re-verify on your own hardware.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GLQuant;
