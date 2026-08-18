import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';
import { BeforeAfter } from '../../lib/pricekit';

// master 109.52-136.75 · chip design run. "8,298" f214, "~500 turns" f317, "678 gates" f485, "81%" f552.
export const compositionConfig = { id: 'Q38ChipDesign', durationInSeconds: 27.23, fps: 30, width: 1920, height: 1080 };

const Q38ChipDesign: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(817);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.cyan}>one more example &middot; autonomous chip design</Eyebrow></div>
        <div style={{ ...rise(30, 18), fontSize: 28, fontWeight: 500, color: RM.text, textAlign: 'center', maxWidth: 1100 }}>
          A cryptography accelerator, logic gate count:
        </div>
        <BeforeAfter before="8,298 gates" after="678 gates" label="logic gates" big style={pop(214)} />
        <div style={{ ...pop(317), marginTop: 6, fontFamily: 'monospace', fontSize: 20, color: RM.muted, background: RM.panel, border: `1px solid ${RM.line}`, borderRadius: 999, padding: '10px 26px' }}>
          ~500 autonomous design turns &middot; zero human intervention
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, marginTop: 18 }}>
          <div style={{ ...slam(485, 9), display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontFamily: FONT_HOOK, fontSize: 100, color: RM.green, textShadow: `0 10px 44px ${RM.green}44` }}>81</span>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 56, color: RM.green, marginLeft: 4 }}>%</span>
          </div>
          <div style={{ ...rise(510, 14), fontSize: 22, color: RM.muted, maxWidth: 360 }}>cut in physical die area</div>
        </div>
        <div style={{ ...rise(552, 16), fontSize: 20, color: RM.muted, fontFamily: 'monospace' }}>
          verified through a real place-and-route tool &mdash; not just simulated
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default Q38ChipDesign;
