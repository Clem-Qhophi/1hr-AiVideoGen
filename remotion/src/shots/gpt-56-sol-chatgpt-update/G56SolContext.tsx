import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 14.0-66.7 · context / model lineup. Sol 35s, Terra 36.5s, Luna 37.8s, collapse 53s, free->Luna 59.5s.
export const compositionConfig = { id: 'G56SolContext', durationInSeconds: 52.7, fps: 30, width: 1920, height: 1080 };

const Tier: React.FC<{ label: string; accent: string; style: React.CSSProperties; desc: string }> = ({ label, accent, style, desc }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 30, background: RM.panel, border: `1px solid ${accent}44`, borderRadius: 18, padding: '16px 38px', width: 1160 }}>
    <div style={{ fontFamily: FONT_HOOK, fontSize: 46, color: accent, width: 150 }}>{label}</div>
    <div style={{ fontSize: 30, color: RM.muted }}>{desc}</div>
  </div>
);

const G56SolContext: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(1581);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.cyan}>the GPT-5.6 lineup</Eyebrow></div>

        <Tier label="Sol" accent={RM.cyan} style={pop(120)} desc="the flagship" />
        <Tier label="Terra" accent={RM.amber} style={pop(225)} desc="the middle" />
        <Tier label="Luna" accent={RM.green} style={pop(330)} desc="fast and cheap" />

        <div style={{ ...rise(520, 16), marginTop: 10, fontSize: 32, fontWeight: 600, color: RM.text, textAlign: 'center' }}>
          Until today: quick answers on GPT-5.5 Instant, deep thinking on Sol.
        </div>
        <div style={{ ...slam(920, 10), fontFamily: FONT_HOOK, fontSize: 62, color: RM.text, textAlign: 'center' }}>
          Today that split collapses.
        </div>
        <div style={{ ...rise(1400, 16), fontSize: 30, fontWeight: 500, color: RM.text, textAlign: 'center' }}>
          Paid gets ONE Sol for both. Free gets switched to Luna. Same announcement.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default G56SolContext;