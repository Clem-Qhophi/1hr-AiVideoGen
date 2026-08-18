import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceFrame } from '../../lib/evidence';
import { CLAMP } from '../../lib/kit';
import { EASINGS } from '../../brand';
import { RM, FONT_HOOK, useDrift } from '../../lib/reviewkit';

// master 232.32-252.58 · evidence-6: Vector market report. "MiniMax" f264, "half the price" f387,
// "ByteDance" f452, "own the moment" f579.
export const compositionConfig = { id: 'SoraEvidence6', durationInSeconds: 20.26, fps: 30, width: 1920, height: 1080 };

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

const SoraEvidence6: React.FC = () => {
  const drift = useDrift(608);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <AbsoluteFill style={drift}>
        <EvidenceFrame
          image="projects/sora-shutdown-2026/evidence/vector-ceded-market.png"
          source="Vector, 2026"
          label="WHO TAKES THE MARKET"
          appearAt={0}
        />
      </AbsoluteFill>
      <Chip text="MiniMax takes #1" color={RM.cyan} at={264} hideAt={380} />
      <Chip text="at roughly half the price" color={RM.green} at={387} hideAt={445} font={34} />
      <Chip text="ByteDance launched hours later" color={RM.text} at={452} hideAt={565} />
      <Chip text="whoever ships first owns the moment" color={RM.amber} at={579} font={34} />
    </AbsoluteFill>
  );
};
export default SoraEvidence6;
