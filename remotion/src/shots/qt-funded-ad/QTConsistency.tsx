import React from 'react';
import { useSlam, useRise, FONT_HOOK, QTEyebrow, QT, VibeEvidenceBg } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// master 1.90-5.00 (93f) THE EDGE. "But consistency (2.44) ... moves you forward. (4.38)"
// backdrop: trust.png — the real trust/cert band, grounding "consistency" in the firm's standing.
export const compositionConfig = { id: 'QTConsistency', durationInSeconds: 3.1, fps: 30, width: 1080, height: 1920 };

const QTConsistency: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeEvidenceBg vibe="fintech" image="projects/qt-funded-ad/evidence/trust.png" dim={0.82} frames={93} />
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
export default QTConsistency;
