import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SSBg, SSLine, SSDrift, SS, VW, FONT_DISPLAY } from './sskit';

// master 9.45-17.10 (231f) · PROBLEM. Stamps land on their spoken words (ASR-synced); the felt
// cost closes the beat in red.
export const compositionConfig = { id: 'SSProblem', durationInSeconds: 7.7, fps: 30, width: 1080, height: 1920 };

const SSProblem: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
    <SSBg>
      <SSDrift frames={231}>
        <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40, padding: '0 70px', textAlign: 'center' }}>
          <SSLine text="LOOKS GREAT" start={12} size={92} />
          <SSLine text="FOR ONE WEEK" start={22} size={92} color={SS.accent} />
          <SSLine text="THE STRAP SNAPS" start={76} size={92} />
          <SSLine text="THE SOLE GOES FLAT" start={115} size={92} color={SS.accent} />
          <SSLine text="YOUR FEET PAY FOR IT." start={166} size={86} color={SS.red} style={{ marginTop: 16 }} />
        </AbsoluteFill>
      </SSDrift>
    </SSBg>
  </AbsoluteFill>
);
export default SSProblem;
