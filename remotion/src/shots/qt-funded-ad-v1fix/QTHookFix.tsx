import React from 'react';
import { useSlam, useRise, FONT_HOOK, QTEyebrow, QT, VibeBg } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// COPY of qt-funded-ad/QTHook.tsx with ONE change: hero.png (full-bleed, carried unapproved
// profit-share/discount-code/Trustpilot text -- see videos/qt-funded-ad/work/v1-audit-report.md)
// replaced with the abstract fintech vibe. Timing/animation frames UNCHANGED -- same VO, same cut.
// master 0.00-1.90 (57f) HOOK. "Every trader has a plan." (0.19-1.27)
export const compositionConfig = { id: 'QTHookFix', durationInSeconds: 1.9, fps: 30, width: 1080, height: 1920 };

const QTHookFix: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, padding: '0 60px', textAlign: 'center' }}>
        <QTEyebrow style={{ ...rise(2) }}>PROP TRADING EVALUATIONS</QTEyebrow>
        <div style={{ ...slam(8, 9), fontFamily: FONT_HOOK, fontSize: 130, lineHeight: 1.0, color: QT.text, textShadow: '0 10px 40px rgba(0,0,0,.6)' }}>
          EVERY TRADER
          <br />
          HAS A <span style={{ color: QT.accent }}>PLAN.</span>
        </div>
      </div>
    </div>
  );
};
export default QTHookFix;
