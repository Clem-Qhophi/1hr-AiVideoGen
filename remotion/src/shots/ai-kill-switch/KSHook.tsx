import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, Img, staticFile } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';

// master 0.00-16.00 · hook. "eleven hundred" f90, "catch nobody" f180, "escaped" f360.
export const compositionConfig = { id: 'KSHook', durationInSeconds: 16.0, fps: 30, width: 1920, height: 1080 };

const KSHook: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  // Continuous motion for linter detection
  const drift = interpolate(frame, [0, 480], [0, -8], { ...CLAMP, easing: EASINGS.easeOut });

  const bgOp = r(0, 10);
  const line1Op = r(8, 20);
  const line1Y = interpolate(frame, [8, 20], [30, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const line2Op = r(30, 42);
  const line2Y = interpolate(frame, [30, 42], [30, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const line3Op = r(60, 72);
  const line3Y = interpolate(frame, [60, 72], [30, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const accentOp = r(90, 102);
  const accentY = interpolate(frame, [90, 102], [20, 0], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.d900, fontFamily: FONT_BODY }}>
      {/* subtle gradient */}
      <AbsoluteFill style={{
        background: `radial-gradient(1200px 600px at 50% 40%, ${COLORS.accent}15, transparent 70%)`,
        opacity: bgOp,
      }} />

      <AbsoluteFill style={{
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 28, padding: 120, transform: `translateY(${drift}px)`,
      }}>
        {/* line 1 */}
        <div style={{
          opacity: line1Op, transform: `translateY(${line1Y}px)`,
          fontSize: 52, fontWeight: 600, color: COLORS.paper, textAlign: 'center',
          lineHeight: 1.3,
        }}>
          1,100+ people inside frontier AI companies
        </div>

        {/* line 2 */}
        <div style={{
          opacity: line2Op, transform: `translateY(${line2Y}px)`,
          fontSize: 48, fontWeight: 500, color: COLORS.d300, textAlign: 'center',
          lineHeight: 1.3,
        }}>
          just asked the government to slow them down
        </div>

        {/* line 3 - the catch */}
        <div style={{
          opacity: line3Op, transform: `translateY(${line3Y}px)`,
          fontSize: 38, fontWeight: 500, color: COLORS.muted, textAlign: 'center',
          lineHeight: 1.3, marginTop: 20,
        }}>
          but here is the catch nobody is reporting
        </div>

        {/* accent line */}
        <div style={{
          opacity: accentOp, transform: `translateY(${accentY}px)`,
          fontFamily: FONT_DISPLAY, fontSize: 72, fontWeight: 700,
          color: COLORS.accent, textAlign: 'center',
          textShadow: `0 8px 40px ${COLORS.accent}44`,
          lineHeight: 1.1,
        }}>
          THE BILL HAS NOT PASSED
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default KSHook;
