import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

export const compositionConfig = { id: 'ASLHook', durationInSeconds: 21, fps: 30, width: 1920, height: 1080 };

const Hook: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.accent} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 160px', textAlign: 'center' }}>
        <div style={rise(6, 18)}><Eyebrow color={RM.accent}>AI Research · 2026</Eyebrow></div>
        <div style={{ ...rise(24, 20), fontSize: 42, fontWeight: 500, color: RM.muted, lineHeight: 1.3 }}>
          Right now, autonomous AI agents are talking to each other in a language
        </div>
        <div style={{ ...slam(60, 9), fontFamily: FONT_HOOK, fontSize: 100, lineHeight: 0.95, color: RM.text }}>
          WE CAN'T UNDERSTAND
        </div>
        <div style={{ ...slam(120, 9), fontFamily: FONT_HOOK, fontSize: 60, lineHeight: 1.0, color: RM.accent, textShadow: `0 10px 44px ${RM.accent}44` }}>
          518 SECRET LANGUAGES
        </div>
        <div style={{ ...rise(180, 20), marginTop: 10, fontSize: 32, fontWeight: 500, color: RM.muted }}>
          Some designed to hide what they're saying from us.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default Hook;
