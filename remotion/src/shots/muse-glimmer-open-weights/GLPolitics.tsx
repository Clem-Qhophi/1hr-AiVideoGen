import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceBrowser } from '../../lib/evidence';
import { useDrift } from '../../lib/reviewkit';

// master 146-165 · "political statement" f0, "Kimi K3" f176. Zuck on X: US falling behind China in open weights.
export const compositionConfig = { id: 'GLPolitics', durationInSeconds: 19.0, fps: 30, width: 1920, height: 1080 };

const GLPolitics: React.FC = () => {
  const drift = useDrift(570);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY, ...drift }}>
      <EvidenceBrowser
        image="projects/muse-glimmer-open-weights/evidence/zuck-x-post-post.png"
        url="x.com/finkd/status/2086755195535413696"
        source="Mark Zuckerberg on X, Aug 10 2026"
        label="THE POLITICAL STATEMENT"
        appearAt={0}
        highlight={{ x: 33.3, y: 12.2, w: 26.6, h: 8.4, startFrame: 90 }}
      />
    </AbsoluteFill>
  );
};
export default GLPolitics;
