import React from 'react';
import { useSlam, useRise, usePop, FONT_HOOK, QT, VibeEvidenceBg } from '../../lib/qtkit';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';

// master 25.50-30.00 (135f) END CARD. "Trade with discipline. (25.79) Scale with confidence. (28.36)"
// The campaign tagline + CTA. backdrop: hero.png — bookends the hook's own hero shot.
export const compositionConfig = { id: 'QTEndCard', durationInSeconds: 4.5, fps: 30, width: 1080, height: 1920 };

const QTEndCard: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const pop = usePop();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeEvidenceBg vibe="fintech" image="projects/qt-funded-ad/evidence/hero.png" dim={0.82} frames={135} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: '0 60px', textAlign: 'center' }}>
        <div>
          <div style={{ ...slam(9, 9), fontFamily: FONT_HOOK, fontSize: 104, lineHeight: 1.02, color: QT.text }}>
            TRADE WITH
            <br />
            DISCIPLINE.
          </div>
          <div style={{ ...slam(60, 9), marginTop: 24, fontFamily: FONT_HOOK, fontSize: 104, lineHeight: 1.02, color: QT.accent }}>
            SCALE WITH
            <br />
            CONFIDENCE.
          </div>
        </div>
        <div style={{ ...pop(96), marginTop: 26, background: QT.accent, color: QT.bg0, fontWeight: 800, fontSize: 48, padding: '24px 60px', borderRadius: 999, boxShadow: '0 18px 50px rgba(154,255,209,.35)' }}>
          START YOUR EVALUATION
        </div>
        <div style={{ ...rise(104, 16), fontFamily: FONT_MONO, fontSize: 32, color: QT.muted, letterSpacing: 2 }}>
          qtfunded.quanttekel.com/evaluations
        </div>
        <div style={{ ...rise(116, 14), fontSize: 26, fontWeight: 500, color: QT.muted, opacity: 0.85 }}>
          Simulated funded accounts · Subject to program rules
        </div>
      </div>
    </div>
  );
};
export default QTEndCard;
