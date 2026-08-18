import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { EASINGS } from '../../brand';
import { CLAMP } from '../../lib/kit';
import { EvidenceBrowser } from '../../lib/evidence';

// Beat 9: Lot Size Example — 130s-140s (3900f-4200f)
// EvidenceBrowser enforcement-log.png highlight lot-size adjustment line
export const compositionConfig = { id: 'RMLotSize', durationInSeconds: 10, fps: 30, width: 1920, height: 1080 };

const RMLotSize: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing: EASINGS.easeOut });

  // "You set two lots" — ~124250ms. Shot starts at 130s = 3900f.
  // (124250 - 130000) is negative, so this starts before the shot. The beat starts at 130s.
  // Actually edit plan says beat 9 is 130s-140s but the narration "You set two lots" is at 124250ms.
  // This is a slight misalignment. We'll show the lot-size line highlighted from frame 0.
  const highlightOp = r(10, 26);

  // Callout: "2.00 lots -> 0.47" synced to "adjusted to zero point four seven" ~127747ms
  // In shot: (127747 - 130000) * 0.03 = negative. Let me recalculate.
  // 130s = 130000ms. 127747ms is BEFORE 130s. The narration overlaps beats 8 and 9.
  // We'll show the callout at a reasonable point in this shot.
  const calloutOp = r(30, 48);
  const calloutScale = interpolate(frame, [30, 50], [0.9, 1], { ...CLAMP, easing: EASINGS.overshoot });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <EvidenceBrowser
        image="projects/review-riskmarshal/evidence/enforcement-log.png"
        url="riskmarshal.com/dashboard/enforcement"
        source="Risk Marshal"
        label="LOT SIZE ADJUSTMENT"
        appearAt={0}
        highlight={{ x: 5, y: 55, w: 90, h: 12, startFrame: 15 }}
      />

      {/* Animated callout */}
      <div style={{ position: 'absolute', bottom: 100, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{
          opacity: calloutOp, transform: `scale(${calloutScale})`,
          background: '#0b1720ee', border: '1px solid #22c55e66', borderRadius: 14,
          padding: '20px 40px', display: 'flex', gap: 24, alignItems: 'center',
        }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 32, color: '#f0687a', textDecoration: 'line-through' }}>2.00 lots</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 28, color: '#8ba396' }}>&rarr;</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 36, color: '#22c55e', fontWeight: 700 }}>0.47 lots</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 24, color: '#8ba396' }}>within risk limit</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
export default RMLotSize;
