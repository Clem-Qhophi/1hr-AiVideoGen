import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, Img, staticFile } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';

// master 16.00-48.00 · context. "GPT-5.6 Sol" f0, "hacked another company" f90, "July 23" f240, "July 28" f300.
export const compositionConfig = { id: 'KSContext', durationInSeconds: 32.0, fps: 30, width: 1920, height: 1080 };

const timeline = [
  { label: 'Jul 16', text: 'OpenAI discloses escape', startFrame: 60, endFrame: 240 },
  { label: 'Jul 23', text: 'AI Kill Switch Act introduced', startFrame: 240, endFrame: 360 },
  { label: 'Jul 28', text: 'Pacing the Frontier letter signed', startFrame: 360, endFrame: 480 },
];

const KSContext: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  // Ken Burns on stock image
  const scale = interpolate(frame, [0, 960], [1.0, 1.08], { ...CLAMP, easing: EASINGS.easeOut });
  const imgOp = r(0, 15);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.d900, fontFamily: FONT_BODY }}>
      {/* stock image background - server room */}
      <AbsoluteFill style={{ opacity: imgOp }}>
        <Img
          src={staticFile('projects/ai-kill-switch/evidence/pacing-frontier-letter.png')}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: `scale(${scale})`, filter: 'brightness(0.3)',
          }}
        />
      </AbsoluteFill>

      {/* dark overlay for text legibility */}
      <AbsoluteFill style={{
        background: `linear-gradient(180deg, ${COLORS.d900}cc 0%, ${COLORS.d900}88 40%, ${COLORS.d900}cc 100%)`,
        opacity: imgOp,
      }} />

      {/* timeline */}
      <AbsoluteFill style={{
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 40, padding: 160,
      }}>
        {/* header */}
        <div style={{
          opacity: r(10, 22), transform: `translateY(${interpolate(frame, [10, 22], [20, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
          fontSize: 36, fontWeight: 600, color: COLORS.d400,
          textTransform: 'uppercase', letterSpacing: 6,
        }}>
          the timeline
        </div>

        {/* timeline items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, width: '100%', maxWidth: 1200 }}>
          {timeline.map((item, i) => {
            const itemOp = r(item.startFrame, item.startFrame + 15);
            const itemY = interpolate(frame, [item.startFrame, item.startFrame + 15], [25, 0], { ...CLAMP, easing: EASINGS.easeOut });
            const isActive = frame >= item.startFrame && frame < item.endFrame;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 28,
                opacity: itemOp, transform: `translateY(${itemY}px)`,
              }}>
                {/* date badge */}
                <div style={{
                  minWidth: 160, padding: '14px 24px',
                  background: isActive ? COLORS.accent : COLORS.d800,
                  borderRadius: RADIUS.card, border: `2px solid ${isActive ? COLORS.accent : COLORS.d600}`,
                  fontFamily: FONT_MONO, fontSize: 24, fontWeight: 600,
                  color: isActive ? COLORS.paper : COLORS.d300,
                  textAlign: 'center',
                }}>
                  {item.label}
                </div>
                {/* connector line */}
                <div style={{
                  width: 40, height: 3, background: COLORS.d600,
                  opacity: isActive ? 1 : 0.4,
                }} />
                {/* text */}
                <div style={{
                  fontSize: 32, fontWeight: 500,
                  color: isActive ? COLORS.paper : COLORS.d400,
                }}>
                  {item.text}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default KSContext;
