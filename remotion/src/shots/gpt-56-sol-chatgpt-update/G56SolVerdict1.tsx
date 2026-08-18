import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 66.7-98.8 · verdict change 1+2. "68%" 86.1s, "company number" 94.8s, slider 98.8s.
export const compositionConfig = { id: 'G56SolVerdict1', durationInSeconds: 32.1, fps: 30, width: 1920, height: 1080 };

const G56SolVerdict1: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(963);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.green} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.green}>the verdict · one</Eyebrow></div>

        <div style={{ ...rise(90, 16), fontSize: 36, fontWeight: 500, color: RM.muted, textAlign: 'center' }}>
          One retuned GPT-5.6 Sol powers both instant and deep answers.
        </div>
        <div style={{ ...slam(240, 10), display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <span style={{ fontFamily: FONT_HOOK, fontSize: 160, lineHeight: 0.9, color: RM.cyan }}>68%</span>
          <span style={{ fontSize: 40, color: RM.muted }}>fewer<br/>factual errors</span>
        </div>
        <div style={{ ...pop(580, 12), fontFamily: 'monospace', fontSize: 26, color: RM.text }}>
          OpenAI internal eval · financial, medical, legal prompts · vs GPT-5.5 Instant
        </div>
        <div style={{ ...rise(900, 14), fontSize: 28, fontWeight: 500, color: RM.amber }}>
          Company number, not a third-party benchmark. Keep the attribution.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default G56SolVerdict1;