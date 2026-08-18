import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

export const compositionConfig = { id: 'BrainChart', durationInSeconds: 200, fps: 30, width: 1920, height: 1080 };

const BrainChart: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.accent} />
      <AbsoluteFill style={{ flexDirection: 'row', alignItems: 'center', padding: '0 100px', gap: 60 }}>
        <div style={{ flex: 1, flexDirection: 'column', gap: 18, textAlign: 'left' }}>
          <div style={rise(6, 18)}><Eyebrow color={RM.accent}>Why This Matters</Eyebrow></div>
          <div style={rise(24, 20)}>Every smart home device you own has a brain — and it's not yours.</div>
          <div style={{ ...rise(48, 20), fontSize: 28, color: RM.muted, lineHeight: 1.5 }}>
            Your Alexa. Your Ring doorbell. Your thermostat. They all process your data on chips designed by someone else, stored on servers you don't control.
          </div>
          <div style={{ ...rise(72, 20), fontSize: 28, color: RM.muted, lineHeight: 1.5 }}>
            Neuralink just flipped that model entirely.
          </div>
        </div>
        <div style={{ flex: 1, flexDirection: 'column', gap: 24, alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...slam(6, 9), fontFamily: FONT_HOOK, fontSize: 120, color: RM.accent }}>🧠</div>
          <div style={{ ...rise(12, 20), fontSize: 32, color: RM.muted }}>Your brain as the controller</div>
          <div style={{ ...rise(18, 20), fontSize: 26, color: RM.muted }}>No cloud. No hub. No middleman.</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default BrainChart;
