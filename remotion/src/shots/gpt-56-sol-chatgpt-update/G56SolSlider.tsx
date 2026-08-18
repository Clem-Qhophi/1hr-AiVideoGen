import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 98.8-112.2 · verdict: reasoning slider. "reasoning slider" 100.8s, web/mobile/desktop 102s, drag low 103.7s.
export const compositionConfig = { id: 'G56SolSlider', durationInSeconds: 13.4, fps: 30, width: 1920, height: 1080 };

const G56SolSlider: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(402);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.cyan}>the verdict · two</Eyebrow></div>
        <div style={{ ...rise(40, 16), fontFamily: FONT_HOOK, fontSize: 96, color: RM.text, textAlign: 'center' }}>The Reasoning Slider</div>
        <div style={{ ...pop(90, 12), fontSize: 34, color: RM.muted }}>web · mobile · desktop</div>

        {/* slider visual */}
        <div style={{ ...rise(150, 16), position: 'relative', width: 1100, height: 90, background: RM.panel, borderRadius: 999, border: `1px solid ${RM.line}` }}>
          <div style={{ position: 'absolute', top: 0, left: 0, borderRadius: 999, width: '42%', height: '100%', background: `${RM.cyan}33` }} />
          <div style={{ position: 'absolute', top: '50%', left: '42%', transform: 'translate(-50%,-50%)', width: 76, height: 76, borderRadius: '50%', background: RM.cyan, boxShadow: `0 0 40px ${RM.cyan}66` }} />
          <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 28, color: RM.text }}>quick</div>
          <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 28, color: RM.text }}>deep</div>
        </div>

        <div style={{ ...rise(260, 14), fontSize: 29, fontWeight: 600, color: RM.text, textAlign: 'center' }}>
          One assistant, extra thinking on demand. The part people love.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default G56SolSlider;