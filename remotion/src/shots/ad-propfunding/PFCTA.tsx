import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { VibeEvidenceBg } from '../../lib/vibes';
import { useRise, usePop, useSlam, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 74.24-83.47 (277f) · CTA — the memorable line REPEATED verbatim from PFFlip (checklist #5).
// "pass" f120 / "first," f127 / "then" f149 / "pay." f156 -> slam. "nothing" f228 / "try." f245.
// backdrop: hero.png — closes the loop with the hook + flip for visual cohesion.
export const compositionConfig = { id: 'PFCTA', durationInSeconds: 9.3, fps: 30, width: 1920, height: 1080 };

const PFCTA: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <VibeEvidenceBg vibe="fintech" image="projects/ad-propfunding/evidence/hero.png" dim={0.68} frames={277} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 220px', textAlign: 'center' }}>
        <div style={{ ...rise(0, 20), fontSize: 40, fontWeight: 500, color: RM.muted, lineHeight: 1.3, maxWidth: 1300 }}>
          If you've been putting off a challenge because you didn't want to risk the fee,
        </div>
        <div style={{ ...slam(120, 8), fontFamily: FONT_HOOK, fontSize: 130, lineHeight: 0.95, color: RM.text }}>
          PASS FIRST. <span style={{ color: '#22c55e' }}>THEN PAY.</span>
        </div>
        <div style={{ ...rise(228, 18), fontSize: 38, fontWeight: 600, color: RM.muted, marginTop: 4 }}>
          this one costs you nothing to try
        </div>
        <div style={{ ...pop(245), marginTop: 16, background: '#22c55e', color: '#04120a', fontWeight: 800, fontSize: 46, padding: '20px 52px', borderRadius: 999, boxShadow: '0 18px 50px rgba(34,197,94,.4)' }}>
          propfunding.com
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default PFCTA;
