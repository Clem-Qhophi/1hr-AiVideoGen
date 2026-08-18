import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 87-102 · "55GB" f-30, "under twenty" f75, "twenty-four-gigabyte" f126, "one GPU" f216, "always-on agent" f345.
export const compositionConfig = { id: 'GLSize', durationInSeconds: 15.0, fps: 30, width: 1920, height: 1080 };

const GLSize: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(450);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 150px', textAlign: 'center' }}>
        <div style={rise(6, 14)}><Eyebrow color={RM.cyan}>What it runs on</Eyebrow></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginTop: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ ...rise(18, 14), fontSize: 22, color: RM.muted, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 2 }}>Full precision</div>
            <div style={{ ...slam(36, 9), fontFamily: FONT_HOOK, fontSize: 92, lineHeight: 1, color: RM.red, textShadow: `0 10px 44px ${RM.red}44` }}>55 GB</div>
          </div>
          <div style={{ ...rise(60, 12), fontSize: 44, color: RM.muted }}>&rarr;</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ ...rise(80, 14), fontSize: 22, color: RM.muted, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 2 }}>4-bit</div>
            <div style={{ ...slam(100, 9), fontFamily: FONT_HOOK, fontSize: 92, lineHeight: 1, color: RM.green, textShadow: `0 10px 44px ${RM.green}44` }}>20 GB</div>
          </div>
        </div>
        <div style={{ ...rise(150, 16), fontSize: 28, fontWeight: 600, color: RM.text, marginTop: 8 }}>
          Inside a single <span style={{ color: RM.green }}>24 GB card</span>. One GPU.
        </div>
        <div style={{ ...rise(230, 18), fontSize: 26, color: RM.muted }}>
          No cloud. No per-token fees. No internet needed.
        </div>
        <div style={{ ...slam(330, 10), fontFamily: FONT_HOOK, fontSize: 52, lineHeight: 1.05, color: RM.cyan, textShadow: `0 8px 36px ${RM.cyan}44` }}>
          AN ALWAYS-ON AGENT<br />ON YOUR OWN MACHINE
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GLSize;
