import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SSBg, SSLine, SSEyebrow, SSDrift, SSPill, ProductSlot, ColorwayStrip, PHOTOS, SS, VW, FONT_DISPLAY } from './sskit';

// master 25.40-35.20 (294f) · FLIP. Product hero (real photo) + colorway strip + sizes.
// VO: Softstep (25.5s), Cushioned foam (27.2s).
export const compositionConfig = { id: 'SSFlip', durationInSeconds: 9.8, fps: 30, width: 1080, height: 1920 };

const SSFlip: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
    <SSBg>
      <SSDrift frames={294}>
        <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', padding: '90px 70px 0', textAlign: 'center' }}>
          <div style={{ width: '78%', height: 680 }}>
            <ProductSlot name={PHOTOS.hero} label="PRODUCT HERO" />
          </div>
          <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 22, padding: '0 70px 60px' }}>
            <SSEyebrow>THE FLIP</SSEyebrow>
            <SSLine text="SOFTSTEP IS DIFFERENT." start={10} size={100} color={SS.accent} />
            <SSPill start={54} style={{ maxWidth: 840 }}>CUSHIONED FOAM THAT KEEPS ITS SHAPE</SSPill>
            <SSPill start={80} accent={SS.accent2} style={{ maxWidth: 680, fontSize: 48 }}>SIZES 38 – 46</SSPill>
            <ColorwayStrip delay={100} />
          </AbsoluteFill>
        </AbsoluteFill>
      </SSDrift>
    </SSBg>
  </AbsoluteFill>
);
export default SSFlip;
