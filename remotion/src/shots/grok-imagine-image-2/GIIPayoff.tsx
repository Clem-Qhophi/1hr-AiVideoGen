import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 357.25-370.18 · close: HOOK PAYOFF. "the catch, in one line" f6, "ranked #2 by its
// fast variant, preliminary board, app-only" f97-227, "not a reason to dismiss it" f261,
// "know what you're looking at" f304.
export const compositionConfig = { id: 'GIIPayoff', durationInSeconds: 12.93, fps: 30, width: 1920, height: 1080 };

const GIIPayoff: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(388);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 190px', textAlign: 'center' }}>
        <div style={rise(4, 16)}><Eyebrow color={RM.cyan}>The catch, in one line</Eyebrow></div>
        <div style={{ ...rise(97, 18), fontSize: 38, fontWeight: 700, color: RM.text, maxWidth: 1250 }}>
          Grok&rsquo;s new model is ranked second in the world
        </div>
        <div style={{ ...rise(140, 18), fontSize: 36, fontWeight: 700, color: RM.amber, maxWidth: 1250 }}>
          by its fast variant, on a preliminary scoreboard, app-only for now.
        </div>
        <div style={{ ...rise(261, 18), marginTop: 24, fontSize: 32, fontWeight: 600, color: RM.muted }}>
          That&rsquo;s not a reason to dismiss it.
        </div>
        <div style={{ ...slam(304, 10), fontFamily: FONT_HOOK, fontSize: 62, color: RM.green, maxWidth: 1250 }}>
          It&rsquo;s a reason to know what you&rsquo;re looking at.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GIIPayoff;
