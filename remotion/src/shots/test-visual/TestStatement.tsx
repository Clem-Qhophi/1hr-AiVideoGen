import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';


// Animated brand background: gradient blobs + dotted grid + subtle drift
const BrandBg: React.FC<{ glow: string; variant?: 'dark' | 'paper' }> = ({ glow, variant = 'dark' }) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame % 300, [0, 300], [0, 1], { extrapolateRight: 'clamp' });
  const x1 = interpolate(Math.sin(drift * Math.PI * 2) * 50, [-50, 50], [-50, 50]);
  const y1 = interpolate(Math.cos(drift * Math.PI * 1.5) * 30, [-30, 30], [-30, 30]);
  const x2 = interpolate(Math.sin(drift * Math.PI * 1.3 + 2) * 40, [-40, 40], [-40, 40]);
  const y2 = interpolate(Math.cos(drift * Math.PI * 1.7 + 1) * 35, [-35, 35], [-35, 35]);

  return (
    <>
      <AbsoluteFill style={{ backgroundColor: variant === 'dark' ? COLORS.d900 : COLORS.paper }} />
      <AbsoluteFill style={{
        background: `radial-gradient(1200px 600px at ${30 + x1}% ${40 + y1}%, ${glow}18, transparent 60%)`,
        backgroundImage: `radial-gradient(${variant === 'dark' ? COLORS.d600 : COLORS.line} 1.2px, transparent 1.2px)`,
        backgroundSize: '42px 42px', opacity: 0.35,
      }} />
      <AbsoluteFill style={{
        background: `radial-gradient(800px 400px at ${70 + x2}% ${60 + y2}%, ${COLORS.accent}12, transparent 60%)`,
      }} />
    </>
  );
};


// Rise-in animation utility
const useRise = () => {
  const frame = useCurrentFrame();
  return (start: number, dist = 24, dur = 14) => ({
    opacity: interpolate(frame, [start, start + dur], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    transform: `translateY(${interpolate(frame, [start, start + dur], [dist, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
  });
};

// Highlight sweep behind text
const Sweep: React.FC<{ start: number; color?: string; children: React.ReactNode }> = ({ start, color = COLORS.accent + '55', children }) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [start, start + 16], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span style={{ position: 'absolute', left: -6, right: -6, bottom: 6, height: 22, background: color, borderRadius: 6, transform: `scaleX(${s})`, transformOrigin: 'left', zIndex: 0 }} />
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </span>
  );
};

// Card with entrance animation
const Card: React.FC<{ start: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ start, children, style }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [start, start + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const y = interpolate(frame, [start, start + 14], [28, 0], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <div style={{ opacity: op, transform: `translateY(${y}px)`, background: COLORS.paper, border: `2px solid ${COLORS.line}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '24px 36px', ...style }}>
      {children}
    </div>
  );
};


export const compositionConfig = {
  id: 'TestStatement',
  durationInSeconds: 8,
  fps: 30,
  width: 1920,
  height: 1080,
};

const TestStatement: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const totalFrames = 8 * 30;

  const labelOp = interpolate(frame, [4, 16], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const textOp = interpolate(frame, [14, 30], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const exitOp = interpolate(frame, [totalFrames - 15, totalFrames], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, opacity: exitOp }}>
      <BrandBg glow={COLORS.accent} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 140px' }}>
        <div style={{ ...rise(4, 16), opacity: labelOp, fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 4, color: COLORS.muted, marginBottom: 20 }}>
          THE DETAILS
        </div>
        <h1 style={{
          opacity: textOp,
          fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: COLORS.ink,
          margin: 0, marginBottom: 36, textAlign: 'center', lineHeight: 1.3,
        }}>
          Every new model shifts the balance of power in the AI race
        </h1>
        <div style={{ display: 'flex', gap: 20, marginTop: 32 }}>
          <Card start={45}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 20, color: COLORS.muted }}>LEADER</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 32, color: COLORS.ink, marginTop: 6 }}>OpenAI</div>
          </Card>
          <Card start={60}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 20, color: COLORS.muted }}>CHALLENGER</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 32, color: COLORS.ink, marginTop: 6 }}>Anthropic</div>
          </Card>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default TestStatement;
