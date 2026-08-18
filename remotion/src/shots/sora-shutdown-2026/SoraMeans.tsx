import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 118.62-134.43 · stakes. "Here's what it means for you" f0,
// "permanently deletes the data" f289, "not on your side" f439.
export const compositionConfig = { id: 'SoraMeans', durationInSeconds: 15.81, fps: 30, width: 1920, height: 1080 };

const SoraMeans: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(474);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.red} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '0 170px', textAlign: 'center' }}>
        <div style={rise(0, 14)}><Eyebrow color={RM.red}>YOUR STAKES</Eyebrow></div>
        <div style={{ ...rise(8, 18), fontFamily: FONT_HOOK, fontSize: 74, color: RM.text, maxWidth: 1300 }}>
          Here&apos;s what it means for you.
        </div>
        <div style={{ ...rise(289, 18), fontSize: 40, fontWeight: 800, color: RM.red }}>
          OpenAI permanently deletes the data.
        </div>
        <div style={{ ...rise(439, 18), fontSize: 32, fontWeight: 600, color: RM.amber }}>
          The clock is not on your side.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default SoraMeans;
