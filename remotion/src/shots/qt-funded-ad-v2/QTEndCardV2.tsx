import React from 'react';
import { useSlam, useRise, usePop, FONT_HOOK, QT, VibeBg } from '../../lib/qtkit';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';

// master 42.10-56.00 (417f) END CARD.
// "Real accounts. (0.37s local) Real rules. (2.12s) Real progress. (3.88s) Discover QT Funded.
// (5.66-6.85s) Trade with discipline. (7.83s) Scale with confidence. (9.75-10.95s)" then a ~3s
// silent hold so the CTA + URL breathe. No screenshot -- v1 bookended hook+end-card on the SAME
// hero.png background (a missed-variety issue on top of the claims issue, see v1-audit-report.md).
export const compositionConfig = { id: 'QTEndCardV2', durationInSeconds: 13.9, fps: 30, width: 1080, height: 1920 };

const QTEndCardV2: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const pop = usePop();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '0 60px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ ...rise(11, 14), fontSize: 40, fontWeight: 600, color: QT.muted }}>Real accounts.</div>
          <div style={{ ...rise(64, 14), fontSize: 40, fontWeight: 600, color: QT.muted }}>Real rules.</div>
          <div style={{ ...rise(117, 14), fontSize: 40, fontWeight: 700, color: QT.accent2 }}>Real progress.</div>
        </div>
        <div style={{ ...slam(165, 9), marginTop: 20, fontFamily: FONT_HOOK, fontSize: 64, letterSpacing: 2, color: QT.text }}>
          DISCOVER
        </div>
        <div style={{ ...slam(165, 9), fontFamily: FONT_HOOK, fontSize: 96, color: QT.accent, marginTop: -8 }}>
          QT FUNDED
        </div>
        <div style={{ width: 560, height: 2, background: QT.line, margin: '16px 0' }} />
        <div style={{ ...slam(230, 9), fontFamily: FONT_HOOK, fontSize: 86, lineHeight: 1.05, color: QT.text }}>
          TRADE WITH
          <br />
          DISCIPLINE.
        </div>
        <div style={{ ...slam(290, 9), fontFamily: FONT_HOOK, fontSize: 86, lineHeight: 1.05, color: QT.accent }}>
          SCALE WITH
          <br />
          CONFIDENCE.
        </div>
        <div style={{ ...pop(340), marginTop: 22, background: QT.accent, color: QT.bg0, fontWeight: 800, fontSize: 44, padding: '22px 54px', borderRadius: 999, boxShadow: '0 18px 50px rgba(154,255,209,.35)' }}>
          START YOUR EVALUATION
        </div>
        <div style={{ ...rise(348, 16), fontFamily: FONT_MONO, fontSize: 30, color: QT.muted, letterSpacing: 2 }}>
          qtfunded.quanttekel.com/evaluations
        </div>
        <div style={{ ...rise(358, 14), fontSize: 24, fontWeight: 500, color: QT.muted, opacity: 0.85 }}>
          Simulated funded accounts · Subject to program rules
        </div>
      </div>
    </div>
  );
};
export default QTEndCardV2;
