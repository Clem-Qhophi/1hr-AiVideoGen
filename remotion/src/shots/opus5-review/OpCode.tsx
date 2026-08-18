import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { EASINGS } from '../../brand';
import { CLAMP } from '../../lib/kit';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 34.07-48.87 (444f) · Frontier-Bench v0.1 (43.3 / 33.7 / 18.7). Bars grow early, a delta
// callout fills the mid-beat, CursorBench card lands f331 ("half the cost").
const Bar: React.FC<{ label: string; pct: number; w: number; color: string; dim?: boolean }> = ({ label, pct, w, color, dim }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', width: 1180, marginBottom: 8 }}>
      <span style={{ fontSize: 30, fontWeight: dim ? 500 : 700, color: dim ? RM.muted : RM.text }}>{label}</span>
      <span style={{ fontFamily: FONT_HOOK, fontSize: 38, color }}>{pct}%</span>
    </div>
    <div style={{ height: 56, width: w, background: color, borderRadius: 9, opacity: dim ? 0.55 : 1 }} />
  </div>
);

export const compositionConfig = { id: 'OpCode', durationInSeconds: 14.9, fps: 30, width: 1920, height: 1080 };

const OpCode: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(444);
  const g = (start: number, w: number) => interpolate(frame, [start, start + 28], [0, w], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 200px' }}>
        <div style={{ ...rise(4, 16), marginBottom: 26 }}><Eyebrow color={RM.muted}>Frontier-Bench v0.1 · coding + knowledge work</Eyebrow></div>
        <Bar label="Claude Opus 5" pct={43.3} w={g(30, 1180)} color={RM.cyan} />
        <Bar label="Claude Fable 5 (flagship)" pct={33.7} w={g(52, 918)} color={RM.muted} dim />
        <Bar label="Claude Opus 4.8 (previous)" pct={18.7} w={g(74, 510)} color={RM.muted} dim />
        <div style={{ ...pop(150), marginTop: 6, fontSize: 34, fontWeight: 700, color: RM.green }}>
          more than double Opus 4.8, at a lower cost per task
        </div>
        <div style={{ ...pop(331), marginTop: 22, background: RM.panel, border: `1px solid ${RM.cyanDim}`, borderRadius: 16, padding: '20px 40px', fontSize: 34, fontWeight: 600, color: RM.text }}>
          CursorBench 3.2: within <span style={{ color: RM.cyan }}>0.5%</span> of Fable 5's peak, at <span style={{ color: RM.cyan }}>half the cost</span>
        </div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', bottom: 34, width: '100%', textAlign: 'center', fontFamily: 'monospace', fontSize: 22, color: RM.muted }}>
        Source: anthropic.com, Jul 2026
      </div>
    </AbsoluteFill>
  );
};
export default OpCode;
