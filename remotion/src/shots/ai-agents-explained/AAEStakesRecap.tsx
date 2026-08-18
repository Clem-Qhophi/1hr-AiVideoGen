import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 560.32-589.42 · stakes ladder across the three worked examples.
export const compositionConfig = { id: 'AAEStakesRecap', durationInSeconds: 29.1, fps: 30, width: 1920, height: 1080 };

const Rung: React.FC<{ label: string; note: string; accent: string; width: number; style: React.CSSProperties }> = ({ label, note, accent, width, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 20 }}>
    <div style={{ width, height: 46, background: `${accent}22`, border: `1px solid ${accent}66`, borderRadius: 10, display: 'flex', alignItems: 'center', paddingLeft: 20 }}>
      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 20, color: accent }}>{label}</span>
    </div>
    <span style={{ fontFamily: FONT_DISPLAY, fontSize: 17, color: RM.muted }}>{note}</span>
  </div>
);

const AAEStakesRecap: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(873);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <div style={rise(10, 16)}><Eyebrow color={RM.cyan}>rank your own idea on this same scale</Eyebrow></div>
        <Rung label="JOB FILTER" note="worst case: wastes your morning" accent={RM.green} width={280} style={pop(90)} />
        <Rung label="SUMMARY BOT" note="worst case: mildly embarrassing" accent={RM.amber} width={420} style={pop(250)} />
        <Rung label="CODING AGENT" note="worst case: breaks a real system" accent={RM.red} width={620} style={pop(410)} />
        <div style={{ ...rise(600, 20), marginTop: 16, fontSize: 22, color: RM.text, fontWeight: 600, textAlign: 'center', maxWidth: 1050 }}>
          Low stakes can tolerate a looser check while you're learning. High stakes earns the strictest check you can write, from day one.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default AAEStakesRecap;
