import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 249.8-296.7 · honest gap. "honest gap" 250s, "one more thing" 295s.
export const compositionConfig = { id: 'G56SolGap', durationInSeconds: 46.9, fps: 30, width: 1920, height: 1080 };

const Card: React.FC<{ head: string; body: string; accent: string; style: React.CSSProperties }> = ({ head, body, accent, style }) => (
  <div style={{ ...style, width: 1180, background: RM.panel, border: `1px solid ${accent}44`, borderRadius: 18, padding: '24px 34px' }}>
    <div style={{ fontFamily: FONT_HOOK, fontSize: 34, color: accent }}>{head}</div>
    <div style={{ fontSize: 28, color: RM.text, marginTop: 6 }}>{body}</div>
  </div>
);

const G56SolGap: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(1407);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.amber} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.amber}>the honest gap</Eyebrow></div>
        <Card accent={RM.amber} style={pop(40)} head="The 68% is internal" body="Self-reported, vs GPT-5.5 Instant only. Not versus Fable 5 or Gemini." />
        <Card accent={RM.green} style={pop(200)} head="'Unlimited' has guardrails" body="Files, images, tools still rate-limited. Think button has abuse checks." />
        <Card accent={RM.cyan} style={pop(360)} head="Free runs the smallest tier" body="Real expansion, and real downsizing. Both true." />
        <Card accent={RM.muted} style={pop(520)} head="No rival published today" body="Comparing a claimed improvement to a static field." />

        <div style={{ ...rise(900, 16), marginTop: 8, fontSize: 30, fontWeight: 600, color: RM.text, textAlign: 'center' }}>
          That's the part a hype channel skips. We don't.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default G56SolGap;