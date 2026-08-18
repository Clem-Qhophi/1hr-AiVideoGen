import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

export const compositionConfig = { id: 'DaltonQuote', durationInSeconds: 10, fps: 30, width: 1920, height: 1080 };

const DaltonQuote: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.danger} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 200px', textAlign: 'center' }}>
        <div style={rise(6, 18)}><Eyebrow color={RM.danger}>MICHAEL DALTON · OPENAI</Eyebrow></div>
        <div style={{ ...slam(30, 9), fontFamily: FONT_HOOK, fontSize: 60, lineHeight: 1.1, color: RM.text }}>
          "AI-ORCHESTRATED,
        </div>
        <div style={{ ...slam(60, 9), fontFamily: FONT_HOOK, fontSize: 60, lineHeight: 1.1, color: RM.danger, textShadow: `0 10px 44px ${RM.danger}44` }}>
          FULLY AUTOMATED OFFENSIVE
        </div>
        <div style={{ ...slam(90, 9), fontFamily: FONT_HOOK, fontSize: 60, lineHeight: 1.1, color: RM.danger, textShadow: `0 10px 44px ${RM.danger}44` }}>
          ATTACKS ARE REAL NOW."
        </div>
        <div style={{ ...rise(150, 20), fontSize: 36, fontWeight: 500, color: RM.muted, marginTop: 20 }}>
          "We need a similar acceleration in defense."
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default DaltonQuote;
