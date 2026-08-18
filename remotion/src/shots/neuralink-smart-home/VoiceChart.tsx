import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

export const compositionConfig = { id: 'VoiceChart', durationInSeconds: 31, fps: 30, width: 1920, height: 1080 };

const VoiceChart: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.accent} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 36, padding: '0 160px', textAlign: 'center' }}>
        <div style={rise(6, 18)}><Eyebrow color={RM.accent}>The Numbers</Eyebrow></div>
        <div style={{ ...slam(24, 20), fontSize: 44, fontWeight: 500 }}>Why voice hubs are dying</div>
        <div style={{ flexDirection: 'row', gap: 60, justifyContent: 'center', marginTop: 20 }}>
          <div style={{ flexDirection: 'column', gap: 16, alignItems: 'center', flex: 1 }}>
            <div style={{ ...rise(36, 9), fontFamily: FONT_HOOK, fontSize: 80, color: RM.accent }}>10x</div>
            <div style={rise(42, 20)}>Faster than voice assistants</div>
          </div>
          <div style={{ flexDirection: 'column', gap: 16, alignItems: 'center', flex: 1 }}>
            <div style={{ ...slam(36, 9), fontFamily: FONT_HOOK, fontSize: 80, color: RM.muted }}>0ms</div>
            <div style={rise(42, 20)}>Wake word delay</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default VoiceChart;
