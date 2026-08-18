import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, useRise, CLAMP } from '../../lib/kit';

export const compositionConfig = {
  id: 'Verdict',
  durationInSeconds: 41.9,
  fps: 30,
  width: 1920,
  height: 1080,
};

const GOOD = [
  { label: 'Brand still huge', at: 40 },
  { label: 'App everywhere', at: 80 },
  { label: 'Flash still ships', at: 130 },
  { label: 'Distribution unmatched', at: 180 },
];

const STORY = [
  { label: 'a delay', color: COLORS.warn, at: 420 },
  { label: 'a shortfall', color: COLORS.danger, at: 460 },
  { label: 'racing its own hype', color: COLORS.accent, at: 510 },
];

const Verdict: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();

  const phase1 = interpolate(frame, [380, 420], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });
  const phase2 = interpolate(frame, [400, 440], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const outro = interpolate(frame, [680, 720], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const final = interpolate(frame, [900, 960], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      {/* phase 1: still strong */}
      <AbsoluteFill style={{
        alignItems: 'center', justifyContent: 'center', padding: '0 120px',
        opacity: phase1,
      }}>
        <div style={{ ...rise(8, 16), fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 4, color: COLORS.muted, marginBottom: 24 }}>
          THE GEMINI BRAND
        </div>
        <h1 style={{
          ...rise(20, 22),
          fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 72, color: COLORS.ink,
          margin: 0, marginBottom: 48, textAlign: 'center',
        }}>
          Still huge. Still shipping.
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center', maxWidth: 1200 }}>
          {GOOD.map((g) => {
            const op = interpolate(frame, [g.at, g.at + 16], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
            const y = interpolate(frame, [g.at, g.at + 16], [20, 0], { ...CLAMP, easing: EASINGS.easeOut });
            return (
              <div key={g.label} style={{
                opacity: op, transform: `translateY(${y}px)`,
                background: COLORS.paper, border: `2px solid ${COLORS.signal}`,
                borderRadius: RADIUS.pill, padding: '16px 32px', boxShadow: SHADOW.soft,
                fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 32, color: COLORS.ink,
              }}>
                {g.label}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* phase 2: but the story */}
      <AbsoluteFill style={{
        alignItems: 'center', justifyContent: 'center', padding: '0 120px',
        opacity: phase2,
      }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 4, color: COLORS.muted, marginBottom: 24 }}>
          BUT THE FRONTIER MODEL SETS THE STORY
        </div>
        <h1 style={{
          fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: COLORS.ink,
          margin: 0, marginBottom: 40, textAlign: 'center',
        }}>
          Right now, that story is
        </h1>
        <div style={{ display: 'flex', gap: 24, marginBottom: 56 }}>
          {STORY.map((s) => {
            const op = interpolate(frame, [s.at, s.at + 18], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
            const y = interpolate(frame, [s.at, s.at + 18], [26, 0], { ...CLAMP, easing: EASINGS.easeOut });
            return (
              <div key={s.label} style={{
                opacity: op, transform: `translateY(${y}px)`,
                background: COLORS.paper, border: `2px solid ${s.color}`,
                borderRadius: RADIUS.card, padding: '28px 36px', boxShadow: SHADOW.card,
                fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 36, color: s.color,
              }}>
                {s.label}
              </div>
            );
          })}
        </div>

        <div style={{
          opacity: outro,
          fontFamily: FONT_BODY, fontSize: 32, color: COLORS.muted, textAlign: 'center', maxWidth: 1100, marginBottom: 28,
        }}>
          Watch for 3.5 Pro when coding scores clear the internal bar.
        </div>

        <div style={{
          opacity: final,
          fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 48, color: COLORS.ink, textAlign: 'center', maxWidth: 1200,
        }}>
          How hard it is to stay on top<br />
          when everyone else is <span style={{ color: COLORS.accent }}>sprinting</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default Verdict;
