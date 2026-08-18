import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 137-146 · "what it means for you" f0. free / open / local slams.
export const compositionConfig = { id: 'GLMeans', durationInSeconds: 9.0, fps: 30, width: 1920, height: 1080 };

const GLMeans: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(270);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.green} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '0 150px', textAlign: 'center' }}>
        <div style={rise(6, 14)}><Eyebrow color={RM.green}>What it means for you</Eyebrow></div>
        <div style={{ display: 'flex', gap: 34, marginTop: 10 }}>
          <div style={{ ...slam(20, 9), fontFamily: FONT_HOOK, fontSize: 110, lineHeight: 0.95, color: RM.green, textShadow: `0 10px 44px ${RM.green}44` }}>FREE</div>
          <div style={{ ...slam(70, 9), fontFamily: FONT_HOOK, fontSize: 110, lineHeight: 0.95, color: RM.cyan, textShadow: `0 10px 44px ${RM.cyan}44` }}>OPEN</div>
          <div style={{ ...slam(120, 9), fontFamily: FONT_HOOK, fontSize: 110, lineHeight: 0.95, color: RM.text, textShadow: `0 10px 44px #ffffff22` }}>LOCAL</div>
        </div>
        <div style={{ ...rise(180, 18), fontSize: 30, fontWeight: 600, color: RM.text }}>
          If you build agents: an open option that never phones home.
        </div>
        <div style={{ ...rise(230, 18), fontSize: 26, color: RM.muted }}>
          Your agent. Your machine. Your data.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GLMeans;
