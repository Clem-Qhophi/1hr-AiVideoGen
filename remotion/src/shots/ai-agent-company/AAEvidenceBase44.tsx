import React from 'react';
import { AbsoluteFill } from 'remotion';
import { EvidenceBrowser } from '../../lib/evidence';

export const compositionConfig = { id: 'AAEvidenceBase44', durationInSeconds: 35, fps: 30, width: 1920, height: 1080 };

const AAEvidenceBase44: React.FC = () => (
  <AbsoluteFill>
    <EvidenceBrowser
      image="projects/ai-agent-company/evidence/base44.png"
      url="www.joelonsoftware.com/2026/06/29/how-base44-was-built..."
      source="Base44 - Built Without Engineers, Sold to Wix for $80M"
      label="BASE44: $80M ACQUISITION"
      appearAt={0}
      scale={1}
    />
  </AbsoluteFill>
);
export default AAEvidenceBase44;
