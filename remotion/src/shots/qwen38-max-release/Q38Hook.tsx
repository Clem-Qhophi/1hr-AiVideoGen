import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 0.18-20.79 · cold-open-claim. "2.4T" f34, "95B" f128, landed-yesterday f267, cost-stakes f318.
export const compositionConfig = { id: 'Q38Hook', durationInSeconds: 20.61, fps: 30, width: 1920, height: 1080 };

const Q38Hook: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(618);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 140px', textAlign: 'center' }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.cyan}>Qwen &middot; Aug 3, 2026</Eyebrow></div>
        <div style={{ ...rise(20, 18), fontSize: 38, fontWeight: 500, color: RM.muted }}>
          Alibaba just built a model this big
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 30, marginTop: 6 }}>
          <div style={{ ...slam(34, 9), fontFamily: FONT_HOOK, fontSize: 120, lineHeight: 0.95, color: RM.cyan, textShadow: `0 10px 44px ${RM.cyan}44` }}>2.4T</div>
          <div style={{ ...rise(60, 14), fontSize: 26, color: RM.muted, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 2 }}>total params</div>
        </div>
        <div style={{ ...rise(96, 16), fontSize: 32, fontWeight: 500, color: RM.muted, marginTop: 2 }}>
          but only turns on
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 30 }}>
          <div style={{ ...slam(128, 9), fontFamily: FONT_HOOK, fontSize: 100, lineHeight: 0.95, color: RM.green, textShadow: `0 10px 44px ${RM.green}44` }}>95B</div>
          <div style={{ ...rise(154, 14), fontSize: 24, color: RM.muted, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 2 }}>active at a time</div>
        </div>
        <div style={{ ...rise(230, 18), marginTop: 18, fontSize: 30, fontWeight: 600, color: RM.text }}>
          That&rsquo;s Qwen3.8-Max. It landed yesterday.
        </div>
        <div style={{ ...rise(310, 18), fontSize: 26, color: RM.muted, maxWidth: 1000 }}>
          If you&rsquo;re picking a model on cost per token, this is the number you need first.
        </div>
        <div style={{ ...rise(440, 20), marginTop: 20, fontSize: 32, fontWeight: 700, color: RM.amber, maxWidth: 1050 }}>
          But it doesn&rsquo;t win everything it&rsquo;s being sold on.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default Q38Hook;
