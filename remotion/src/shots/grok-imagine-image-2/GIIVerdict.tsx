import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 163.43-176.10 · verdict-7: the verdict. "#2 in the world" f41, "editing that behaves like
// a design tool" f93, "live today in the Grok apps" f166, "the catch: fast variant, not flagship"
// f226-301, "board is barely a day old" f337.
export const compositionConfig = { id: 'GIIVerdict', durationInSeconds: 12.67, fps: 30, width: 1920, height: 1080 };

const GIIVerdict: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(380);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.green} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 170px', textAlign: 'center' }}>
        <div style={rise(4, 16)}><Eyebrow color={RM.green}>The verdict</Eyebrow></div>
        <div style={{ ...slam(41, 9), fontFamily: FONT_HOOK, fontSize: 104, color: RM.green, textShadow: `0 12px 50px ${RM.green}44` }}>
          NUMBER TWO IN THE WORLD
        </div>
        <div style={{ ...rise(93, 16), fontSize: 30, fontWeight: 600, color: RM.text, maxWidth: 1200 }}>
          With editing that behaves like a design tool. Live today in the Grok apps.
        </div>
        <div style={{ ...rise(226, 18), marginTop: 26, fontSize: 32, fontWeight: 700, color: RM.amber, maxWidth: 1200 }}>
          And the catch: the score on top belongs to the fast variant, not the flagship.
        </div>
        <div style={{ ...rise(337, 18), fontSize: 30, color: RM.muted }}>
          And the board is barely a day old.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GIIVerdict;
