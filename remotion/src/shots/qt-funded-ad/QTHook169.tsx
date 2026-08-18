import React from 'react';
import { useSlam, useRise, FONT_HOOK, QTEyebrow, QT, VibeEvidenceBg } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// 16:9 adaptation of QTHook. Same frames as the 9:16 original (cues stay valid).
export const compositionConfig = { id: 'QTHook169', durationInSeconds: 1.9, fps: 30, width: 1920, height: 1080 };

const QTHook169: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeEvidenceBg vibe="fintech" image="projects/qt-funded-ad/evidence/hero.png" dim={0.8} frames={57} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, padding: '0 120px', textAlign: 'center' }}>
        <QTEyebrow style={{ ...rise(2), fontSize: 44 }}>PROP TRADING EVALUATIONS</QTEyebrow>
        <div style={{ ...slam(8, 9), fontFamily: FONT_HOOK, fontSize: 200, lineHeight: 1.0, color: QT.text, textShadow: '0 10px 40px rgba(0,0,0,.6)' }}>
          EVERY TRADER
          <br />
          HAS A <span style={{ color: QT.accent }}>PLAN.</span>
        </div>
      </div>
    </div>
  );
};
export default QTHook169;
