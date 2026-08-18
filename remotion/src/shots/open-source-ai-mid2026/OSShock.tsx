import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { COLORS, EASINGS } from '../../brand';
import { FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';
import { EvidenceFrame } from '../../lib/evidence';
import { useRise } from '../../lib/reviewkit';

// master 39.0-55.0 · aa-leaderboard, highlight Kimi K3 row (#4) · "number four" f26 · WebDev #1 caption f405
// ken-burns on the evidence (not the caption pill) so the 12.6s gap stays alive (tools/lint_pacing.py).
export const compositionConfig = { id: 'OSShock', durationInSeconds: 16.0, fps: 30, width: 1920, height: 1080 };

const OSShock: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const zoom = interpolate(frame, [0, 480], [1.0, 1.06], { ...CLAMP, easing: EASINGS.easeInOut });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.d900 }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <EvidenceFrame
          image="projects/open-source-ai-mid2026/evidence/aa-leaderboard.png"
          source="Artificial Analysis, Jul 2026"
          label="#4 OVERALL · KIMI K3 · 57 · 1M CONTEXT"
          appearAt={4}
          highlight={{ x: 9, y: 62, w: 82, h: 8, startFrame: 26 }}
        />
      </AbsoluteFill>
      <div style={{ position: 'absolute', bottom: 130, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ ...rise(405, 22), fontFamily: FONT_MONO, fontSize: 30, color: COLORS.paper, background: COLORS.d800, border: `1px solid ${COLORS.signal}`, borderRadius: 999, padding: '14px 32px', boxShadow: '0 10px 30px rgba(0,0,0,.45)' }}>
          AND <span style={{ color: COLORS.signal }}>#1</span> ON THE LMARENA WEBDEV ARENA
        </div>
      </div>
    </AbsoluteFill>
  );
};
export default OSShock;
