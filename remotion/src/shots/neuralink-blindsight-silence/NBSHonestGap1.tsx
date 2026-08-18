import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 254.3-276.4 · honest-gap pt1. What this video genuinely doesn't know.
export const compositionConfig = { id: 'NBSHonestGap1', durationInSeconds: 22.1, fps: 30, width: 1920, height: 1080 };

const NBSHonestGap1: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(663);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, textAlign: 'center', padding: '0 160px' }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.muted}>what this video can't tell you</Eyebrow></div>
        <div style={{ ...rise(50, 18), fontSize: 30, fontWeight: 600, color: RM.text, maxWidth: 1050 }}>
          We don't know why Blindsight specifically has stalled.
        </div>
        <div style={{ ...rise(180, 18), fontSize: 22, color: RM.muted, maxWidth: 1000 }}>
          Neuralink didn't respond to IEEE Spectrum in 2024 — and hasn't published a reason since.
        </div>
        <div style={{ display: 'flex', gap: 50, marginTop: 16 }}>
          <div style={{ ...pop(330), fontSize: 22, color: RM.text, maxWidth: 400 }}>Could be a hard technical problem.</div>
          <div style={{ ...pop(400), fontSize: 22, color: RM.text, maxWidth: 400 }}>Could be motor + speech, deliberately, first.</div>
        </div>
        <div style={{ ...pop(510), fontSize: 32, fontWeight: 700, color: RM.amber, marginTop: 18 }}>
          Silence isn't proof of failure. It's just silence.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default NBSHonestGap1;
