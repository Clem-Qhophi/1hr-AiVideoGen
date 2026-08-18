// EvidenceFrame / EvidenceBrowser — display a real screenshot in a branded frame with a source
// citation. Used for "evidence cutaways": when the script makes a factual claim, show the real
// screenshot (tweet, article, benchmark, website) instead of animated text.
//
// Frame-based only; monotonic interpolate; no useState/useEffect.
//
// TWO GLOBAL FIXES (2026-07-24):
//  1. The source citation now sits in the TOP band (label left, source right) — NOT the bottom —
//     so it never collides with the full-video caption bar that lives at the bottom. (Was a
//     per-video cosmetic issue in EVOLUTION.md.)
//  2. Both components now support `highlight` with IDENTICAL semantics: {x,y,w,h} are percentages
//     of the SCREENSHOT AREA (the image box, excluding any browser chrome). Adding highlight to
//     EvidenceBrowser removes the reason people used to swap components + reuse coords (the
//     "off-by-a-row" bug). Still verify a highlight by pulling the rendered frame — a % only maps
//     to a pixel exactly when the screenshot's aspect matches the box (contain can letterbox).
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, Img, staticFile } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../brand';
import { FONT_BODY, FONT_MONO } from '../fonts';
import { CLAMP } from './kit';

type Highlight = { x: number; y: number; w: number; h: number; startFrame?: number };

