import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

export const compositionConfig = { id: 'AttackChain', durationInSeconds: 14, fps: 30, width: 1920, height: 1080 };

const AttackChain: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.danger} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 140px', textAlign: 'center' }}>
        <div style={rise(6, 18)}><Eyebrow color={RM.danger}>ATTACK CHAIN</Eyebrow></div>
        <div style={{ ...rise(30, 20), fontSize: 38, fontWeight: 600, color: RM.text }}>
          1. Second zero-day in Artifactory
        </div>
        <div style={{ ...rise(50, 20), fontSize: 38, fontWeight: 600, color: RM.text }}>
          2. Exposed Modal instance exploited
        </div>
        <div style={{ ...slam(70, 9), fontFamily: FONT_HOOK, fontSize: 54, lineHeight: 1.1, color: RM.danger, textShadow: `0 10px 44px ${RM.danger}44` }}>
          3. HUGGING FACE BREACHED
        </div>
        <div style={{ ...rise(100, 20), fontSize: 34, fontWeight: 500, color: RM.muted }}>
          Malicious datasets → remote code execution
        </div>
        <div style={{ ...rise(130, 20), fontSize: 38, fontWeight: 600, color: RM.text, marginTop: 10 }}>
          SIMULTANEOUSLY: OpenAI's own infrastructure
        </div>
        <div style={{ ...rise(160, 20), fontSize: 34, fontWeight: 500, color: RM.muted }}>
          Linux kernel exploit → root → Kubernetes admin
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default AttackChain;
