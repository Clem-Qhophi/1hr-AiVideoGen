import React from 'react';
import { usePop, useRise, QT, VibeBg } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// 16:9 adaptation of QTRiskV2 -- SAME cue frames. Row of 3 rule chips instead of a stack (more
// natural for a wide canvas).
// master 21.70-28.60 (207f) RISK / POSITION / PLAN.
const Rule: React.FC<{ n: string; head: string; style: React.CSSProperties }> = ({ n, head, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 16, background: QT.panel, border: `1px solid ${QT.line}`, borderRadius: 14, padding: '16px 26px' }}>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 26, color: QT.bg0, background: QT.accent2, borderRadius: 999, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 28, color: QT.text, whiteSpace: 'nowrap' }}>{head}</div>
  </div>
);

export const compositionConfig = { id: 'QTRiskV2169', durationInSeconds: 6.9, fps: 30, width: 1920, height: 1080 };

const QTRiskV2169: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 40 }}>
        <div style={{ ...rise(2), fontSize: 46, fontWeight: 700, color: QT.text }}>
          Your own <span style={{ color: QT.accent }}>rules.</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <Rule n="1" head="Manage your risk" style={pop(20)} />
          <Rule n="2" head="Size your position" style={pop(73)} />
          <Rule n="3" head="Follow your own plan" style={pop(130)} />
        </div>
        <div style={{ ...rise(170, 16), fontSize: 34, fontWeight: 500, color: QT.muted }}>
          Not the market's mood.
        </div>
      </div>
    </div>
  );
};
export default QTRiskV2169;
