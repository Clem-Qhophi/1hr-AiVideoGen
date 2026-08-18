import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 707.16-769.00 · honest-limits 2: runaway-loop cost + agent-chain leak, then the honest close.
export const compositionConfig = { id: 'AAEHonestLimits2', durationInSeconds: 61.84, fps: 30, width: 1920, height: 1080 };

const Caveat: React.FC<{ head: string; sub: string; style: React.CSSProperties }> = ({ head, sub, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'flex-start', gap: 22, background: RM.panel, border: `1px solid ${RM.red}44`, borderRadius: 16, padding: '18px 32px', width: 1180 }}>
    <div style={{ fontSize: 28, color: RM.red, lineHeight: 1.1 }}>&#10005;</div>
    <div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 26, color: RM.text }}>{head}</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 19, color: RM.muted, marginTop: 5 }}>{sub}</div>
    </div>
  </div>
);

const AAEHonestLimits2: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(1855);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.red} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <Caveat head="A loop that doesn't know when to stop" sub="Retrying overnight can rack up a real bill by morning. It's like leaving a car running in the driveway. Quiet, but it costs you." style={pop(30)} />
        <Caveat head="Agent chains lose the goal, one hop at a time" sub="Every extra handoff is another place the real goal can quietly disappear unnoticed." style={pop(480)} />
        <div style={{ ...rise(950, 20), marginTop: 14, fontSize: 26, fontWeight: 700, color: RM.green, textAlign: 'center', maxWidth: 1100 }}>
          None of that means don't build one.
        </div>
        <div style={{ ...rise(1150, 20), fontSize: 22, color: RM.text, textAlign: 'center', maxWidth: 1100 }}>
          Agents can give you back hours a week, but only after the unglamorous setup work, not instead of it.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default AAEHonestLimits2;
