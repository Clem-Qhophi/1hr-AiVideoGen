import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 296.7-352.7 · close. "in under three minutes" 313s, "we cover these" 331s.
export const compositionConfig = { id: 'G56SolClose', durationInSeconds: 56.4, fps: 30, width: 1920, height: 1080 };

const G56SolClose: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(1680);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.cyan}>in under three minutes</Eyebrow></div>

        <div style={{ ...rise(60, 16), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ fontFamily: FONT_HOOK, fontSize: 60, color: RM.green }}>SOL RETUNED + SLIDER</div>
          <div style={{ fontFamily: FONT_HOOK, fontSize: 60, color: RM.amber }}>FREE &rarr; LUNA</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span style={{ fontFamily: FONT_HOOK, fontSize: 88, color: RM.cyan }}>68%</span>
            <span style={{ fontSize: 30, color: RM.muted }}>OpenAI's own internal count</span>
          </div>
        </div>

        <div style={{ ...pop(480, 12), fontSize: 30, fontWeight: 600, color: RM.text, textAlign: 'center' }}>
          We cover these the day they drop. Subscribe so you don't miss the next one.
        </div>

        <div style={{ ...rise(700, 18), display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{ background: `${RM.cyan}22`, border: `1px solid ${RM.cyan}66`, borderRadius: 999, padding: '16px 40px', fontFamily: FONT_HOOK, fontSize: 34, color: RM.cyan }}>SUBSCRIBE</div>
          <div style={{ fontSize: 28, color: RM.muted }}>Verdict in the first three minutes. Every time.</div>
        </div>

        <div style={{ ...rise(1100, 16), marginTop: 8, fontSize: 26, color: RM.muted, textAlign: 'center' }}>
          Comment: gift to free users, or a quiet re-rating? I read the numbers.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default G56SolClose;