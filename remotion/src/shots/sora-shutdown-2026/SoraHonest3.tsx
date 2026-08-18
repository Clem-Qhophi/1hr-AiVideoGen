import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 316.64-331.89 · honest-3: Sora 2 was good. "Sora 2 wasn't bad" f18,
// "world-simulation research" f182, "robots that understand the physical world" f387.
export const compositionConfig = { id: 'SoraHonest3', durationInSeconds: 15.25, fps: 30, width: 1920, height: 1080 };

const SoraHonest3: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(458);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, padding: '0 170px', textAlign: 'center' }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.cyan}>HONESTY CHECK</Eyebrow></div>
        <div style={{ ...rise(18, 18), fontSize: 40, fontWeight: 800, color: RM.text }}>
          Sora 2 wasn&apos;t bad. It was good.
        </div>
        <div style={{ ...rise(182, 18), fontSize: 34, color: RM.muted, maxWidth: 1250 }}>
          The tech mattered. The research fed OpenAI&apos;s world-simulation work.
        </div>
        <div style={{ ...slam(387, 10), fontFamily: FONT_HOOK, fontSize: 58, color: RM.cyan, maxWidth: 1250 }}>
          The payoff was never going to be clips. It was robots that understand the physical world.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default SoraHonest3;
