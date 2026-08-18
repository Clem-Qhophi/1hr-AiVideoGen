import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 112.30-121.63 · verdict + subscribe (f266).
export const compositionConfig = { id: 'OpOutro', durationInSeconds: 9.4, fps: 30, width: 1920, height: 1080 };

const Line: React.FC<{ mark: string; color: string; text: string; style: React.CSSProperties }> = ({ mark, color, text, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 20, width: 1120 }}>
    <div style={{ fontSize: 40, color, width: 40 }}>{mark}</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 42, color: RM.text }}>{text}</div>
  </div>
);

const OpOutro: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(280);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={{ ...rise(6, 20), fontFamily: FONT_HOOK, fontSize: 92, color: RM.cyan, marginBottom: 18 }}>THE VERDICT</div>
        <Line mark="✓" color={RM.green} text="Cheaper than the flagship" style={rise(30, 18)} />
        <Line mark="✓" color={RM.green} text="Better on most real-world work" style={rise(70, 18)} />
        <Line mark="✕" color={RM.red} text="Real gap on security work" style={rise(110, 18)} />
        <div style={{ ...pop(266), marginTop: 30, background: RM.cyan, color: '#04121a', fontWeight: 800, fontSize: 44, padding: '20px 52px', borderRadius: 999, boxShadow: `0 16px 46px ${RM.cyan}44` }}>
          Subscribe for day-one breakdowns
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default OpOutro;
