import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

export const compositionConfig = { id: 'Hook-neuralink-smart-home', durationInSeconds: 21, fps: 30, width: 1920, height: 1080 };

const Hookneuralinksmarthome: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.accent} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 160px', textAlign: 'center' }}>
        <div style={rise(6, 18)}><Eyebrow color={RM.accent}>Neuralink · 2026</Eyebrow></div>
        <div style={{ ...rise(24, 20), fontSize: 44, fontWeight: 500, color: RM.muted, lineHeight: 1.3 }}>
          Your Alexa is about to become
        </div>
        <div style={{ ...slam(60, 9), fontFamily: FONT_HOOK, fontSize: 110, lineHeight: 0.95, color: RM.text }}>
          A MUSEUM PIECE
        </div>
        <div style={{ ...slam(120, 9), fontFamily: FONT_HOOK, fontSize: 72, lineHeight: 1.0, color: RM.accent, textShadow: `0 10px 44px ${RM.accent}44` }}>
          50ms RESPONSE TIME
        </div>
        <div style={{ ...rise(180, 20), marginTop: 10, fontSize: 36, fontWeight: 500, color: RM.muted }}>
          No wake word. No phone. No hub. Just thought.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default Hookneuralinksmarthome;
