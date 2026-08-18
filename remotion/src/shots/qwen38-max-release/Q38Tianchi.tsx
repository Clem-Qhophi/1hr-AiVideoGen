import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 89.23-109.52 · Tianchi contest. "526 teams" f67, "24 hours" f284, "458/526" f346, "87%" f460.
export const compositionConfig = { id: 'Q38Tianchi', durationInSeconds: 20.29, fps: 30, width: 1920, height: 1080 };

const Q38Tianchi: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(609);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.cyan}>WWW2025 Tianchi challenge &middot; live contest</Eyebrow></div>
        <div style={{ ...rise(30, 18), fontSize: 30, fontWeight: 500, color: RM.text, textAlign: 'center', maxWidth: 1100 }}>
          <span style={pop(67) as React.CSSProperties}>526 human teams</span> competing &mdash; reading chats and screenshots to spot customer intent
        </div>
        <div style={{ ...pop(284), marginTop: 8, fontFamily: 'monospace', fontSize: 22, color: RM.amber, background: RM.panel, border: `1px solid ${RM.amber}44`, borderRadius: 999, padding: '10px 26px' }}>
          Qwen: 24 HOURS, ENTIRELY SOLO
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, marginTop: 22 }}>
          <div style={{ ...pop(346), fontFamily: FONT_HOOK, fontSize: 60, color: RM.text }}>458 / 526</div>
          <div style={{ ...rise(370, 14), fontSize: 22, color: RM.muted, fontFamily: 'monospace' }}>teams beaten</div>
        </div>
        <div style={{ ...slam(460, 9), marginTop: 6, display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontFamily: FONT_HOOK, fontSize: 128, color: RM.green, textShadow: `0 10px 44px ${RM.green}44` }}>87</span>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 72, color: RM.green, marginLeft: 6 }}>%</span>
        </div>
        <div style={{ ...rise(510, 16), fontSize: 22, color: RM.muted }}>of the field &mdash; solo, under a deadline, on a task it wasn&rsquo;t built for</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default Q38Tianchi;
