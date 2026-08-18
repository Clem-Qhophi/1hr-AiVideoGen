import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 267.39-286.93 · bottom line recap. "genuine step" f74, "not best on every chart" f317, "landed yesterday" f437.
export const compositionConfig = { id: 'Q38Recap', durationInSeconds: 19.54, fps: 30, width: 1920, height: 1080 };

const Line: React.FC<{ mark: string; color: string; text: string; style: React.CSSProperties }> = ({ mark, color, text, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 20, width: 1180 }}>
    <div style={{ fontSize: 34, color, width: 34 }}>{mark}</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 32, color: RM.text }}>{text}</div>
  </div>
);

const Q38Recap: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(586);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.cyan}>bottom line</Eyebrow></div>
        <Line mark="&#10003;" color={RM.green} text="A genuine step for Alibaba, efficiency-first" style={pop(74)} />
        <Line mark="&#10003;" color={RM.green} text="First Max-class Qwen promising open weights" style={pop(220)} />
        <Line mark="&#10005;" color={RM.red} text="Not the best model on every chart" style={pop(317)} />
        <Line mark="&#10005;" color={RM.red} text="Weights aren't in your hands yet" style={pop(380)} />
        <div style={{ ...rise(437, 18), marginTop: 14, fontFamily: FONT_HOOK, fontSize: 30, color: RM.text, textAlign: 'center' }}>
          It landed yesterday, and you're hearing the real numbers today.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default Q38Recap;
