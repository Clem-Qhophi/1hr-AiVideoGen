import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, staticFile } from 'remotion';
import { Arena3DBackdrop, SpeedometerGauge } from '../../lib/comparisonkit';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';

export const compositionConfig = {
  id: 'SpeedHook',
  durationInSeconds: 18,
  fps: 30,
  width: 1920,
  height: 1080,
};

const SpeedHook: React.FC = () => {
  const frame = useCurrentFrame();

  const titleRise = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp', easing: EASINGS.overshoot });
  const titleY = interpolate(frame, [0, 14], [40, 0], { extrapolateRight: 'clamp', easing: EASINGS.overshoot });

  const pulse = interpolate(frame, [15, 30, 45, 60], [1, 1.05, 1, 1.05], { extrapolateRight: 'wrap' });
  const subRise = interpolate(frame, [15, 25], [0, 1], { extrapolateRight: 'clamp', easing: EASINGS.easeOut });

  return (
    <AbsoluteFill>
      <Arena3DBackdrop
        primaryGlow={COLORS.accent2}
        secondaryGlow={COLORS.danger}
        accentTitle="THE COMPARISON ARENA"
        videoSrc={staticFile('projects/fastest-things-universe-ladder/002-galaxy-cluster-expanding-universe-nebula-0.mp4')}
        videoOpacity={0.5}
      />

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Category Tag */}
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 22,
            color: COLORS.accent2,
            letterSpacing: 6,
            textTransform: 'uppercase',
            marginBottom: 20,
            opacity: titleRise,
          }}
        >
          VELOCITY & COSMIC SCALE
        </div>

        {/* Big Impact Title */}
        <div
          style={{
            opacity: titleRise,
            transform: `translateY(${titleY}px)`,
            fontFamily: FONT_DISPLAY,
            fontSize: 100,
            color: COLORS.ink,
            textAlign: 'center',
            lineHeight: 1.0,
            textShadow: `0 0 50px ${COLORS.accent2}44`,
          }}
        >
          FASTEST THINGS <br />
          <span style={{ color: COLORS.accent, textShadow: `0 0 40px ${COLORS.accent}88` }}>IN THE UNIVERSE</span>
        </div>

        {/* Level 1 to Level 10 Roadmap Banner */}
        <div
          style={{
            opacity: subRise,
            transform: `scale(${pulse})`,
            marginTop: 45,
            background: `${COLORS.d900}ee`,
            border: `2px solid ${COLORS.accent}`,
            borderRadius: RADIUS.pill,
            padding: '16px 44px',
            boxShadow: `0 0 40px ${COLORS.accent}44`,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <span style={{ fontFamily: FONT_MONO, fontSize: 26, color: COLORS.accent, fontWeight: 700 }}>27.8 MPH</span>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 28, color: COLORS.muted }}>➔➔➔</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 28, color: COLORS.danger, fontWeight: 700 }}>FASTER THAN LIGHT</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default SpeedHook;
