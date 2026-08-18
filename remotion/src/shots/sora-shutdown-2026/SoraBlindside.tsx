import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 100.90-118.62 · blindside. "Disney got blindsided" f7, "two hundred characters" f79,
// "big rug-pull" f411, "No money ever changed hands" f481.
export const compositionConfig = { id: 'SoraBlindside', durationInSeconds: 17.72, fps: 30, width: 1920, height: 1080 };

const SoraBlindside: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(531);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.red} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 170px', textAlign: 'center' }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.red}>the blindside</Eyebrow></div>
        <div style={{ ...rise(7, 18), fontSize: 38, fontWeight: 700, color: RM.text }}>
          Disney got blindsided.
        </div>
        <div style={{ ...rise(79, 18), fontSize: 34, color: RM.muted }}>
          The story: Disney wanted a deal worth more than two hundred characters.
        </div>
        <div style={{ ...slam(180, 10), fontFamily: FONT_HOOK, fontSize: 130, color: RM.red, textShadow: `0 14px 60px ${RM.red}55` }}>
          RUG-PULL
        </div>
        <div style={{ ...rise(411, 18), fontSize: 32, fontWeight: 800, color: RM.text }}>
          One analyst called it the big rug-pull.
        </div>
        <div style={{ ...rise(481, 18), fontSize: 30, fontWeight: 600, color: RM.amber }}>
          No money ever changed hands.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default SoraBlindside;
