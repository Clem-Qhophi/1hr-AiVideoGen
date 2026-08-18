import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 47.59-60.83 · context-3. "Disney signed on" f27, "One billion dollars" f60,
// "gets turned off" f366.
export const compositionConfig = { id: 'SoraDisney', durationInSeconds: 13.24, fps: 30, width: 1920, height: 1080 };

const SoraDisney: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(397);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.amber} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 170px', textAlign: 'center' }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.amber}>Dec 2025 &middot; the high-water mark</Eyebrow></div>
        <div style={{ ...rise(27, 18), fontSize: 34, fontWeight: 600, color: RM.text }}>
          Disney signed on.
        </div>
        <div style={{ display: 'flex', gap: 40, alignItems: 'baseline', marginTop: 8 }}>
          <div style={{ ...slam(60, 10), fontFamily: FONT_HOOK, fontSize: 110, color: RM.amber, textShadow: `0 10px 44px ${RM.amber}44` }}>
            $1,000,000,000
          </div>
          <div style={{ ...rise(120, 16), fontSize: 44, fontWeight: 700, color: RM.text }}>
            200 characters
          </div>
        </div>
        <div style={{ ...rise(200, 18), fontSize: 30, color: RM.muted }}>
          Then it all collapsed.
        </div>
        <div style={{ ...rise(320, 18), fontSize: 30, fontWeight: 600, color: RM.muted }}>
          The date you need: September 24. The developer access gets turned off.
        </div>
        <div style={{ ...rise(366, 18), fontSize: 40, fontWeight: 800, color: RM.red }}>
          SEPTEMBER 24, 2026
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default SoraDisney;
