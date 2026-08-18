import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 374.84-396.43 · action: three things to do. "export it now" f139,
// "migration deadline" f330, "moving fastest" f611.
export const compositionConfig = { id: 'SoraAction', durationInSeconds: 21.59, fps: 30, width: 1920, height: 1080 };

const Action: React.FC<{ at: number; n: string; text: string; color: string; sub: string }> = ({ at, n, text, color, sub }) => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ ...slam(at, 8), fontFamily: FONT_HOOK, fontSize: 40, color }}>{n}</div>
      <div style={{ ...rise(at + 8, 14), fontSize: 40, fontWeight: 800, color: RM.text }}>{text}</div>
      <div style={{ ...rise(at + 18, 14), fontSize: 26, color: RM.muted, maxWidth: 800 }}>{sub}</div>
    </div>
  );
};

const SoraAction: React.FC = () => {
  const rise = useRise();
  const drift = useDrift(648);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.green} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: '0 170px', textAlign: 'center' }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.green}>WHAT YOU CAN DO &middot; today</Eyebrow></div>
        <div style={{ display: 'flex', gap: 60, alignItems: 'flex-start', marginTop: 8 }}>
          <Action at={139} n="01" text="EXPORT IT NOW" color={RM.red} sub="your clips, your prompts, your history" />
          <Action at={330} n="02" text="WATCH THE MIGRATION" color={RM.amber} sub="API deadline Sept 24, and the 'if we are able' window" />
          <Action at={460} n="03" text="FOLLOW THE MONEY" color={RM.cyan} sub="MiniMax, ByteDance, and Google are moving fastest" />
        </div>
        <div style={{ ...rise(611, 18), marginTop: 14, fontSize: 32, fontWeight: 700, color: RM.text, maxWidth: 1250 }}>
          The companies building for the future are the ones making money now. That&apos;s the lesson.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default SoraAction;
