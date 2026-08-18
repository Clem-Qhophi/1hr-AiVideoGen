import React from 'react';
import { Img, staticFile } from 'remotion';
import { useSlam, useRise, FONT_HOOK, QTEyebrow, QT, VibeBg } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// 1:1 adaptation of QTDiscover. Same frames as the 9:16 original (cues stay valid).
export const compositionConfig = { id: 'QTDiscover11', durationInSeconds: 2.5, fps: 30, width: 1080, height: 1080 };

const QTDiscover11: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <QTEyebrow style={{ ...rise(2), marginTop: 130, fontSize: 26 }}>DISCOVER</QTEyebrow>
        <div style={{ ...slam(8, 9), marginTop: 26, fontFamily: FONT_HOOK, fontSize: 150, lineHeight: 1.0, color: QT.text }}>
          QT <span style={{ color: QT.accent }}>FUNDED</span>
        </div>
        <div style={{ ...rise(34, 18), marginTop: 70 }}>
          <Img
            src={staticFile('projects/qt-funded-ad/logo.svg')}
            style={{ width: 620, display: 'block' }}
          />
        </div>
      </div>
    </div>
  );
};
export default QTDiscover11;
