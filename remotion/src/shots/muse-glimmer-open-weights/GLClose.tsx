import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 340-388 · "next one" f211. Close CTA + rogue-agents cross-link.
export const compositionConfig = { id: 'GLClose', durationInSeconds: 48.0, fps: 30, width: 1920, height: 1080 };

const GLClose: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(1440, 1.0, 1.035);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 160px', textAlign: 'center' }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.cyan}>For the community</Eyebrow></div>
        <div style={{ ...slam(30, 10), fontFamily: FONT_HOOK, fontSize: 76, lineHeight: 1, color: RM.text }}>
          SUBSCRIBE &mdash; DON&rsquo;T MISS SPARK 1.2
        </div>
        <div style={{ ...rise(140, 18), fontSize: 28, fontWeight: 500, color: RM.muted, maxWidth: 1000 }}>
          We tracked this one the day it dropped. The weights land on this channel first.
        </div>
        <div style={{ ...rise(260, 18), fontSize: 26, color: RM.text }}>
          Drop a comment: is this enough to bring you back to Meta&rsquo;s open models?
        </div>
        <div style={{ ...rise(420, 20), fontFamily: 'monospace', fontSize: 24, color: RM.amber, border: `1px solid ${RM.amber}44`, borderRadius: 999, padding: '14px 30px' }}>
          WATCH: our rogue-agents deep dive &mdash; the security side of open weights
        </div>
        <div style={{ ...rise(600, 18), fontSize: 30, fontWeight: 700, color: RM.text }}>
          MUSE GLIMMER &mdash; open weights, Aug 10 2026.
        </div>
        <div style={{ ...rise(700, 18), fontSize: 26, color: RM.muted }}>
          See you in the next one.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GLClose;
