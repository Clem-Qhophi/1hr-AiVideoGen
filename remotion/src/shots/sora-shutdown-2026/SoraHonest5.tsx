import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 350.81-360.33 · honest-5: side-quests is reporting. "side-quests quote" f27,
// "not confirmed" f173, "reporting, not confession" f233.
export const compositionConfig = { id: 'SoraHonest5', durationInSeconds: 9.52, fps: 30, width: 1920, height: 1080 };

const SoraHonest5: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(286);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.amber} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 170px', textAlign: 'center' }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.amber}>LAST HONESTY CHECK</Eyebrow></div>
        <div style={{ ...rise(27, 18), fontSize: 36, fontWeight: 700, color: RM.text }}>
          And that &ldquo;side quests&rdquo; quote? That&apos;s reporting, not confession.
        </div>
        <div style={{ ...rise(173, 18), fontSize: 32, color: RM.muted, maxWidth: 1250 }}>
          The attitude is not confirmed to be official OpenAI policy.
        </div>
        <div style={{ ...slam(233, 10), fontFamily: FONT_HOOK, fontSize: 44, color: RM.amber }}>
          We report it because it&apos;s what the sources said. You judge what it means.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default SoraHonest5;
