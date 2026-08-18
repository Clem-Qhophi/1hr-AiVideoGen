import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceFrame } from '../../lib/evidence';
import { CLAMP } from '../../lib/kit';
import { EASINGS } from '../../brand';
import { RM, FONT_HOOK, useDrift } from '../../lib/reviewkit';

// master 156.99-176.48 · evidence-2: TechCrunch autopsy. "the autopsy" f7,
// "one million dollars a day" f180, "expensive to run" f308, "coding and enterprise" f476.
export const compositionConfig = { id: 'SoraEvidence2', durationInSeconds: 19.49, fps: 30, width: 1920, height: 1080 };

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

const SoraEvidence2: React.FC = () => {
  const drift = useDrift(585);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <AbsoluteFill style={drift}>
        <EvidenceFrame
          image="projects/sora-shutdown-2026/evidence/techcrunch-why-shutdown.png"
          source="TechCrunch, Aug 2026"
          label="WHY SORA DIED"
          appearAt={0}
        />
      </AbsoluteFill>
      <Chip text="the autopsy" color={RM.cyan} at={7} hideAt={170} font={34} />
      <Chip text="$1M a day just to keep it running" color={RM.red} at={180} hideAt={300} />
      <Chip text="chips too expensive to justify" color={RM.amber} at={308} hideAt={465} font={34} />
      <Chip text="the money went to coding + enterprise" color={RM.green} at={476} font={34} />
    </AbsoluteFill>
  );
};
export default SoraEvidence2;
