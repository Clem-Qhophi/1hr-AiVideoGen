// Shared building blocks for the ai-self-preservation shot list ONLY. NOT a shot itself — no
// compositionConfig export, so gen-registry skips this file (same convention as remotion/src/lib/kit.tsx).
// Dark (d900) aesthetic to match the existing ASPEvidence.tsx evidence shot so the whole video reads
// as one piece. Frame-based only; monotonic interpolate + clamp; no useState/useEffect.
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, Img, staticFile } from 'remotion';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';

export const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

// rise-in (fade + translateY)
export const rise = (frame: number, start: number, dist = 26, dur = 16) => ({
  opacity: interpolate(frame, [start, start + dur], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
  transform: `translateY(${interpolate(frame, [start, start + dur], [dist, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
});

// slam-in (scale overshoot) — for big numbers / hook lines
export const slam = (frame: number, start: number, dur = 12) => ({
  opacity: interpolate(frame, [start, start + dur], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
  transform: `scale(${interpolate(frame, [start, start + dur], [0.82, 1], { ...CLAMP, easing: EASINGS.overshoot })})`,
});

// Full-bleed real stock photo, dimmed + slow Ken-Burns zoom, for atmosphere (not evidence — no
// source citation). Path is relative to media/, e.g. 'projects/ai-self-preservation/stock/x.jpg'.
export const PhotoBg: React.FC<{ image: string; dim?: number; frames?: number; from?: number; to?: number }> = ({
  image, dim = 0.78, frames = 900, from = 1.04, to = 1.16,
}) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, frames], [from, to], { ...CLAMP, easing: EASINGS.easeInOut });
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Img src={staticFile(image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${COLORS.d900}${Math.round(dim * 255).toString(16).padStart(2, '0')}, ${COLORS.d900}${Math.round(Math.min(1, dim + 0.1) * 255).toString(16).padStart(2, '0')} 60%, ${COLORS.d900}f2)` }} />
    </AbsoluteFill>
  );
};

// Flat dark backdrop with a faint accent glow + dotted grid — for text-only beats with no photo.
export const DarkBg: React.FC<{ glow?: string }> = ({ glow = COLORS.accent }) => (
  <>
    <AbsoluteFill style={{ backgroundColor: COLORS.d900 }} />
    <AbsoluteFill style={{ background: `radial-gradient(1300px 700px at 50% -8%, ${glow}2e, transparent 60%)` }} />
    <AbsoluteFill style={{ backgroundImage: `radial-gradient(${COLORS.d600} 1.5px, transparent 1.5px)`, backgroundSize: '46px 46px', opacity: 0.35 }} />
  </>
);

export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = COLORS.d400, style }) => (
  <div style={{ fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 6, color, textTransform: 'uppercase', ...style }}>
    {children}
  </div>
);

export const BigStat: React.FC<{
  frame: number; appearAt: number; value: string; label: string; sub?: string; color?: string;
}> = ({ frame, appearAt, value, label, sub, color = COLORS.danger }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 18 }}>
    <div style={{ ...rise(frame, appearAt), ...{} }}><Eyebrow color={color}>{label}</Eyebrow></div>
    <div style={{ ...slam(frame, appearAt + 8), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 168, lineHeight: 1, color: COLORS.d300 }}>
      {value}
    </div>
    {sub && (
      <div style={{ ...rise(frame, appearAt + 20), fontFamily: FONT_BODY, fontSize: 32, color: COLORS.d400, textAlign: 'center', maxWidth: 1000 }}>
        {sub}
      </div>
    )}
  </AbsoluteFill>
);

export const QuoteCard: React.FC<{
  frame: number; appearAt: number; quote: string; attribution: string; accent?: string;
}> = ({ frame, appearAt, quote, attribution, accent = COLORS.warn }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '0 220px', gap: 28 }}>
    <div style={{ ...rise(frame, appearAt), fontSize: 120, color: accent, fontFamily: FONT_DISPLAY, lineHeight: 0.5 }}>&ldquo;</div>
    <div style={{
      ...rise(frame, appearAt + 6, 20),
      fontFamily: FONT_BODY, fontWeight: 600, fontSize: 52, lineHeight: 1.35, color: COLORS.d300, textAlign: 'center',
    }}>
      {quote}
    </div>
    <div style={{ ...rise(frame, appearAt + 30), fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 3, color: accent }}>
      — {attribution}
    </div>
  </AbsoluteFill>
);

export const ListItem: React.FC<{
  frame: number; appearAt: number; n: string; text: string; y: number; accent?: string;
}> = ({ frame, appearAt, n, text, y, accent = COLORS.accent }) => (
  <div style={{
    ...rise(frame, appearAt, 20),
    position: 'absolute', top: y, left: 220, right: 220,
    display: 'flex', alignItems: 'flex-start', gap: 28,
  }}>
    <div style={{
      flexShrink: 0, width: 64, height: 64, borderRadius: RADIUS.pill,
      border: `2px solid ${accent}`, color: accent, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 30,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {n}
    </div>
    <div style={{ fontFamily: FONT_BODY, fontSize: 34, fontWeight: 500, color: COLORS.d300, lineHeight: 1.3, paddingTop: 10 }}>
      {text}
    </div>
  </div>
);

export const CenterTitle: React.FC<{
  frame: number; appearAt: number; eyebrow?: string; title: string; sub?: string; color?: string;
}> = ({ frame, appearAt, eyebrow, title, sub, color = COLORS.accent }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 26, padding: '0 200px', textAlign: 'center' }}>
    {eyebrow && <div style={rise(frame, appearAt)}><Eyebrow color={color}>{eyebrow}</Eyebrow></div>}
    <div style={{
      ...slam(frame, appearAt + 8),
      fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 84, lineHeight: 1.08, color: COLORS.d300,
    }}>
      {title}
    </div>
    {sub && (
      <div style={{ ...rise(frame, appearAt + 26), fontFamily: FONT_BODY, fontSize: 34, color: COLORS.d400, maxWidth: 1200 }}>
        {sub}
      </div>
    )}
  </AbsoluteFill>
);
