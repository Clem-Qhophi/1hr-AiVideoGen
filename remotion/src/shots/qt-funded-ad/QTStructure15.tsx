import React from 'react';
import { useRise, QT, VibeBg, EvidenceBrowser, evFrame } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// 15s cutdown STRUCTURE, master 2.00-6.20 (126f).
// "QT Funded gives you a structured evaluation with clear requirements." (2.51-5.71)
export const compositionConfig = { id: 'QTStructure15', durationInSeconds: 4.2, fps: 30, width: 1080, height: 1920 };

const QTStructure15: React.FC = () => {
  const rise = useRise();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ ...rise(4), marginTop: 210, fontSize: 66, fontWeight: 700, color: QT.text }}>
          <span style={{ color: QT.accent }}>QT FUNDED</span> gives you
        </div>
        <div style={{ ...rise(48, 16), marginTop: 26, fontSize: 46, fontWeight: 600, color: QT.muted }}>
          structured evaluation · clear requirements
        </div>
        <div style={evFrame(760)}>
          <EvidenceBrowser
            image="projects/qt-funded-ad/evidence/features.png"
            url="qtfunded.quanttekel.com"
            label="THE PLATFORM"
            source="qtfunded.quanttekel.com, Aug 2026"
            appearAt={12}
          />
        </div>
      </div>
    </div>
  );
};
export default QTStructure15;
