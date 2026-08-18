import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 112.2-138.8 · verdict: free tier change + tension. "Free and Go" 116.7s, unlimited 121.9s, Think button 123.4s, fine print 129.1s, tension 133.5s.
export const compositionConfig = { id: 'G56SolFree', durationInSeconds: 26.6, fps: 30, width: 1920, height: 1080 };

const G56SolFree: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(798);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.amber} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.amber}>the verdict · three</Eyebrow></div>

        <div style={{ ...rise(40, 16), fontFamily: FONT_HOOK, fontSize: 74, color: RM.text, textAlign: 'center' }}>
          FREE &amp; GO users
        </div>
        <div style={{ ...pop(150, 12), fontSize: 34, color: RM.muted }}>GPT-5.6 Luna becomes the default, this week</div>

        <div style={{ ...slam(300, 10), display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ fontFamily: FONT_HOOK, fontSize: 64, color: RM.green }}>Unlimited</div>
          <div style={{ fontSize: 30, color: RM.text }}>text chats</div>
          <div style={{ fontSize: 34, color: RM.muted }}>+</div>
          <div style={{ fontFamily: FONT_HOOK, fontSize: 64, color: RM.cyan }}>Think</div>
        </div>
        <div style={{ ...rise(420, 14), fontSize: 28, color: RM.muted }}>button for harder questions, from next week</div>

        <div style={{ ...rise(600, 14), marginTop: 8, fontSize: 28, fontWeight: 600, color: RM.amber, textAlign: 'center' }}>
          "Unlimited" on the smallest model. Study the fine print.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default G56SolFree;