import React from 'react';
import { useSlam, useRise, FONT_HOOK, QT, VibeEvidenceBg } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// 16:9 adaptation of QTDiscipline. Same frames as the 9:16 original (cues stay valid).
export const compositionConfig = { id: 'QTDiscipline169', durationInSeconds: 3.6, fps: 30, width: 1920, height: 1080 };

const QTDiscipline169: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeEvidenceBg vibe="fintech" image="projects/qt-funded-ad/evidence/testimonials.png" dim={0.82} frames={108} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: '0 120px', textAlign: 'center' }}>
        <div>
          <div style={{ ...rise(2, 18), fontSize: 60, fontWeight: 500, color: QT.muted }}>Trade with</div>
          <div style={{ ...slam(11, 9), marginTop: 6, fontFamily: FONT_HOOK, fontSize: 190, lineHeight: 1.0, color: QT.text }}>DISCIPLINE.</div>
        </div>
        <div style={{ width: 900, height: 2, background: QT.line }} />
        <div>
          <div style={{ ...rise(60, 18), fontSize: 60, fontWeight: 500, color: QT.muted }}>Prove your</div>
          <div style={{ ...slam(68, 9), marginTop: 6, fontFamily: FONT_HOOK, fontSize: 190, lineHeight: 1.0, color: QT.accent }}>CONSISTENCY.</div>
        </div>
      </div>
    </div>
  );
};
export default QTDiscipline169;
