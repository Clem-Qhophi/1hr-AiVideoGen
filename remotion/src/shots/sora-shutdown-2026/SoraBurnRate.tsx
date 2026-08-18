import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 69.00-86.64 · the money gap. "roughly a million dollars a day" f101,
// "two days of burn" f426, "entire lifetime" f474.
export const compositionConfig = { id: 'SoraBurnRate', durationInSeconds: 17.64, fps: 30, width: 1920, height: 1080 };

const SoraBurnRate: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(529);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.red} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: '0 170px', textAlign: 'center' }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.red}>the money gap</Eyebrow></div>
        <div style={{ ...slam(101, 10), fontFamily: FONT_HOOK, fontSize: 96, color: RM.red, textShadow: `0 12px 50px ${RM.red}55` }}>
          $1,000,000 / DAY
        </div>
        <div style={{ ...rise(200, 16), fontSize: 30, color: RM.muted }}>
          to keep Sora running. Every single day, with nobody paying enough.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 30, marginTop: 12 }}>
          <div style={{ ...rise(330, 18), fontSize: 38, fontWeight: 700, color: RM.text }}>
            LIFETIME REVENUE
          </div>
          <div style={{ ...slam(380, 10), fontFamily: FONT_HOOK, fontSize: 84, color: RM.amber }}>
            $2.1M
          </div>
        </div>
        <div style={{ ...rise(426, 18), fontSize: 34, fontWeight: 800, color: RM.text }}>
          That is two days of burn.
        </div>
        <div style={{ ...rise(474, 18), fontSize: 28, color: RM.muted }}>
          Sora earned, in its entire lifetime, what OpenAI spent keeping it alive by Tuesday.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default SoraBurnRate;
