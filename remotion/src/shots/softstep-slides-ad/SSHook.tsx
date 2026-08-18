import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SSBg, SSLine, SSEyebrow, SSDrift, SS, VW, FONT_DISPLAY } from './sskit';

// master 0.00-9.45 (285f) · HOOK. Multimodal: text visible from frame 0 (works muted/autoplay,
// /make-ad checklist #1). Memorable line 'STEP INTO SOFTSTEP' first appears here as the bookend.
// VO: hook question (0.2s), each pair cost you money (3.5s), that waste ends today (7.6s).
export const compositionConfig = { id: 'SSHook', durationInSeconds: 9.5, fps: 30, width: 1080, height: 1920 };

const SSHook: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
    <SSBg>
      <SSDrift frames={285}>
        <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, padding: '0 70px', textAlign: 'center' }}>
          <SSEyebrow>SOFTSTEP SLIDES &amp; SNEAKERS</SSEyebrow>
          <SSLine text="THROWN AWAY" start={6} size={116} />
          <SSLine text="ANY SLIDES" start={14} size={116} />
          <SSLine text="THIS YEAR?" start={22} size={116} color={SS.accent} />
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 34, fontWeight: 600, color: SS.muted, letterSpacing: 2, marginTop: 18 }}>
            STEP INTO COMFORT. STEP INTO SOFTSTEP.
          </div>
        </AbsoluteFill>
      </SSDrift>
    </SSBg>
  </AbsoluteFill>
);
export default SSHook;
