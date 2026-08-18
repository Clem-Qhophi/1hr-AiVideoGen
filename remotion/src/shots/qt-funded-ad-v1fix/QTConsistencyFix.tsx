import React from 'react';
import { useSlam, useRise, FONT_HOOK, QTEyebrow, QT, VibeBg } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// COPY of qt-funded-ad/QTConsistency.tsx with ONE change: trust.png ("TRUSTED BY 120,000 TRADERS",
// "$16M+ paid out to traders", "110+ countries served", plus real named payout certificates -- all
// unapproved, see videos/qt-funded-ad/work/v1-audit-report.md rows 1-4) replaced with the abstract
// fintech vibe. Timing/animation frames UNCHANGED -- same VO, same cut.
// master 1.90-5.00 (93f) THE EDGE. "But consistency (2.44) ... moves you forward. (4.38)"
export const compositionConfig = { id: 'QTConsistencyFix', durationInSeconds: 3.1, fps: 30, width: 1080, height: 1920 };

const QTConsistencyFix: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 60px', textAlign: 'center' }}>
        <QTEyebrow style={{ ...rise(3) }}>THE REAL EDGE</QTEyebrow>
        <div style={{ ...slam(16, 9), fontFamily: FONT_HOOK, fontSize: 150, lineHeight: 1.0, color: QT.accent, textShadow: '0 12px 44px rgba(154,255,209,.25)' }}>
          CONSISTENCY
        </div>
        <div style={{ ...rise(52, 20), fontSize: 54, fontWeight: 600, color: QT.text }}>
          moves you forward
        </div>
      </div>
    </div>
  );
};
export default QTConsistencyFix;
