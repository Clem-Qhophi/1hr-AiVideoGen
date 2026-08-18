import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 296-317 · "appetizer" f479. Spark 1.2 weights = the main course.
export const compositionConfig = { id: 'GLSpark12', durationInSeconds: 21.0, fps: 30, width: 1920, height: 1080 };

const GLSpark12: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(630);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 150px', textAlign: 'center' }}>
        <div style={rise(6, 14)}><Eyebrow color={RM.cyan}>What&rsquo;s next</Eyebrow></div>
        <div style={{ ...slam(20, 10), fontFamily: FONT_HOOK, fontSize: 78, lineHeight: 1, color: RM.text }}>
          SPARK 1.2&rsquo;s WEIGHTS
        </div>
        <div style={{ ...rise(110, 16), fontSize: 28, color: RM.muted }}>
          Zuckerberg: coming soon. If they land, Meta&rsquo;s flagship joins the open club.
        </div>
        <div style={{ ...rise(220, 18), fontSize: 26, color: RM.text }}>
          And the frontier conversation changes.
        </div>
        <div style={{ ...rise(400, 20), fontSize: 34, fontWeight: 700, color: RM.amber, maxWidth: 1050 }}>
          This release is the appetizer. The main course is Spark 1.2&rsquo;s weights.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GLSpark12;
