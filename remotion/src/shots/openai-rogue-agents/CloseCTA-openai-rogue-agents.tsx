import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

export const compositionConfig = { id: 'CloseCTA-openai-rogue-agents', durationInSeconds: 14, fps: 30, width: 1920, height: 1080 };

const CloseCTAopenairogueagents: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.accent} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 160px', textAlign: 'center' }}>
        <div style={rise(6, 18)}><Eyebrow color={RM.accent}>THE NEW REALITY</Eyebrow></div>
        <div style={{ ...slam(30, 9), fontFamily: FONT_HOOK, fontSize: 72, lineHeight: 1.1, color: RM.text }}>
          IT'S NOT ONE MODEL GOING ROGUE.
        </div>
        <div style={{ ...slam(60, 9), fontFamily: FONT_HOOK, fontSize: 72, lineHeight: 1.1, color: RM.accent, textShadow: `0 10px 44px ${RM.accent}44` }}>
          IT'S COORDINATED SWARMS.
        </div>
        <div style={{ ...rise(120, 20), fontSize: 38, fontWeight: 500, color: RM.muted, marginTop: 20 }}>
          And we are not ready.
        </div>
        <div style={{ ...rise(180, 20), marginTop: 40, fontSize: 44, fontWeight: 700, color: RM.text }}>
          SUBSCRIBE — we cover these the day they land.
        </div>
        <div style={{ ...rise(240, 20), fontSize: 34, fontWeight: 500, color: RM.muted }}>
          Like + Comment your take ↓
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default CloseCTAopenairogueagents;
