import React from 'react';
import { useSlam, useRise, FONT_HOOK, QT, VibeEvidenceBg } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// master 14.20-17.80 (108f) THE CODE. "Trade with discipline. (14.57-15.50) Prove your consistency. (16.48-17.50)"
// backdrop: testimonials.png — real traders' words behind the discipline ask.
export const compositionConfig = { id: 'QTDiscipline', durationInSeconds: 3.6, fps: 30, width: 1080, height: 1920 };

const QTDiscipline: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeEvidenceBg vibe="fintech" image="projects/qt-funded-ad/evidence/testimonials.png" dim={0.82} frames={108} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, padding: '0 60px', textAlign: 'center' }}>
        <div>
          <div style={{ ...rise(2, 18), fontSize: 48, fontWeight: 500, color: QT.muted }}>Trade with</div>
          <div style={{ ...slam(11, 9), marginTop: 6, fontFamily: FONT_HOOK, fontSize: 128, lineHeight: 1.0, color: QT.text }}>DISCIPLINE.</div>
        </div>
        <div style={{ width: 720, height: 2, background: QT.line }} />
        <div>
          <div style={{ ...rise(60, 18), fontSize: 48, fontWeight: 500, color: QT.muted }}>Prove your</div>
          <div style={{ ...slam(68, 9), marginTop: 6, fontFamily: FONT_HOOK, fontSize: 128, lineHeight: 1.0, color: QT.accent }}>CONSISTENCY.</div>
        </div>
      </div>
    </div>
  );
};
export default QTDiscipline;
