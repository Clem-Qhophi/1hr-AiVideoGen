import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EASINGS } from '../../brand';
import { CLAMP } from '../../lib/kit';
import { VibeBg } from '../../lib/vibes';
import { useRise } from '../../lib/reviewkit';

// Beat 4: The Promise — 55s-65s (1650f-1950f)
// "If you can't break your rules, you can't blow your account."
export const compositionConfig = { id: 'RMPromise', durationInSeconds: 10, fps: 30, width: 1920, height: 1080 };

const RMPromise: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const r = (a: number, b: number, from = 0, to = 1) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing: EASINGS.easeOut });

  // "you can't blow your account" — ~60668ms. Shot starts at 55s = 1650f.
  // In shot: (60668 - 55000) * 0.03 = ~170f
  const line2Op = r(164, 182);
  const line2Scale = interpolate(frame, [164, 184], [0.88, 1], { ...CLAMP, easing: EASINGS.overshoot });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 170px', textAlign: 'center' }}>
        <div style={{ ...rise(120, 16) }}>
          <h1 style={{ fontWeight: 600, fontSize: 72, lineHeight: 1.2, color: '#eaf5ef', margin: 0 }}>
            If you can&rsquo;t break your rules,
          </h1>
        </div>
        <div style={{ opacity: line2Op, transform: `scale(${line2Scale})`, marginTop: 24 }}>
          <h1 style={{ fontWeight: 700, fontSize: 88, lineHeight: 1.1, color: '#22c55e', margin: 0 }}>
            you can&rsquo;t blow your account.
          </h1>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default RMPromise;
