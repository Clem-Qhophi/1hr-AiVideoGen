import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 226.12-233.35 · evidence-3: the jump. "Twelve places in one release" f33,
// "previous quality model sat at fourteen" f94, "new one opens at two" f181.
export const compositionConfig = { id: 'GIIJump', durationInSeconds: 7.23, fps: 30, width: 1920, height: 1080 };

const GIIJump: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(217);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.red} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 160px', textAlign: 'center' }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.red}>Now watch the jump</Eyebrow></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginTop: 8 }}>
          <div style={{ ...slam(94, 10), fontFamily: FONT_HOOK, fontSize: 130, color: RM.muted, textDecoration: 'line-through', textDecorationColor: RM.red, textDecorationThickness: 10 }}>
            #14
          </div>
          <div style={{ ...slam(60, 9), fontFamily: FONT_HOOK, fontSize: 90, color: RM.text }}>→</div>
          <div style={{ ...slam(181, 10), fontFamily: FONT_HOOK, fontSize: 170, lineHeight: 0.9, color: RM.cyan, textShadow: `0 14px 55px ${RM.cyan}44` }}>
            #2
          </div>
        </div>
        <div style={{ ...rise(33, 16), fontSize: 36, fontWeight: 700, color: RM.red, marginTop: 14 }}>
          TWELVE PLACES. ONE RELEASE.
        </div>
        <div style={{ ...rise(160, 16), fontSize: 28, color: RM.muted }}>
          The old quality model sat at #14. The new one opens at #2.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GIIJump;
