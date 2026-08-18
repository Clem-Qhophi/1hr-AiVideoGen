import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 295.16-376.36 · worked example 1: weekly summary bot, the four-part breakdown applied.
export const compositionConfig = { id: 'AAEExampleSummaryBot', durationInSeconds: 81.2, fps: 30, width: 1920, height: 1080 };

const Row: React.FC<{ label: string; text: string; accent: string; style: React.CSSProperties }> = ({ label, text, accent, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'flex-start', gap: 20, width: 1180, borderBottom: `1px solid ${RM.line}`, paddingBottom: 14 }}>
    <div style={{ fontFamily: 'monospace', fontSize: 16, color: accent, letterSpacing: 2, width: 90, paddingTop: 4 }}>{label}</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: RM.text, lineHeight: 1.4 }}>{text}</div>
  </div>
);

const AAEExampleSummaryBot: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(2436);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <div style={rise(10, 16)}><Eyebrow color={RM.cyan}>worked example 1</Eyebrow></div>
        <div style={{ ...rise(40, 18), fontSize: 26, fontWeight: 600, color: RM.text, textAlign: 'center' }}>
          A weekly project summary, posted every Friday
        </div>
        <Row label="GOAL" text="Draft a weekly summary of what shipped, post it to the team channel every Friday." accent={RM.cyan} style={pop(220)} />
        <Row label="TOOLS" text="Read the project log. Post a message. Two real permissions, nothing vague." accent={RM.cyan} style={pop(560)} />
        <Row label="CHECK" text="Before posting: count the items. Zero items never auto-posts: it flags a human instead." accent={RM.amber} style={pop(1000)} />
        <Row label="STOP" text="Posts to one channel only. No email access, nothing with money attached." accent={RM.red} style={pop(1620)} />
        <div style={{ ...rise(2100, 20), marginTop: 14, fontSize: 22, color: RM.green, fontWeight: 600, textAlign: 'center' }}>
          That "zero items" check catches the single most common agent failure: quietly succeeding at nothing.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default AAEExampleSummaryBot;
