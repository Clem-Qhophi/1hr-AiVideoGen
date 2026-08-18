import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceFrame } from '../../lib/evidence';
import { useDrift } from '../../lib/reviewkit';

// master 192.81-205.00 · "Back to the scoreboard" - SWE-bench Pro (Qwen loses to both Opus4.8 and Fable5).
// "67.7" lands f159, highlight f100.
export const compositionConfig = { id: 'Q38EvidenceSWEBench', durationInSeconds: 12.19, fps: 30, width: 1920, height: 1080 };

const Q38EvidenceSWEBench: React.FC = () => {
  const drift = useDrift(366);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY, ...drift }}>
      <EvidenceFrame
        image="projects/qwen38-max-release/evidence/qwen-benchmark-table.png"
        source="qwen.ai official blog, Aug 3 2026"
        label="SWE-BENCH PRO"
        appearAt={0}
        highlight={{ x: 40.95, y: 23.7, w: 27.45, h: 2.9, startFrame: 100 }}
      />
    </AbsoluteFill>
  );
};
export default Q38EvidenceSWEBench;
