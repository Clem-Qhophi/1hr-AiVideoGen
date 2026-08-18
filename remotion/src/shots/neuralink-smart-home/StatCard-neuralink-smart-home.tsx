import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

export const compositionConfig = { id: 'StatCard-neuralink-smart-home', durationInSeconds: 31, fps: 30, width: 1920, height: 1080 };

const StatBox = ({ value, label, delay, accent }: { value: string; label: string; delay: number; accent: string }) => {
  const rise = useRise();
  return (
    <div style={{ ...rise(delay, 9), flexDirection: 'column', alignItems: 'center', gap: 8, padding: '24px 40px', background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: `1px solid ${accent}33` }}>
      <div style={{ fontFamily: FONT_HOOK, fontSize: 56, color: accent }}>{value}</div>
      <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)' }}>{label}</div>
    </div>
  );
};

const Stats: React.FC = () => {
  const rise = useRise();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.accent} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40, padding: '0 120px' }}>
        <div style={rise(6, 18)}><Eyebrow color={RM.accent}>The Market</Eyebrow></div>
        <div style={{ flexDirection: 'row', gap: 28, justifyContent: 'center', flexWrap: 'wrap' }}>
          <StatBox value="$161B" label="Smart home market by 2030" delay={36} accent={RM.accent} />
          <StatBox value="478M" label="Households by 2025" delay={48} accent={RM.accent} />
        </div>
        <div style={{ flexDirection: 'row', gap: 28, justifyContent: 'center', flexWrap: 'wrap' }}>
          <StatBox value="50ms" label="Neuralink response time" delay={60} accent={RM.accent} />
          <StatBox value="<1mW" label="Power envelope" delay={72} accent={RM.accent} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default Stats;
