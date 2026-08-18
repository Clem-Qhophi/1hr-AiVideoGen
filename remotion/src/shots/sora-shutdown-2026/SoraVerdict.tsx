import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 60.83-69.00 · verdict. "verdict, right now" f2, "catastrophic" f213.
export const compositionConfig = { id: 'SoraVerdict', durationInSeconds: 8.17, fps: 30, width: 1920, height: 1080 };

const SoraVerdict: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(245);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.red} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, padding: '0 170px', textAlign: 'center' }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.red}>THE VERDICT &middot; right now</Eyebrow></div>
        <div style={{ ...slam(213, 12), fontFamily: FONT_HOOK, fontSize: 150, color: RM.red, textShadow: `0 14px 60px ${RM.red}66`, textTransform: 'uppercase' }}>
          Catastrophic
        </div>
        <div style={{ ...rise(160, 18), fontSize: 32, fontWeight: 600, color: RM.muted, maxWidth: 1200 }}>
          We read the filings, the reports, and the reviews. Sora burned money every single day of its life.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default SoraVerdict;
