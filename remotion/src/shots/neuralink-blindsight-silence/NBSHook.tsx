import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 0.0-13.1 · cold-open-claim. $650M raised, none into a Blindsight trial -> "you got played."
export const compositionConfig = { id: 'NBSHook', durationInSeconds: 13.1, fps: 30, width: 1920, height: 1080 };

const NBSHook: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(393);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, textAlign: 'center', padding: '0 160px' }}>
        <div style={rise(4, 14)}><Eyebrow color={RM.cyan}>neuralink, checked against the primary source</Eyebrow></div>
        <div style={{ ...pop(6), fontFamily: FONT_MONO, fontSize: 92, fontWeight: 700, color: RM.text }}>$650,000,000</div>
        <div style={{ ...rise(60, 18), fontSize: 26, color: RM.muted, maxWidth: 1000 }}>
          raised by Neuralink this year.
        </div>
        <div style={{ ...rise(210, 20), fontSize: 30, fontWeight: 600, color: RM.amber, maxWidth: 1050, marginTop: 8 }}>
          None of it has gone toward an actual human trial for their vision device.
        </div>
        <div style={{ ...pop(320), fontSize: 46, fontWeight: 800, color: RM.red, marginTop: 14 }}>
          If you shared that headline — you got played.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default NBSHook;
