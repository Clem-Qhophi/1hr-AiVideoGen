import React from 'react';
import { useSlam, useRise, usePop, FONT_HOOK, QTEyebrow, QT, VibeBg, EvidenceBrowser, evFrame } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// 1:1 adaptation of QTProgress. Same frames as the 9:16 original (cues stay valid).
// Compact vertical stack: text, legal chip, then the evidence browser.
export const compositionConfig = { id: 'QTProgress11', durationInSeconds: 5.2, fps: 30, width: 1080, height: 1080 };

const QTProgress11: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const pop = usePop();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <QTEyebrow style={{ ...rise(3), marginTop: 46, fontSize: 26 }}>THE PATH</QTEyebrow>
        <div style={{ ...rise(20, 16), marginTop: 22, fontSize: 44, fontWeight: 500, color: QT.muted }}>
          progress toward a
        </div>
        <div style={{ ...slam(46, 9), marginTop: 12, fontFamily: FONT_HOOK, fontSize: 92, lineHeight: 1.02, color: QT.accent, textShadow: '0 10px 40px rgba(154,255,209,.2)' }}>
          SIMULATED
          <br />
          FUNDED ACCOUNT
        </div>
        <div style={{ ...pop(128), marginTop: 22, border: `1px solid ${QT.line}`, borderRadius: 999, padding: '14px 34px', background: QT.panel, fontSize: 34, fontWeight: 600, color: QT.muted }}>
          subject to the program rules
        </div>

        <div style={evFrame(470, 780)}>
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
export default QTProgress11;
