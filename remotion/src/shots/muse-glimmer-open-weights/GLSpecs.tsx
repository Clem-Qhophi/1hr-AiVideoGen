import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceFrame } from '../../lib/evidence';
import { useDrift } from '../../lib/reviewkit';

// master 80-87 · "chatbot vs agent" + headline number. HF model card: 30B, Apache 2.0, distilled from Spark.
export const compositionConfig = { id: 'GLSpecs', durationInSeconds: 7.0, fps: 30, width: 1920, height: 1080 };

const GLSpecs: React.FC = () => {
  const drift = useDrift(210);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY, ...drift }}>
      <EvidenceFrame
        image="projects/muse-glimmer-open-weights/evidence/hf-model-card-top.png"
        source="Hugging Face model card, meta-models/Muse-Glimmer-30B"
        label="THE MODEL CARD"
        appearAt={0}
        highlight={{ x: 10.4, y: 1.5, w: 15.6, h: 15.0, startFrame: 40 }}
      />
    </AbsoluteFill>
  );
};
export default GLSpecs;
