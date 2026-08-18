import React from 'react';
import { AbsoluteFill } from 'remotion';
import { MVBg, MVDrift, FlyerCrop, MVLine, MV, FONT_HOOK, FONT_DISPLAY } from './mvkit';
import { useSlam } from '../../lib/reviewkit';

// master 24.00-26.70 (81f) · SCARCITY. '20 plots left' with the flyer's own scarcity
// crop. VO: Only(24.62) twenty(24.85) plots left(25.19).
export const compositionConfig = { id: 'MVScarcity', durationInSeconds: 2.7, fps: 30, width: 1080, height: 1920 };

const MVScarcity: React.FC = () => {
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <MVBg>
        <MVDrift frames={81} to={1.02}>
          <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '0 70px', textAlign: 'center' }}>
            <div style={{ fontFamily: FONT_HOOK, fontSize: 190, color: MV.olive, lineHeight: 0.95, ...slam(14) }}>20</div>
            <MVLine text="PLOTS LEFT" start={28} size={94} />
            <MVLine text="ONLY" start={42} size={52} color={MV.olive} />
            <FlyerCrop name="scarcity.png" label="AS ADVERTISED BY MAVIGA" start={46} width={280} />
          </AbsoluteFill>
        </MVDrift>
      </MVBg>
    </AbsoluteFill>
  );
};
export default MVScarcity;
