import React from 'react';
import { useSlam, useRise, FONT_HOOK, QT, VibeBg } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// COPY of qt-funded-ad/QTChoose.tsx with ONE change: evaluations.png (the full page also carries
// the QT 2 Step pricing panel -- profit targets, drawdown %, and the 55%-off promo code, all
// unapproved -- see videos/qt-funded-ad/work/v1-audit-report.md) DROPPED rather than swapped, since
// QTStructureFix and QTProgressFix already each carry one real evidence image (2 total meets Growth
// Rule #3's floor) and reusing the same crop a third time in one 30s cut adds nothing. Pure kinetic
// statement instead. Timing UNCHANGED.
// master 11.20-14.20 (90f) CHOOSE YOUR PATH. "Choose the path (11.84) that fits your strategy. (13.57)"
export const compositionConfig = { id: 'QTChooseFix', durationInSeconds: 3.0, fps: 30, width: 1080, height: 1920 };

const QTChooseFix: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ ...slam(14, 9), fontFamily: FONT_HOOK, fontSize: 92, lineHeight: 1.0, color: QT.text }}>
          CHOOSE THE PATH
        </div>
        <div style={{ ...rise(52, 18), marginTop: 20, fontSize: 46, fontWeight: 600, color: QT.accent2 }}>
          that fits your strategy
        </div>
        <div style={{ ...rise(64, 16), marginTop: 60, fontFamily: 'monospace', fontSize: 32, color: QT.muted, letterSpacing: 2 }}>
          qtfunded.quanttekel.com/evaluations
        </div>
      </div>
    </div>
  );
};
export default QTChooseFix;
