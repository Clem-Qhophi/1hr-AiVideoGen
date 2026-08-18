import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 38-69 · "Muse Spark" f60, "Show us the weights" f426, "Four months later" f459, "Spark 1.2's weights, soon" f851.
export const compositionConfig = { id: 'GLContext', durationInSeconds: 31.0, fps: 30, width: 1920, height: 1080 };

const GLContext: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(930);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 160px', textAlign: 'center' }}>
        <div style={rise(8, 16)}><Eyebrow color={RM.cyan}>April, 2026</Eyebrow></div>
        <div style={{ ...rise(24, 18), fontSize: 38, fontWeight: 600, color: RM.text }}>
          Meta shipped <span style={{ color: RM.cyan }}>Muse Spark</span> &mdash; their best model ever.
        </div>
        <div style={{ ...rise(90, 18), fontSize: 30, color: RM.muted }}>
          Weights: closed. One comment to the community:
        </div>
        <div style={{ ...rise(150, 18), fontFamily: 'monospace', fontSize: 28, color: RM.amber, fontStyle: 'italic', maxWidth: 1100 }}>
          &ldquo;Talk is cheap. Show us the weights.&rdquo;
        </div>
        <div style={{ ...rise(420, 18), marginTop: 16, fontSize: 34, fontWeight: 700, color: RM.text }}>
          Four months later&hellip;
        </div>
        <div style={{ ...slam(470, 10), fontFamily: FONT_HOOK, fontSize: 88, lineHeight: 1, color: RM.green, textShadow: `0 10px 44px ${RM.green}44` }}>
          AUG 10 &mdash; HERE THEY ARE
        </div>
        <div style={{ ...rise(640, 18), fontSize: 28, color: RM.muted }}>
          First fully-open release from Meta&rsquo;s Superintelligence Lab.
        </div>
        <div style={{ ...rise(800, 20), fontSize: 30, fontWeight: 700, color: RM.amber, maxWidth: 1050 }}>
          And Spark 1.2&rsquo;s weights are coming soon &mdash; we&rsquo;ll get there.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GLContext;
