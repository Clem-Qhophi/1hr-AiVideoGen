import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceFrame } from '../../lib/evidence';
import { useDrift } from '../../lib/reviewkit';

// master 165-183 · "context window" f56. HF card metadata: Context length 131,072+.
export const compositionConfig = { id: 'GLContextWin', durationInSeconds: 18.0, fps: 30, width: 1920, height: 1080 };

const GLContextWin: React.FC = () => {
  const drift = useDrift(540);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY, ...drift }}>
      <EvidenceFrame
        image="projects/muse-glimmer-open-weights/evidence/hf-context-window.png"
        source="Hugging Face model card, meta-models/Muse-Glimmer-30B"
        label="CONTEXT WINDOW"
        appearAt={0}
        highlight={{ x: 10.8, y: 67.7, w: 30.1, h: 9.7, startFrame: 80 }}
      />
    </AbsoluteFill>
  );
};
export default GLContextWin;
