import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SSBg, SSEyebrow, SSDrift, SSPill, ProductSlot, PHOTOS, SS, VW, FONT_DISPLAY } from './sskit';

// master 35.20-42.00 (204f) · HOW. The comfort stack pops with the spoken lines (ASR-synced:
// soft 37.7s, firm 39.8s, last 41.5s); a lifestyle slot strip sits below.
export const compositionConfig = { id: 'SSHow', durationInSeconds: 6.8, fps: 30, width: 1080, height: 1920 };

const SSHow: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
    <SSBg>
      <SSDrift frames={204}>
        <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40, padding: '0 70px', textAlign: 'center' }}>
          <SSEyebrow>STEP IN AND FEEL IT</SSEyebrow>
          <SSPill start={75} style={{ maxWidth: 860 }}>SOFT WHERE IT <span style={{ color: SS.accent }}>SHOULD BE SOFT</span></SSPill>
          <SSPill start={139} style={{ maxWidth: 860 }}>FIRM WHERE YOU <span style={{ color: SS.accent2 }}>NEED SUPPORT</span></SSPill>
          <SSPill start={189} style={{ maxWidth: 860 }}>BUILT TO <span style={{ color: SS.red }}>LAST</span></SSPill>
        </AbsoluteFill>
        <AbsoluteFill style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', padding: '0 120px 90px' }}>
          <div style={{ width: 620, height: 300 }}>
            <ProductSlot name="lifestyle" label="LIFESTYLE PHOTO — WORN" />
          </div>
        </AbsoluteFill>
      </SSDrift>
    </SSBg>
  </AbsoluteFill>
);
export default SSHow;
