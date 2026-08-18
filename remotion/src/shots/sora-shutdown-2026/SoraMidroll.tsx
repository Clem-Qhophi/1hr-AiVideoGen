import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 273.92-287.79 · midroll. "subscribe" f104, "verdict in the first three minutes" f207,
// "drop it in the comments" f378.
export const compositionConfig = { id: 'SoraMidroll', durationInSeconds: 13.87, fps: 30, width: 1920, height: 1080 };

const SoraMidroll: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(416);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '0 170px', textAlign: 'center' }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.cyan}>before we keep going</Eyebrow></div>
        <div style={{ ...slam(104, 12), fontFamily: FONT_HOOK, fontSize: 100, color: RM.cyan, textShadow: `0 12px 50px ${RM.cyan}44` }}>
          SUBSCRIBE
        </div>
        <div style={{ ...rise(207, 18), fontSize: 34, fontWeight: 600, color: RM.text, maxWidth: 1200 }}>
          Every video ends with a verdict in the first three minutes. No filler, no clickbait.
        </div>
        <div style={{ ...rise(378, 18), fontSize: 32, color: RM.muted, maxWidth: 1200 }}>
          Drop your call below in the comments.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default SoraMidroll;
