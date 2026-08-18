import React from 'react';
import { useSlam, useRise, FONT_HOOK, QT, VibeBg, EvidenceBrowser, evFrame } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// 15s cutdown DISCIPLINE, master 6.20-10.00 (114f).
// "Trade with discipline. (6.71-7.64) Prove your consistency. (8.56-9.57)"
// Real traders' words framed as evidence below the slams.
export const compositionConfig = { id: 'QTDiscipline15', durationInSeconds: 3.8, fps: 30, width: 1080, height: 1920 };

const QTDiscipline15: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ ...rise(2, 18), marginTop: 390, fontSize: 48, fontWeight: 500, color: QT.muted }}>Trade with</div>
        <div style={{ ...slam(11, 9), marginTop: 6, fontFamily: FONT_HOOK, fontSize: 128, lineHeight: 1.0, color: QT.text }}>DISCIPLINE.</div>
        <div style={{ width: 720, height: 2, background: QT.line, marginTop: 30 }} />
        <div style={{ ...rise(60, 18), marginTop: 30, fontSize: 48, fontWeight: 500, color: QT.muted }}>Prove your</div>
        <div style={{ ...slam(68, 9), marginTop: 6, fontFamily: FONT_HOOK, fontSize: 128, lineHeight: 1.0, color: QT.accent }}>CONSISTENCY.</div>
        <div style={evFrame(1010, 940)}>
          <EvidenceBrowser
            image="projects/qt-funded-ad/evidence/testimonials.png"
            url="qtfunded.quanttekel.com"
            label="REAL TRADERS"
            source="qtfunded.quanttekel.com, Aug 2026"
            appearAt={30}
          />
        </div>
      </div>
    </div>
  );
};
export default QTDiscipline15;
