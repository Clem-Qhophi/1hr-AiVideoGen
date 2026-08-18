import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 190.5-249.8 · evidence: scope + honest scope recap. "scope" 219s.
export const compositionConfig = { id: 'G56SolScope', durationInSeconds: 59.3, fps: 30, width: 1920, height: 1080 };

const Line: React.FC<{ text: string; accent: string; style: React.CSSProperties }> = ({ text, accent, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 24, background: RM.panel, border: `1px solid ${accent}55`, borderRadius: 16, padding: '18px 30px', width: 1240 }}>
    <span style={{ width: 14, height: 14, borderRadius: '50%', background: accent, flex: 'none' }} />
    <span style={{ fontSize: 32, color: RM.text }}>{text}</span>
  </div>
);

const G56SolScope: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(1779);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.cyan}>scope · keep yourself honest</Eyebrow></div>
        <Line accent={RM.cyan} style={pop(50)} text="Update applies to ChatGPT Chat only" />
        <Line accent={RM.cyan} style={pop(150)} text="Work, Codex, and the API are NOT changing" />
        <Line accent={RM.green} style={pop(250)} text="GPT-5.5 Instant still exists as the fast default" />
        <Line accent={RM.green} style={pop(350)} text="'Unlimited' text chats still cap files, images, tools" />
        <Line accent={RM.amber} style={pop(450)} text="Think button has abuse guardrails" />

        <div style={{ ...slam(800, 10), marginTop: 12, fontFamily: FONT_HOOK, fontSize: 58, color: RM.cyan, textAlign: 'center' }}>
          ONE app. ONE model. ONE dialect.
        </div>
        <div style={{ ...rise(900, 14), fontSize: 30, fontWeight: 600, color: RM.text, textAlign: 'center' }}>
          That boundary is the headline the lazy coverage drops.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default G56SolScope;