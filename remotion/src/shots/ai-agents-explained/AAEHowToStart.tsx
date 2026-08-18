import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 589.42-633.53 · the practical starting kit, five concrete steps.
export const compositionConfig = { id: 'AAEHowToStart', durationInSeconds: 44.11, fps: 30, width: 1920, height: 1080 };

const Step: React.FC<{ n: number; text: string; style: React.CSSProperties }> = ({ n, text, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 18, width: 1050 }}>
    <div style={{ width: 34, height: 34, borderRadius: '50%', background: RM.cyan, color: '#04121a', fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: RM.text }}>{text}</div>
  </div>
);

const AAEHowToStart: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(1323);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={rise(10, 16)}><Eyebrow color={RM.cyan}>the whole starting kit</Eyebrow></div>
        <Step n={1} text="Pick one task you already do by hand every week." style={pop(90)} />
        <Step n={2} text="Write its goal in one sentence, like explaining it to a new hire." style={pop(280)} />
        <Step n={3} text="List the 2-3 tools it genuinely needs. Nothing more." style={pop(470)} />
        <Step n={4} text="Write one check, even a simple one, before it touches anything real." style={pop(660)} />
        <Step n={5} text="Name the one line it can't cross without asking you first." style={pop(850)} />
        <div style={{ ...rise(1100, 20), marginTop: 12, fontSize: 22, color: RM.green, fontWeight: 600, textAlign: 'center' }}>
          One small, trustworthy agent before you build a second one.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default AAEHowToStart;
