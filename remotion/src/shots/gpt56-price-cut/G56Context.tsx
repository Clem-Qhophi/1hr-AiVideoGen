import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';
import { TierCard } from '../../lib/pricekit';

// master 11.52-35.93 · context. Sol f159, Terra f186, Luna f222, old prices f427/f516, tagline f571.
export const compositionConfig = { id: 'G56Context', durationInSeconds: 24.5, fps: 30, width: 1920, height: 1080 };

const G56Context: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(735);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
        <div style={rise(6, 16)}><Eyebrow>GPT 5.6 · three sizes, late June 2026</Eyebrow></div>
        <div style={{ display: 'flex', gap: 30 }}>
          <TierCard name="Sol" role="top · reasoning" style={pop(159)} accent={RM.cyan} />
          <TierCard name="Terra" role="middle · general use" style={pop(186)} accent={RM.amber} />
          <TierCard name="Luna" role="bottom · high volume" style={pop(222)} accent={RM.green} />
        </div>
        <div style={{ display: 'flex', gap: 60, marginTop: 10 }}>
          <div style={{ ...pop(427), textAlign: 'center' }}>
            <div style={{ fontSize: 22, color: RM.muted, fontFamily: 'monospace', letterSpacing: 1 }}>LUNA AT LAUNCH</div>
            <div style={{ fontSize: 54, fontWeight: 700, color: RM.text }}>$7<span style={{ fontSize: 22, color: RM.muted }}>/1M</span></div>
          </div>
          <div style={{ ...pop(516), textAlign: 'center' }}>
            <div style={{ fontSize: 22, color: RM.muted, fontFamily: 'monospace', letterSpacing: 1 }}>TERRA AT LAUNCH</div>
            <div style={{ fontSize: 54, fontWeight: 700, color: RM.text }}>$17.50<span style={{ fontSize: 22, color: RM.muted }}>/1M</span></div>
          </div>
        </div>
        <div style={{ ...rise(571, 18), marginTop: 6, fontSize: 32, fontWeight: 600, color: RM.cyan, textAlign: 'center' }}>
          Google and Anthropic both shipped cheaper models. OpenAI just answered.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default G56Context;
