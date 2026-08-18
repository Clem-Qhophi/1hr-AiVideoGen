import React from 'react';
import { useSlam, useRise, usePop, FONT_HOOK, QT, VibeBg } from '../../lib/qtkit';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';

// 16:9 adaptation of QTEndCardV2 -- SAME cue frames, canvas re-laid for 1920x1080.
// master 42.10-56.00 (417f) END CARD.
export const compositionConfig = { id: 'QTEndCardV2169', durationInSeconds: 13.9, fps: 30, width: 1920, height: 1080 };

const QTEndCardV2169: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const pop = usePop();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ ...rise(11, 14), fontSize: 30, fontWeight: 600, color: QT.muted }}>Real accounts.</div>
          <div style={{ ...rise(64, 14), fontSize: 30, fontWeight: 600, color: QT.muted }}>Real rules.</div>
          <div style={{ ...rise(117, 14), fontSize: 30, fontWeight: 700, color: QT.accent2 }}>Real progress.</div>
        </div>
        <div style={{ ...slam(165, 9), marginTop: 14, fontFamily: FONT_HOOK, fontSize: 46, letterSpacing: 2, color: QT.text }}>
          DISCOVER
        </div>
        <div style={{ ...slam(165, 9), fontFamily: FONT_HOOK, fontSize: 70, color: QT.accent, marginTop: -4 }}>
          QT FUNDED
        </div>
        <div style={{ width: 460, height: 2, background: QT.line, margin: '12px 0' }} />
        <div style={{ display: 'flex', gap: 30 }}>
          <div style={{ ...slam(230, 9), fontFamily: FONT_HOOK, fontSize: 60, lineHeight: 1.05, color: QT.text }}>
            TRADE WITH DISCIPLINE.
          </div>
          <div style={{ ...slam(290, 9), fontFamily: FONT_HOOK, fontSize: 60, lineHeight: 1.05, color: QT.accent }}>
            SCALE WITH CONFIDENCE.
          </div>
        </div>
        <div style={{ ...pop(340), marginTop: 18, background: QT.accent, color: QT.bg0, fontWeight: 800, fontSize: 34, padding: '18px 44px', borderRadius: 999, boxShadow: '0 18px 50px rgba(154,255,209,.35)' }}>
          START YOUR EVALUATION
        </div>
        <div style={{ ...rise(348, 16), fontFamily: FONT_MONO, fontSize: 24, color: QT.muted, letterSpacing: 2 }}>
          qtfunded.quanttekel.com/evaluations
        </div>
        <div style={{ ...rise(358, 14), fontSize: 20, fontWeight: 500, color: QT.muted, opacity: 0.85 }}>
          Simulated funded accounts · Subject to program rules
        </div>
      </div>
    </div>
  );
};
export default QTEndCardV2169;
