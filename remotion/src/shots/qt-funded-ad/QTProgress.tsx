import React from 'react';
import { useSlam, useRise, usePop, FONT_HOOK, QTEyebrow, QT, VibeBg, EvidenceBrowser, evFrame } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// master 17.80-23.00 (156f) THE PATH. "Then progress toward (19.45) a simulated funded account (20.07)
// subject to the program rules. (22.20)" Evidence: programs.png — the real account selector page.
export const compositionConfig = { id: 'QTProgress', durationInSeconds: 5.2, fps: 30, width: 1080, height: 1920 };

const QTProgress: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const pop = usePop();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <QTEyebrow style={{ ...rise(3), marginTop: 230 }}>THE PATH</QTEyebrow>
        <div style={{ ...rise(20, 16), marginTop: 26, fontSize: 48, fontWeight: 500, color: QT.muted }}>
          progress toward a
        </div>
        <div style={{ ...slam(46, 9), marginTop: 14, fontFamily: FONT_HOOK, fontSize: 108, lineHeight: 1.02, color: QT.accent, textShadow: '0 10px 40px rgba(154,255,209,.2)' }}>
          SIMULATED
          <br />
          FUNDED ACCOUNT
        </div>
        <div style={{ ...pop(128), marginTop: 28, border: `1px solid ${QT.line}`, borderRadius: 999, padding: '16px 40px', background: QT.panel, fontSize: 32, fontWeight: 600, color: QT.muted }}>
          subject to the program rules
        </div>

        <div style={evFrame(1000)}>
          <EvidenceBrowser
            image="projects/qt-funded-ad/evidence/programs.png"
            url="qtfunded.quanttekel.com"
            label="ACCOUNTS & PROGRAMS"
            source="qtfunded.quanttekel.com, Aug 2026"
            appearAt={6}
          />
        </div>
      </div>
    </div>
  );
};
export default QTProgress;
