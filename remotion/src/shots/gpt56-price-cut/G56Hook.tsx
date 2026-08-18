import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 0.00-11.52 · hook. "eighty percent" f111, "$7" f182, "$1.40" f241, tagline f309.
export const compositionConfig = { id: 'G56Hook', durationInSeconds: 11.6, fps: 30, width: 1920, height: 1080 };

const G56Hook: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(348);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <div style={rise(6, 18)}><Eyebrow color={RM.cyan}>GPT 5.6 pricing · Jul 30, 2026</Eyebrow></div>
        <div style={{ ...rise(20, 20), fontSize: 42, fontWeight: 500, color: RM.muted, textAlign: 'center' }}>
          OpenAI just made its cheapest GPT 5.6 model
        </div>
        <div style={{ ...slam(111, 9), fontFamily: FONT_HOOK, fontSize: 118, lineHeight: 0.95, color: RM.cyan, textShadow: `0 10px 44px ${RM.cyan}44` }}>
          EIGHTY PERCENT CHEAPER
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, marginTop: 16 }}>
          <div style={{ ...pop(182), fontFamily: FONT_HOOK, fontSize: 74, color: RM.muted, textDecoration: 'line-through', opacity: 0.7 }}>$7</div>
          <div style={{ fontSize: 46, color: RM.muted }}>&#8594;</div>
          <div style={{ ...pop(241), fontFamily: FONT_HOOK, fontSize: 92, color: RM.green }}>$1.40</div>
          <div style={{ fontFamily: 'monospace', fontSize: 20, color: RM.muted, textTransform: 'uppercase', letterSpacing: 2 }}>per 1M tokens</div>
        </div>
        <div style={{ ...rise(309, 18), marginTop: 10, fontSize: 34, fontWeight: 600, color: RM.text }}>
          and it's not the only cut
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default G56Hook;
