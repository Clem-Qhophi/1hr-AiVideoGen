import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Arena3DBackdrop } from '../../lib/comparisonkit';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';

export const compositionConfig = {
  id: 'RichestVerdict',
  durationInSeconds: 30,
  fps: 30,
  width: 1920,
  height: 1080,
};

const RichestVerdict: React.FC = () => {
  const frame = useCurrentFrame();

  const enter = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp', easing: EASINGS.overshoot });
  const pulse = interpolate(frame, [15, 30, 45, 60], [1, 1.04, 1, 1.04], { extrapolateRight: 'wrap' });

  return (
    <AbsoluteFill>
      <Arena3DBackdrop primaryGlow={COLORS.accent} secondaryGlow={COLORS.accent2} accentTitle="THE COMPARISON ARENA" />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Main Victory Sign-Off */}
        <div
          style={{
            opacity: enter,
            fontFamily: FONT_DISPLAY,
            fontSize: 74,
            color: COLORS.ink,
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          AND THE NUMBERS HAVE <br />
          <span style={{ color: COLORS.accent, textShadow: `0 0 40px ${COLORS.accent}88` }}>SETTLED IT.</span>
        </div>

        {/* Subscribe & Next Matchup CTA Box */}
        <div
          style={{
            opacity: enter,
            transform: `scale(${pulse})`,
            marginTop: 40,
            background: `${COLORS.d900}f0`,
            border: `2px solid ${COLORS.accent}`,
            borderRadius: RADIUS.card,
            padding: '24px 50px',
            boxShadow: `0 0 50px ${COLORS.accent}55`,
            textAlign: 'center',
          }}
        >
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 36, color: COLORS.warn, letterSpacing: 2 }}>
            WHO SHOULD ENTER THE ARENA NEXT?
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 20, color: COLORS.muted, marginTop: 8 }}>
            Drop your vote in the comments & subscribe to The Comparison Arena!
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default RichestVerdict;
