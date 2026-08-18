import React from 'react';
import { useSlam, useRise, FONT_HOOK, QTEyebrow, QT, VibeEvidenceBg } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// 15s cutdown HOOK, master 0.00-2.00 (60f).
// "Consistency moves you forward." (0.18-1.61). backdrop: hero.png dimmed.
export const compositionConfig = { id: 'QTHook15', durationInSeconds: 2.0, fps: 30, width: 1080, height: 1920 };

const QTHook15: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeEvidenceBg vibe="fintech" image="projects/qt-funded-ad/evidence/hero.png" dim={0.8} frames={60} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, padding: '0 60px', textAlign: 'center' }}>
        <QTEyebrow style={{ ...rise(2) }}>PROP TRADING EVALUATIONS</QTEyebrow>
        <div style={{ ...slam(9, 9), fontFamily: FONT_HOOK, fontSize: 150, lineHeight: 1.0, color: QT.accent, textShadow: '0 12px 44px rgba(154,255,209,.25)' }}>
          CONSISTENCY
        </div>
        <div style={{ ...rise(30, 18), fontSize: 54, fontWeight: 600, color: QT.text }}>
          moves you forward
        </div>
      </div>
    </div>
  );
};
export default QTHook15;
