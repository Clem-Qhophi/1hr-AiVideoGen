import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { VibeBg, VIBES } from '../../lib/vibes';
import { useRise, useSlam, FONT_HOOK } from '../../lib/reviewkit';

// Vibe demo — proves the atmosphere/palette system. Same layout, same copy position;
// ONLY the vibe changes. If these all looked alike, the system would be broken.
const V = VIBES['luxury'];
export const compositionConfig = { id: 'VibeLuxury', durationInSeconds: 4, fps: 30, width: 1920, height: 1080 };

const VibeLuxury: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="luxury" />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, textAlign: 'center', padding: '0 180px' }}>
        <div style={{ ...rise(2, 16), fontFamily: 'monospace', fontSize: 26, letterSpacing: 7, color: V.accent, textTransform: 'uppercase' }}>
          {V.label}
        </div>
        <div style={{ ...slam(10, 9), fontFamily: FONT_HOOK, fontSize: 132, lineHeight: 0.95, color: V.text }}>
          FEEL THE <span style={{ color: V.accent }}>DIFFERENCE</span>
        </div>
        <div style={{ ...rise(30, 16), fontSize: 34, fontWeight: 500, color: V.muted, maxWidth: 1100 }}>
          Same layout, same copy. Only the vibe changed.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default VibeLuxury;
