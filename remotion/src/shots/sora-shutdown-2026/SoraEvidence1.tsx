import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceFrame } from '../../lib/evidence';
import { CLAMP } from '../../lib/kit';
import { EASINGS } from '../../brand';
import { RM, FONT_HOOK, useDrift } from '../../lib/reviewkit';

// master 134.43-156.99 · evidence-1: NBC sunset report. "show you the receipts" f5,
// "goodbye to Sora" f200, "ten billion dollars" f297, "one decision" f481, "IPO" f546.
export const compositionConfig = { id: 'SoraEvidence1', durationInSeconds: 22.56, fps: 30, width: 1920, height: 1080 };

const Chip: React.FC<{ text: string; color: string; at: number; hideAt?: number; font?: number }> = ({ text, color, at, hideAt, font = 38 }) => {
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

const SoraEvidence1: React.FC = () => {
  const drift = useDrift(677);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <AbsoluteFill style={drift}>
        <EvidenceFrame
          image="projects/sora-shutdown-2026/evidence/nbc-sora-shutdown.png"
          source="NBC News, Aug 2026"
          label="THE SUNSET ANNOUNCEMENT"
          appearAt={0}
        />
      </AbsoluteFill>
      <Chip text="show you the receipts" color={RM.cyan} at={5} hideAt={190} font={34} />
      <Chip text="OpenAI: goodbye to Sora" color={RM.text} at={200} hideAt={290} />
      <Chip text="$10,000,000,000 raise behind it" color={RM.amber} at={297} hideAt={470} />
      <Chip text="one decision · one deadline" color={RM.red} at={481} font={34} />
    </AbsoluteFill>
  );
};
export default SoraEvidence1;
