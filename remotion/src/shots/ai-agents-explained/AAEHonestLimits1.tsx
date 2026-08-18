import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 633.53-707.16 · honest-limits 1: real setup cost, and the confident-wrong-answer risk.
export const compositionConfig = { id: 'AAEHonestLimits1', durationInSeconds: 73.63, fps: 30, width: 1920, height: 1080 };

const Caveat: React.FC<{ head: string; sub: string; style: React.CSSProperties }> = ({ head, sub, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'flex-start', gap: 22, background: RM.panel, border: `1px solid ${RM.red}44`, borderRadius: 16, padding: '20px 34px', width: 1180 }}>
    <div style={{ fontSize: 30, color: RM.red, lineHeight: 1.1 }}>&#10005;</div>
    <div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 28, color: RM.text }}>{head}</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 20, color: RM.muted, marginTop: 6 }}>{sub}</div>
    </div>
  </div>
);

const AAEHonestLimits1: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(2209);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.red} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.red}>the part that gets glossed over</Eyebrow></div>
        <Caveat head="Every piece takes real setup" sub="Real authentication, real permissions that expire and need renewing." style={pop(120)} />
        <Caveat head="The check is genuinely the hard part" sub="Someone has to actually understand what 'correct' looks like for that job, not the AI part." style={pop(500)} />
        <Caveat head="It fails quietly, not loudly" sub="An API changes or a login expires. It doesn't explain that. It just keeps going with wrong information." style={pop(1000)} />
        <div style={{ ...rise(1600, 20), marginTop: 10, fontSize: 24, color: RM.text, fontWeight: 600, textAlign: 'center', maxWidth: 1100 }}>
          Nobody watching in real time means a confident wrong answer travels a lot further before anyone catches it.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default AAEHonestLimits1;
