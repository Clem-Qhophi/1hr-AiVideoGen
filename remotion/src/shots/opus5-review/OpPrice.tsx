import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 66.60-80.12 · price: $5 in (f67) / $25 out (f151), same as 4.8, ~half of Fable 5 (f343).
export const compositionConfig = { id: 'OpPrice', durationInSeconds: 13.6, fps: 30, width: 1920, height: 1080 };

const Price: React.FC<{ big: string; sub: string; style: React.CSSProperties }> = ({ big, sub, style }) => (
  <div style={{ ...style, background: RM.panel, border: `1px solid ${RM.line}`, borderRadius: 22, padding: '36px 54px', textAlign: 'center', width: 520 }}>
    <div style={{ fontFamily: FONT_HOOK, fontSize: 118, lineHeight: 0.95, color: RM.cyan }}>{big}</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 26, letterSpacing: 2, color: RM.muted, marginTop: 12, textTransform: 'uppercase' }}>{sub}</div>
  </div>
);

const OpPrice: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(406);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.muted}>API pricing · per million tokens</Eyebrow></div>
        <div style={{ display: 'flex', gap: 36 }}>
          <Price big="$5" sub="input" style={pop(67)} />
          <Price big="$25" sub="output" style={pop(151)} />
        </div>
        <div style={{ ...slam(240, 9), marginTop: 12, fontFamily: FONT_HOOK, fontSize: 92, lineHeight: 0.95, color: RM.text }}>
          SAME AS OPUS 4.8
        </div>
        <div style={{ ...rise(343, 18), fontSize: 42, fontWeight: 600, color: RM.cyan }}>
          and about half what the flagship costs
        </div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', bottom: 34, width: '100%', textAlign: 'center', fontFamily: 'monospace', fontSize: 22, color: RM.muted }}>
        Source: anthropic.com, Jul 2026
      </div>
    </AbsoluteFill>
  );
};
export default OpPrice;
