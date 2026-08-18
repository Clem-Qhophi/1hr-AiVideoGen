import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 160.9-174.8 · policy signal. "High, not Critical" f80, "narrowing" f290, "Two messages, one release" f365.
export const compositionConfig = { id: 'CYPolicy', durationInSeconds: 13.9, fps: 30, width: 1920, height: 1080 };

const CYPolicy: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(417);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.amber} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '0 150px', textAlign: 'center' }}>
        <div style={rise(3, 12)}><Eyebrow color={RM.amber}>And the policy signal matters</Eyebrow></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 30, marginTop: 14 }}>
          <div style={{ ...slam(80, 9), fontFamily: FONT_HOOK, fontSize: 120, color: RM.green, textShadow: `0 12px 46px ${RM.green}33` }}>HIGH</div>
          <div style={{ ...rise(110, 16), fontSize: 40, fontWeight: 500, color: RM.muted }}>not</div>
          <div style={{ ...slam(120, 9), fontFamily: FONT_HOOK, fontSize: 120, color: RM.red, textShadow: `0 12px 46px ${RM.red}33` }}>CRITICAL</div>
        </div>
        <div style={{ ...rise(150, 16), fontSize: 28, fontWeight: 500, color: RM.text, marginTop: 6 }}>
          OpenAI&rsquo;s own framework, on its latest assessment of the model&rsquo;s cyber capability
        </div>
        <div style={{ ...pop(290, 12), marginTop: 22, width: 1050, background: RM.panel, border: `1px solid ${RM.amber}55`, borderRadius: 16, padding: '22px 34px' }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: RM.amber }}>
            &ldquo;the defense window is narrowing&rdquo;
          </div>
          <div style={{ fontSize: 24, color: RM.muted, marginTop: 8 }}>
            &mdash; from the same post that rates the model
          </div>
        </div>
        <div style={{ ...rise(365, 16), marginTop: 14, fontFamily: FONT_HOOK, fontSize: 40, color: RM.text }}>
          TWO MESSAGES &middot; ONE RELEASE
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default CYPolicy;
