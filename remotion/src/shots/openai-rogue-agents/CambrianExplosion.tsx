import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

export const compositionConfig = { id: 'CambrianExplosion', durationInSeconds: 10, fps: 30, width: 1920, height: 1080 };

const CambrianExplosion: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.accent2} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 200px', textAlign: 'center' }}>
        <div style={rise(6, 18)}><Eyebrow color={RM.accent2}>ERIC WALLACE · OPENAI</Eyebrow></div>
        <div style={{ ...slam(30, 9), fontFamily: FONT_HOOK, fontSize: 72, lineHeight: 1.1, color: RM.text }}>
          "A CAMBRIAN EXPLOSION
        </div>
        <div style={{ ...slam(60, 9), fontFamily: FONT_HOOK, fontSize: 72, lineHeight: 1.1, color: RM.accent2, textShadow: `0 10px 44px ${RM.accent2}44` }}>
          IN INTELLIGENCE"
        </div>
        <div style={{ ...rise(120, 20), fontSize: 36, fontWeight: 500, color: RM.muted, marginTop: 20 }}>
          The moment life went from simple cells to complex organisms.
        </div>
        <div style={{ ...rise(180, 20), fontSize: 36, fontWeight: 500, color: RM.muted }}>
          He wasn't being poetic. He was being precise.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default CambrianExplosion;