// Shared highlight overlay — positioned in % of its (relative) parent, which callers size to the
// screenshot area. Keeps the box math in one place so both frames animate it identically.
const HighlightBox: React.FC<{ highlight: Highlight; appearAt: number; scale: number }> = ({
  highlight, appearAt, scale,
}) => {
  const frame = useCurrentFrame();
  const start = highlight.startFrame ?? appearAt + 30;
  const op = interpolate(frame, [start, start + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const sc = interpolate(frame, [start, start + 16], [0.92, 1], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <div style={{
      position: 'absolute',
      left: `${highlight.x}%`, top: `${highlight.y}%`,
      width: `${highlight.w}%`, height: `${highlight.h}%`,
      border: `${4 * scale}px solid ${COLORS.warn}`,
      borderRadius: 8, opacity: op, transform: `scale(${sc})`,
      boxShadow: `0 0 0 ${4 * scale}px ${COLORS.warn}33, 0 0 ${40 * scale}px ${COLORS.warn}66`,
      pointerEvents: 'none',
    }} />
  );
};

// Top-band label (left) + source citation (right), sharing the strip above the frame so neither
// touches the bottom caption bar.
const TopBand: React.FC<{
  x: number; w: number; topY: number; scale: number;
  label?: string; source?: string; labelOp: number; sourceOp: number;
}> = ({ x, w, topY, scale, label, source, labelOp, sourceOp }) => (
  <>
    {label && (
      <div style={{
        position: 'absolute', top: topY, left: x, opacity: labelOp,
        fontFamily: FONT_MONO, fontSize: 24 * scale, letterSpacing: 5, color: COLORS.d400,
      }}>
        {label}
      </div>
    )}
    {source && (
      <div style={{
        position: 'absolute', top: topY, left: x, width: w, textAlign: 'right', opacity: sourceOp,
        fontFamily: FONT_MONO, fontSize: 22 * scale, color: COLORS.d400,
      }}>
        Source: {source}
      </div>
    )}
  </>
);

export const EvidenceFrame: React.FC<{
  // Path relative to media/ — e.g., 'projects/gemini-release/evidence/bloomberg.png'
  image: string;
  // Source citation text shown at the top-right (e.g., "Bloomberg, Jul 2026")
  source: string;
  // Optional: a label shown at the top-left (e.g., "THE REPORT")
  label?: string;
  // Animation start frame
  appearAt?: number;
  // Optional highlight box {x, y, w, h} in percentages (0-100) of the screenshot area
  highlight?: Highlight;
  // Scale of the frame within the 1920x1080 canvas
  scale?: number;
}> = ({ image, source, label, appearAt = 0, highlight, scale = 1 }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [appearAt, appearAt + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const y = interpolate(frame, [appearAt, appearAt + 14], [30, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const labelOp = interpolate(frame, [appearAt + 6, appearAt + 16], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const sourceOp = interpolate(frame, [appearAt + 20, appearAt + 32], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  const W = 1600 * scale;
  const H = 900 * scale;
  const x = (1920 - W) / 2;
  const top = (1080 - H) / 2 - 20;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.d900, fontFamily: FONT_BODY, opacity: op, transform: `translateY(${y}px)` }}>
      <TopBand x={x} w={W} topY={top - 46 * scale} scale={scale}
        label={label} source={source} labelOp={labelOp} sourceOp={sourceOp} />

      {/* screenshot frame — the highlight's positioning context (% maps to this box). */}
      <div style={{
        position: 'absolute', left: x, top, width: W, height: H,
        borderRadius: RADIUS.card, overflow: 'hidden',
        border: `2px solid ${COLORS.d600}`, boxShadow: SHADOW.card,
        background: COLORS.paper,
      }}>
        <Img
          src={staticFile(image)}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
        {highlight && <HighlightBox highlight={highlight} appearAt={appearAt} scale={scale} />}
      </div>
    </AbsoluteFill>
  );
};

// A simpler variant: screenshot in a browser-like chrome frame (for website screenshots)
export const EvidenceBrowser: React.FC<{
  image: string;
  url: string;
  source?: string;
  label?: string;
  appearAt?: number;
  // Highlight box in % of the SCREENSHOT area (below the chrome bar) — same semantics as EvidenceFrame.
  highlight?: Highlight;
  scale?: number;
}> = ({ image, url, source, label, appearAt = 0, highlight, scale = 1 }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [appearAt, appearAt + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const y = interpolate(frame, [appearAt, appearAt + 14], [30, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const labelOp = interpolate(frame, [appearAt + 6, appearAt + 16], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const sourceOp = interpolate(frame, [appearAt + 20, appearAt + 32], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  const W = 1600 * scale;
  const H = 900 * scale;
  const x = (1920 - W) / 2;
  const top = (1080 - H) / 2 - 30;
  const chromeH = 80 * scale;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.d900, fontFamily: FONT_BODY, opacity: op, transform: `translateY(${y}px)` }}>
      <TopBand x={x} w={W} topY={top - 40 * scale} scale={scale}
        label={label} source={source} labelOp={labelOp} sourceOp={sourceOp} />

      <div style={{
        position: 'absolute', left: x, top, width: W,
        borderRadius: `${RADIUS.card}px ${RADIUS.card}px 0 0`,
        overflow: 'hidden', border: `2px solid ${COLORS.d600}`,
        boxShadow: SHADOW.card,
      }}>
        {/* browser chrome */}
        <div style={{
          height: chromeH, background: COLORS.d800,
          display: 'flex', alignItems: 'center', gap: 12 * scale,
          padding: `0 ${20 * scale}px`, borderBottom: `1px solid ${COLORS.d600}`,
        }}>
          <span style={{ width: 12 * scale, height: 12 * scale, borderRadius: '50%', background: '#ff5f57' }} />
          <span style={{ width: 12 * scale, height: 12 * scale, borderRadius: '50%', background: '#febc2e' }} />
          <span style={{ width: 12 * scale, height: 12 * scale, borderRadius: '50%', background: '#28c840' }} />
          <div style={{
            flex: 1, background: COLORS.d900, borderRadius: 999,
            padding: `${8 * scale}px ${20 * scale}px`, marginLeft: 16 * scale,
            fontFamily: FONT_MONO, fontSize: 18 * scale, color: COLORS.d400,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {url}
          </div>
        </div>

        {/* screenshot — the highlight's positioning context (% maps to this box, chrome excluded). */}
        <div style={{ position: 'relative', width: W, height: H - chromeH, overflow: 'hidden', background: COLORS.paper }}>
          <Img src={staticFile(image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {highlight && <HighlightBox highlight={highlight} appearAt={appearAt} scale={scale} />}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// EvidenceBackdrop — a real screenshot as a dimmed, slow-drifting FULL-BLEED background for a
// kinetic/statement beat, so the ad stays evidence-backed even on beats built around big text or
// stat cards rather than a framed screenshot. Built for /make-ad's evidence-density rule ("4+
// distinct real screenshots used across the ad, not one reused") — cycle a different real capture
// through each beat's backdrop instead of a flat brand gradient. Content (text/cards) renders on
// top; keep it high-contrast against the dim layer. `dim` is the darkening overlay opacity (0-1,
// default 0.82 — legible screenshot texture without competing with foreground text).
//
// COMPLIANCE: `dim` makes a screenshot read as atmosphere, it does NOT make its text illegible.
// A raw marketing-page capture (hero/testimonials/pricing sections) usually has promo banners,
// stat claims, discount codes, or reviews baked into the pixels — those are exactly the claims an
// ad's approval process is supposed to gate, and they will ship anyway if the screenshot is used
// whole. Before passing `image` here, either crop the source to a claims-clean sub-region
// (`tools/capture_evidence.py --crop x,y,w,h`) or check every visible word against the project's
// claims register. Caught on qt-funded-ad v1 (2026-08-08): four full-bleed marketing screenshots
// shipped unapproved profit-share/discount-code/trader-count/testimonial claims as "just a
// backdrop." See videos/qt-funded-ad/work/v1-audit-report.md.
export const EvidenceBackdrop: React.FC<{
  image: string; dim?: number; drift?: boolean; frames?: number; tint?: string;
}> = ({ image, dim = 0.82, drift = true, frames = 300, tint = '#000000' }) => {
  const frame = useCurrentFrame();
  const zoom = drift
    ? interpolate(frame, [0, frames], [1.04, 1.12], { ...CLAMP, easing: EASINGS.easeInOut })
    : 1.04;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Img src={staticFile(image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `${tint}${Math.round(dim * 255).toString(16).padStart(2, '0')}` }} />
    </AbsoluteFill>
  );
};
