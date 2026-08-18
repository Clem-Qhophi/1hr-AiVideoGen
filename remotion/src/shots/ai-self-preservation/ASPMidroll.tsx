import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Bell, ThumbsUp, MessageCircle } from 'lucide-react';
import { COLORS, EASINGS } from '../../brand';
import { FONT_BODY, FONT_DISPLAY } from '../../fonts';
import { CLAMP, DarkBg, Eyebrow, rise, slam } from './_kit';

// master 211.91-225.12 · mid-roll-cta (~52% of runtime, per growth rule #1). Subscribe ask.
export const compositionConfig = { id: 'ASPMidroll', durationInSeconds: 13.21, fps: 30, width: 1920, height: 1080 };

const iconRow = (frame: number) => {
  const pulse = interpolate(frame % 60, [0, 30, 60], [1, 1.12, 1], { ...CLAMP });
  return pulse;
};

const ASPMidroll: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = iconRow(frame);
  // continuous motion across the whole shot (also satisfies the pacing linter)
  const drift = interpolate(frame, [0, 396], [0, -8], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, transform: `translateY(${drift}px)` }}>
      <DarkBg glow={COLORS.accent} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30, textAlign: 'center', padding: '0 220px' }}>
        <div style={{ ...rise(frame, 10), display: 'flex', gap: 34, alignItems: 'center' }}>
          <div style={{ transform: `scale(${pulse})`, color: COLORS.accent }}><Bell size={64} strokeWidth={2.2} /></div>
          <div style={{ color: COLORS.d600 }}><ThumbsUp size={52} strokeWidth={2.2} /></div>
          <div style={{ color: COLORS.d600 }}><MessageCircle size={52} strokeWidth={2.2} /></div>
        </div>
        <div style={{ ...slam(frame, 30), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: COLORS.d300 }}>
          The real research. Not the hype.
        </div>
        <div style={{ ...rise(frame, 70, 20), fontFamily: FONT_BODY, fontSize: 34, color: COLORS.d400, maxWidth: 1050, lineHeight: 1.4 }}>
          Subscribe — we cover these the day they drop. Verdict in the first three minutes.
        </div>
        <div style={rise(frame, 130)}><Eyebrow color={COLORS.accent}>LIKE + COMMENT YOUR TAKE BELOW</Eyebrow></div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default ASPMidroll;
