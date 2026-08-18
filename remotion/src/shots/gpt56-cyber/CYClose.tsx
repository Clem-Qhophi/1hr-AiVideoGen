import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 369.9-385.7 · close CTA + comment + rogue-agents cross-link.
// "what this channel is for" f33, "hit subscribe" f125, "prove you deserved it" f290,
// "rogue-agents deep dive is linked below" f420.
export const compositionConfig = { id: 'CYClose', durationInSeconds: 15.8, fps: 30, width: 1920, height: 1080 };

const CYClose: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(474);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '0 150px', textAlign: 'center' }}>
        <div style={rise(3, 12)}><Eyebrow color={RM.cyan}>For the community</Eyebrow></div>
        <div style={{ ...rise(30, 16), fontSize: 30, fontWeight: 500, color: RM.text, marginTop: 4 }}>
          We tracked this one the day it dropped &mdash; that&rsquo;s what this channel is for.
        </div>
        <div style={{ ...slam(120, 9), marginTop: 10, fontFamily: FONT_HOOK, fontSize: 72, color: RM.cyan, textShadow: `0 10px 44px ${RM.cyan}44` }}>
          SUBSCRIBE &mdash; DON&rsquo;T MISS THE NEXT RELEASE
        </div>
        <div style={{ ...rise(230, 16), fontSize: 28, fontWeight: 500, color: RM.muted, maxWidth: 1150, marginTop: 6 }}>
          Drop a comment: would you want a tool this sharp &mdash; if you had to prove you deserved it?
        </div>
        <div style={{ ...pop(420, 12), marginTop: 6, fontFamily: 'monospace', fontSize: 22, letterSpacing: 1.5, color: RM.amber, border: `1px solid ${RM.amber}55`, borderRadius: 999, padding: '14px 30px', background: RM.panel }}>
          WATCH &middot; the Hugging Face rogue-agents deep dive &mdash; linked below
        </div>
        <div style={{ ...rise(440, 16), marginTop: 8, fontSize: 28, fontWeight: 700, color: RM.text }}>
          GPT-5.6-CYBER &middot; Aug 10, 2026
        </div>
        <div style={{ ...rise(455, 16), fontSize: 26, color: RM.muted }}>
          See you in the next one.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default CYClose;
