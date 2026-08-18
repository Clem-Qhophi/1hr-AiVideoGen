import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { VibeEvidenceBg } from '../../lib/vibes';
import { usePop, useSlam, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 11.44-22.32 (326f) · AGITATE. pass f36 / fail f103 / "either way, win or lose" f240-281.
// backdrop: leaderboard.png — the real cohort, grounding "the firm gets paid either way" in the
// real product (this is where people actually pay/fail/retry).
const Row: React.FC<{ tag: string; tagColor: string; text: string; style: React.CSSProperties }> = ({ tag, tagColor, text, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 26, background: 'rgba(19,23,33,0.92)', border: `1px solid ${RM.line}`, borderRadius: 16, padding: '20px 36px', width: 940 }}>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 34, letterSpacing: 2, color: tagColor, width: 150 }}>{tag}</div>
    <div style={{ fontSize: 40, color: RM.muted }}>→</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: RM.text }}>{text}</div>
  </div>
);

export const compositionConfig = { id: 'PFAgitate', durationInSeconds: 10.9, fps: 30, width: 1920, height: 1080 };

const PFAgitate: React.FC = () => {
  const pop = usePop();
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <VibeEvidenceBg vibe="fintech" image="projects/ad-propfunding/evidence/leaderboard.png" dim={0.68} frames={326} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <Row tag="YOU PASS" tagColor="#22c55e" text="you already paid" style={pop(36)} />
        <Row tag="YOU FAIL" tagColor={RM.red} text="you pay again to retry" style={pop(103)} />
        <div style={{ ...slam(240, 9), marginTop: 26, fontFamily: FONT_HOOK, fontSize: 100, lineHeight: 0.95, color: RM.red, textShadow: '0 10px 40px rgba(0,0,0,.6)' }}>
          WIN OR LOSE, THEY WIN
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default PFAgitate;
