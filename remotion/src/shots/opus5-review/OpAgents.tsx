import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 48.87-66.60 (532f) · the longest beat, so it reveals in FOUR steps, not two: each card
// arrives when its benchmark is named, then its number slams when the figure is spoken
// (AutomationBench figure f234, OSWorld figure f496).
const Card: React.FC<{
  big: string; head: string; sub: string;
  cardStyle: React.CSSProperties; bigStyle: React.CSSProperties;
}> = ({ big, head, sub, cardStyle, bigStyle }) => (
  <div style={{ ...cardStyle, background: RM.panel, border: `1px solid ${RM.line}`, borderRadius: 22, padding: '34px 44px', width: 900, display: 'flex', alignItems: 'center', gap: 40 }}>
    <div style={{ ...bigStyle, fontFamily: FONT_HOOK, fontSize: 92, lineHeight: 0.95, color: RM.cyan, minWidth: 300 }}>{big}</div>
    <div style={{ textAlign: 'left' }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 36, color: RM.text }}>{head}</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 26, color: RM.muted, marginTop: 8, lineHeight: 1.35 }}>{sub}</div>
    </div>
  </div>
);

export const compositionConfig = { id: 'OpAgents', durationInSeconds: 17.8, fps: 30, width: 1920, height: 1080 };

const OpAgents: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(532);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34 }}>
        <div style={{ ...rise(6, 16), marginBottom: 4 }}><Eyebrow color={RM.muted}>agentic + computer use</Eyebrow></div>
        <Card
          big="1.5×" head="Zapier AutomationBench" sub="pass rate vs the next-best model, at the same cost per task"
          cardStyle={pop(24)} bigStyle={slam(234, 8)}
        />
        <Card
          big="1/3 COST" head="OSWorld 2.0" sub="beats Fable 5's best result at just over a third of the cost"
          cardStyle={pop(300)} bigStyle={slam(496, 8)}
        />
      </AbsoluteFill>
      <div style={{ position: 'absolute', bottom: 34, width: '100%', textAlign: 'center', fontFamily: 'monospace', fontSize: 22, color: RM.muted }}>
        Source: anthropic.com, Jul 2026
      </div>
    </AbsoluteFill>
  );
};
export default OpAgents;
