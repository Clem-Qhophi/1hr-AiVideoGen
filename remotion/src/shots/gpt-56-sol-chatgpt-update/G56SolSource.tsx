import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 138.8-175.6 · evidence: the sources. "openai home page" 141.2s, "that sixty eight" ~150s, attribution ~163s.
export const compositionConfig = { id: 'G56SolSource', durationInSeconds: 37.0, fps: 30, width: 1920, height: 1080 };

const G56SolSource: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(1110);
  const frames = 1110;
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.cyan}>the sources</Eyebrow></div>

        <div style={{ ...rise(70, 14), fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 2, color: RM.muted, textAlign: 'center' }}>
          openai.com/index/improving-gpt-5-6-sol-in-chatgpt · Aug 6, 2026
        </div>
        <div style={{ ...pop(150, 12), fontFamily: FONT_HOOK, fontSize: 92, color: RM.cyan, textAlign: 'center' }}>
          "Tuned for how you use ChatGPT"
        </div>
        <div style={{ ...rise(320, 16), fontSize: 34, color: RM.muted, textAlign: 'center' }}>
          The headline is literal on the page. Every number here comes from it.
        </div>
        <div style={{ ...rise(600, 16), marginTop: 10, fontSize: 30, fontWeight: 600, color: RM.text, textAlign: 'center' }}>
          The 68%: financial, medical, legal prompts, at least one factual error, less common with Sol.
        </div>
        <div style={{ ...rise(900, 16), marginTop: 8, fontSize: 24, color: RM.muted, textAlign: 'center' }}>
          live page capture blocked (Cloudflare) A� source text verified directly
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default G56SolSource;