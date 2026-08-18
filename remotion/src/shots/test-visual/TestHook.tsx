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
  id: 'TestHook',
  durationInSeconds: 8,
  fps: 30,
  width: 1920,
  height: 1080,
};

const TestHook: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const totalFrames = 8 * 30;

  const headlineOp = interpolate(frame, [8, 22], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const subOp = interpolate(frame, [30, 48], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const exitOp = interpolate(frame, [totalFrames - 15, totalFrames], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, opacity: exitOp }}>
      <BrandBg glow={COLORS.danger} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 120px' }}>
        <div style={{ ...rise(4, 18), fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 5, color: COLORS.danger, marginBottom: 24 }}>
          BREAKING NEWS
        </div>
        <h1 style={{
          opacity: headlineOp,
          fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 88, color: COLORS.ink,
          margin: 0, marginBottom: 28, textAlign: 'center', lineHeight: 1.15,
        }}>
          AI just changed everything again
        </h1>
        <div style={{ opacity: subOp, fontFamily: FONT_BODY, fontSize: 32, color: COLORS.muted, textAlign: 'center', maxWidth: 1100, lineHeight: 1.5 }}>
          OpenAI and Anthropic are trading blows while Google scrambles to catch up
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 48 }}>
          <Card start={60}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: COLORS.muted }}>MODELS RELEASED</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 48, color: COLORS.danger, marginTop: 8 }}>7</div>
          </Card>
          <Card start={75}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: COLORS.muted }}>COMPANIES RACING</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 48, color: COLORS.accent, marginTop: 8 }}>4</div>
          </Card>
          <Card start={90}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: COLORS.muted }}>DEVELOPERS SWITCHING</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 48, color: COLORS.signal, marginTop: 8 }}>40%</div>
          </Card>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default TestHook;
