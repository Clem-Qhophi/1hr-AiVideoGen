import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 0-15.0 · cold open. "says yes" f63, "ninety-five percent" f208, "versus one point five" f328,
// "Same brain, different answer." f398.
export const compositionConfig = { id: 'CYHook', durationInSeconds: 15.0, fps: 30, width: 1920, height: 1080 };

const CYHook: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(450);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 150px', textAlign: 'center' }}>
        <div style={rise(4, 14)}><Eyebrow color={RM.cyan}>OpenAI &middot; Aug 10, 2026</Eyebrow></div>
        <div style={{ ...rise(16, 18), fontSize: 40, fontWeight: 500, color: RM.text, maxWidth: 1300, marginTop: 8 }}>
          On August 10, OpenAI shipped a model that says
        </div>
        <div style={{ ...slam(208, 10), fontFamily: FONT_HOOK, fontSize: 210, lineHeight: 0.9, color: RM.cyan, textShadow: `0 14px 50px ${RM.cyan}44`, marginTop: 4 }}>
          95%
        </div>
        <div style={{ ...rise(258, 18), fontSize: 32, fontWeight: 600, color: RM.text, letterSpacing: 1 }}>
          &mdash; of advanced cyber attacks
        </div>
        <div style={{ ...pop(330, 12), marginTop: 14, fontFamily: FONT_HOOK, fontSize: 48, color: RM.muted }}>
          vs <span style={{ color: RM.amber }}>1.5%</span> for its own base model
        </div>
        <div style={{ ...rise(398, 18), marginTop: 14, fontSize: 36, fontWeight: 700, color: RM.text }}>
          Same brain. <span style={{ color: RM.cyan }}>Different answer.</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default CYHook;
