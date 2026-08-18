import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceFrame } from '../../lib/evidence';
import { useDrift } from '../../lib/reviewkit';

// master 205.00-215.54 · HLE row (Qwen 43.6 vs Fable5 53.3). Captured separately from the first
// benchmark-table screenshot, which only showed "HLE w/ tools" - a DIFFERENT row with different
// numbers; verified against the live page before use (see work/facts.json). "43.6" lands f126.
export const compositionConfig = { id: 'Q38EvidenceHLE', durationInSeconds: 10.54, fps: 30, width: 1920, height: 1080 };

const Q38EvidenceHLE: React.FC = () => {
  const drift = useDrift(316);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY, ...drift }}>
      <EvidenceFrame
        image="projects/qwen38-max-release/evidence/qwen-benchmark-table-hle.png"
        source="qwen.ai official blog, Aug 3 2026"
        label="HLE (EXPERT-LEVEL QUESTIONS)"
        appearAt={0}
        highlight={{ x: 40.95, y: 52.3, w: 27.45, h: 3.0, startFrame: 70 }}
      />
    </AbsoluteFill>
  );
};
export default Q38EvidenceHLE;
