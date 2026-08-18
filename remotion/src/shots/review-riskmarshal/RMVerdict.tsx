import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ArrowRight } from 'lucide-react';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { RM, RMBg, useRise } from '../../lib/reviewkit';

// master 64.3-70.3 · tagline f9 · CTA f119
export const compositionConfig = { id: 'RMVerdict', durationInSeconds: 6.4, fps: 30, width: 1920, height: 1080 };

const RMVerdict: React.FC = () => {
  const rise = useRise();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 52, padding: '0 180px', textAlign: 'center' }}>
        <h1 style={{ ...rise(9, 28), fontWeight: 700, fontSize: 88, lineHeight: 1.15, color: RM.text, margin: 0 }}>
          If you can&rsquo;t break your rules,<br />you can&rsquo;t <span style={{ color: RM.cyan }}>blow your account</span>.
        </h1>
        <div style={{ ...rise(119, 26), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: RM.cyan, color: RM.bg0, fontWeight: 700, fontSize: 40, borderRadius: 14, padding: '20px 40px' }}>
            Start Free Trial <ArrowRight size={34} color={RM.bg0} strokeWidth={3} />
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 28, color: RM.muted }}>14-day free trial · cancel anytime</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default RMVerdict;
