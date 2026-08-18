import React from 'react';
import { usePop, useRise, QT, VibeBg, EvidenceBrowser, evFrame } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// 1:1 adaptation of QTPathV2 -- SAME cue frames, compact stack for 1080x1080.
// master 4.60-13.90 (279f) WHAT YOU GET + CHOOSE THE PATH.
const Pillar: React.FC<{ n: string; head: string; style: React.CSSProperties }> = ({ n, head, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 18, background: QT.panel, border: `1px solid ${QT.line}`, borderRadius: 14, padding: '12px 22px', width: 640 }}>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 26, color: QT.bg0, background: QT.accent, borderRadius: 999, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 28, color: QT.text }}>{head}</div>
  </div>
);

export const compositionConfig = { id: 'QTPathV211', durationInSeconds: 9.3, fps: 30, width: 1080, height: 1080 };

const QTPathV211: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ ...rise(15), marginTop: 50, fontSize: 40, fontWeight: 700, color: QT.text }}>
          <span style={{ color: QT.accent }}>QT FUNDED</span> gives traders
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 22, alignItems: 'center' }}>
          <Pillar n="1" head="Structured evaluation" style={pop(65)} />
          <Pillar n="2" head="Clear requirements" style={pop(108)} />
          <Pillar n="3" head="Tools to track progress" style={pop(144)} />
        </div>
        <div style={{ ...rise(214, 16), marginTop: 20, fontSize: 30, fontWeight: 600, color: QT.accent2 }}>
          Choose the path that fits your strategy.
        </div>
        {/* real_bottom ~850 on a 1080-tall canvas, leaving margin for the caption safe zone below --
            same collision class caught and fixed on the 9:16/16:9 variants, avoided here up front. */}
        <div style={evFrame(540, 620)}>
          <EvidenceBrowser
            image="projects/qt-funded-ad/evidence/clean/mobile-dropdowns.png"
            url="qtfunded.quanttekel.com/evaluations"
            label="THE PLATFORM"
            source="qtfunded.quanttekel.com/evaluations, Aug 2026"
            appearAt={180}
          />
        </div>
      </div>
    </div>
  );
};
export default QTPathV211;
