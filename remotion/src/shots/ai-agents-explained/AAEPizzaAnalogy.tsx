import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 20.34-65.61 · pizza analogy + agent definition. Core teaching device for the whole video.
export const compositionConfig = { id: 'AAEPizzaAnalogy', durationInSeconds: 45.27, fps: 30, width: 1920, height: 1080 };

const Card: React.FC<{ title: string; lines: string[]; accent: string; style: React.CSSProperties }> = ({ title, lines, accent, style }) => (
  <div style={{ ...style, background: RM.panel, border: `1px solid ${accent}55`, borderRadius: 20, padding: '28px 34px', width: 560 }}>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 30, color: accent, marginBottom: 16 }}>{title}</div>
    {lines.map((l, i) => (
      <div key={i} style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: RM.text, marginBottom: 8, lineHeight: 1.4 }}>{l}</div>
    ))}
  </div>
);

const AAEPizzaAnalogy: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(1358);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <div style={rise(10, 16)}><Eyebrow color={RM.cyan}>think about ordering a pizza</Eyebrow></div>
        <div style={{ display: 'flex', gap: 30 }}>
          <Card title="PROMPTING" accent={RM.muted}
            lines={['Call every 5 minutes.', 'Is it in the oven yet?', 'Is it out for delivery?', 'You do all the checking.']}
            style={pop(60)} />
          <Card title="AN AGENT" accent={RM.green}
            lines={['Place the order once.', 'Trust the process.', 'It handles the oven,', 'the driver, the doorbell.']}
            style={pop(240)} />
        </div>
        <div style={{ ...rise(430, 20), fontSize: 26, color: RM.text, fontWeight: 600, textAlign: 'center' }}>
          Same pizza. Completely different amount of your attention spent getting it.
        </div>
        <div style={{ ...rise(760, 22), marginTop: 18, fontSize: 30, fontWeight: 700, color: RM.cyan, textAlign: 'center', maxWidth: 1150, lineHeight: 1.4 }}>
          An agent looks at a result, decides what to do next, and acts, in a loop, without you typing the next step.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default AAEPizzaAnalogy;
