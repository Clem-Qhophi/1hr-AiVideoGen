import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 268.45-297.50 · outro. header f0, 10x f116, track-fast f429, subscribe f598, comment f704.
export const compositionConfig = { id: 'G56Outro', durationInSeconds: 29.1, fps: 30, width: 1920, height: 1080 };

const Line: React.FC<{ mark: string; color: string; text: string; style: React.CSSProperties }> = ({ mark, color, text, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 20, width: 1160 }}>
    <div style={{ fontSize: 38, color, width: 38 }}>{mark}</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 38, color: RM.text }}>{text}</div>
  </div>
);

const G56Outro: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(872);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={{ ...rise(0, 20), fontFamily: FONT_HOOK, fontSize: 84, color: RM.cyan, marginBottom: 14 }}>BOTTOM LINE</div>
        <Line mark="&#10003;" color={RM.green} text="Luna: 10x cheaper than a week ago" style={rise(116, 18)} />
        <Line mark="&#10003;" color={RM.green} text="A real price war, not a marketing number" style={rise(260, 18)} />
        <Line mark="&#10005;" color={RM.red} text="OpenAI still isn't the cheapest, full stop" style={rise(390, 18)} />
        <div style={{ ...pop(598), marginTop: 26, background: RM.cyan, color: '#04121a', fontWeight: 800, fontSize: 40, padding: '18px 48px', borderRadius: 999, boxShadow: `0 16px 46px ${RM.cyan}44` }}>
          Subscribe for day-one breakdowns
        </div>
        <div style={{ ...rise(704, 18), marginTop: 10, fontSize: 24, color: RM.muted, textAlign: 'center' }}>
          Drop a comment: which model are you switching to at these prices?
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default G56Outro;
