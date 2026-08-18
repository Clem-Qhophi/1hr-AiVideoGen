import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 86.64-100.90 · users. "around a million users" f89, "below half a million" f148,
// "six point one million in November" f279, "one point one million by March" f341.
export const compositionConfig = { id: 'SoraUsers', durationInSeconds: 14.26, fps: 30, width: 1920, height: 1080 };

const Pair: React.FC<{ at: number; num: string; label: string; color: string; size?: number }> = ({ at, num, label, color, size = 84 }) => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ ...slam(at, 10), fontFamily: FONT_HOOK, fontSize: size, color }}>{num}</div>
      <div style={{ ...rise(at + 14, 16), fontSize: 26, color: RM.muted }}>{label}</div>
    </div>
  );
};

const SoraUsers: React.FC = () => {
  const rise = useRise();
  const drift = useDrift(428);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.amber} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, padding: '0 160px', textAlign: 'center' }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.amber}>the audience left</Eyebrow></div>
        <div style={{ display: 'flex', gap: 80, alignItems: 'center', marginTop: 8 }}>
          <Pair at={89} num="~1M" label="USERS AT PEAK" color={RM.text} />
          <div style={{ ...rise(110, 16), fontSize: 50, color: RM.line }}>&rarr;</div>
          <Pair at={148} num="<500K" label="USERS BEFORE THE AXE" color={RM.red} />
        </div>
        <div style={{ display: 'flex', gap: 80, alignItems: 'center', marginTop: 16 }}>
          <Pair at={279} num="6.1M" label="DOWNLOADS NOV 2025" color={RM.cyan} size={64} />
          <div style={{ ...rise(300, 16), fontSize: 42, color: RM.line }}>&rarr;</div>
          <Pair at={341} num="1.1M" label="DOWNLOADS BY MARCH" color={RM.red} size={64} />
        </div>
        <div style={{ ...rise(370, 18), fontSize: 26, color: RM.muted }}>
          Downloads slid 82%. Usage kept falling. Revenue never caught up.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default SoraUsers;
