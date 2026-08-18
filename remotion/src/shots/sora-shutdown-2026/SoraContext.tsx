import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 18.00-34.36 · context. "type a sentence" f308, "film-quality footage" f339,
// "GPT-1 moment for video" f423.
export const compositionConfig = { id: 'SoraContext', durationInSeconds: 16.36, fps: 30, width: 1920, height: 1080 };

const SoraContext: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(490);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 170px', textAlign: 'center' }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.cyan}>Feb 2024 &middot; the demo</Eyebrow></div>
        <div style={{ ...rise(20, 16), fontSize: 30, fontWeight: 500, color: RM.muted }}>
          What Sora was, so the deadline means something.
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 22, marginTop: 12 }}>
          <div style={{ ...rise(308, 16), fontSize: 44, color: RM.muted }}>type a sentence</div>
          <div style={{ ...slam(339, 9), fontFamily: FONT_HOOK, fontSize: 96, color: RM.text }}>&rarr;</div>
          <div style={{ ...slam(339, 9), fontFamily: FONT_HOOK, fontSize: 88, color: RM.cyan }}>film-quality footage</div>
        </div>
        <div style={{ ...rise(423, 18), marginTop: 22, fontSize: 34, fontWeight: 700, color: RM.text, maxWidth: 1200 }}>
          OpenAI called it the GPT-1 moment for video.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default SoraContext;
