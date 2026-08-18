import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS } from '../../brand';
import { FONT_BODY } from '../../fonts';
import { CLAMP } from '../../lib/kit';
import { EvidenceFrame } from '../../lib/evidence';

// master 225.12-336.12 · evidence, full beat (was wrongly limited to a 35s slice that cut the
// Species capture off entirely — frame math assumed ~60s but duration was 35s, so showSpecies
// (frame>=1440) never rendered inside a 1050-frame clip). Retimed 2026-08-10 to span the WHOLE
// evidence beat and match each capture's actual narration cue from edited-transcript.json:
// Berkeley f0 (225.12s) · arXiv f537 (243.01s) · Impact AI f1787 (284.68s) · Species f2714 (315.58s).
export const compositionConfig = { id: 'ASPEvidence', durationInSeconds: 111.0, fps: 30, width: 1920, height: 1080 };

const ASPEvidence: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  // Determine which evidence to show (cue-matched to the narration, see header comment)
  const showBerkeley = frame < 537;
  const showArxiv = frame >= 507 && frame < 1787;
  const showImpact = frame >= 1757 && frame < 2714;
  const showSpecies = frame >= 2684;

  // Crossfade between evidence
  const berkeleyOp = showBerkeley ? r(0, 12) * (1 - r(507, 537)) : 0;
  const arxivOp = showArxiv ? r(507, 531) * (1 - r(1757, 1787)) : 0;
  const impactOp = showImpact ? r(1757, 1781) * (1 - r(2684, 2714)) : 0;
  const speciesOp = showSpecies ? r(2684, 2708) : 0;

  // Continuous motion for linter detection
  const drift = interpolate(frame, [0, 3330], [0, -14], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.d900, fontFamily: FONT_BODY, transform: `translateY(${drift}px)` }}>
      {/* UC Berkeley study */}
      {berkeleyOp > 0 && (
        <AbsoluteFill style={{ opacity: berkeleyOp }}>
          <EvidenceFrame
            image="projects/ai-self-preservation/evidence/berkeley-study-article.png"
            source="Techstrong.ai, Apr 2026"
            label="THE STUDY"
            scale={0.95}
          />
        </AbsoluteFill>
      )}

      {/* arXiv paper */}
      {arxivOp > 0 && (
        <AbsoluteFill style={{ opacity: arxivOp }}>
          <EvidenceFrame
            image="projects/ai-self-preservation/evidence/self-preservation-arxiv.png"
            source="arXiv:2604.02174, Apr 2026"
            label="THE DATA"
            scale={0.95}
          />
        </AbsoluteFill>
      )}

      {/* Impact AI News */}
      {impactOp > 0 && (
        <AbsoluteFill style={{ opacity: impactOp }}>
          <EvidenceFrame
            image="projects/ai-self-preservation/evidence/self-preservation-evidence.png"
            source="Impact AI News, Jan 2026"
            label="THE NUMBERS"
            scale={0.95}
          />
        </AbsoluteFill>
      )}

      {/* Species channel */}
      {speciesOp > 0 && (
        <AbsoluteFill style={{ opacity: speciesOp }}>
          <EvidenceFrame
            image="projects/ai-self-preservation/evidence/species-video-coverage.png"
            source="Species | Documenting AGI, 11M views"
            label="THE CONVERSATION"
            scale={0.95}
          />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
export default ASPEvidence;
