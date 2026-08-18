import React from 'react';
import { useSlam, useRise, QTEyebrow, FONT_HOOK, QT, VibeBg } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// master 28.60-37.00 (252f) PROVE YOUR CONSISTENCY.
// "Prove your consistency, (0.57-1.58s local) one session at a time. (1.93-3.02s) That's the whole
// idea (3.94-5.03s) -- progress you can see, (5.28-6.26s) not promises you can't check. (6.50-7.85s)"
// No screenshot -- v1's trust.png here carried "Trusted by 120,000 traders / $16M+ paid out / real
// payout certificates" (all unapproved, claims-register.md rows 1-4). Pure kinetic statement instead.
export const compositionConfig = { id: 'QTConsistencyV2', durationInSeconds: 8.4, fps: 30, width: 1080, height: 1920 };

const QTConsistencyV2: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 60px', textAlign: 'center' }}>
        <QTEyebrow style={{ ...rise(2) }}>ONE SESSION AT A TIME</QTEyebrow>
        <div style={{ ...slam(17, 9), fontFamily: FONT_HOOK, fontSize: 108, lineHeight: 1.02, color: QT.text }}>
          PROVE YOUR
          <br />
          <span style={{ color: QT.accent }}>CONSISTENCY.</span>
        </div>
        <div style={{ width: 560, height: 2, background: QT.line, margin: '10px 0' }} />
        <div style={{ ...slam(155, 9), fontFamily: FONT_HOOK, fontSize: 88, lineHeight: 1.04, color: QT.accent2 }}>
          PROGRESS YOU
          <br />
          CAN SEE.
        </div>
        <div style={{ ...rise(195, 16), fontSize: 38, fontWeight: 500, color: QT.muted }}>
          Not promises you can't check.
        </div>
      </div>
    </div>
  );
};
export default QTConsistencyV2;
