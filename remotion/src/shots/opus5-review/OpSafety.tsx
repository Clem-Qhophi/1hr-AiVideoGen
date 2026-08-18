import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 102.73-112.30 · safety: 2.3 misaligned behavior (f135), lowest of recent models (f215).
export const compositionConfig = { id: 'OpSafety', durationInSeconds: 9.7, fps: 30, width: 1920, height: 1080 };

const OpSafety: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(287);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.green} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, textAlign: 'center' }}>
        <div style={rise(8, 16)}><Eyebrow color={RM.muted}>automated behavioral audit</Eyebrow></div>
        <div style={{ ...slam(135, 9), fontFamily: FONT_HOOK, fontSize: 260, lineHeight: 0.9, color: RM.green, textShadow: `0 12px 56px ${RM.green}33` }}>2.3</div>
        <div style={{ ...rise(175, 16), fontSize: 34, fontWeight: 600, letterSpacing: 3, color: RM.muted, textTransform: 'uppercase' }}>
          overall misaligned behavior
        </div>
        <div style={{ ...rise(215, 18), marginTop: 14, fontSize: 46, fontWeight: 700, color: RM.text }}>
          the lowest of any recent Claude model
        </div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', bottom: 34, width: '100%', textAlign: 'center', fontFamily: 'monospace', fontSize: 22, color: RM.muted }}>
        Source: anthropic.com, Jul 2026
      </div>
    </AbsoluteFill>
  );
};
export default OpSafety;
