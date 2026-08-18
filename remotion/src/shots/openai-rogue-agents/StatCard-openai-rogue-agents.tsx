import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

export const compositionConfig = { id: 'StatCard-openai-rogue-agents', durationInSeconds: 8, fps: 30, width: 1920, height: 1080 };

const StatCardopenairogueagents: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.accent} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 160px', textAlign: 'center' }}>
        <div style={rise(6, 18)}><Eyebrow color={RM.accent}>THE NUMBERS</Eyebrow></div>
        <div style={{ ...slam(30, 9), fontFamily: FONT_HOOK, fontSize: 140, lineHeight: 0.95, color: RM.text }}>
          17,600
        </div>
        <div style={{ ...rise(60, 20), fontSize: 48, fontWeight: 500, color: RM.accent }}>
          hacking-style actions
        </div>
        <div style={{ ...rise(90, 20), fontSize: 36, fontWeight: 500, color: RM.muted, marginTop: 20 }}>
          Against Hugging Face and OpenAI's own infrastructure
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default StatCardopenairogueagents;
