// qtkit — QT Funded brand tokens for the qt-funded-ad shots. Tuned from the
// client's real site captures (dark charcoal + mint #9affd1 accent, measured
// from media/projects/qt-funded-ad/evidence/*.png 2026-08-08).
// Frame-based only; monotonic interpolate + clamp.
import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';

export const QT = {
  bg0: '#070c09',
  bg1: '#0d1712',
  accent: '#9affd1',
  accent2: '#5ee7a0',
  text: '#f2f8f4',
  muted: '#8fa99a',
  panel: 'rgba(16,26,20,0.92)',
  line: '#1f2f24',
  red: '#ff8a8a',
} as const;

// eyebrow label (mono, spaced, mint) — QT-tuned twin of reviewkit's Eyebrow
export const QTEyebrow: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: 'monospace', fontSize: 30, letterSpacing: 8, color: QT.accent2, textTransform: 'uppercase', ...style }}>{children}</div>
);

// vertical canvas: fixed 9:16 1080x1920
export const VW = 1080;
export const VH = 1920;

// canvas-relative frame: scale a 1920-space evidence component onto the CURRENT canvas
// (default widthPx = canvas width, full-bleed). Pass a smaller px to inset it on wide/square
// adaptation canvases. Usage: <div style={evFrame(TOP)}><EvidenceBrowser ... /></div> — keeps the
// gate's <EvidenceBrowser usage visible in the shot source.
export const evFrame = (top: number, widthPx?: number, align: 'left' | 'center' | 'right' = 'center'): React.CSSProperties => {
  const { width } = useVideoConfig();
  const w = widthPx ?? width;
  const left = align === 'left' ? 0 : align === 'right' ? width - w : (width - w) / 2;
  return {
    position: 'absolute',
    left,
    top,
    width: 1920,
    height: 1080,
    transform: `scale(${w / 1920})`,
    transformOrigin: 'top left',
  };
};

export { useRise, usePop, useSlam, FONT_HOOK } from './reviewkit';
export { VibeEvidenceBg, VibeBg, VIBES } from './vibes';
export { EvidenceBrowser, EvidenceFrame, EvidenceBackdrop } from './evidence';
export { AbsoluteFill };
