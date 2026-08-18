import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 294.4-315.0 · THE PAYOFF: the last number. "the catch I promised" f11, "report writing" f180,
// "performs worse than plain Sol" f300, "Shorter, less detailed reports" f330, "the report is the
// deliverable" f553.
export const compositionConfig = { id: 'CYCatch', durationInSeconds: 20.6, fps: 30, width: 1920, height: 1080 };

const CYCatch: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(618);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.red} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '0 140px', textAlign: 'center' }}>
        <div style={rise(3, 12)}><Eyebrow color={RM.red}>The catch I promised &middot; the last number in the report</Eyebrow></div>
        <div style={{ ...slam(60, 9), fontFamily: FONT_HOOK, fontSize: 120, lineHeight: 0.95, color: RM.red, textShadow: `0 12px 46px ${RM.red}33`, marginTop: 10 }}>
          CYBER <span style={{ color: RM.text }}>&lt;</span> SOL
        </div>
        <div style={{ ...rise(120, 16), fontSize: 32, fontWeight: 600, color: RM.text }}>
          on vulnerability discovery + report writing
        </div>
        <div style={{ ...pop(300, 12), marginTop: 12, fontSize: 30, fontWeight: 700, color: RM.amber }}>
          Shorter. Less detailed reports.
        </div>
        <div style={{ ...rise(420, 18), marginTop: 14, fontSize: 34, fontWeight: 600, color: RM.text, maxWidth: 1300 }}>
          The model that&rsquo;s best at breaking into systems is <span style={{ fontFamily: FONT_HOOK, color: RM.red }}>not</span> the best at explaining what it found.
        </div>
        <div style={{ ...rise(540, 18), marginTop: 8, fontSize: 30, fontWeight: 700, color: RM.amber, maxWidth: 1200 }}>
          In a discipline where the report <span style={{ fontFamily: FONT_HOOK }}>is</span> the deliverable &mdash; that gap matters.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default CYCatch;
