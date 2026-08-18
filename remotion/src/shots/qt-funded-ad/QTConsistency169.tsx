import React from 'react';
import { useSlam, useRise, FONT_HOOK, QTEyebrow, QT, VibeEvidenceBg } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// 16:9 adaptation of QTConsistency. Same frames as the 9:16 original (cues stay valid).
export const compositionConfig = { id: 'QTConsistency169', durationInSeconds: 3.1, fps: 30, width: 1920, height: 1080 };

const QTConsistency169: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeEvidenceBg vibe="fintech" image="projects/qt-funded-ad/evidence/trust.png" dim={0.82} frames={93} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: '0 120px', textAlign: 'center' }}>
        <QTEyebrow style={{ ...rise(3), fontSize: 44 }}>THE REAL EDGE</QTEyebrow>
        <div style={{ ...slam(16, 9), fontFamily: FONT_HOOK, fontSize: 230, lineHeight: 1.0, color: QT.accent, textShadow: '0 12px 44px rgba(154,255,209,.25)' }}>
          CONSISTENCY
        </div>
        <div style={{ ...rise(52, 20), fontSize: 76, fontWeight: 600, color: QT.text }}>
          moves you forward
        </div>
      </div>
    </div>
  );
};
export default QTConsistency169;
