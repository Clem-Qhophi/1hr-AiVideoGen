import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 15.0-29.4 · two unknown Chrome bugs + retention-loop setup.
// "two unknown Chrome bugs" f48, "escape Google's sandbox" f87, "built to get past you" f210,
// "the one nobody is reporting" f350, "We'll get to it." f417.
export const compositionConfig = { id: 'CYBugs', durationInSeconds: 14.4, fps: 30, width: 1920, height: 1080 };

const CYBugs: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(432);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 150px', textAlign: 'center' }}>
        <div style={rise(4, 12)}><Eyebrow color={RM.cyan}>And it already found them</Eyebrow></div>
        <div style={{ ...slam(48, 9), fontFamily: FONT_HOOK, fontSize: 120, lineHeight: 0.95, color: RM.red, textShadow: `0 12px 44px ${RM.red}33`, marginTop: 6 }}>
          2 UNKNOWN CHROME BUGS
        </div>
        <div style={{ ...rise(92, 16), fontSize: 30, fontWeight: 500, color: RM.muted, marginTop: 4 }}>
          chainable &rarr; escape Google&rsquo;s heap sandbox
        </div>
        <div style={{ ...rise(165, 18), marginTop: 22, fontSize: 38, fontWeight: 700, color: RM.text, maxWidth: 1200 }}>
          If you run anything online, this is a tool <span style={{ fontFamily: FONT_HOOK, color: RM.cyan }}>built to get past you.</span>
        </div>
        <div style={{ ...rise(300, 18), marginTop: 18, fontSize: 34, fontWeight: 600, color: RM.amber, maxWidth: 1250 }}>
          But the last number in OpenAI&rsquo;s report is the one nobody is reporting &mdash; and it changes what this model is.
        </div>
        <div style={{ ...rise(417, 16), marginTop: 10, fontFamily: 'monospace', fontSize: 26, letterSpacing: 3, color: RM.cyan }}>
          WE&rsquo;LL GET TO IT
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default CYBugs;
