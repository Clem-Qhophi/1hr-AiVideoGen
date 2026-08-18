import React from 'react';
import { useSlam, useRise, FONT_HOOK, QT, VibeBg, EvidenceBrowser, evFrame } from '../../lib/qtkit';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';

// master 11.20-14.20 (90f) CHOOSE YOUR PATH. "Choose the path (11.84) that fits your strategy. (13.57)"
// Evidence: evaluations.png — the real program selector page.
export const compositionConfig = { id: 'QTChoose', durationInSeconds: 3.0, fps: 30, width: 1080, height: 1920 };

const QTChoose: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ ...slam(14, 9), marginTop: 240, fontFamily: FONT_HOOK, fontSize: 92, lineHeight: 1.0, color: QT.text }}>
          CHOOSE THE PATH
        </div>
        <div style={{ ...rise(52, 18), marginTop: 20, fontSize: 46, fontWeight: 600, color: QT.muted }}>
          that fits your strategy
        </div>

        <div style={evFrame(640)}>
          <EvidenceBrowser
            image="projects/qt-funded-ad/evidence/evaluations.png"
            url="qtfunded.quanttekel.com/evaluations"
            label="PROGRAM SELECTOR"
            source="qtfunded.quanttekel.com, Aug 2026"
            appearAt={6}
          />
        </div>

        <div style={{ ...rise(64, 16), marginTop: 940, fontFamily: FONT_MONO, fontSize: 34, color: QT.accent2, letterSpacing: 2 }}>
          qtfunded.quanttekel.com/evaluations
        </div>
      </div>
    </div>
  );
};
export default QTChoose;
