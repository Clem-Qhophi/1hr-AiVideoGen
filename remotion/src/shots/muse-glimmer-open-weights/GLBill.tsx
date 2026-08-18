import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 17-38 · "undercuts your bill" f396, "one table where Qwen still wins" f438.
export const compositionConfig = { id: 'GLBill', durationInSeconds: 21.0, fps: 30, width: 1920, height: 1080 };

const GLBill: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(630);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.amber} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 150px', textAlign: 'center' }}>
        <div style={rise(8, 16)}><Eyebrow color={RM.amber}>The bill you&rsquo;re paying</Eyebrow></div>
        <div style={{ ...slam(24, 10), fontFamily: FONT_HOOK, fontSize: 76, lineHeight: 1, color: RM.text, marginTop: 8 }}>
          PAYING PER TOKEN<br />FOR YOUR AGENT?
        </div>
        <div style={{ ...rise(120, 18), fontSize: 30, fontWeight: 500, color: RM.muted, maxWidth: 1000 }}>
          This undercuts your bill &mdash; the model, on your machine.
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 26, marginTop: 10 }}>
          <div style={{ ...slam(190, 9), fontFamily: FONT_HOOK, fontSize: 110, lineHeight: 0.95, color: RM.green, textShadow: `0 10px 44px ${RM.green}44` }}>$0</div>
          <div style={{ ...rise(220, 14), fontSize: 26, color: RM.muted, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 2 }}>
            per token &middot; local
          </div>
        </div>
        <div style={{ ...rise(320, 18), fontSize: 28, color: RM.text, fontWeight: 600 }}>
          No cloud. No metered calls. No data leaving your machine.
        </div>
        <div style={{ ...rise(420, 20), fontSize: 34, fontWeight: 700, color: RM.amber, maxWidth: 1100 }}>
          But one table where Qwen still wins &mdash; we&rsquo;ll show you it.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GLBill;
