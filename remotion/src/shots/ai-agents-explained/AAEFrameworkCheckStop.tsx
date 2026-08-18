import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 187.86-255.58 · framework pieces 3-4: a check on its own work, a stop condition.
export const compositionConfig = { id: 'AAEFrameworkCheckStop', durationInSeconds: 67.72, fps: 30, width: 1920, height: 1080 };

const Piece: React.FC<{ n: string; title: string; sub: string; style: React.CSSProperties }> = ({ n, title, sub, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 26, width: 1200 }}>
    <div style={{ fontFamily: FONT_HOOK, fontSize: 64, color: RM.cyan, width: 70 }}>{n}</div>
    <div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 30, color: RM.text }}>{title}</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: RM.muted, marginTop: 4 }}>{sub}</div>
    </div>
  </div>
);

const AAEFrameworkCheckStop: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(2032);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.amber} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <Piece n="3" title="A way to check its own work" sub="The piece almost everyone skips. Without it: fails confidently, not loudly." style={pop(20)} />
        <div style={{ ...rise(280, 18), fontSize: 20, color: RM.amber, fontStyle: 'italic', maxWidth: 1100, textAlign: 'center' }}>
          Spend as much thought on the check as you spent on the prompt.
        </div>
        <Piece n="4" title="A stop condition" sub="The clear line it will not cross without asking: money, public posts, deletes." style={pop(1060)} />
        <div style={{ ...rise(1350, 18), fontSize: 20, color: RM.muted, maxWidth: 1100, textAlign: 'center' }}>
          Naming it takes thirty seconds. Finding out you needed one takes a lot longer.
        </div>
        <div style={{ ...rise(1650, 20), marginTop: 10, fontSize: 26, fontWeight: 700, color: RM.text, textAlign: 'center' }}>
          Miss the check or the stop condition, and you haven't built an agent.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default AAEFrameworkCheckStop;
