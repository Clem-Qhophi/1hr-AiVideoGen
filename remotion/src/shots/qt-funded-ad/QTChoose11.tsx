import React from 'react';
import { useSlam, useRise, FONT_HOOK, QT, VibeBg, EvidenceBrowser, evFrame } from '../../lib/qtkit';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';

// 1:1 adaptation of QTChoose. Same frames as the 9:16 original (cues stay valid).
export const compositionConfig = { id: 'QTChoose11', durationInSeconds: 3.0, fps: 30, width: 1080, height: 1080 };

const QTChoose11: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ ...slam(14, 9), marginTop: 60, fontFamily: FONT_HOOK, fontSize: 100, lineHeight: 1.0, color: QT.text }}>
          CHOOSE THE PATH
        </div>
        <div style={{ ...rise(52, 18), marginTop: 18, fontSize: 48, fontWeight: 600, color: QT.muted }}>
          that fits your strategy
        </div>
        <div style={{ ...rise(64, 16), marginTop: 22, fontFamily: FONT_MONO, fontSize: 30, color: QT.accent2, letterSpacing: 2 }}>
          qtfunded.quanttekel.com/evaluations
        </div>

        <div style={evFrame(300, 920)}>
          <EvidenceBrowser
            image="projects/qt-funded-ad/evidence/evaluations.png"
            url="qtfunded.quanttekel.com/evaluations"
            label="PROGRAM SELECTOR"
            source="qtfunded.quanttekel.com, Aug 2026"
            appearAt={6}
          />
        </div>
      </div>
    </div>
  );
};
export default QTChoose11;
