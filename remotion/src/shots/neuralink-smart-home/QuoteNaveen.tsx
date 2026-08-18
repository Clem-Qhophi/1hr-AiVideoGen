import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, Eyebrow, RM } from '../../lib/reviewkit';

export const compositionConfig = { id: 'QuoteNaveen', durationInSeconds: 27, fps: 30, width: 1920, height: 1080 };

const QuoteNaveen: React.FC = () => {
  const rise = useRise();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.accent} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 220px', textAlign: 'center', gap: 30 }}>
        <div style={rise(6, 18)}><Eyebrow color={RM.accent}>Naveen Jain · Founder</Eyebrow></div>
        <div style={{ ...rise(36, 9), fontSize: 48, fontStyle: 'italic', color: RM.text, lineHeight: 1.3, maxWidth: 900 }}>
          "It's going to completely eliminate smart homes — you're just going to think, and things will happen."
        </div>
        <div style={{ ...rise(120, 20), marginTop: 14, fontSize: 26, color: RM.muted }}>
          Brain-computer interfaces as universal controllers
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default QuoteNaveen;
