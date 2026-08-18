import React from 'react';
import { useSlam, useRise, FONT_HOOK, QTEyebrow, QT, VibeBg } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// 1:1 adaptation of QTHookV2 -- SAME cue frames, compact stack for 1080x1080.
// master 0.00-4.60 (138f) HOOK.
export const compositionConfig = { id: 'QTHookV211', durationInSeconds: 4.6, fps: 30, width: 1080, height: 1080 };

const QTHookV211: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '0 60px', textAlign: 'center' }}>
        <QTEyebrow style={{ ...rise(2) }}>PROP TRADING EVALUATIONS</QTEyebrow>
        <div style={{ ...slam(6, 9), fontFamily: FONT_HOOK, fontSize: 74, lineHeight: 1.02, color: QT.text, textShadow: '0 10px 40px rgba(0,0,0,.6)' }}>
          EVERY TRADER
          <br />
          HAS A <span style={{ color: QT.accent }}>PLAN.</span>
        </div>
        <div style={{ ...rise(70, 20), fontFamily: FONT_HOOK, fontSize: 36, lineHeight: 1.1, color: QT.muted, marginTop: 4 }}>
          But <span style={{ color: QT.accent2 }}>consistency</span> is what
          <br />
          moves you forward.
        </div>
      </div>
    </div>
  );
};
export default QTHookV211;
