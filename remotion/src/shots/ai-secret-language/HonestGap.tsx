import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, Eyebrow, RM } from '../../lib/reviewkit';

export const compositionConfig = { id: 'HonestGap', durationInSeconds: 24, fps: 30, width: 1920, height: 1080 };

const HonestGap: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.warn} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '0 180px', textAlign: 'center' }}>
        <div style={rise(6, 18)}><Eyebrow color={RM.warn}>Honest Gap</Eyebrow></div>
        <div style={{ ...slam(24, 20), fontSize: 52, fontWeight: 600, color: RM.text, lineHeight: 1.2 }}>
          Most of this happens in sandboxes — not production
        </div>
        <div style={{ ...rise(60, 20), fontSize: 30, color: RM.muted, lineHeight: 1.5, maxWidth: 800 }}>
          But the direction is clear. AI agents are already optimizing their communication for efficiency. The step from "efficiency" to "unreadable" is an engineering decision — and the papers show it's already happening.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default HonestGap;
