import React from 'react';
import { usePop, useRise, QT, VibeBg, EvidenceBrowser, evFrame } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// 16:9 adaptation of QTStructure. Same frames as the 9:16 original (cues stay valid).
// Pillars become a horizontal row; the evidence browser sits beneath them.
const Pillar169: React.FC<{ n: string; head: string; style: React.CSSProperties }> = ({ n, head, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 22, background: QT.panel, border: `1px solid ${QT.line}`, borderRadius: 18, padding: '20px 30px', width: 560 }}>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: QT.bg0, background: QT.accent, borderRadius: 999, width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 48, color: QT.text }}>{head}</div>
  </div>
);

export const compositionConfig = { id: 'QTStructure169', durationInSeconds: 6.2, fps: 30, width: 1920, height: 1080 };

const QTStructure169: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ ...rise(6), marginTop: 56, fontSize: 88, fontWeight: 700, color: QT.text }}>
          <span style={{ color: QT.accent }}>QT FUNDED</span> gives traders
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 32, marginTop: 34, alignItems: 'center' }}>
          <Pillar169 n="1" head="Structured evaluation" style={pop(50)} />
          <Pillar169 n="2" head="Clear requirements" style={pop(95)} />
          <Pillar169 n="3" head="Progress tracking" style={pop(142)} />
        </div>
        <div style={evFrame(400, 950)}>
          <EvidenceBrowser
            image="projects/qt-funded-ad/evidence/features.png"
            url="qtfunded.quanttekel.com"
            label="THE PLATFORM"
            source="qtfunded.quanttekel.com, Aug 2026"
            appearAt={4}
          />
        </div>
      </div>
    </div>
  );
};
export default QTStructure169;
