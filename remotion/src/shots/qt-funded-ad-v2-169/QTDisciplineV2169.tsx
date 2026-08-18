import React from 'react';
import { useSlam, useRise, FONT_HOOK, QT, VibeBg } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// 16:9 adaptation of QTDisciplineV2 -- SAME cue frames, canvas re-laid for 1920x1080.
// master 13.90-21.70 (234f) DISCIPLINE SLAM SEQUENCE.
export const compositionConfig = { id: 'QTDisciplineV2169', durationInSeconds: 7.8, fps: 30, width: 1920, height: 1080 };

const QTDisciplineV2169: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 30 }}>
          <div style={{ ...slam(16, 8), fontFamily: FONT_HOOK, fontSize: 60, color: QT.muted }}>NO NOISE.</div>
          <div style={{ ...slam(66, 8), fontFamily: FONT_HOOK, fontSize: 60, color: QT.muted }}>NO GUESSWORK.</div>
        </div>
        <div style={{ ...rise(114, 16), fontSize: 32, fontWeight: 500, color: QT.accent2 }}>
          Just the next rule, and the next.
        </div>
        <div style={{ width: 460, height: 2, background: QT.line, margin: '14px 0' }} />
        <div style={{ ...slam(194, 10), fontFamily: FONT_HOOK, fontSize: 108, lineHeight: 1.0, color: QT.text }}>
          TRADE WITH <span style={{ color: QT.accent }}>DISCIPLINE.</span>
        </div>
      </div>
    </div>
  );
};
export default QTDisciplineV2169;
