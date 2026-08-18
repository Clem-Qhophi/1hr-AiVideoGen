import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 138.75-161.1 · verdict pt5. Prior vision-implant companies reached trials, then ran out of money.
export const compositionConfig = { id: 'NBSTrackRecord', durationInSeconds: 22.35, fps: 30, width: 1920, height: 1080 };

const NBSTrackRecord: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(670);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.red} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, textAlign: 'center', padding: '0 160px' }}>
        <div style={rise(10, 16)}><Eyebrow color={RM.red}>a track record worth knowing</Eyebrow></div>
        <div style={{ ...rise(90, 18), fontSize: 28, color: RM.text, maxWidth: 1100 }}>
          Other companies built brain-linked vision implants before.
        </div>
        <div style={{ display: 'flex', gap: 60, marginTop: 10 }}>
          <div style={{ ...pop(220), fontSize: 22, color: RM.muted }}>Second Sight</div>
          <div style={{ ...pop(270), fontSize: 22, color: RM.muted }}>Pixium Vision</div>
        </div>
        <div style={{ ...pop(340), fontSize: 34, fontWeight: 700, color: RM.amber, marginTop: 12 }}>
          Reached real trials. Then ran out of money.
        </div>
        <div style={{ ...rise(420, 20), fontSize: 26, color: RM.red, fontWeight: 600, maxWidth: 1000, marginTop: 8 }}>
          Their patients were left with hardware in their heads — and no company left to support it.
        </div>
        <div style={{ ...rise(560, 18), fontSize: 22, color: RM.muted, maxWidth: 950 }}>
          That already happened, more than once, before Neuralink even started.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default NBSTrackRecord;
