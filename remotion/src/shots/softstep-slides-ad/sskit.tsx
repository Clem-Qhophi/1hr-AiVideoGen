// sskit â€” Softstep Slides & Sneakers brand tokens for the softstep-slides-ad shots.
// Art direction: light, warm, comfortable (footwear-comfort vertical). Picked the
// beauty-family LIGHT palette as the base per /make-ad (never the dark house template),
// then tuned to the client's world: warm cream + peach + tangerine accent.
// Frame-based only; monotonic interpolate + clamp. 9:16 canvas: 1080x1920.
import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { Particles, Bokeh, GlowWash, Vignette, Grain } from '../../lib/atmosphere';
import { FONT_HOOK, useSlam, usePop, useDrift, Eyebrow } from '../../lib/reviewkit';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';

export const VW = 1080;
export const VH = 1920;

export const SS = {
  bg0: '#FFF7EE',
  bg1: '#FFE9D4',
  glow: '#FFD9B8',
  accent: '#FF6B35',
  accent2: '#0FB5A6',
  text: '#2A2118',
  muted: '#8A7A6A',
  panel: 'rgba(255,252,247,0.92)',
  line: '#F0DCC8',
  white: '#FFFFFF',
  red: '#E5484D',
} as const;

// Client product photos. Preview pass: HAS_PHOTOS=false renders branded placeholder slots.
// When real photos land in media/projects/softstep-slides-ad/product/ (per assets/README.md),
// flip to true and re-render â€” no other change needed.
export const HAS_PHOTOS = true;
export const PRODUCT_DIR = 'projects/softstep-slides-ad/product';
export const PHOTOS = {
  hero: 'product-1.png',       // dark brown — hero on cream (high contrast)
  color1: 'product-2.png',     // light warm colorway
  color2: 'product-3.png',     // light warm colorway
  color3: 'product-4.png',     // light warm colorway
  color4: 'product-5.png',     // dark colorway
  color5: 'product-6.png',     // neutral grey colorway
  lifestyle: 'lifestyle.png',  // landscape lifestyle strip
} as const;

export const SSBg: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <>
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${SS.bg0}, ${SS.bg1})` }} />
    <GlowWash color="#FFB27A" opacity={0.3} y={8} size={1400} />
    <Bokeh count={8} colors={['#FFFFFF', '#FFD9B8', '#FFC9A3']} opacity={0.5} speed={0.5} size={[120, 340]} seed={15} />
    <Particles count={24} color="#FFFFFF" direction="drift" size={[2, 6]} opacity={0.6} glow seed={16} />
    <Vignette strength={0.2} color="#C9A58C" />
    <Grain opacity={0.04} />
    {children}
  </>
);

export const SSEyebrow: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <Eyebrow color={SS.accent2} style={{ fontSize: 28, letterSpacing: 7, ...style }}>{children}</Eyebrow>
);

// slow continuous push on the whole content layer — keeps a long chunk visually alive after
// its slams have settled (VO chunks here run 6-10s; a settled frame reads as broken).
export const SSDrift: React.FC<{ children: React.ReactNode; frames?: number; to?: number }> = ({ children, frames = 300, to = 1.05 }) => {
  const d = useDrift(frames, 1.0, to);
  return <AbsoluteFill style={{ ...d, alignItems: 'center', justifyContent: 'center' }}>{children}</AbsoluteFill>;
};

// big display line that slams in on its cue word
export const SSLine: React.FC<{
  text: string;
  start: number;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ text, start, size = 104, color = SS.text, style }) => {
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_HOOK, fontSize: size, lineHeight: 1.02, color, textAlign: 'center', ...slam(start), ...style }}>
      {text}
    </div>
  );
};

// real product photo with cinematic treatment, or a branded placeholder slot
export const ProductSlot: React.FC<{
  name: keyof typeof PHOTOS | string;
  label: string;
  style?: React.CSSProperties;
}> = ({ name, label, style }) => {
  if (HAS_PHOTOS) {
    return (
      <Img
        src={staticFile(`${PRODUCT_DIR}/${name}`)}
        style={{ width: '100%', height: '100%', objectFit: 'contain', ...style }}
      />
    );
  }
  return (
    <div
      style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20,
        border: `3px dashed ${SS.line}`, borderRadius: 32,
        background: 'rgba(255,255,255,0.5)',
        ...style,
      }}
    >
      <div style={{ width: 96, height: 96, borderRadius: 48, background: SS.bg1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: FONT_HOOK, fontSize: 40, color: SS.accent, opacity: 0.8 }}>SS</div>
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 3, color: SS.muted, textTransform: 'uppercase', textAlign: 'center' }}>{label}</div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 20, color: SS.muted, opacity: 0.7 }}>{name}</div>
    </div>
  );
};

// pop-in pill for stacked claims
export const SSPill: React.FC<{
  children: React.ReactNode;
  start: number;
  accent?: string;
  style?: React.CSSProperties;
}> = ({ children, start, accent = SS.accent, style }) => {
  const pop = usePop();
  return (
    <div
      style={{
        fontFamily: FONT_HOOK, fontSize: 56, lineHeight: 1.05, color: SS.text, textAlign: 'center',
        background: SS.panel, border: `3px solid ${accent}`, borderRadius: 22,
        padding: '26px 34px', ...pop(start), ...style,
      }}
    >
      {children}
    </div>
  );
};

export { FONT_DISPLAY, FONT_HOOK, AbsoluteFill };

// colorway row: horizontal strip of small product thumbnails (for SSFlip)
export const ColorwayStrip: React.FC<{ delay?: number }> = ({ delay = 80 }) => {
  const pop = usePop();
  const thumbnails = [PHOTOS.color1, PHOTOS.color2, PHOTOS.color3, PHOTOS.color4, PHOTOS.color5];
  return (
    <div style={{ ...pop(delay), display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 14, width: '100%', padding: '0 20px' }}>
      {thumbnails.map((name, i) => (
        <div key={name} style={{ width: 140, height: 140, borderRadius: 18, overflow: 'hidden', border: `2px solid ${SS.line}`, background: SS.panel }}>
          <Img src={staticFile(`${PRODUCT_DIR}/${name}`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ))}
    </div>
  );
};
