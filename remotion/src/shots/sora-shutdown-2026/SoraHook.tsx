import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, usePop, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 0.00-18.00 · cold-open-claim. "six weeks" f6, "deleting your clips" f230,
// "$1M a day" f383, "made back $2.1M. Total." f450.
export const compositionConfig = { id: 'SoraHook', durationInSeconds: 18.0, fps: 30, width: 1920, height: 1080 };

const SoraHook: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const pop = usePop();
  const drift = useDrift(540);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 160px', textAlign: 'center' }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.cyan}>OpenAI &middot; countdown running</Eyebrow></div>
        <div style={{ ...slam(6, 9), fontFamily: FONT_HOOK, fontSize: 112, lineHeight: 0.98, color: RM.text }}>
          SORA DIES IN 6 WEEKS
        </div>
        <div style={{ ...rise(230, 18), fontSize: 40, fontWeight: 700, color: RM.red, maxWidth: 1300 }}>
          OpenAI is deleting your clips.
        </div>
        <div style={{ ...pop(383, 12), marginTop: 14, fontFamily: FONT_HOOK, fontSize: 120, color: RM.cyan, textShadow: `0 12px 50px ${RM.cyan}44` }}>
          $1,000,000 / DAY
        </div>
        <div style={{ ...rise(450, 18), fontSize: 32, fontWeight: 600, color: RM.muted, maxWidth: 1200 }}>
          It made back $2.1 million. Total. In its whole life.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default SoraHook;
