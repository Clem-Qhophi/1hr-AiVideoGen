import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { RMBg, useRise } from '../../lib/reviewkit';

// master 0.0-11.0 · "locked behind a paywall" f20 · "scare everyone" ~f150 (open got scary good)
export const compositionConfig = { id: 'OSHook', durationInSeconds: 11.0, fps: 30, width: 1920, height: 1080 };

const OSHook: React.FC = () => {
  const rise = useRise();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={COLORS.accent} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 170px', textAlign: 'center' }}>
        <div style={{ ...rise(6, 16), fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 6, color: COLORS.d400, marginBottom: 44 }}>OPEN SOURCE AI · MID 2026</div>
        <h1 style={{ ...rise(20, 24), fontWeight: 600, fontSize: 76, lineHeight: 1.16, color: COLORS.paper, margin: 0 }}>
          The frontier is still locked<br />behind a <span style={{ color: COLORS.accent }}>paywall</span>.
        </h1>
        <h1 style={{ ...rise(150, 30), fontWeight: 700, fontSize: 94, lineHeight: 1.1, color: COLORS.paper, margin: '40px 0 0' }}>
          But the open models just got <span style={{ color: COLORS.signal }}>scary good</span>.
        </h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default OSHook;
