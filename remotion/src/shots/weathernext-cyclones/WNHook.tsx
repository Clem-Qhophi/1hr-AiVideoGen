import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 0.00-29.25 · hook. "$1.4T" f153, "5 days" f454, "+1 day" f699, teaser f788.
export const compositionConfig = { id: 'WNHook', durationInSeconds: 29.3, fps: 30, width: 1920, height: 1080 };

const WNHook: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(877);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <div style={rise(8, 16)}><Eyebrow color={RM.cyan}>Google DeepMind · Nature · Aug 6, 2026</Eyebrow></div>
        <div style={{ ...rise(40, 18), fontSize: 40, fontWeight: 500, color: RM.muted, textAlign: 'center' }}>
          Cyclones have cost the world
        </div>
        <div style={{ ...slam(153, 9), fontFamily: FONT_HOOK, fontSize: 150, lineHeight: 0.95, color: RM.cyan, textShadow: `0 10px 44px ${RM.cyan}44` }}>
          $1.4 TRILLION
        </div>
        <div style={{ ...rise(220, 18), fontSize: 34, fontWeight: 500, color: RM.text }}>
          in damage, over the last 50 years
        </div>
        <div style={{ ...rise(454, 18), marginTop: 20, fontSize: 44, fontWeight: 600, color: RM.text }}>
          Forecasters had <span style={{ color: RM.green }}>5 days of warning</span> for Hurricane Melissa
        </div>
        <div style={{ ...slam(699, 9), fontFamily: FONT_HOOK, fontSize: 84, color: RM.cyan, textShadow: `0 8px 36px ${RM.cyan}44` }}>
          ONE EXTRA DAY
        </div>
        <div style={{ ...rise(788, 18), marginTop: 8, fontSize: 30, fontWeight: 500, color: RM.muted, textAlign: 'center' }}>
          And the strangest part of the paper has nothing to do with hurricanes.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default WNHook;
