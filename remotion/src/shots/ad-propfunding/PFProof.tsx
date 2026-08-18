import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { CLAMP } from '../../lib/kit';
import { EASINGS } from '../../brand';
import { GlowWash, Particles, Vignette, Grain } from '../../lib/atmosphere';
import { VIBES } from '../../lib/vibes';
import { useRise, useSlam, FONT_HOOK } from '../../lib/reviewkit';

// master 63.36-74.24 (326f) · PROOF — the framed evidence beat. Deliberately the BRIGHTEST beat in
// the ad: this is the primary "show don't tell" moment, so the leaderboard stays legible rather than
// being dimmed like the backdrop beats. Graded to the fintech vibe (navy-green, not flat black) and
// given the vibe's ambient atmosphere so it belongs to the same film as every other beat.
// "leaderboard," f98, "fast." f283.
const V = VIBES.fintech;
export const compositionConfig = { id: 'PFProof', durationInSeconds: 11.0, fps: 30, width: 1920, height: 1080 };

const PFProof: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const slam = useSlam();
  const zoom = interpolate(frame, [0, 330], [1.08, 1.17], { ...CLAMP, easing: EASINGS.easeInOut });
  return (
    <AbsoluteFill style={{ backgroundColor: V.bg[0], fontFamily: FONT_DISPLAY }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Img src={staticFile('projects/ad-propfunding/evidence/leaderboard.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>

      {/* grade toward the vibe's own background, not flat black — keeps it in the same film */}
      <AbsoluteFill style={{ background: 'linear-gradient(0deg, rgba(7,13,20,0.96) 10%, rgba(7,13,20,0.52) 46%, rgba(7,13,20,0.30) 100%)' }} />
      <GlowWash color={V.glow} opacity={0.14} y={12} />
      <Particles count={22} color="#9fe8bf" direction="drift" size={[1.5, 4]} opacity={0.28} seed={31} />

      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 110, gap: 18, textAlign: 'center' }}>
        <div style={{ ...rise(98, 18), fontSize: 42, fontWeight: 600, letterSpacing: 3, color: V.text, textShadow: '0 6px 24px rgba(0,0,0,.85)' }}>
          Real traders, climbing toward the funding zone
        </div>
        <div style={{ ...slam(283, 9), fontFamily: FONT_HOOK, fontSize: 116, lineHeight: 0.95, color: V.accent, textShadow: '0 10px 40px rgba(0,0,0,.75)' }}>
          SPOTS FILL UP FAST
        </div>
      </AbsoluteFill>

      <Vignette strength={0.55} />
      <Grain opacity={0.07} />
    </AbsoluteFill>
  );
};
export default PFProof;
