import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 126.20-157.03 · scale. 15 days f32, 1000 futures f120, under a minute f272, open source f566,
// colab f692, receipts f885.
export const compositionConfig = { id: 'WNScale', durationInSeconds: 30.8, fps: 30, width: 1920, height: 1080 };

const WNScale: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(925);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.cyan}>The scale</Eyebrow></div>
        <div style={{ ...rise(32, 18), fontSize: 40, fontWeight: 500, color: RM.text }}>
          Forecasts out <span style={{ fontFamily: FONT_HOOK, color: RM.cyan }}>15 days</span>
        </div>
        <div style={{ ...slam(120, 8), fontFamily: FONT_HOOK, fontSize: 120, color: RM.cyan, textShadow: `0 10px 44px ${RM.cyan}44` }}>
          1,000 FUTURES
        </div>
        <div style={{ ...rise(220, 18), fontSize: 30, fontWeight: 500, color: RM.muted }}>
          per storm · last year it was 50
        </div>
        <div style={{ ...rise(272, 18), marginTop: 10, fontSize: 34, fontWeight: 600, color: RM.text }}>
          A full 15-day forecast in <span style={{ fontFamily: FONT_HOOK, color: RM.green }}>under a minute</span> on a single TPU
        </div>
        <div style={{ ...slam(566, 8), marginTop: 16, fontFamily: FONT_HOOK, fontSize: 88, color: RM.green, textShadow: `0 8px 36px ${RM.green}44` }}>
          OPEN SOURCE
        </div>
        <div style={{ ...rise(692, 18), fontSize: 30, fontWeight: 500, color: RM.text }}>
          code + weights + a mini model that runs free in a Colab notebook
        </div>
        <div style={{ ...rise(885, 18), marginTop: 6, fontSize: 26, fontWeight: 500, color: RM.muted }}>
          The repos and the receipts, next.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default WNScale;
