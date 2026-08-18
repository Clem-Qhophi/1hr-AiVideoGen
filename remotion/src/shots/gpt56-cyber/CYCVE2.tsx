import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceBrowser } from '../../lib/evidence';
import { useDrift } from '../../lib/reviewkit';

// master 229.4-255.0 · the Chrome finding, independently checkable on NVD.
// "NVD, the US government vulnerability database" f120, "CVE-2026-15903" f304, "bound check skip" f322,
// "fixed it" f571, "watching this on" f760.
export const compositionConfig = { id: 'CYCVE2', durationInSeconds: 25.6, fps: 30, width: 1920, height: 1080 };

const CYCVE2: React.FC = () => {
  const drift = useDrift(768, 1.0, 1.04);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY, ...drift }}>
      <EvidenceBrowser
        image="projects/gpt56-cyber/evidence/cve-2026-15903-v8.png"
        url="nvd.nist.gov/vuln/detail/CVE-2026-15903"
        source="NVD &middot; US government, Aug 2026"
        label="INDEPENDENTLY CHECKABLE"
        appearAt={0}
        scale={0.86}
      />
    </AbsoluteFill>
  );
};
export default CYCVE2;
