import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 102-117 · "DFlash" f51, "233 tok/s" f170, "M5 Max fifty" f245.
export const compositionConfig = { id: 'GLSpeed', durationInSeconds: 15.0, fps: 30, width: 1920, height: 1080 };

const GLSpeed: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(450);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '0 150px', textAlign: 'center' }}>
        <div style={rise(6, 14)}><Eyebrow color={RM.cyan}>Speed</Eyebrow></div>
        <div style={{ ...rise(20, 16), fontSize: 30, fontWeight: 500, color: RM.muted }}>
          Meta ships a speculative-decoding drafter: <span style={{ color: RM.text, fontWeight: 700 }}>DFlash</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 26, marginTop: 8 }}>
          <div style={{ ...slam(150, 9), fontFamily: FONT_HOOK, fontSize: 120, lineHeight: 0.95, color: RM.green, textShadow: `0 10px 44px ${RM.green}44` }}>233</div>
          <div style={{ ...rise(180, 14), fontSize: 26, color: RM.muted, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 2 }}>tok/s &middot; RTX 5090</div>
        </div>
        <div style={{ ...rise(240, 16), fontSize: 26, fontWeight: 600, color: RM.text }}>
          That&rsquo;s 3&times; faster than base. On a Mac M5 Max: 50 tok/s.
        </div>
        <div style={{ ...rise(320, 18), fontSize: 26, color: RM.muted }}>
          Agents start to feel real-time.
        </div>
        <div style={{ ...rise(380, 16), fontSize: 22, color: RM.amber, fontFamily: 'monospace' }}>
          Meta&rsquo;s numbers, on Meta&rsquo;s hardware.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GLSpeed;
