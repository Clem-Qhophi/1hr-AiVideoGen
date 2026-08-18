import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SSBg, SSLine, SSDrift, SS, VW, FONT_DISPLAY, FONT_HOOK } from './sskit';

// master 56.70-60.00 (99f) · STING. The memorable line lands as the bookend; logo + handle close.
// VO: 'Step into comfort' 56.7s, 'Step into Softstep' 58.3s (ASR-synced).
export const compositionConfig = { id: 'SSSting', durationInSeconds: 3.3, fps: 30, width: 1080, height: 1920 };

const SSSting: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
    <SSBg>
      <SSDrift frames={99} to={1.03}>
        <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, padding: '0 70px', textAlign: 'center' }}>
          <SSLine text="STEP INTO COMFORT." start={10} size={96} color={SS.muted} />
          <SSLine text="STEP INTO" start={30} size={128} />
          <SSLine text="SOFTSTEP." start={47} size={128} color={SS.accent} />
          <div
            style={{
              fontFamily: FONT_HOOK, fontSize: 40, color: SS.white, letterSpacing: 2,
              background: SS.text, borderRadius: 30, padding: '20px 44px', marginTop: 34,
            }}
          >
            @SOFTSTEP_SLIDES · DM TO ORDER
          </div>
        </AbsoluteFill>
      </SSDrift>
    </SSBg>
  </AbsoluteFill>
);
export default SSSting;
