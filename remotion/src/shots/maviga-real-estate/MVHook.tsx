import React from 'react';
import { AbsoluteFill } from 'remotion';
import { MVBg, MVLine, MVEyebrow, MVDrift, MVLogo, MV, FONT_DISPLAY } from './mvkit';

// master 0.00-4.30 (129f) · HOOK. Conversational direct address: "Are you buying land?"
// then the money line. Multimodal from frame 0 (works muted). Memorable line 'GHC 5,000'
// opens the loop the ad pays off. VO: Are(0.21) Five(1.95) thousand cedis(2.25) down(2.92)
// the land is yours(3.56).
export const compositionConfig = { id: 'MVHook', durationInSeconds: 4.3, fps: 30, width: 1080, height: 1920 };

const MVHook: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
    <MVBg>
      <MVDrift frames={129}>
        <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, padding: '0 70px', textAlign: 'center' }}>
          <MVLogo width={380} />
          <MVEyebrow style={{ marginTop: 10 }}>MAVIGA REAL ESTATE</MVEyebrow>
          <MVLine text="ARE YOU BUYING LAND?" start={6} size={88} />
          <div style={{ height: 20 }} />
          <MVLine text="GHC 5,000" start={56} size={150} />
          <MVLine text="DOWN." start={84} size={150} color={MV.olive} />
          <MVLine text="THE LAND IS YOURS." start={100} size={88} />
        </AbsoluteFill>
      </MVDrift>
    </MVBg>
  </AbsoluteFill>
);
export default MVHook;
