import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 20.79-49.60 · context. "always closed" f77, "every open Qwen smaller" f306, "1M tokens" f705.
export const compositionConfig = { id: 'Q38Context', durationInSeconds: 28.81, fps: 30, width: 1920, height: 1080 };

const Tier: React.FC<{ name: string; note: string; accent: string; locked: boolean; style: React.CSSProperties }> = ({ name, note, accent, locked, style }) => (
  <div style={{ ...style, background: RM.panel, border: `1px solid ${accent}55`, borderRadius: 16, padding: '18px 34px', textAlign: 'center', minWidth: 260 }}>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 30, color: accent }}>{locked ? '🔒 ' : '🔓 '}{name}</div>
    <div style={{ fontFamily: 'monospace', fontSize: 15, color: RM.muted, marginTop: 6, textTransform: 'uppercase', letterSpacing: 1.5 }}>{note}</div>
  </div>
);

const Q38Context: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(864);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <div style={rise(6, 16)}><Eyebrow>quick context</Eyebrow></div>
        <div style={{ ...rise(30, 18), fontSize: 32, fontWeight: 500, color: RM.text, textAlign: 'center', maxWidth: 1100 }}>
          Alibaba&rsquo;s Max tier has always been closed &mdash; rent it through the API, never download it.
        </div>
        <div style={{ display: 'flex', gap: 30, marginTop: 8 }}>
          <Tier name="Qwen3.7-Max" note="closed &middot; API only" accent={RM.muted} locked style={pop(180)} />
          <Tier name="open Qwen models" note="always smaller than Max" accent={RM.muted} locked={false} style={pop(306)} />
        </div>
        <div style={{ ...rise(420, 18), marginTop: 10, fontSize: 30, fontWeight: 700, color: RM.cyan, textAlign: 'center' }}>
          Qwen3.8-Max breaks that pattern &mdash; the first Max-class model going open weight.
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginTop: 20 }}>
          <div style={{ ...pop(705), fontFamily: FONT_HOOK, fontSize: 84, color: RM.green, textShadow: `0 10px 44px ${RM.green}44` }}>1M</div>
          <div style={{ ...rise(730, 14), fontSize: 24, color: RM.muted, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 2 }}>token context &mdash; a novel and a half, in one prompt</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default Q38Context;
