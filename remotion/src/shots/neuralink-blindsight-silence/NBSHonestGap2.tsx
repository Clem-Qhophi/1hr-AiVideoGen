import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 276.4-293.0 · honest-gap pt2. The real timeline is unknown - treat their track record as a floor.
export const compositionConfig = { id: 'NBSHonestGap2', durationInSeconds: 16.6, fps: 30, width: 1920, height: 1080 };

const NBSHonestGap2: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(498);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, textAlign: 'center', padding: '0 160px' }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.muted}>the real timeline is unknown</Eyebrow></div>
        <div style={{ display: 'flex', gap: 40, marginTop: 6 }}>
          <div style={{ ...pop(70), fontSize: 28, color: RM.text }}>"Upcoming" could mean months.</div>
          <div style={{ ...pop(140), fontSize: 28, color: RM.text }}>Could mean years.</div>
        </div>
        <div style={{ ...rise(230, 18), fontSize: 22, color: RM.muted, maxWidth: 1000, marginTop: 10 }}>
          Their other two programs took about a year, designation to real participants.
        </div>
        <div style={{ ...pop(360), fontSize: 30, fontWeight: 700, color: RM.amber, marginTop: 10, maxWidth: 1000 }}>
          Vision is the harder problem. Treat that year as a floor, not a promise.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default NBSHonestGap2;
