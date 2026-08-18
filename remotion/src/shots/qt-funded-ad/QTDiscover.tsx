import React from 'react';
import { Img, staticFile } from 'remotion';
import { useSlam, useRise, FONT_HOOK, QTEyebrow, QT, VibeBg } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// master 23.00-25.50 (75f) DISCOVER. "Discover QT Funded. (23.54-24.81)"
// The brand moment: QT FUNDED wordmark slam + the Quant Tekel logo beneath.
export const compositionConfig = { id: 'QTDiscover', durationInSeconds: 2.5, fps: 30, width: 1080, height: 1920 };

const QTDiscover: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <QTEyebrow style={{ ...rise(2), marginTop: 660 }}>DISCOVER</QTEyebrow>
        <div style={{ ...slam(8, 9), marginTop: 30, fontFamily: FONT_HOOK, fontSize: 150, lineHeight: 1.0, color: QT.text }}>
          QT <span style={{ color: QT.accent }}>FUNDED</span>
        </div>
        <div style={{ ...rise(34, 18), marginTop: 90 }}>
          <Img
            src={staticFile('projects/qt-funded-ad/logo.svg')}
            style={{ width: 640, display: 'block' }}
          />
        </div>
      </div>
    </div>
  );
};
export default QTDiscover;
