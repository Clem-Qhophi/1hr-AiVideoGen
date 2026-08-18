import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceFrame } from '../../lib/evidence';
import { CLAMP } from '../../lib/kit';
import { EASINGS } from '../../brand';
import { RM, FONT_HOOK, useDrift } from '../../lib/reviewkit';

// master 176.10-203.88 · evidence-1: text-to-image board. "GPT-Image-2 at 1380" f322,
// "Grok Imagine 2.0 at 1320" f366, "preliminary tag" f462, "old Quality model at 1228" f522,
// "Reve 1302, eighteen points back, clear of the pack" f669-807.
export const compositionConfig = { id: 'GIIEvidenceT2I', durationInSeconds: 27.78, fps: 30, width: 1920, height: 1080 };

// One chip slot at the bottom: each chip fades out as the next lands, so callouts
// sequence with the narration instead of piling up.
const Chip: React.FC<{ text: string; color: string; at: number; hideAt?: number; font?: number }> = ({ text, color, at, hideAt, font = 40 }) => {
  const frame = useCurrentFrame();
  const op =
    interpolate(frame, [at, at + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }) *
    (hideAt ? 1 - interpolate(frame, [hideAt - 12, hideAt], [0, 1], { ...CLAMP, easing: EASINGS.easeIn }) : 1);
  if (op <= 0) return null;
  const sc = interpolate(frame, [at, at + 14], [1.3, 1], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <div style={{
      position: 'absolute', bottom: 54, left: '50%', transform: `translateX(-50%) scale(${sc})`,
      opacity: op, fontFamily: FONT_HOOK, fontSize: font, color,
      background: '#0d1117ee', border: `2px solid ${color}66`, borderRadius: 16,
      padding: '12px 38px', textAlign: 'center', whiteSpace: 'nowrap',
    }}>{text}</div>
  );
};

const GIIEvidenceT2I: React.FC = () => {
  const drift = useDrift(833);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <AbsoluteFill style={drift}>
        <EvidenceFrame
          image="projects/grok-imagine-image-2/evidence/arena-t2i-overall.png"
          source="LMArena Text-to-Image Arena, as of Aug 7 2026"
          label="TEXT-TO-IMAGE LEADERBOARD"
          appearAt={0}
        />
      </AbsoluteFill>
      <Chip text="Grok Imagine 2.0 · 1320 · #2" color={RM.cyan} at={366} hideAt={455} />
      <Chip text="MARKED PRELIMINARY" color={RM.amber} at={462} hideAt={515} font={32} />
      <Chip text="old 'Quality' model: 1228 · still #14" color={RM.red} at={522} hideAt={660} font={34} />
      <Chip text="18 pts clear of #3 Reve. clear of the pack." color={RM.green} at={669} font={34} />
    </AbsoluteFill>
  );
};
export default GIIEvidenceT2I;
