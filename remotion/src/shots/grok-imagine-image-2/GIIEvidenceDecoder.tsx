import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceFrame } from '../../lib/evidence';
import { CLAMP } from '../../lib/kit';
import { EASINGS } from '../../brand';
import { RM, FONT_HOOK, useDrift } from '../../lib/reviewkit';

// master 233.35-250.43 · evidence-4: the announcement as The Decoder covered it.
// Feature chips sequence over the article: Magic Wand f157, Segmentation f221,
// Background removal f281, Smart Resize f358.
export const compositionConfig = { id: 'GIIEvidenceDecoder', durationInSeconds: 17.08, fps: 30, width: 1920, height: 1080 };

const FEATURES = [
  { t: 'MAGIC WAND', s: 157, next: 215, color: RM.cyan },
  { t: 'SEGMENTATION', s: 221, next: 275, color: RM.green },
  { t: 'BG REMOVAL', s: 281, next: 350, color: RM.amber },
  { t: 'SMART RESIZE', s: 358, next: 512, color: RM.cyan },
];

const GIIEvidenceDecoder: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = useDrift(512);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <AbsoluteFill style={drift}>
        <EvidenceFrame
          image="projects/grok-imagine-image-2/evidence/decoder-announcement.png"
          source="The Decoder, Aug 8 2026"
          label="THE RELEASE"
          appearAt={0}
        />
      </AbsoluteFill>
      {FEATURES.map((f) => {
        const op =
          interpolate(frame, [f.s, f.s + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }) *
          (1 - interpolate(frame, [f.next - 12, f.next], [0, 1], { ...CLAMP, easing: EASINGS.easeIn }));
        if (op <= 0) return null;
        const sc = interpolate(frame, [f.s, f.s + 14], [1.3, 1], { ...CLAMP, easing: EASINGS.easeOut });
        return (
          <div key={f.t} style={{
            position: 'absolute', bottom: 66, left: 130, opacity: op, transform: `scale(${sc})`,
            fontFamily: FONT_HOOK, fontSize: 40, color: f.color,
            background: '#0d1117ee', border: `2px solid ${f.color}55`, borderRadius: 14,
            padding: '10px 30px', whiteSpace: 'nowrap',
          }}>{f.t}</div>
        );
      })}
    </AbsoluteFill>
  );
};
export default GIIEvidenceDecoder;
