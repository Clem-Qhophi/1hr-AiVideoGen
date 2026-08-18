import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 277-296 · "don't mistake size for frontier" + open license = open risk.
export const compositionConfig = { id: 'GLFrontier', durationInSeconds: 19.0, fps: 30, width: 1920, height: 1080 };

const GLFrontier: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(570);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 150px', textAlign: 'center' }}>
        <div style={rise(6, 14)}><Eyebrow color={RM.cyan}>Reality check</Eyebrow></div>
        <div style={{ ...slam(20, 10), fontFamily: FONT_HOOK, fontSize: 64, lineHeight: 1.02, color: RM.text }}>
          DON&rsquo;T MISTAKE SIZE<br />FOR FRONTIER
        </div>
        <div style={{ ...rise(130, 18), fontSize: 28, color: RM.muted, maxWidth: 1000 }}>
          A 30B local model is not a GPT-5.6 or a Muse Spark. It competes with other mid-size open models.
        </div>
        <div style={{ ...rise(240, 18), fontSize: 26, color: RM.text, maxWidth: 1050 }}>
          And Meta&rsquo;s own card says it can still produce inaccurate or biased responses.
        </div>
        <div style={{ ...rise(360, 20), fontSize: 30, fontWeight: 700, color: RM.amber, maxWidth: 1050 }}>
          Open license = open risk. Anyone gets it &mdash; including the people who won&rsquo;t add guardrails.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GLFrontier;
