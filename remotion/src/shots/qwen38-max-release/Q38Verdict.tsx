import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 49.60-67.67 · verdict open. rank#5 f87, rank#2 f135, "95B active" efficiency line f270.
export const compositionConfig = { id: 'Q38Verdict', durationInSeconds: 18.07, fps: 30, width: 1920, height: 1080 };

const Rank: React.FC<{ n: string; label: string; style: React.CSSProperties }> = ({ n, label, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 20, background: RM.panel, border: `1px solid ${RM.cyan}44`, borderRadius: 16, padding: '16px 32px', minWidth: 340 }}>
    <div style={{ fontFamily: FONT_HOOK, fontSize: 56, color: RM.cyan }}>#{n}</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 26, color: RM.text }}>{label}</div>
  </div>
);

const Q38Verdict: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(542);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.cyan}>the actual verdict</Eyebrow></div>
        <div style={{ display: 'flex', gap: 26 }}>
          <Rank n="5" label="Text Arena" style={pop(87)} />
          <Rank n="2" label="Vision Arena" style={pop(135)} />
        </div>
        <div style={{ ...rise(180, 18), fontSize: 26, color: RM.muted, textAlign: 'center', maxWidth: 1000 }}>
          right now, against every frontier model out there
        </div>
        <div style={{ ...rise(270, 20), marginTop: 16, fontSize: 32, fontWeight: 700, color: RM.text, textAlign: 'center', maxWidth: 1080 }}>
          95B active parameters is small for a model at this scale.
        </div>
        <div style={{ ...rise(340, 20), fontSize: 26, color: RM.green, fontWeight: 600, textAlign: 'center' }}>
          That&rsquo;s the efficiency bet: near-flagship results on a fraction of the compute per token.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default Q38Verdict;
