import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SSBg, SSLine, SSDrift, SS, VW, FONT_DISPLAY } from './sskit';

// master 17.10-25.40 (249f) · AGITATE. Lines land on their ASR word times: SAME PRICE (19.5s),
// SAME FALL-APART (20.7s), THAT'S A TAX ON YOUR FEET (24.5s -> f222).
export const compositionConfig = { id: 'SSAgitate', durationInSeconds: 8.3, fps: 30, width: 1080, height: 1920 };

const SSAgitate: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
    <SSBg>
      <SSDrift frames={249}>
        <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: '0 70px', textAlign: 'center' }}>
          <SSLine text="SAME PRICE." start={73} size={96} color={SS.red} />
          <SSLine text="SAME FALL-APART." start={107} size={96} color={SS.red} />
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, color: SS.muted, fontWeight: 600, marginTop: 10 }}>YOU KEEP BUYING THE SAME FAILURE</div>
          <SSLine text="THAT'S A TAX" start={162} size={128} />
          <SSLine text="ON YOUR FEET." start={222} size={128} color={SS.accent} />
        </AbsoluteFill>
      </SSDrift>
    </SSBg>
  </AbsoluteFill>
);
export default SSAgitate;
