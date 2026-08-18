import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { Brain, Code2, Sparkles } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, useRise, CLAMP } from '../../lib/kit';

export const compositionConfig = {
  id: 'IOPromise',
  durationInSeconds: 24.6,
  fps: 30,
  width: 1920,
  height: 1080,
};

const CHIPS = [
  { label: 'Smarter Gemini', icon: Sparkles, color: COLORS.accent, at: 420 },
  { label: 'Better reasoning', icon: Brain, color: COLORS.accent2, at: 480 },
  { label: 'Stronger coding', icon: Code2, color: COLORS.signal, at: 540 },
];

const IOPromise: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 120px' }}>
        <div style={{ ...rise(6, 16), fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 4, color: COLORS.muted, marginBottom: 20 }}>
          GOOGLE I/O · MAY
        </div>
        <h1 style={{
          ...rise(18, 22),
          fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 86, color: COLORS.ink,
          margin: 0, marginBottom: 16, textAlign: 'center',
        }}>
          3.5 Pro <span style={{ color: COLORS.accent }}>on stage</span>
        </h1>
        <div style={{ ...rise(50, 18), fontSize: 32, color: COLORS.muted, marginBottom: 56, textAlign: 'center' }}>
          &ldquo;Already used internally&rdquo; · rolling out next month
        </div>

        <div style={{ display: 'flex', gap: 28 }}>
          {CHIPS.map((c) => {
            const Icon = c.icon;
            const op = interpolate(frame, [c.at, c.at + 16], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
            const y = interpolate(frame, [c.at, c.at + 16], [30, 0], { ...CLAMP, easing: EASINGS.easeOut });
            return (
              <div key={c.label} style={{
                opacity: op, transform: `translateY(${y}px)`,
                display: 'flex', alignItems: 'center', gap: 18,
                background: COLORS.paper, border: `2px solid ${c.color}`,
                borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '26px 36px',
              }}>
                <Icon size={40} color={c.color} strokeWidth={2.2} />
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 36, color: COLORS.ink }}>{c.label}</span>
              </div>
            );
          })}
        </div>

        <div style={{
          ...rise(620, 18), marginTop: 56,
          fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 40, color: COLORS.ink, textAlign: 'center',
        }}>
          Keep Google in the fight with <span style={{ color: COLORS.accent }}>OpenAI</span> and <span style={{ color: COLORS.accent2 }}>Anthropic</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default IOPromise;
