import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { VibeEvidenceBg } from '../../lib/vibes';
import { useRise, usePop, useSlam, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 22.32-35.37 (391f) · THE FLIP — explicit differentiation (/make-ad checklist #4) +
// the memorable line, slammed here and repeated verbatim at PFCTA (checklist #5).
// "PropFunding" f111 / "flips" f132 -> differentiation card. "Pass" f288 / "first." f300 /
// "Then" f344 / "pay." f353 -> the tagline slam. backdrop: hero.png (ties back to the hook).
export const compositionConfig = { id: 'PFFlip', durationInSeconds: 13.1, fps: 30, width: 1920, height: 1080 };

const PFFlip: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <VibeEvidenceBg vibe="fintech" image="projects/ad-propfunding/evidence/hero.png" dim={0.66} frames={391} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
        <div style={{ ...rise(0, 18), fontSize: 38, fontWeight: 500, color: RM.muted, maxWidth: 1200 }}>
          Most firms make you pay to find out if you're good enough.
        </div>
        <div style={{ ...pop(111), marginTop: 6, marginBottom: 10, background: 'rgba(19,23,33,0.92)', border: '1px solid #22c55e66', borderRadius: 16, padding: '18px 40px', fontSize: 34, fontWeight: 700, color: RM.text }}>
          <span style={{ color: '#22c55e' }}>PropFunding</span> flips that.
        </div>
        <div style={{ ...slam(288, 8), fontFamily: FONT_HOOK, fontSize: 148, lineHeight: 0.95, color: '#22c55e' }}>PASS FIRST.</div>
        <div style={{ ...slam(344, 8), fontFamily: FONT_HOOK, fontSize: 148, lineHeight: 0.95, color: RM.text }}>THEN PAY.</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default PFFlip;
