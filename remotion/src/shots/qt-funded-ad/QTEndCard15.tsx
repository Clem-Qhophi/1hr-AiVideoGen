import React from 'react';
import { useSlam, useRise, usePop, FONT_HOOK, QTEyebrow, QT, VibeBg, EvidenceBrowser, evFrame } from '../../lib/qtkit';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';

// 15s cutdown END CARD, master 10.00-15.00 (150f).
// "Discover QT Funded." (10.49-11.75) then the CTA holds to 15.0.
// The real program-selector page frames the ask: proof right before the CTA.
export const compositionConfig = { id: 'QTEndCard15', durationInSeconds: 5.0, fps: 30, width: 1080, height: 1920 };

const QTEndCard15: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const pop = usePop();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <QTEyebrow style={{ ...rise(2), marginTop: 170 }}>DISCOVER</QTEyebrow>
        <div style={{ ...slam(8, 9), marginTop: 24, fontFamily: FONT_HOOK, fontSize: 150, lineHeight: 1.0, color: QT.text }}>
          QT <span style={{ color: QT.accent }}>FUNDED</span>
        </div>
        <div style={evFrame(620, 940)}>
          <EvidenceBrowser
            image="projects/qt-funded-ad/evidence/evaluations.png"
            url="qtfunded.quanttekel.com/evaluations"
            label="START HERE"
            source="qtfunded.quanttekel.com, Aug 2026"
            appearAt={32}
          />
        </div>
        <div style={{ ...pop(50), marginTop: 1190, background: QT.accent, color: QT.bg0, fontWeight: 800, fontSize: 44, padding: '22px 56px', borderRadius: 999, boxShadow: '0 18px 50px rgba(154,255,209,.35)' }}>
          START YOUR EVALUATION
        </div>
        <div style={{ ...rise(60, 16), marginTop: 28, fontFamily: FONT_MONO, fontSize: 30, color: QT.muted, letterSpacing: 2 }}>
          qtfunded.quanttekel.com/evaluations
        </div>
        <div style={{ ...rise(70, 14), marginTop: 20, fontSize: 24, fontWeight: 500, color: QT.muted, opacity: 0.85 }}>
          Simulated funded accounts · Subject to program rules
        </div>
      </div>
    </div>
  );
};
export default QTEndCard15;
