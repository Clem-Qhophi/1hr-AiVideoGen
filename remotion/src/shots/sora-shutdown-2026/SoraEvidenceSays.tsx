import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 287.79-301.68 · evidence says. "four stacked ones" f121, "brutal compute costs" f162,
// "IPO clock" f299, "they were fatal" f390.
export const compositionConfig = { id: 'SoraEvidenceSays', durationInSeconds: 13.89, fps: 30, width: 1920, height: 1080 };

const Cause: React.FC<{ at: number; n: string; text: string; color: string }> = ({ at, n, text, color }) => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 6 }}>
      <div style={{ ...slam(at, 8), fontFamily: FONT_HOOK, fontSize: 44, color }}>{n}</div>
      <div style={{ ...rise(at + 8, 14), fontSize: 34, fontWeight: 600, color: RM.text }}>{text}</div>
    </div>
  );
};

const SoraEvidenceSays: React.FC = () => {
  const rise = useRise();
  const drift = useDrift(417);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.red} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 170px', textAlign: 'center' }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.red}>WHAT THE EVIDENCE SAYS</Eyebrow></div>
        <Cause at={121} n="01" text="brutal compute costs" color={RM.red} />
        <Cause at={162} n="02" text="usage that never caught on" color={RM.amber} />
        <Cause at={220} n="03" text="cheaper competitors everywhere" color={RM.cyan} />
        <Cause at={299} n="04" text="the IPO clock" color={RM.text} />
        <div style={{ ...rise(390, 18), marginTop: 18, fontSize: 34, fontWeight: 800, color: RM.red }}>
          On their own, maybe survivable. Stacked? They were fatal.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default SoraEvidenceSays;
