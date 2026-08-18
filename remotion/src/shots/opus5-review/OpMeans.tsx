import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 80.12-89.29 · what it means. "production" f258.
export const compositionConfig = { id: 'OpMeans', durationInSeconds: 9.3, fps: 30, width: 1920, height: 1080 };

const OpMeans: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, padding: '0 220px', textAlign: 'center' }}>
        <div style={{ ...rise(8, 20), fontSize: 52, fontWeight: 600, color: RM.text, lineHeight: 1.25, maxWidth: 1400 }}>
          It changes what you can afford to automate.
        </div>
        <div style={{ ...rise(120, 18), fontSize: 40, fontWeight: 500, color: RM.muted, lineHeight: 1.35, maxWidth: 1300 }}>
          Agent work that was too expensive to run at frontier quality
        </div>
        <div style={{ ...slam(258, 9), fontFamily: FONT_HOOK, fontSize: 104, lineHeight: 0.98, color: RM.cyan }}>
          IS NOW PRODUCTION-CHEAP
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default OpMeans;
