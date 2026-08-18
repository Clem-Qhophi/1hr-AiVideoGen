import React from 'react';
import { usePop, useRise, QT, VibeBg, EvidenceBrowser, evFrame } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// 16:9 adaptation of QTPathV2 -- SAME cue frames. Row/split layout per house convention:
// pillars + headline left, real evidence right. EvidenceBrowser is an AbsoluteFill that paints its
// own full-canvas background -- it can't be dropped into a flex child directly (it would cover the
// left column). evFrame(top, w, 'right') wraps+positions it correctly instead, same pattern used by
// every other evidence beat in this kit.
// master 4.60-13.90 (279f) WHAT YOU GET + CHOOSE THE PATH.
const Pillar: React.FC<{ n: string; head: string; style: React.CSSProperties }> = ({ n, head, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 20, background: QT.panel, border: `1px solid ${QT.line}`, borderRadius: 14, padding: '14px 24px', width: 620 }}>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 28, color: QT.bg0, background: QT.accent, borderRadius: 999, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 30, color: QT.text }}>{head}</div>
  </div>
);

export const compositionConfig = { id: 'QTPathV2169', durationInSeconds: 9.3, fps: 30, width: 1920, height: 1080 };

const QTPathV2169: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', left: 70, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 20, width: 760 }}>
        <div style={{ ...rise(15), fontSize: 42, fontWeight: 700, color: QT.text }}>
          <span style={{ color: QT.accent }}>QT FUNDED</span> gives traders
        </div>
        <Pillar n="1" head="Structured evaluation" style={pop(65)} />
        <Pillar n="2" head="Clear requirements" style={pop(108)} />
        <Pillar n="3" head="Tools to track progress" style={pop(144)} />
        <div style={{ ...rise(214, 16), marginTop: 8, fontSize: 30, fontWeight: 600, color: QT.accent2 }}>
          Choose the path that fits your strategy.
        </div>
      </div>
      <div style={evFrame(140, 820, 'right')}>
        <EvidenceBrowser
          image="projects/qt-funded-ad/evidence/clean/mobile-dropdowns.png"
          url="qtfunded.quanttekel.com/evaluations"
          label="THE PLATFORM"
          source="qtfunded.quanttekel.com/evaluations, Aug 2026"
          appearAt={180}
        />
      </div>
    </div>
  );
};
export default QTPathV2169;
