import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 250.77-267.39 · honest-gap close. "not close to the top" f176, "self host" f351, "isn't here yet" f462.
export const compositionConfig = { id: 'Q38HonestClose', durationInSeconds: 16.62, fps: 30, width: 1920, height: 1080 };

const Caveat: React.FC<{ head: string; sub: string; style: React.CSSProperties }> = ({ head, sub, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'flex-start', gap: 22, background: RM.panel, border: `1px solid ${RM.red}44`, borderRadius: 16, padding: '18px 32px', width: 1080 }}>
    <div style={{ fontSize: 30, color: RM.red, lineHeight: 1.1 }}>✕</div>
    <div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 30, color: RM.text }}>{head}</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 22, color: RM.muted, marginTop: 4 }}>{sub}</div>
    </div>
  </div>
);

const Q38HonestClose: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(499);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.red} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.red}>on the hardest benchmarks, not close to the top</Eyebrow></div>
        <Caveat head="SWE-bench Pro: 67.7" sub="vs. Opus4.8 69.2 and Fable5 80.0" style={pop(60)} />
        <Caveat head="HLE (expert-level): 43.6" sub="vs. Fable5 53.3 — a real gap, not a rounding error" style={pop(176)} />
        <div style={{ ...rise(351, 18), marginTop: 6, fontSize: 26, color: RM.text, fontWeight: 600, textAlign: 'center', maxWidth: 1050 }}>
          If you need the single best model today, this isn&rsquo;t automatically it.
        </div>
        <div style={{ ...rise(462, 18), fontSize: 24, color: RM.muted, textAlign: 'center', maxWidth: 1000 }}>
          Waiting to self-host a Max-tier Qwen for the first time ever? That part is real &mdash; it just isn&rsquo;t here yet.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default Q38HonestClose;
