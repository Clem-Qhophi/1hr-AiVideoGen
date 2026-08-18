import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 222.9-229.4 · mid-roll CTA. "hit subscribe" f160.
export const compositionConfig = { id: 'CYCTA', durationInSeconds: 6.5, fps: 30, width: 1920, height: 1080 };

const CYCTA: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(195);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 150px', textAlign: 'center' }}>
        <div style={rise(2, 12)}><Eyebrow color={RM.cyan}>Want these the day a model drops?</Eyebrow></div>
        <div style={{ ...rise(30, 16), fontSize: 34, fontWeight: 600, color: RM.text, marginTop: 4 }}>
          Breakdowns of every major release &middot; verdict in the first three minutes
        </div>
        <div style={{ ...slam(110, 9), marginTop: 14, fontFamily: FONT_HOOK, fontSize: 76, color: RM.cyan, textShadow: `0 10px 44px ${RM.cyan}44` }}>
          HIT SUBSCRIBE
        </div>
        <div style={{ ...rise(160, 16), fontSize: 26, fontWeight: 500, color: RM.muted }}>
          (the evidence continues after this &mdash; stay with me)
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default CYCTA;
