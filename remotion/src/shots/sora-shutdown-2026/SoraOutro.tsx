import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 396.43-416.00 · outro/endcard. "while the deadline still matters" f26,
// "verdict lands here first" f182, "two-million-versus-two-days" f306,
// "MiniMax, ByteDance, or Google" f485, "next one" f569.
export const compositionConfig = { id: 'SoraOutro', durationInSeconds: 19.57, fps: 30, width: 1920, height: 1080 };

const SoraOutro: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(587);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 170px', textAlign: 'center' }}>
        <div style={rise(2, 14)}><Eyebrow color={RM.cyan}>AI UNDER 3 MIN</Eyebrow></div>
        <div style={{ ...rise(26, 18), fontFamily: FONT_HOOK, fontSize: 62, color: RM.text, maxWidth: 1300 }}>
          The deadline still matters. Act on it while it does.
        </div>
        <div style={{ ...rise(182, 18), fontSize: 32, color: RM.muted, maxWidth: 1300 }}>
          Every AI news verdict lands here first. Two-million-versus-two-days? That&apos;s the pattern to watch.
        </div>
        <div style={{ display: 'flex', gap: 30, alignItems: 'center', marginTop: 12 }}>
          <div style={{ ...slam(280, 10), fontFamily: FONT_HOOK, fontSize: 44, color: RM.cyan, border: `2px solid ${RM.cyan}66`, borderRadius: 999, padding: '14px 44px' }}>
            SUBSCRIBE
          </div>
          <div style={{ ...rise(380, 16), fontSize: 30, color: RM.muted }}>
            Like if this helped. Comment your call.
          </div>
        </div>
        <div style={{ ...rise(485, 18), fontSize: 28, color: RM.muted, maxWidth: 1300 }}>
          Next: who wins the market - MiniMax, ByteDance, or Google?
        </div>
        <div style={{ ...slam(569, 10), fontSize: 26, color: RM.green }}>
          See you on the next one.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default SoraOutro;
