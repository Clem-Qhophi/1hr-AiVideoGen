import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 0.00-23.85 · cold-open-claim. "Grok Imagine Image 2.0" f152, "#2 in the world" f229,
// catch f350, "isn't the one xAI calls Quality" f415, cost f533, "a day old" f627, "read it wrong" f696.
export const compositionConfig = { id: 'GIIHook', durationInSeconds: 23.85, fps: 30, width: 1920, height: 1080 };

const GIIHook: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(716);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '0 140px', textAlign: 'center' }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.cyan}>xAI &middot; Aug 7, 2026</Eyebrow></div>
        <div style={{ ...rise(120, 18), fontSize: 30, fontWeight: 500, color: RM.muted }}>
          xAI just shipped
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 30 }}>
          <div style={{ ...slam(152, 10), fontFamily: FONT_HOOK, fontSize: 108, lineHeight: 0.95, color: RM.text }}>
            Grok Imagine 2.0
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
          <div style={{ ...slam(229, 9), fontFamily: FONT_HOOK, fontSize: 118, lineHeight: 0.95, color: RM.cyan, textShadow: `0 10px 44px ${RM.cyan}44` }}>
            #2 IN THE WORLD
          </div>
        </div>
        <div style={{ ...rise(275, 16), fontSize: 28, color: RM.muted }}>
          on both leaderboards. That&rsquo;s the headline.
        </div>
        <div style={{ ...rise(350, 18), marginTop: 22, fontSize: 36, fontWeight: 700, color: RM.text, maxWidth: 1150 }}>
          But the catch nobody&rsquo;s reporting?
        </div>
        <div style={{ ...rise(415, 18), fontSize: 32, fontWeight: 600, color: RM.amber, maxWidth: 1200 }}>
          The model ranked second isn&rsquo;t the one xAI calls Quality.
        </div>
        <div style={{ ...rise(533, 20), marginTop: 18, fontSize: 28, color: RM.muted, maxWidth: 1100 }}>
          When you pay for your next image tool, the scoreboard you read is a day old.
        </div>
        <div style={{ ...rise(677, 18), fontSize: 34, fontWeight: 700, color: RM.red }}>
          Most people will read it wrong.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GIIHook;
