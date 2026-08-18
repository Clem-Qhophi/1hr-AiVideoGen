import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { EvidenceFrame } from '../../lib/evidence';
import { CLAMP } from '../../lib/kit';
import { EASINGS } from '../../brand';
import { RM, FONT_HOOK, useDrift } from '../../lib/reviewkit';

// master 203.88-226.12 · evidence-2: edit board + vote counts. "GPT-Image-2 at 1463" f141,
// "Grok at 1439, second again" f195, "5,931 votes vs 184,189" f349-570, "preliminary on both" f585.
export const compositionConfig = { id: 'GIIEvidenceEdit', durationInSeconds: 22.24, fps: 30, width: 1920, height: 1080 };

const VoteChip: React.FC<{ at: number; hideAt: number }> = ({ at, hideAt }) => {
  const frame = useCurrentFrame();
  const op =
    interpolate(frame, [at, at + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }) *
    (1 - interpolate(frame, [hideAt - 12, hideAt], [0, 1], { ...CLAMP, easing: EASINGS.easeIn }));
  if (op <= 0) return null;
  const a = interpolate(frame, [at + 16, at + 60], [0.033, 0.033], { ...CLAMP });
  const b = interpolate(frame, [at + 70, at + 130], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <div style={{
      position: 'absolute', bottom: 54, left: '50%', transform: 'translateX(-50%)',
      opacity: op, display: 'flex', alignItems: 'center', gap: 26,
      background: '#0d1117ee', border: `2px solid ${RM.cyan}66`, borderRadius: 16,
      padding: '14px 38px', fontFamily: FONT_HOOK, fontSize: 34, whiteSpace: 'nowrap',
    }}>
      <div style={{ color: RM.cyan, textAlign: 'right' }}>Grok Imagine 2.0</div>
      <div style={{ width: 160, height: 22, borderRadius: 8, background: RM.panel, overflow: 'hidden' }}>
        <div style={{ width: `${a * 100}%`, height: '100%', background: RM.cyan }} />
      </div>
      <div style={{ color: RM.cyan }}>5,931 votes</div>
      <div style={{ color: RM.muted }}>vs</div>
      <div style={{ color: RM.muted }}>GPT-Image-2</div>
      <div style={{ width: 160, height: 22, borderRadius: 8, background: RM.panel, overflow: 'hidden' }}>
        <div style={{ width: `${b * 100}%`, height: '100%', background: RM.muted }} />
      </div>
      <div style={{ color: RM.muted }}>184,189</div>
    </div>
  );
};

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

const GIIEvidenceEdit: React.FC = () => {
  const drift = useDrift(667);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <AbsoluteFill style={drift}>
        <EvidenceFrame
          image="projects/grok-imagine-image-2/evidence/arena-edit-overall.png"
          source="LMArena Image Edit Arena, as of Aug 7 2026"
          label="IMAGE EDITING LEADERBOARD"
          appearAt={0}
        />
      </AbsoluteFill>
      <Chip text="Grok at 1439 · second again" color={RM.cyan} at={195} hideAt={340} />
      <VoteChip at={349} hideAt={570} />
      <Chip text="preliminary on both boards" color={RM.amber} at={585} font={34} />
    </AbsoluteFill>
  );
};
export default GIIEvidenceEdit;
