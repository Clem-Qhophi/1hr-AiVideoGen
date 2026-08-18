import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 301.68-316.64 · honest-2: the burn number. "straight with you" f22, "estimates" f82,
// "several times higher" f253, "reported number, not a bank statement" f381.
export const compositionConfig = { id: 'SoraHonest2', durationInSeconds: 14.96, fps: 30, width: 1920, height: 1080 };

const SoraHonest2: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(449);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.amber} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, padding: '0 170px', textAlign: 'center' }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.amber}>BEING STRAIGHT WITH YOU</Eyebrow></div>
        <div style={{ ...rise(22, 18), fontSize: 36, fontWeight: 700, color: RM.text }}>
          Let&apos;s be straight with you about the number.
        </div>
        <div style={{ ...rise(82, 18), fontSize: 32, color: RM.muted, maxWidth: 1250 }}>
          Public estimates of the burn disagree, sometimes by several times.
        </div>
        <div style={{ ...slam(253, 10), fontFamily: FONT_HOOK, fontSize: 66, color: RM.amber, maxWidth: 1250 }}>
          $1M a day is a reported number, not a bank statement.
        </div>
        <div style={{ ...rise(381, 18), fontSize: 30, color: RM.muted, maxWidth: 1250 }}>
          However you slice it, the conclusion holds: revenue was nowhere near the cost.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default SoraHonest2;
