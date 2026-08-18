import React from 'react';
import { usePop, useRise, QT, VibeBg } from '../../lib/qtkit';
import { FONT_DISPLAY } from '../../fonts';

// master 21.70-28.60 (207f) RISK / POSITION / PLAN.
// "Manage your risk. (0.65-1.52s local) Size your position. (2.43-3.35s) Follow your own plan,
// not the market's mood. (4.33-6.52s)"
// Code-rendered emphasis cards, deliberately NOT a screenshot -- these are house rules, not a real
// dashboard recording (none exists yet per client-approval-package.md §5). Emphasis, not proof.
const Rule: React.FC<{ n: string; head: string; style: React.CSSProperties }> = ({ n, head, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 24, background: QT.panel, border: `1px solid ${QT.line}`, borderRadius: 16, padding: '20px 32px', width: 840 }}>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 34, color: QT.bg0, background: QT.accent2, borderRadius: 999, width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 38, color: QT.text }}>{head}</div>
  </div>
);

export const compositionConfig = { id: 'QTRiskV2', durationInSeconds: 6.9, fps: 30, width: 1080, height: 1920 };

const QTRiskV2: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  return (
    <div style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ ...rise(2), marginBottom: 46, fontSize: 52, fontWeight: 700, color: QT.text }}>
          Your own <span style={{ color: QT.accent }}>rules.</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
          <Rule n="1" head="Manage your risk" style={pop(20)} />
          <Rule n="2" head="Size your position" style={pop(73)} />
          <Rule n="3" head="Follow your own plan" style={pop(130)} />
        </div>
        <div style={{ ...rise(170, 16), marginTop: 40, fontSize: 40, fontWeight: 500, color: QT.muted }}>
          Not the market's mood.
        </div>
      </div>
    </div>
  );
};
export default QTRiskV2;
