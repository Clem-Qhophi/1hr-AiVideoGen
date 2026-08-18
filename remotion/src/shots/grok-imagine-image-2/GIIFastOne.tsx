import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 61.79-69.10 · verdict HOOK LINE. "ranked second in the world is the fast one" f34,
// "the lightweight one" f99, "xAI calls Quality?" f159, "still at fourteen" f205.
export const compositionConfig = { id: 'GIIFastOne', durationInSeconds: 7.31, fps: 30, width: 1920, height: 1080 };

const GIIFastOne: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(219);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.amber} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 160px', textAlign: 'center' }}>
        <div style={{ ...rise(2, 16), fontSize: 30, fontWeight: 600, color: RM.text, maxWidth: 1300 }}>
          The model ranked second in the world
        </div>
        <div style={{ ...slam(34, 9), fontFamily: FONT_HOOK, fontSize: 130, lineHeight: 0.95, color: RM.cyan, textShadow: `0 12px 50px ${RM.cyan}44` }}>
          IS THE FAST ONE
        </div>
        <div style={{ ...rise(99, 16), fontSize: 30, fontWeight: 500, color: RM.muted }}>
          The lightweight one.
        </div>
        <div style={{ ...rise(159, 18), marginTop: 22, fontSize: 36, fontWeight: 700, color: RM.text, maxWidth: 1200 }}>
          The tier xAI literally calls Quality?
        </div>
        <div style={{ ...slam(205, 10), fontFamily: FONT_HOOK, fontSize: 92, color: RM.red, textShadow: `0 10px 44px ${RM.red}44` }}>
          It&rsquo;s still at #14
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GIIFastOne;
