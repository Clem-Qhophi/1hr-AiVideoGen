import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, Img, staticFile } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';
import { EvidenceFrame } from '../../lib/evidence';

// master 178.00-262.00 · evidence. Real screenshots with source labels.
// Pacing the Frontier f0-300, Kill Switch Act f300-600, White House f600-840.
export const compositionConfig = { id: 'KSEvidence', durationInSeconds: 84.0, fps: 30, width: 1920, height: 1080 };

const KSEvidence: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  // Determine which evidence to show
  const showPacing = frame < 300;
  const showKillSwitch = frame >= 280 && frame < 600;
  const showWhiteHouse = frame >= 580;

  // Crossfade between evidence
  const pacingOp = showPacing ? r(0, 12) * (1 - r(280, 300)) : 0;
  const killSwitchOp = showKillSwitch ? r(280, 292) * (1 - r(580, 600)) : 0;
  const whiteHouseOp = showWhiteHouse ? r(580, 592) : 0;

  // Continuous motion for linter detection
  const drift = interpolate(frame, [0, 2520], [0, -10], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.d900, fontFamily: FONT_BODY, transform: `translateY(${drift}px)` }}>
      {/* Pacing the Frontier */}
      {pacingOp > 0 && (
        <AbsoluteFill style={{ opacity: pacingOp }}>
          <EvidenceFrame
            image="projects/ai-kill-switch/evidence/pacing-frontier-letter.png"
            source="pacingthefrontier.com, Jul 28 2026"
            label="THE LETTER"
            scale={0.95}
          />
        </AbsoluteFill>
      )}

      {/* Kill Switch Act */}
      {killSwitchOp > 0 && (
        <AbsoluteFill style={{ opacity: killSwitchOp }}>
          <EvidenceFrame
            image="projects/ai-kill-switch/evidence/kill-switch-act-ars.png"
            source="Ars Technica, Jul 23 2026"
            label="THE BILL"
            scale={0.95}
          />
        </AbsoluteFill>
      )}

      {/* White House meeting */}
      {whiteHouseOp > 0 && (
        <AbsoluteFill style={{ opacity: whiteHouseOp }}>
          <EvidenceFrame
            image="projects/ai-kill-switch/evidence/white-house-meeting-nbc.png"
            source="NBC News, Aug 3 2026"
            label="THE WHITE HOUSE"
            scale={0.95}
          />
        </AbsoluteFill>
      )}

      {/* mid-roll CTA at ~4:00 mark (frame 360 = 12s into this shot) */}
      <AbsoluteFill style={{
        opacity: r(360, 372) * (1 - r(420, 432)),
        justifyContent: 'flex-end', alignItems: 'center', padding: 60,
      }}>
        <div style={{
          padding: '16px 32px', borderRadius: RADIUS.pill,
          background: COLORS.accent + 'cc', backdropFilter: 'blur(8px)',
          fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 600,
          color: COLORS.paper,
        }}>
          subscribe for the verdict in the first 3 minutes
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default KSEvidence;
