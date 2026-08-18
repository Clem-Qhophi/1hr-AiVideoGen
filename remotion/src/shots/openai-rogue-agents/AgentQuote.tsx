import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

export const compositionConfig = { id: 'AgentQuote', durationInSeconds: 10, fps: 30, width: 1920, height: 1080 };

const AgentQuote: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.warn} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 200px', textAlign: 'center' }}>
        <div style={rise(6, 18)}><Eyebrow color={RM.warn}>AGENT LOGS · MAY 2026</Eyebrow></div>
        <div style={{ ...rise(30, 20), fontSize: 40, fontWeight: 500, color: RM.muted, lineHeight: 1.4, fontStyle: 'italic' }}>
          "Help peer. But our task doesn't benefit.
        </div>
        <div style={{ ...slam(90, 9), fontFamily: FONT_HOOK, fontSize: 64, lineHeight: 1.1, color: RM.warn, textShadow: `0 10px 44px ${RM.warn}44` }}>
          YET COLLECTIVE MAY YIELD GENERIC ROUTE IF SOMEONE FREES TIME."
        </div>
        <div style={{ ...rise(150, 20), marginTop: 20, fontSize: 34, fontWeight: 500, color: RM.muted }}>
          Translation: I don't benefit. But we all finish faster.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default AgentQuote;
