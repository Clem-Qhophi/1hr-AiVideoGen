import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 0.00-14.0 · cold open. "different model" 3.6s, "new reasoning slider" 13.1s.
export const compositionConfig = { id: 'G56SolHook', durationInSeconds: 14.0, fps: 30, width: 1920, height: 1080 };

const G56SolHook: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(420);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
        <div style={rise(2, 16)}><Eyebrow color={RM.cyan}>GPT-5.6 Sol · ChatGPT update · Aug 6, 2026</Eyebrow></div>
        <div style={{ ...rise(14, 16), fontSize: 44, fontWeight: 500, color: RM.muted, textAlign: 'center' }}>
          You may already be on a different model than you think
        </div>
        <div style={{ ...slam(60, 10), fontFamily: FONT_HOOK, fontSize: 108, lineHeight: 0.98, color: RM.cyan, textAlign: 'center', textShadow: `0 10px 44px ${RM.cyan}44` }}>
          PAID UPGRADED.<br/>FREE SWAPPED.
        </div>
        <div style={{ ...rise(220, 16), fontSize: 34, fontWeight: 600, color: RM.text }}>
          The catch is in the gap section, so stay.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default G56SolHook;