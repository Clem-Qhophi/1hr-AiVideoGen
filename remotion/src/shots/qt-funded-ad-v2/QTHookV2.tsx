import React from 'react';
import { useSlam, useRise, FONT_HOOK, QTEyebrow, QT, VibeBg } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// master 0.00-4.60 (138f) HOOK. "Every trader has a plan." (0.19-1.27) "But consistency is what
// moves you forward." (2.34-4.38). No screenshot backdrop -- v1 used hero.png full-bleed here and
// it bled unapproved profit-share/discount/Trustpilot text through the dim layer (see
// videos/qt-funded-ad/work/v1-audit-report.md). Abstract fintech vibe instead: same brand energy,
// zero claims risk on the two beats that matter most for retention (open + close).
export const compositionConfig = { id: 'QTHookV2', durationInSeconds: 4.6, fps: 30, width: 1080, height: 1920 };

const QTHookV2: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: '0 60px', textAlign: 'center' }}>
        <QTEyebrow style={{ ...rise(2) }}>PROP TRADING EVALUATIONS</QTEyebrow>
        <div style={{ ...slam(6, 9), fontFamily: FONT_HOOK, fontSize: 118, lineHeight: 1.02, color: QT.text, textShadow: '0 10px 40px rgba(0,0,0,.6)' }}>
          EVERY TRADER
          <br />
          HAS A <span style={{ color: QT.accent }}>PLAN.</span>
        </div>
        <div style={{ ...rise(70, 20), fontFamily: FONT_HOOK, fontSize: 64, lineHeight: 1.08, color: QT.muted, marginTop: 10 }}>
          But <span style={{ color: QT.accent2 }}>consistency</span> is what
          <br />
          moves you forward.
        </div>
      </div>
    </div>
  );
};
export default QTHookV2;
