import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 126.67-187.86 · framework pieces 1-2: goal (not task), tools (real access).
export const compositionConfig = { id: 'AAEFrameworkGoalTools', durationInSeconds: 61.19, fps: 30, width: 1920, height: 1080 };

const Piece: React.FC<{ n: string; title: string; sub: string; style: React.CSSProperties }> = ({ n, title, sub, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 26, width: 1200 }}>
    <div style={{ fontFamily: FONT_HOOK, fontSize: 64, color: RM.cyan, width: 70 }}>{n}</div>
    <div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 30, color: RM.text }}>{title}</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: RM.muted, marginTop: 4 }}>{sub}</div>
    </div>
  </div>
);

const AAEFrameworkGoalTools: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(1836);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
        <div style={rise(10, 16)}><Eyebrow color={RM.cyan}>four pieces make it real</Eyebrow></div>
        <Piece n="1" title="A goal, not a task" sub={'"Summarize this email" ends. "Keep my inbox at zero" keeps running.'} style={pop(70)} />
        <div style={{ ...rise(340, 18), fontSize: 20, color: RM.green, fontStyle: 'italic', maxWidth: 1100 }}>
          The test: can you picture it still running next Tuesday, without you?
        </div>
        <Piece n="2" title="Tools it can actually use" sub="Real access, something it can change: a calendar, a file, a search, an email." style={pop(920)} />
        <div style={{ ...rise(1200, 18), fontSize: 20, color: RM.muted, maxWidth: 1100, textAlign: 'center' }}>
          API keys, permissions, logins. The boring part everyone skips fastest in a demo.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default AAEFrameworkGoalTools;
