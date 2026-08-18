import React from 'react';
import { AbsoluteFill } from 'remotion';
import { interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { RMBg, useRise, useDrift, Eyebrow, RM, CLAMP } from '../../lib/reviewkit';
import { EASINGS } from '../../brand';

// master 204.1-232.2 · evidence pt2. Neuralink's own update log: everything got news except Blindsight.
export const compositionConfig = { id: 'NBSTimeline', durationInSeconds: 28.1, fps: 30, width: 1920, height: 1080 };

const Row: React.FC<{ date: string; text: string; appearAt: number; muted?: boolean }> = ({ date, text, appearAt, muted }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [appearAt, appearAt + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const x = interpolate(frame, [appearAt, appearAt + 14], [-24, 0], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <div style={{ opacity: op, transform: `translateX(${x}px)`, display: 'flex', alignItems: 'center', gap: 22, width: 1150 }}>
      <span style={{ fontFamily: FONT_MONO, fontSize: 18, color: muted ? RM.amber : RM.cyan, width: 110, flexShrink: 0 }}>{date}</span>
      <span style={{ fontSize: 22, color: muted ? RM.muted : RM.text }}>{text}</span>
      <span style={{ marginLeft: 'auto', fontSize: 22, color: muted ? RM.amber : RM.green }}>{muted ? '—' : '✓'}</span>
    </div>
  );
};

const NBSTimeline: React.FC = () => {
  const rise = useRise();
  const drift = useDrift(843);
  const frame = useCurrentFrame();
  const finalOp = interpolate(frame, [760, 774], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
        <div style={rise(4, 14)}><Eyebrow color={RM.cyan}>their own updates page</Eyebrow></div>
        <Row date="SEP 2024" text="Blindsight FDA designation" appearAt={70} muted />
        <Row date="NOV 2024" text="Canada trial launch (Telepathy)" appearAt={230} />
        <Row date="MAY 2025" text="Speech FDA designation" appearAt={370} />
        <Row date="JUN 2025" text="$650M funding round" appearAt={500} />
        <Row date="JAN 2026" text="Two Years of Telepathy — 21 participants" appearAt={630} />
        <div style={{ opacity: finalOp, marginTop: 16, fontSize: 34, fontWeight: 800, color: RM.red, textAlign: 'center' }}>
          Blindsight alone stayed silent.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default NBSTimeline;
