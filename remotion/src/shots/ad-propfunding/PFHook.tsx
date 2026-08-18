import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { VibeEvidenceBg } from '../../lib/vibes';
import { RM, FONT_HOOK, Eyebrow } from '../../lib/reviewkit';

// master 0.00-4.48 (134f) · HOOK. Multimodal: text visible from frame 0 (works muted/autoplay —
// per /make-ad checklist #1). backdrop: hero.png (real "Pass First, Then Pay!" page).
export const compositionConfig = { id: 'PFHook', durationInSeconds: 4.6, fps: 30, width: 1920, height: 1080 };

const PFHook: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
    <VibeEvidenceBg vibe="fintech" image="projects/ad-propfunding/evidence/hero.png" dim={0.67} frames={134} />
    <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 200px', textAlign: 'center' }}>
      <Eyebrow color="#22c55e">PROP TRADING</Eyebrow>
      <div style={{ fontFamily: FONT_HOOK, fontSize: 96, lineHeight: 0.98, color: RM.text, textShadow: '0 8px 40px rgba(0,0,0,.6)' }}>
        THE PART THEY DON'T TELL YOU
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
export default PFHook;
