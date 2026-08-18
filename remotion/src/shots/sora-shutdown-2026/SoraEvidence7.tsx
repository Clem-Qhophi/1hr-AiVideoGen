import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceFrame } from '../../lib/evidence';
import { CLAMP } from '../../lib/kit';
import { EASINGS } from '../../brand';
import { RM, FONT_HOOK, useDrift } from '../../lib/reviewkit';

// master 252.58-273.92 · evidence-7: Vector market share. "few billion dollars" f43,
// "twenty percent" f138, "finished clips" f450, "left the one modality" f553.
export const compositionConfig = { id: 'SoraEvidence7', durationInSeconds: 21.34, fps: 30, width: 1920, height: 1080 };

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

const SoraEvidence7: React.FC = () => {
  const drift = useDrift(640);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <AbsoluteFill style={drift}>
        <EvidenceFrame
          image="projects/sora-shutdown-2026/evidence/vector-ceded-market.png"
          source="Vector, 2026"
          label="THE MARKET AFTER SORA"
          appearAt={0}
        />
      </AbsoluteFill>
      <Chip text="a few billion dollars a year" color={RM.text} at={43} hideAt={130} font={34} />
      <Chip text="20%+ growth" color={RM.green} at={138} hideAt={300} font={34} />
      <Chip text="money for 'finished clips' moved on" color={RM.amber} at={450} hideAt={545} font={34} />
      <Chip text="nobody stayed on one modality" color={RM.cyan} at={553} font={34} />
    </AbsoluteFill>
  );
};
export default SoraEvidence7;
