import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

export const compositionConfig = { id: 'CloseCTA-neuralink-smart-home', durationInSeconds: 51, fps: 30, width: 1920, height: 1080 };

const CloseCTAneuralinksmarthome: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.accent} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '0 160px', textAlign: 'center' }}>
        <div style={rise(6, 18)}><Eyebrow color={RM.accent}>Neuralink · Smart Home</Eyebrow></div>
        <div style={{ ...slam(24, 20), fontSize: 60, fontWeight: 600, color: RM.text }}>
          Would you get a brain chip to control your home?
        </div>
        <div style={{ ...rise(48, 20), fontSize: 30, color: RM.muted, marginTop: 14 }}>
          Drop a comment below. We track these breakthroughs as they happen.
        </div>
        <div style={{ flexDirection: 'row', gap: 30, marginTop: 24 }}>
          <div style={{ ...rise(72, 9), padding: '16px 40px', background: RM.accent, borderRadius: 12, fontSize: 22, fontWeight: 700, color: '#fff' }}>
            SUBSCRIBE
          </div>
          <div style={{ ...rise(84, 9), padding: '16px 40px', border: `2px solid ${RM.accent}`, borderRadius: 12, fontSize: 22, fontWeight: 700, color: RM.accent }}>
            SHARE THIS VIDEO
          </div>
        </div>
        <div style={{ ...rise(120, 20), marginTop: 20, fontSize: 24, color: RM.muted }}>
          See you in the next one.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default CloseCTAneuralinksmarthome;
