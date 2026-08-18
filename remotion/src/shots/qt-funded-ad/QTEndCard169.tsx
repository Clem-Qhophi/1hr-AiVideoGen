import React from 'react';
import { useSlam, useRise, usePop, FONT_HOOK, QT, VibeEvidenceBg } from '../../lib/qtkit';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';

// 16:9 adaptation of QTEndCard. Same frames as the 9:16 original (cues stay valid).
export const compositionConfig = { id: 'QTEndCard169', durationInSeconds: 4.5, fps: 30, width: 1920, height: 1080 };

const QTEndCard169: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const pop = usePop();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeEvidenceBg vibe="fintech" image="projects/qt-funded-ad/evidence/hero.png" dim={0.82} frames={135} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, padding: '0 120px', textAlign: 'center' }}>
        <div>
          <div style={{ ...slam(9, 9), fontFamily: FONT_HOOK, fontSize: 150, lineHeight: 1.02, color: QT.text }}>
            TRADE WITH
            <br />
            DISCIPLINE.
          </div>
          <div style={{ ...slam(60, 9), marginTop: 30, fontFamily: FONT_HOOK, fontSize: 150, lineHeight: 1.02, color: QT.accent }}>
            SCALE WITH
            <br />
            CONFIDENCE.
          </div>
        </div>
        <div style={{ ...pop(96), marginTop: 30, background: QT.accent, color: QT.bg0, fontWeight: 800, fontSize: 60, padding: '26px 64px', borderRadius: 999, boxShadow: '0 18px 50px rgba(154,255,209,.35)' }}>
          START YOUR EVALUATION
        </div>
        <div style={{ ...rise(104, 16), fontFamily: FONT_MONO, fontSize: 36, color: QT.muted, letterSpacing: 2 }}>
          qtfunded.quanttekel.com/evaluations
        </div>
        <div style={{ ...rise(116, 14), fontSize: 30, fontWeight: 500, color: QT.muted, opacity: 0.85 }}>
          Simulated funded accounts · Subject to program rules
        </div>
      </div>
    </div>
  );
};
export default QTEndCard169;
