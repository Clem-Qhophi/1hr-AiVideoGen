import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { Globe2, Rocket, Database } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, useRise, CLAMP } from '../../lib/kit';

export const compositionConfig = {
  id: 'PressureStack',
  durationInSeconds: 38.1,
  fps: 30,
  width: 1920,
  height: 1080,
};

const PRESSURES = [
  { label: 'Kimi K3 + Qwen', sub: 'Chinese labs · fraction of the cost', icon: Globe2, color: COLORS.accent, at: 150 },
  { label: 'OpenAI + Anthropic', sub: 'Keep shipping frontier models', icon: Rocket, color: COLORS.accent2, at: 380 },
  { label: 'Reddit vs Google', sub: 'Cutting training data · AI Overviews', icon: Database, color: COLORS.danger, at: 500 },
];

const PressureStack: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();

  const trapOp = interpolate(frame, [780, 820], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const leftOp = interpolate(frame, [840, 880], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const rightOp2 = interpolate(frame, [920, 960], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const pressure = interpolate(frame, [1020, 1060], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.danger} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 100px' }}>
        <div style={{ ...rise(8, 16), fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 4, color: COLORS.muted, marginBottom: 18 }}>
          WORST POSSIBLE TIME
        </div>
        <h1 style={{
          ...rise(20, 20),
          fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 68, color: COLORS.ink,
          margin: 0, marginBottom: 40, textAlign: 'center',
        }}>
          Pressure from every side
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: 1100, marginBottom: 40 }}>
          {PRESSURES.map((p) => {
            const Icon = p.icon;
            const op = interpolate(frame, [p.at, p.at + 18], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
            const x = interpolate(frame, [p.at, p.at + 18], [-40, 0], { ...CLAMP, easing: EASINGS.easeOut });
            return (
              <div key={p.label} style={{
                opacity: op, transform: `translateX(${x}px)`,
                display: 'flex', alignItems: 'center', gap: 24,
                background: COLORS.paper, border: `2px solid ${p.color}`,
                borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '22px 32px',
              }}>
                <Icon size={36} color={p.color} strokeWidth={2.2} />
                <div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 36, color: COLORS.ink }}>{p.label}</div>
                  <div style={{ fontSize: 24, color: COLORS.muted, marginTop: 4 }}>{p.sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ opacity: trapOp, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: COLORS.ink, marginBottom: 28 }}>
          Stuck in a <span style={{ color: COLORS.danger }}>painful spot</span>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{
            opacity: leftOp, background: COLORS.paper, borderRadius: RADIUS.card, border: `2px solid ${COLORS.line}`,
            padding: '24px 36px', boxShadow: SHADOW.card, width: 420, textAlign: 'center',
          }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 20, color: COLORS.muted, marginBottom: 8 }}>ANNOUNCE EARLY</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 32, color: COLORS.ink }}>Product not ready</div>
          </div>
          <div style={{
            opacity: rightOp2, background: COLORS.paper, borderRadius: RADIUS.card, border: `2px solid ${COLORS.line}`,
            padding: '24px 36px', boxShadow: SHADOW.card, width: 420, textAlign: 'center',
          }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 20, color: COLORS.muted, marginBottom: 8 }}>HOLD BACK</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 32, color: COLORS.ink }}>Market moves without you</div>
          </div>
        </div>

        <div style={{
          opacity: pressure, marginTop: 32,
          fontFamily: FONT_BODY, fontSize: 30, color: COLORS.muted,
        }}>
          Either way, the pressure is public.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default PressureStack;
