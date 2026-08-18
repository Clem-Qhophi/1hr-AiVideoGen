import React from 'react';
import { usePop, useRise, QT, VibeBg, EvidenceBrowser, evFrame } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// master 4.60-13.90 (279f) WHAT YOU GET + CHOOSE THE PATH.
// "QT Funded gives traders a structured evaluation (0.65s local), clear requirements (1.08s),
// and tools to track their progress (1.44s). Choose the path that fits your strategy (2.14-2.67s)."
// Evidence: clean/mobile-dropdowns.png -- real program/platform/currency/size selectors, captured
// at a mobile viewport so the aspect ratio actually fits a vertical frame (see v1-audit-report.md:
// v1's evidence was full-bleed desktop screenshots that also carried unapproved marketing copy).
const Pillar: React.FC<{ n: string; head: string; style: React.CSSProperties }> = ({ n, head, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 24, background: QT.panel, border: `1px solid ${QT.line}`, borderRadius: 16, padding: '18px 30px', width: 800 }}>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 34, color: QT.bg0, background: QT.accent, borderRadius: 999, width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 38, color: QT.text }}>{head}</div>
  </div>
);

export const compositionConfig = { id: 'QTPathV2', durationInSeconds: 9.3, fps: 30, width: 1080, height: 1920 };

const QTPathV2: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ ...rise(15), marginTop: 130, fontSize: 58, fontWeight: 700, color: QT.text }}>
          <span style={{ color: QT.accent }}>QT FUNDED</span> gives traders
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 44, alignItems: 'center' }}>
          <Pillar n="1" head="Structured evaluation" style={pop(65)} />
          <Pillar n="2" head="Clear requirements" style={pop(108)} />
          <Pillar n="3" head="Tools to track progress" style={pop(144)} />
        </div>
        <div style={{ ...rise(214, 16), marginTop: 40, fontSize: 44, fontWeight: 600, color: QT.accent2 }}>
          Choose the path that fits your strategy.
        </div>
        {/* top=1220 (default full width) put this at real y 1254-1760, deep inside the caption
            safe zone (captions are bottom-anchored, pad_bottom 384 -> roughly y 1430-1560 on a
            1920 canvas) -- a real overlap bug only visible once the caption overlay is baked in,
            caught in post-bake frame QA, not the single-shot technical test. Smaller + higher
            clears it with margin on both sides. */}
        <div style={evFrame(850, 780)}>
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
export default QTPathV2;
