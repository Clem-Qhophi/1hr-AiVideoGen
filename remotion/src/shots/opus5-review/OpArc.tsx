import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { EASINGS } from '../../brand';
import { CLAMP } from '../../lib/kit';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 21.44-34.07 (381f) · ARC-AGI 3: 3x the next-best. Bars grow EARLY (as the benchmark is
// named) so the beat is never a static label; "three times" slam lands f230.
export const compositionConfig = { id: 'OpArc', durationInSeconds: 12.7, fps: 30, width: 1920, height: 1080 };

const OpArc: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(381);
  // relative bars: next-best = 1 unit, Opus 5 = 3 units (anthropic: "three times as high")
  const grow = (start: number, w: number) => interpolate(frame, [start, start + 30], [0, w], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 200px' }}>
        <div style={rise(4, 16)}><Eyebrow color={RM.muted}>ARC-AGI 3 · reasoning</Eyebrow></div>
        <div style={{ ...rise(16, 18), fontSize: 38, fontWeight: 500, color: RM.muted, marginBottom: 6 }}>relative score</div>

        <div style={{ width: 1180 }}>
          <div style={{ fontSize: 28, color: RM.muted, marginBottom: 8 }}>Next-best model</div>
          <div style={{ height: 74, width: grow(40, 330), background: RM.line, borderRadius: 10 }} />
          <div style={{ fontSize: 30, color: RM.cyan, marginTop: 26, marginBottom: 8, fontWeight: 700 }}>Claude Opus 5</div>
          <div style={{ height: 74, width: grow(150, 990), background: `linear-gradient(90deg, ${RM.cyanDim}, ${RM.cyan})`, borderRadius: 10, boxShadow: `0 8px 40px ${RM.cyan}33` }} />
        </div>

        <div style={{ ...slam(230, 9), marginTop: 20, fontFamily: FONT_HOOK, fontSize: 132, lineHeight: 0.95, color: RM.cyan }}>
          3× HIGHER
        </div>
        <div style={{ ...rise(312, 14), fontSize: 30, color: RM.muted }}>not three percent. three times.</div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', bottom: 34, width: '100%', textAlign: 'center', fontFamily: 'monospace', fontSize: 22, color: RM.muted }}>
        Source: anthropic.com, Jul 2026
      </div>
    </AbsoluteFill>
  );
};
export default OpArc;
