import React from 'react';
import { usePop, useRise, QT, VibeBg, EvidenceBrowser, evFrame } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// COPY of qt-funded-ad/QTStructure.tsx with ONE change: features.png (carried "7% -- THE LOWEST
// PROFIT TARGETS IN THE INDUSTRY", a banned competitor comparison -- see
// videos/qt-funded-ad/work/v1-audit-report.md) replaced with clean/mobile-dropdowns.png (real
// program/platform/currency/size selector UI, zero performance numbers). Timing UNCHANGED.
// master 5.00-11.20 (186f) WHAT YOU GET. Three pillars revealed on their word cues:
// "structured evaluation" (6.84) / "clear requirements" (8.29) / "tools to track their progress" (9.91).
const Pillar: React.FC<{ n: string; head: string; style: React.CSSProperties }> = ({ n, head, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 26, background: QT.panel, border: `1px solid ${QT.line}`, borderRadius: 18, padding: '22px 34px', width: 860 }}>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: QT.bg0, background: QT.accent, borderRadius: 999, width: 62, height: 62, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: QT.text }}>{head}</div>
  </div>
);

export const compositionConfig = { id: 'QTStructureFix', durationInSeconds: 6.2, fps: 30, width: 1080, height: 1920 };

const QTStructureFix: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ ...rise(6), marginTop: 190, fontSize: 60, fontWeight: 700, color: QT.text }}>
          <span style={{ color: QT.accent }}>QT FUNDED</span> gives traders
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 56, alignItems: 'center' }}>
          <Pillar n="1" head="Structured evaluation" style={pop(50)} />
          <Pillar n="2" head="Clear requirements" style={pop(95)} />
          <Pillar n="3" head="Progress tracking" style={pop(142)} />
        </div>
        <div style={evFrame(870, 780)}>
          <EvidenceBrowser
            image="projects/qt-funded-ad/evidence/clean/mobile-dropdowns.png"
            url="qtfunded.quanttekel.com/evaluations"
            label="THE PLATFORM"
            source="qtfunded.quanttekel.com/evaluations, Aug 2026"
            appearAt={4}
          />
        </div>
      </div>
    </div>
  );
};
export default QTStructureFix;
