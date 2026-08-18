import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 769.00-799.71 · four-piece framework recap.
export const compositionConfig = { id: 'AAECloseRecap', durationInSeconds: 30.71, fps: 30, width: 1920, height: 1080 };

const Line: React.FC<{ text: string; style: React.CSSProperties }> = ({ text, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 18, width: 1080 }}>
    <div style={{ fontSize: 28, color: RM.cyan }}>&#10003;</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 26, color: RM.text }}>{text}</div>
  </div>
);

const AAECloseRecap: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(921);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.cyan}>a prompt gets you an answer &middot; an agent gets you a result</Eyebrow></div>
        <Line text="A goal you can picture still running next week" style={pop(80)} />
        <Line text="Real tools with real access to the world" style={pop(240)} />
        <Line text="A check that catches a confident wrong answer" style={pop(400)} />
        <Line text="A stop condition it won't cross without you" style={pop(560)} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default AAECloseRecap;
