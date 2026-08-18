import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 29.25-64.64 · context. 700K f82, trade-off f301, eye wall f573, RI f761, 35mph f824, melissa f1016.
export const compositionConfig = { id: 'WNContext', durationInSeconds: 35.4, fps: 30, width: 1920, height: 1080 };

const TradeCard: React.FC<{ head: string; sub: string; style: React.CSSProperties; color: string }> = ({ head, sub, style, color }) => (
  <div style={{ ...style, width: 560, background: RM.panel, border: `1px solid ${color}55`, borderRadius: 18, padding: '22px 30px' }}>
    <div style={{ fontFamily: FONT_HOOK, fontSize: 40, color }}>{head}</div>
    <div style={{ marginTop: 8, fontSize: 24, fontWeight: 500, color: RM.muted }}>{sub}</div>
  </div>
);

const WNContext: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(1061);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.amber} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.amber}>Why early warning is so hard</Eyebrow></div>
        <div style={{ ...rise(82, 18), fontSize: 58, fontWeight: 600, color: RM.text }}>
          <span style={{ fontFamily: FONT_HOOK, color: RM.amber }}>700,000+ deaths</span> in 50 years
        </div>
        <div style={{ display: 'flex', gap: 34, marginTop: 18 }}>
          <TradeCard head="TRACK" sub="where it goes · steered by global winds · coarse global models" color={RM.cyan} style={pop(301)} />
          <TradeCard head="INTENSITY" sub="how strong · eye-wall microphysics · high-res local models" color={RM.green} style={pop(573)} />
        </div>
        <div style={{ ...rise(680, 18), fontSize: 32, fontWeight: 500, color: RM.muted }}>
          No single model was great at both.
        </div>
        <div style={{ ...slam(761, 8), fontFamily: FONT_HOOK, fontSize: 62, color: RM.red, textShadow: `0 8px 36px ${RM.red}44` }}>
          RAPID INTENSIFICATION
        </div>
        <div style={{ ...rise(824, 18), fontSize: 34, fontWeight: 500, color: RM.text }}>
          winds +35 mph in 24 hours → a monster overnight, no warning
        </div>
        <div style={{ ...rise(1016, 18), marginTop: 6, fontSize: 30, fontWeight: 600, color: RM.text }}>
          Melissa did exactly that.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default WNContext;
