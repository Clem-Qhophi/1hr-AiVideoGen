import React from 'react';
import { useSlam, useRise, FONT_HOOK, QT, VibeBg } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// COPY of qt-funded-ad/QTDiscipline.tsx with ONE change: testimonials.png (a real Trustpilot
// review wall with named reviewers and a specific rating/count -- item 7/10 in
// client-approval-package.md are still OPEN questions, yet v1 shipped a specific profile baked in
// -- see videos/qt-funded-ad/work/v1-audit-report.md) replaced with the abstract fintech vibe.
// Timing/animation frames UNCHANGED -- same VO, same cut.
// master 14.20-17.80 (108f) THE CODE. "Trade with discipline. (14.57-15.50) Prove your consistency. (16.48-17.50)"
export const compositionConfig = { id: 'QTDisciplineFix', durationInSeconds: 3.6, fps: 30, width: 1080, height: 1920 };

const QTDisciplineFix: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
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
export default QTDisciplineFix;
