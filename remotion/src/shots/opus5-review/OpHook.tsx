import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 0.00-10.72 (322f) · hook. "flagship" f89, "half" f130, then the tease line closes it out.
export const compositionConfig = { id: 'OpHook', durationInSeconds: 10.9, fps: 30, width: 1920, height: 1080 };

const OpHook: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(322);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 180px', textAlign: 'center' }}>
        <div style={rise(6, 18)}><Eyebrow color={RM.cyan}>Claude Opus 5 · July 2026</Eyebrow></div>
        <div style={{ ...rise(24, 20), fontSize: 46, fontWeight: 500, color: RM.muted, lineHeight: 1.3 }}>
          Anthropic just shipped a model that
        </div>
        <div style={{ ...slam(89, 9), fontFamily: FONT_HOOK, fontSize: 128, lineHeight: 0.95, color: RM.text }}>
          BEATS ITS OWN FLAGSHIP
        </div>
        <div style={{ ...slam(130, 9), fontFamily: FONT_HOOK, fontSize: 128, lineHeight: 0.95, color: RM.cyan, textShadow: `0 10px 44px ${RM.cyan}44` }}>
          AT HALF THE PRICE
        </div>
        <div style={{ ...rise(196, 20), marginTop: 14, fontSize: 38, fontWeight: 500, color: RM.muted }}>
          and some of these benchmark numbers are genuinely strange
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default OpHook;
