import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { VibeEvidenceBg } from '../../lib/vibes';
import { useRise, usePop, useSlam, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 44.97-63.36 (552f) · THE FEE + THE DEAL — the longest beat, revealed in stages.
// "first" f19 badge -> "funded," f84 -> $125 slam f189-205 -> then 3 stats: "ten" f288 (10-25K),
// "eighty" f417 (80%), "fourteen" f497 (14 days). backdrop: challenge.png again — SECOND real
// appearance of this screenshot, different section of the ad (per /make-ad density rule, repeat
// appearances across the ad count, they don't have to be unique images each beat).
const Stat: React.FC<{ big: string; sub: string; style: React.CSSProperties; color?: string }> = ({ big, sub, style, color = RM.text }) => (
  <div style={{ ...style, background: 'rgba(19,23,33,0.92)', border: `1px solid ${RM.line}`, borderRadius: 20, padding: '30px 22px', width: 400, textAlign: 'center' }}>
    <div style={{ fontFamily: FONT_HOOK, fontSize: 76, lineHeight: 0.95, color }}>{big}</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 24, letterSpacing: 2, color: RM.muted, textTransform: 'uppercase', marginTop: 12 }}>{sub}</div>
  </div>
);

export const compositionConfig = { id: 'PFDeal', durationInSeconds: 18.5, fps: 30, width: 1920, height: 1080 };

const PFDeal: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <VibeEvidenceBg vibe="fintech" image="projects/ad-propfunding/evidence/challenge.png" dim={0.71} frames={552} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
        <div style={{ ...pop(19), border: '2px solid #22c55e', borderRadius: 999, padding: '12px 34px', fontSize: 32, fontWeight: 700, letterSpacing: 3, color: '#22c55e' }}>
          FIRST 10% TO PASS
        </div>
        <div style={{ ...pop(84), fontSize: 50, fontWeight: 800, color: RM.text }}>you get funded</div>
        <div style={{ ...slam(189, 8), marginTop: 4, fontFamily: FONT_HOOK, fontSize: 168, lineHeight: 0.88, color: '#22c55e', textShadow: '0 12px 50px rgba(34,197,94,.35)' }}>$125</div>
        <div style={{ ...rise(230, 14), fontSize: 26, fontWeight: 600, letterSpacing: 3, color: RM.muted, textTransform: 'uppercase', marginBottom: 10 }}>
          one-time activation fee
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
          <Stat big="$10-25K" sub="on MT5" style={pop(288)} />
          <Stat big="80%" sub="yours to keep" style={pop(417)} color="#22c55e" />
          <Stat big="14 DAYS" sub="payout cycle" style={pop(497)} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default PFDeal;
