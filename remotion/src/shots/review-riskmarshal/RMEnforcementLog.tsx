import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { EASINGS } from '../../brand';
import { CLAMP } from '../../lib/kit';
import { EvidenceBrowser } from '../../lib/evidence';

// Beat 8: Enforcement Log — 100s-130s (3000f-3900f)
// EvidenceBrowser enforcement-log.png with zoom/pan to each line
export const compositionConfig = { id: 'RMEnforcementLog', durationInSeconds: 30, fps: 30, width: 1920, height: 1080 };

const RMEnforcementLog: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing: EASINGS.easeOut });

  // Zoom/pan: slow drift across the log
  const panX = interpolate(frame, [0, 900], [0, -60], { ...CLAMP, easing: EASINGS.easeInOut });
  const zoom = interpolate(frame, [0, 900], [1, 1.08], { ...CLAMP, easing: EASINGS.easeInOut });

  // "enforcement log" callout — ~102710ms. Shot starts at 100s = 3000f.
  // (102710 - 100000) * 0.03 = ~81f
  const calloutOp = r(75, 92);

  // Highlight: "Daily loss limit reached" — ~106092ms. In shot: (106092 - 100000) * 0.03 = ~183f
  const h1Op = r(177, 194);

  // "Trade opened outside your London session" — ~110026ms. In shot: ~301f
  const h2Op = r(295, 312);

  // "Closed in 0.3 seconds" — ~112960ms. In shot: ~389f
  const h3Op = r(383, 400);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{ transform: `translateX(${panX}px) scale(${zoom})`, transformOrigin: 'center center', width: '100%', height: '100%' }}>
          <EvidenceBrowser
            image="projects/review-riskmarshal/evidence/enforcement-log.png"
            url="riskmarshal.com/dashboard/enforcement"
            source="Risk Marshal"
            label="ENFORCEMENT LOG"
            appearAt={0}
          />
        </div>
      </div>

      {/* Callout overlays synced to narration */}
      <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ opacity: calloutOp, background: '#0b1720ee', border: '1px solid #232b36', borderRadius: 14, padding: '18px 36px', display: 'flex', gap: 20, alignItems: 'center' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f0687a' }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 28, color: '#eaf5ef' }}>Daily loss limit reached</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 24, color: '#8ba396' }}>All new trades blocked</span>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ opacity: h2Op, background: '#0b1720ee', border: '1px solid #232b36', borderRadius: 14, padding: '18px 36px', display: 'flex', gap: 20, alignItems: 'center' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f5c451' }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 28, color: '#eaf5ef' }}>Trade opened outside session</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 24, color: '#8ba396' }}>Closed in 0.3s</span>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 220, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ opacity: h3Op, background: '#0b1720ee', border: '1px solid #232b36', borderRadius: 14, padding: '18px 36px', display: 'flex', gap: 20, alignItems: 'center' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 28, color: '#eaf5ef' }}>Revenge trade attempt</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 24, color: '#8ba396' }}>Mandatory cooldown engaged</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
export default RMEnforcementLog;
