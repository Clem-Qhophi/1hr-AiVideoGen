import React from 'react';
import { useSlam, useRise, FONT_HOOK, QT, VibeBg } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// 1:1 adaptation of QTDisciplineV2 -- SAME cue frames, compact stack for 1080x1080.
// master 13.90-21.70 (234f) DISCIPLINE SLAM SEQUENCE.
export const compositionConfig = { id: 'QTDisciplineV211', durationInSeconds: 7.8, fps: 30, width: 1080, height: 1080 };

const QTDisciplineV211: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 60px', textAlign: 'center' }}>
        <div style={{ ...slam(16, 8), fontFamily: FONT_HOOK, fontSize: 52, color: QT.muted }}>NO NOISE.</div>
        <div style={{ ...slam(66, 8), fontFamily: FONT_HOOK, fontSize: 52, color: QT.muted }}>NO GUESSWORK.</div>
        <div style={{ ...rise(114, 16), fontSize: 28, fontWeight: 500, color: QT.accent2, marginTop: 2 }}>
          Just the next rule, and the next.
        </div>
        <div style={{ width: 380, height: 2, background: QT.line, margin: '12px 0' }} />
        <div style={{ ...slam(194, 10), fontFamily: FONT_HOOK, fontSize: 82, lineHeight: 1.02, color: QT.text }}>
          TRADE WITH
          <br />
          <span style={{ color: QT.accent }}>DISCIPLINE.</span>
        </div>
      </div>
    </div>
  );
};
export default QTDisciplineV211;
