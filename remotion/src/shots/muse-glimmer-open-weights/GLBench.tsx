import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceFrame } from '../../lib/evidence';
import { useDrift } from '../../lib/reviewkit';

// master 117-137 · MCP Atlas 75.5 v 54/62 f198/264, DeepSearch 74.6 f384, SWE-Bench Pro 51.2 f486, AIME 94.7 f540.
export const compositionConfig = { id: 'GLBench', durationInSeconds: 20.0, fps: 30, width: 1920, height: 1080 };

const GLBench: React.FC = () => {
  const drift = useDrift(600);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY, ...drift }}>
      <EvidenceFrame
        image="projects/muse-glimmer-open-weights/evidence/meta-bench-capabilities.png"
        source="Meta AI Research blog, Aug 10 2026"
        label="META&rsquo;S OWN BENCHMARK BEATS"
        appearAt={0}
        highlight={{ x: 16.8, y: 29.0, w: 78.8, h: 3.6, startFrame: 180 }}
      />
    </AbsoluteFill>
  );
};
export default GLBench;
