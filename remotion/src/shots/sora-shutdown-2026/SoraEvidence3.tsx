import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceFrame } from '../../lib/evidence';
import { CLAMP } from '../../lib/kit';
import { EASINGS } from '../../brand';
import { RM, FONT_HOOK, useDrift } from '../../lib/reviewkit';

// master 176.48-191.81 · evidence-3: Claude Code eats the lunch. "Claude Code" f0,
// "eating OpenAI's lunch" f74, "side quests are over" f423.
export const compositionConfig = { id: 'SoraEvidence3', durationInSeconds: 15.33, fps: 30, width: 1920, height: 1080 };

const Chip: React.FC<{ text: string; color: string; at: number; hideAt?: number; font?: number; bottom?: number }> = ({ text, color, at, hideAt, font = 38, bottom = 54 }) => {
  const frame = useCurrentFrame();
  const op =
    interpolate(frame, [at, at + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }) *
    (hideAt ? 1 - interpolate(frame, [hideAt - 12, hideAt], [0, 1], { ...CLAMP, easing: EASINGS.easeIn }) : 1);
  if (op <= 0) return null;
  const sc = interpolate(frame, [at, at + 14], [1.3, 1], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <div style={{
      position: 'absolute', bottom, left: '50%', transform: `translateX(-50%) scale(${sc})`,
      opacity: op, fontFamily: FONT_HOOK, fontSize: font, color,
      background: '#0d1117ee', border: `2px solid ${color}66`, borderRadius: 16,
      padding: '12px 38px', textAlign: 'center', whiteSpace: 'nowrap',
    }}>{text}</div>
  );
};

const SoraEvidence3: React.FC = () => {
  const drift = useDrift(460);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <AbsoluteFill style={drift}>
        <EvidenceFrame
          image="projects/sora-shutdown-2026/evidence/techcrunch-why-shutdown.png"
          source="TechCrunch, Aug 2026"
          label="THE COMPETITION"
          appearAt={0}
        />
      </AbsoluteFill>
      <Chip text="Claude Code" color={RM.cyan} at={0} hideAt={74} font={34} />
      <Chip text="eating OpenAI's lunch" color={RM.red} at={74} hideAt={410} />
      <Chip text="side quests are over" color={RM.amber} at={423} bottom={120} font={32} />
    </AbsoluteFill>
  );
};
export default SoraEvidence3;
