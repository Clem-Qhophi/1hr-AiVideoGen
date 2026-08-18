import React from 'react';
import { useSlam, useRise, FONT_HOOK, QT, VibeBg } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// master 13.90-21.70 (234f) DISCIPLINE SLAM SEQUENCE.
// "No noise. (0.60s local) No guesswork. (2.25s) Just the next rule, and the next. (3.86-5.58s)
// Trade with discipline. (6.52-7.46s)" No screenshot -- v1's testimonials.png here carried a real
// Trustpilot review wall (unapproved, see claims-register.md row 9). Pure kinetic escalation instead.
export const compositionConfig = { id: 'QTDisciplineV2', durationInSeconds: 7.8, fps: 30, width: 1080, height: 1920 };

const QTDisciplineV2: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 60px', textAlign: 'center' }}>
        <div style={{ ...slam(16, 8), fontFamily: FONT_HOOK, fontSize: 84, color: QT.muted }}>NO NOISE.</div>
        <div style={{ ...slam(66, 8), fontFamily: FONT_HOOK, fontSize: 84, color: QT.muted }}>NO GUESSWORK.</div>
        <div style={{ ...rise(114, 16), fontSize: 40, fontWeight: 500, color: QT.accent2, marginTop: 6 }}>
          Just the next rule, and the next.
        </div>
        <div style={{ width: 500, height: 2, background: QT.line, margin: '18px 0' }} />
        <div style={{ ...slam(194, 10), fontFamily: FONT_HOOK, fontSize: 132, lineHeight: 1.0, color: QT.text }}>
          TRADE WITH
          <br />
          <span style={{ color: QT.accent }}>DISCIPLINE.</span>
        </div>
      </div>
    </div>
  );
};
export default QTDisciplineV2;
