import React from 'react';
import { AbsoluteFill } from 'remotion';
import { MVBg, MVLine, MVEyebrow, MVDrift, FlyerCrop, MV, FONT_DISPLAY } from './mvkit';

// master 4.30-12.10 (234f) · LAND. The client's real plot-listing images (Dawhenya /
// Shai Hills flyers) anchored at the moment the VO names Dawhenya, then the true specs.
// VO: Full plots(5.33) at Dawhenya(6.02) view of the Shai Mountains(6.68)
// Eighty by eighty feet(9.15) roads cleared(10.35) boundaries marked(11.17).
export const compositionConfig = { id: 'MVLand', durationInSeconds: 7.8, fps: 30, width: 1080, height: 1920 };

const MVLand: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
    <MVBg>
      <MVDrift frames={234}>
        <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: '0 80px', textAlign: 'center' }}>
          <MVEyebrow style={{ marginTop: 6 }}>MAVIGA REAL ESTATE PRESENTS</MVEyebrow>
          <MVLine text="FULL PLOTS" start={26} size={104} />
          <MVLine text="AT DAWHENYA" start={48} size={104} color={MV.olive} />
          <div style={{ display: 'flex', flexDirection: 'row', gap: 24, alignItems: 'center', marginTop: 6 }}>
            <FlyerCrop name="plot-dawhenya.jpg" label="" start={56} width={300} />
            <FlyerCrop name="plot-shai-1.jpg" label="" start={68} width={300} />
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 600, color: MV.muted, letterSpacing: 1, marginTop: 4 }}>
            WITH A VIEW OF THE SHAI MOUNTAINS
          </div>
          <MVLine text="EIGHTY BY EIGHTY" start={118} size={84} />
          <MVLine text="ROADS CLEARED" start={152} size={72} />
          <MVLine text="BOUNDARIES MARKED" start={178} size={72} color={MV.olive} />
        </AbsoluteFill>
      </MVDrift>
    </MVBg>
  </AbsoluteFill>
);
export default MVLand;
