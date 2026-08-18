import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 236.52-268.45 · honest gap. Xiaomi f134, DeepSeek(implicit)~f300, Opus5 f481/578/616, close f907.
export const compositionConfig = { id: 'G56Honest', durationInSeconds: 32.0, fps: 30, width: 1920, height: 1080 };

const Caveat: React.FC<{ head: string; sub: string; style: React.CSSProperties }> = ({ head, sub, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'flex-start', gap: 22, background: RM.panel, border: `1px solid ${RM.red}44`, borderRadius: 16, padding: '20px 34px', width: 1180 }}>
    <div style={{ fontSize: 34, color: RM.red, lineHeight: 1.1 }}>&#10005;</div>
    <div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 36, color: RM.text }}>{head}</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 24, color: RM.muted, marginTop: 6 }}>{sub}</div>
    </div>
  </div>
);

const G56Honest: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(958);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.red} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={{ ...rise(6, 16), marginBottom: 4 }}><Eyebrow color={RM.red}>Luna is not the cheapest model on the market</Eyebrow></div>
        <Caveat head="Xiaomi's MiMo V2.5 Flash: $0.40 combined" sub="still beats Luna on raw token price" style={pop(134)} />
        <Caveat head="DeepSeek's flash model: $0.42 combined" sub="same story" style={pop(300)} />
        <Caveat head="Anthropic cut nothing: Opus 5 is $30 combined" sub="exactly what Opus 4.8 cost, no discount at all" style={pop(481)} />
        <div style={{ ...rise(907, 18), marginTop: 10, fontSize: 30, fontWeight: 600, color: RM.text, textAlign: 'center' }}>
          If raw price per token is all that matters, OpenAI still isn't the cheapest option in the room.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default G56Honest;
