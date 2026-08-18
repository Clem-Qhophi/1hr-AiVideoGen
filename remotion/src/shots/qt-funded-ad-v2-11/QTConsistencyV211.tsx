import React from 'react';
import { useSlam, useRise, QTEyebrow, FONT_HOOK, QT, VibeBg } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// 1:1 adaptation of QTConsistencyV2 -- SAME cue frames, compact stack for 1080x1080.
// master 28.60-37.00 (252f) PROVE YOUR CONSISTENCY.
export const compositionConfig = { id: 'QTConsistencyV211', durationInSeconds: 8.4, fps: 30, width: 1080, height: 1080 };

const QTConsistencyV211: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 60px', textAlign: 'center' }}>
        <QTEyebrow style={{ ...rise(2) }}>ONE SESSION AT A TIME</QTEyebrow>
        <div style={{ ...slam(17, 9), fontFamily: FONT_HOOK, fontSize: 72, lineHeight: 1.02, color: QT.text }}>
          PROVE YOUR
          <br />
          <span style={{ color: QT.accent }}>CONSISTENCY.</span>
        </div>
        <div style={{ width: 420, height: 2, background: QT.line, margin: '6px 0' }} />
        <div style={{ ...slam(155, 9), fontFamily: FONT_HOOK, fontSize: 58, lineHeight: 1.04, color: QT.accent2 }}>
          PROGRESS YOU
          <br />
          CAN SEE.
        </div>
        <div style={{ ...rise(195, 16), fontSize: 28, fontWeight: 500, color: QT.muted }}>
          Not promises you can't check.
        </div>
      </div>
    </div>
  );
};
export default QTConsistencyV211;
