import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 432.61-484.58 · worked example 3: two agents talking, the real goal quietly leaks out.
export const compositionConfig = { id: 'AAEExampleAgentChain', durationInSeconds: 51.97, fps: 30, width: 1920, height: 1080 };

const Box: React.FC<{ label: string; sub: string; style: React.CSSProperties }> = ({ label, sub, style }) => (
  <div style={{ ...style, background: RM.panel, border: `1px solid ${RM.cyan}55`, borderRadius: 16, padding: '20px 30px', width: 380, textAlign: 'center' }}>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 22, color: RM.cyan }}>{label}</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, color: RM.muted, marginTop: 6 }}>{sub}</div>
  </div>
);

const AAEExampleAgentChain: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(1559);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.red} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <div style={rise(10, 16)}><Eyebrow color={RM.red}>worked example 3 &middot; the shape that trips people up most</Eyebrow></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 6 }}>
          <Box label="YOUR AGENT" sub="Goal: keep my manager informed" style={pop(60)} />
          <div style={{ ...rise(220, 14), fontSize: 26, color: RM.muted }}>&#8594; email &#8594;</div>
          <Box label="MANAGER'S AGENT" sub="Reads inbox, produces a digest" style={pop(340)} />
        </div>
        <div style={{ ...rise(560, 20), marginTop: 14, fontSize: 24, color: RM.amber, fontWeight: 600, textAlign: 'center', maxWidth: 1100 }}>
          Somewhere in that chain, the real goal quietly became "an email got sent."
        </div>
        <div style={{ ...rise(900, 20), fontSize: 22, color: RM.text, textAlign: 'center', maxWidth: 1100 }}>
          Two working agents. The goal still leaked, because nothing checked whether a human actually understood something new.
        </div>
        <div style={{ ...rise(1250, 20), marginTop: 10, fontSize: 22, color: RM.green, fontWeight: 600, textAlign: 'center' }}>
          The fix: the check has to watch the real goal, all the way through the chain.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default AAEExampleAgentChain;
