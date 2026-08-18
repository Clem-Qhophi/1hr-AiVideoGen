import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { VibeEvidenceBg } from '../../lib/vibes';
import { usePop, RM } from '../../lib/reviewkit';

// master 35.37-44.97 (288f) · HOW IT WORKS. "free." f41, "simulated" f192, "target." f250.
// backdrop: features.png (real pillar cards — no upfront fee / 80% / copy / arena).
const Step: React.FC<{ n: string; head: string; sub: string; style: React.CSSProperties }> = ({ n, head, sub, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 30, background: 'rgba(19,23,33,0.92)', border: `1px solid ${RM.line}`, borderRadius: 18, padding: '24px 42px', width: 960 }}>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: '#04120a', background: '#22c55e', borderRadius: 999, width: 66, height: 66, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
    <div style={{ textAlign: 'left' }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 46, color: RM.text }}>{head}</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 28, color: RM.muted, marginTop: 4 }}>{sub}</div>
    </div>
  </div>
);

export const compositionConfig = { id: 'PFHow', durationInSeconds: 9.7, fps: 30, width: 1920, height: 1080 };

const PFHow: React.FC = () => {
  const pop = usePop();
  return (
    <AbsoluteFill>
      <VibeEvidenceBg vibe="fintech" image="projects/ad-propfunding/evidence/features.png" dim={0.70} frames={288} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
        <Step n="1" head="Start for free" sub="no card, nothing up front" style={pop(41)} />
        <Step n="2" head="Trade a simulated account" sub="MT5, 1:30 leverage" style={pop(192)} />
        <Step n="3" head="Hit the target" sub="$1,000 profit target" style={pop(250)} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default PFHow;
