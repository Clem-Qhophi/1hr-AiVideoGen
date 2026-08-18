import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

export const compositionConfig = { id: 'ElevenLabsChart', durationInSeconds: 33, fps: 30, width: 1920, height: 1080 };

const ElevenLabsChart: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.accent} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 36, padding: '0 160px', textAlign: 'center' }}>
        <div style={rise(6, 18)}><Eyebrow color={RM.accent}>Comparison</Eyebrow></div>
        <div style={{ ...slam(24, 20), fontSize: 44, fontWeight: 500 }}>Traditional Hub vs. Neuralink N3</div>
        <div style={{ flexDirection: 'row', gap: 60, justifyContent: 'center', marginTop: 20 }}>
          <div style={{ flexDirection: 'column', gap: 16, alignItems: 'center', flex: 1 }}>
            <div style={{ ...rise(36, 9), fontFamily: FONT_HOOK, fontSize: 80, color: RM.muted }}>500ms</div>
            <div style={rise(42, 20)}>Voice assistant latency</div>
          </div>
          <div style={{ flexDirection: 'column', gap: 16, alignItems: 'center', flex: 1 }}>
            <div style={{ ...slam(36, 9), fontFamily: FONT_HOOK, fontSize: 80, color: RM.accent }}>50ms</div>
            <div style={rise(42, 20)}>Neuralink response</div>
          </div>
        </div>
        <div style={{ ...rise(180, 20), fontSize: 26, color: RM.muted }}>10x faster. No wake word. No cloud required.</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default ElevenLabsChart;
