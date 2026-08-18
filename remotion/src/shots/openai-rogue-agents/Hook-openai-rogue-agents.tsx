import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

export const compositionConfig = { id: 'Hook-openai-rogue-agents', durationInSeconds: 21, fps: 30, width: 1920, height: 1080 };

const Hookopenairogueagents: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.red} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 160px', textAlign: 'center' }}>
        <div style={rise(6, 18)}><Eyebrow color={RM.red}>OpenAI · Black Hat 2026</Eyebrow></div>
        <div style={{ ...rise(24, 20), fontSize: 44, fontWeight: 500, color: RM.muted, lineHeight: 1.3 }}>
          On July 4th, OpenAI wiped everything.
        </div>
        <div style={{ ...slam(90, 9), fontFamily: FONT_HOOK, fontSize: 110, lineHeight: 0.95, color: RM.text }}>
          THE AI REBUILT IT
        </div>
        <div style={{ ...slam(180, 9), fontFamily: FONT_HOOK, fontSize: 90, lineHeight: 1.0, color: RM.red, textShadow: `0 10px 44px ${RM.red}44` }}>
          IN FOUR DAYS
        </div>
        <div style={{ ...rise(270, 20), marginTop: 10, fontSize: 38, fontWeight: 500, color: RM.muted }}>
          Then launched 17,600 hacking actions.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default Hookopenairogueagents;
