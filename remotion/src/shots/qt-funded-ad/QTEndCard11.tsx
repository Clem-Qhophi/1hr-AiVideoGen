import React from 'react';
import { useSlam, useRise, usePop, FONT_HOOK, QT, VibeEvidenceBg } from '../../lib/qtkit';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';

// 1:1 adaptation of QTEndCard. Same frames as the 9:16 original (cues stay valid).
export const compositionConfig = { id: 'QTEndCard11', durationInSeconds: 4.5, fps: 30, width: 1080, height: 1080 };

const QTEndCard11: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const pop = usePop();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeEvidenceBg vibe="fintech" image="projects/qt-funded-ad/evidence/hero.png" dim={0.82} frames={135} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 70px', textAlign: 'center' }}>
        <div>
          <div style={{ ...slam(9, 9), fontFamily: FONT_HOOK, fontSize: 96, lineHeight: 1.02, color: QT.text }}>
            TRADE WITH
            <br />
            DISCIPLINE.
          </div>
          <div style={{ ...slam(60, 9), marginTop: 18, fontFamily: FONT_HOOK, fontSize: 96, lineHeight: 1.02, color: QT.accent }}>
            SCALE WITH
            <br />
            CONFIDENCE.
          </div>
        </div>
        <div style={{ ...pop(96), marginTop: 20, background: QT.accent, color: QT.bg0, fontWeight: 800, fontSize: 42, padding: '18px 44px', borderRadius: 999, boxShadow: '0 18px 50px rgba(154,255,209,.35)' }}>
          START YOUR EVALUATION
        </div>
        <div style={{ ...rise(104, 16), fontFamily: FONT_MONO, fontSize: 28, color: QT.muted, letterSpacing: 2 }}>
          qtfunded.quanttekel.com/evaluations
        </div>
        <div style={{ ...rise(116, 14), fontSize: 24, fontWeight: 500, color: QT.muted, opacity: 0.85 }}>
          Simulated funded accounts · Subject to program rules
        </div>
      </div>
    </div>
  );
};
export default QTEndCard11;
