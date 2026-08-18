import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceFrame } from '../../lib/evidence';
import { CLAMP } from '../../lib/kit';
import { EASINGS } from '../../brand';
import { RM, FONT_HOOK, useDrift } from '../../lib/reviewkit';

// master 191.81-212.83 · evidence-4: Verge + Sensor Tower download slide. "four point eight million" f118,
// "six point one" f196, "one point one by March" f336, "went down anyway" f599.
export const compositionConfig = { id: 'SoraEvidence4', durationInSeconds: 21.02, fps: 30, width: 1920, height: 1080 };

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

const SoraEvidence4: React.FC = () => {
  const drift = useDrift(630);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <AbsoluteFill style={drift}>
        <EvidenceFrame
          image="projects/sora-shutdown-2026/evidence/verge-sensor-tower.png"
          source="The Verge / Sensor Tower, 2026"
          label="DOWNLOADS, BY THE NUMBERS"
          appearAt={0}
        />
      </AbsoluteFill>
      <Chip text="4.8M in the US alone" color={RM.cyan} at={118} hideAt={190} />
      <Chip text="6.1M total, November" color={RM.text} at={196} hideAt={330} />
      <Chip text="1.1M by March" color={RM.red} at={336} hideAt={520} />
      <Chip text="usage went down anyway" color={RM.amber} at={599} font={34} />
    </AbsoluteFill>
  );
};
export default SoraEvidence4;
