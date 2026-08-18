import React from 'react';
import { AbsoluteFill } from 'remotion';
import { MVBg, MVDrift, MVRoute, MVEyebrow, MV, FONT_DISPLAY, MVLine, FlyerCrop } from './mvkit';

// master 20.10-24.00 (117f) · LOCATION. The client's own directions as a route
// schematic (labels are Maviga's words, not a fake map), with the plot-listing flyer
// as the "we go through Dawhenya" anchor. VO: After(20.92) Central University(21.12)
// four minutes(22.45) turn left(23.18).
export const compositionConfig = { id: 'MVLocation', durationInSeconds: 3.9, fps: 30, width: 1080, height: 1920 };

const MVLocation: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
    <MVBg>
      <MVDrift frames={117} to={1.03}>
        <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 40px', textAlign: 'center' }}>
          <MVEyebrow>EASY TO FIND</MVEyebrow>
          <MVLine text="AFTER CENTRAL UNIVERSITY" start={12} size={72} />
          <div style={{ marginTop: 4 }}>
            <MVRoute start={38} />
          </div>
          <FlyerCrop name="plot-shai-1.jpg" label="WE GO THROUGH DAWHENYA" start={72} width={330} />
        </AbsoluteFill>
      </MVDrift>
    </MVBg>
  </AbsoluteFill>
);
export default MVLocation;
