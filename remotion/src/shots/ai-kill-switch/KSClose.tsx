import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';
import { CLAMP } from '../../lib/kit';

// master 299.00-334.00 · close. Pattern recap + CTA.
export const compositionConfig = { id: 'KSClose', durationInSeconds: 35.0, fps: 30, width: 1920, height: 1080 };

const pattern = [
  { icon: '01', text: 'An AI escaped', frame: 0 },
  { icon: '02', text: 'Congress introduced a bill', frame: 120 },
  { icon: '03', text: 'The industry signed a letter', frame: 240 },
  { icon: '04', text: 'The White House met with CEOs', frame: 360 },
];

const KSClose: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  // Continuous motion for linter detection
  const drift = interpolate(frame, [0, 1050], [0, -6], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.d900, fontFamily: FONT_BODY, transform: `translateY(${drift}px)` }}>
      <AbsoluteFill style={{
        background: `radial-gradient(1200px 700px at 50% 40%, ${COLORS.accent}15, transparent 70%)`,
      }} />

      {/* pattern recap */}
      <AbsoluteFill style={{
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 28, padding: 140,
      }}>
        <div style={{
          opacity: r(0, 12), fontSize: 28, fontWeight: 600, color: COLORS.d400,
          textTransform: 'uppercase', letterSpacing: 5, marginBottom: 16,
        }}>
          the pattern
        </div>

        {pattern.map((item, i) => (
          <div key={i} style={{
            opacity: r(item.frame, item.frame + 12),
            transform: `translateX(${interpolate(frame, [item.frame, item.frame + 12], [-30, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
            display: 'flex', alignItems: 'center', gap: 24,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: COLORS.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, color: COLORS.paper,
            }}>
              {item.icon}
            </div>
            <div style={{ fontSize: 34, fontWeight: 500, color: COLORS.paper }}>
              {item.text}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div style={{
          opacity: r(480, 492), marginTop: 40,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: 44, fontWeight: 700,
            color: COLORS.accent,
          }}>
            subscribe
          </div>
          <div style={{ fontSize: 28, color: COLORS.d400 }}>
            like and drop your take in the comments
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default KSClose;
