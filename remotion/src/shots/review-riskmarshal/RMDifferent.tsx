import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { EASINGS } from '../../brand';
import { CLAMP } from '../../lib/kit';
import { VibeBg } from '../../lib/vibes';
import { useRise } from '../../lib/reviewkit';

// Beat 10: What Makes It Different — 140s-155s (4200f-4650f)
// "Journal vs Intervention" comparison
export const compositionConfig = { id: 'RMDifferent', durationInSeconds: 15, fps: 30, width: 1920, height: 1080 };

const RMDifferent: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const r = (a: number, b: number, from = 0, to = 1) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing: EASINGS.easeOut });

  // "Risk Marshal actually intervenes" — ~140473ms. In shot: (140473 - 140000) * 0.03 = ~14f
  const rightOp = r(10, 26);
  const rightX = interpolate(frame, [10, 26], [40, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // "It stops them while they're happening" — ~146615ms. In shot: (146615 - 140000) * 0.03 = ~198f
  const detailOp = r(192, 210);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 100px' }}>
        <div style={{ display: 'flex', gap: 60, width: '100%', maxWidth: 1600 }}>
          {/* Left: Others */}
          <div style={{
            flex: 1, ...rise(0, 16, 14),
            background: '#0b1720cc', border: '1px solid #232b36', borderRadius: 18,
            padding: '48px 40px', textAlign: 'center',
          }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 22, letterSpacing: 4, color: '#8ba396', display: 'block', marginBottom: 20 }}>OTHERS</span>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 52, color: '#8ba396', lineHeight: 1.2 }}>
              Give you a journal
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 36, color: '#8ba396', marginTop: 12, opacity: 0.7 }}>
              A dashboard. Maybe some alerts.
            </div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 28, color: '#f0687a', marginTop: 24 }}>
              Show you mistakes after the fact.
            </div>
          </div>

          {/* Right: Risk Marshal */}
          <div style={{
            flex: 1, opacity: rightOp, transform: `translateX(${rightX}px)`,
            background: '#0b1720cc', border: '1px solid #22c55e44', borderRadius: 18,
            padding: '48px 40px', textAlign: 'center',
          }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 22, letterSpacing: 4, color: '#22c55e', display: 'block', marginBottom: 20 }}>RISK MARSHAL</span>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 56, color: '#22c55e', lineHeight: 1.2 }}>
              Actually intervenes.
            </div>
            <div style={{ opacity: detailOp, marginTop: 20 }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 28, color: '#eaf5ef', marginTop: 12 }}>
                Stops them while they&rsquo;re happening.
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default RMDifferent;
