import React from 'react';
import { useSlam, useRise, FONT_HOOK, QTEyebrow, QT, VibeEvidenceBg } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// master 0.00-1.90 (57f) HOOK. Multimodal: text visible from frame 0 (works muted/autoplay).
// "Every trader has a plan." (0.19-1.27). backdrop: hero.png — the real homepage, dimmed.
export const compositionConfig = { id: 'QTHook', durationInSeconds: 1.9, fps: 30, width: 1080, height: 1920 };

const QTHook: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeEvidenceBg vibe="fintech" image="projects/qt-funded-ad/evidence/hero.png" dim={0.8} frames={57} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, padding: '0 60px', textAlign: 'center' }}>
        <QTEyebrow style={{ ...rise(2) }}>PROP TRADING EVALUATIONS</QTEyebrow>
        <div style={{ ...slam(8, 9), fontFamily: FONT_HOOK, fontSize: 130, lineHeight: 1.0, color: QT.text, textShadow: '0 10px 40px rgba(0,0,0,.6)' }}>
          EVERY TRADER
          <br />
          HAS A <span style={{ color: QT.accent }}>PLAN.</span>
        </div>
      </div>
    </div>
  );
};
export default QTHook;
