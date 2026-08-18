import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 360.33-374.84 · close: hook payoff. "catch, in one line" f5, "two point one million" f183,
// "deleting the data" f402.
export const compositionConfig = { id: 'SoraClose', durationInSeconds: 14.51, fps: 30, width: 1920, height: 1080 };

const SoraClose: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(435);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, padding: '0 170px', textAlign: 'center' }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.cyan}>THE CATCH &middot; in one line</Eyebrow></div>
        <div style={{ ...rise(5, 18), fontSize: 36, fontWeight: 700, color: RM.text, maxWidth: 1300 }}>
          Here&apos;s the catch, in one line.
        </div>
        <div style={{ ...slam(183, 12), fontFamily: FONT_HOOK, fontSize: 84, color: RM.amber, maxWidth: 1300 }}>
          OpenAI spent $2.1 million of your attention. On a product that lost money.
        </div>
        <div style={{ ...rise(300, 18), fontSize: 34, color: RM.muted, maxWidth: 1300 }}>
          It&apos;s not that they don&apos;t want Sora to exist. It&apos;s that they never needed it to pay for itself.
        </div>
        <div style={{ ...slam(402, 10), fontFamily: FONT_HOOK, fontSize: 52, color: RM.red }}>
          And now they&apos;re deleting the data.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default SoraClose;
