"""Shot template generator — creates rich, multi-element TSX shot files.

Each template has MULTIPLE animated elements appearing in sequence — not just
static text on a background. Uses __PLACEHOLDER__ tokens (not .format()).
"""
import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

GLOW_MAP = {
    "danger": "COLORS.danger",
    "accent": "COLORS.accent",
    "warn": "COLORS.warn",
    "signal": "COLORS.signal",
    "accent2": "COLORS.accent2",
}

# =============================================================================
# SHARED ANIMATED BACKGROUND (used by all templates)
# =============================================================================

BG_COMPONENT = r'''
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
'''

RISE_UTIL = r'''
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
'''

# =============================================================================
# HOOK — big statement + animated cards + background blobs
# =============================================================================

HOOK_TEMPLATE = r'''import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';

__BG_COMPONENT__
__RISE_UTIL__

export const compositionConfig = {
  id: '__ID__',
  durationInSeconds: __DURATION__,
  fps: 30,
  width: 1920,
  height: 1080,
};

const __ID__: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const totalFrames = __DURATION__ * 30;

  const headlineOp = interpolate(frame, [8, 22], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const subOp = interpolate(frame, [30, 48], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const exitOp = interpolate(frame, [totalFrames - 15, totalFrames], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, opacity: exitOp }}>
      <BrandBg glow={COLORS.danger} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 120px' }}>
        <div style={{ ...rise(4, 18), fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 5, color: COLORS.danger, marginBottom: 24 }}>
          __LABEL__
        </div>
        <h1 style={{
          opacity: headlineOp,
          fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 88, color: COLORS.ink,
          margin: 0, marginBottom: 28, textAlign: 'center', lineHeight: 1.15,
        }}>
          __HEADLINE__
        </h1>
        <div style={{ opacity: subOp, fontFamily: FONT_BODY, fontSize: 32, color: COLORS.muted, textAlign: 'center', maxWidth: 1100, lineHeight: 1.5 }}>
          __SUBHEADLINE__
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 48 }}>
          <Card start={60}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: COLORS.muted }}>__STAT_1_LABEL__</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 48, color: COLORS.danger, marginTop: 8 }}>__STAT_1_VALUE__</div>
          </Card>
          <Card start={75}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: COLORS.muted }}>__STAT_2_LABEL__</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 48, color: COLORS.accent, marginTop: 8 }}>__STAT_2_VALUE__</div>
          </Card>
          <Card start={90}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: COLORS.muted }}>__STAT_3_LABEL__</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 48, color: COLORS.signal, marginTop: 8 }}>__STAT_3_VALUE__</div>
          </Card>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default __ID__;
'''

# =============================================================================
# STATEMENT — text + supporting chips + highlight sweep + background
# =============================================================================

STATEMENT_TEMPLATE = r'''import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';

__BG_COMPONENT__
__RISE_UTIL__

export const compositionConfig = {
  id: '__ID__',
  durationInSeconds: __DURATION__,
  fps: 30,
  width: 1920,
  height: 1080,
};

const __ID__: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const totalFrames = __DURATION__ * 30;

  const labelOp = interpolate(frame, [4, 16], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const textOp = interpolate(frame, [14, 30], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const exitOp = interpolate(frame, [totalFrames - 15, totalFrames], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, opacity: exitOp }}>
      <BrandBg glow={__GLOW__} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 140px' }}>
        <div style={{ ...rise(4, 16), opacity: labelOp, fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 4, color: COLORS.muted, marginBottom: 20 }}>
          __LABEL__
        </div>
        <h1 style={{
          opacity: textOp,
          fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: COLORS.ink,
          margin: 0, marginBottom: 36, textAlign: 'center', lineHeight: 1.3,
        }}>
          __TEXT__
        </h1>
        <div style={{ display: 'flex', gap: 20, marginTop: 32 }}>
          <Card start={45}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 20, color: COLORS.muted }}>__CHIP_1_LABEL__</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 32, color: COLORS.ink, marginTop: 6 }}>__CHIP_1_VALUE__</div>
          </Card>
          <Card start={60}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 20, color: COLORS.muted }}>__CHIP_2_LABEL__</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 32, color: COLORS.ink, marginTop: 6 }}>__CHIP_2_VALUE__</div>
          </Card>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default __ID__;
'''

# =============================================================================
# EVIDENCE — screenshot in browser frame with zoom animation
# =============================================================================

EVIDENCE_TEMPLATE = r'''import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill, Img, staticFile } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';

__BG_COMPONENT__

export const compositionConfig = {
  id: '__ID__',
  durationInSeconds: __DURATION__,
  fps: 30,
  width: 1920,
  height: 1080,
};

const __ID__: React.FC = () => {
  const frame = useCurrentFrame();
  const totalFrames = __DURATION__ * 30;

  const enterOp = interpolate(frame, [0, 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const enterY = interpolate(frame, [0, 14], [30, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const labelOp = interpolate(frame, [10, 22], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const sourceOp = interpolate(frame, [20, 34], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const zoom = interpolate(frame, [20, totalFrames - 30], [1, __ZOOM_LEVEL__], { ...CLAMP, easing: EASINGS.easeInOut });
  const exitOp = interpolate(frame, [totalFrames - 15, totalFrames], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });

  const W = 1500, H = 900;
  const x = (1920 - W) / 2, top = (1080 - H) / 2 - 20;

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, opacity: exitOp }}>
      <BrandBg glow={COLORS.accent} />
      <div style={{
        position: 'absolute', top: top - 42, left: 0, right: 0, textAlign: 'center',
        opacity: labelOp, fontFamily: FONT_MONO, fontSize: 22, letterSpacing: 5, color: COLORS.muted,
      }}>
        __LABEL__
      </div>
      <div style={{
        position: 'absolute', left: x, top, width: W, height: H,
        borderRadius: `${RADIUS.card}px ${RADIUS.card}px 0 0`, overflow: 'hidden',
        border: `2px solid ${COLORS.d600}`, boxShadow: SHADOW.card,
        opacity: enterOp, transform: `translateY(${enterY}px) scale(${zoom})`,
        transformOrigin: '50% 50%',
      }}>
        <div style={{
          height: 72, background: COLORS.d800, display: 'flex', alignItems: 'center',
          gap: 12, padding: '0 20px', borderBottom: `1px solid ${COLORS.d600}`,
        }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
          <div style={{
            flex: 1, background: COLORS.d900, borderRadius: 999, padding: '8px 20px',
            fontFamily: FONT_MONO, fontSize: 17, color: COLORS.d400,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginLeft: 16,
          }}>
            __URL__
          </div>
        </div>
        <div style={{ width: W, height: H - 72, overflow: 'hidden', background: COLORS.paper }}>
          <Img src={staticFile('__IMAGE__')} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      </div>
      <div style={{
        position: 'absolute', top: top + H + 14, left: 0, right: 0, textAlign: 'center',
        opacity: sourceOp, fontFamily: FONT_MONO, fontSize: 20, color: COLORS.d400,
      }}>
        Source: __SOURCE__
      </div>
    </AbsoluteFill>
  );
};

export default __ID__;
'''

# =============================================================================
# LIST — items appearing one by one with icons + connecting line
# =============================================================================

LIST_TEMPLATE = r'''import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';

__BG_COMPONENT__
__RISE_UTIL__

export const compositionConfig = {
  id: '__ID__',
  durationInSeconds: __DURATION__,
  fps: 30,
  width: 1920,
  height: 1080,
};

const ITEMS = __ITEMS__;

const __ID__: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const totalFrames = __DURATION__ * 30;
  const itemSpacing = 24;
  const lineDraw = interpolate(frame, [40, 40 + ITEMS.length * 8], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  const exitOp = interpolate(frame, [totalFrames - 15, totalFrames], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, opacity: exitOp }}>
      <BrandBg glow={__GLOW__} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 100px' }}>
        <h1 style={{ ...rise(8, 20), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: COLORS.ink, margin: 0, marginBottom: 40, textAlign: 'center' }}>
          __TITLE__
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 1000 }}>
          {ITEMS.map((item, i) => {
            const at = 50 + i * itemSpacing;
            const op = interpolate(frame, [at, at + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
            const x = interpolate(frame, [at, at + 14], [-30, 0], { ...CLAMP, easing: EASINGS.easeOut });
            const itemColor = item.color || COLORS.accent;
            return (
              <div key={i} style={{
                opacity: op, transform: `translateX(${x}px)`,
                display: 'flex', alignItems: 'center', gap: 24,
                background: COLORS.paper, border: `2px solid ${itemColor}`,
                borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '20px 32px',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, background: itemColor + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FONT_MONO, fontSize: 22, fontWeight: 700, color: itemColor, flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 34, color: COLORS.ink }}>{item.title}</div>
                  <div style={{ fontSize: 22, color: COLORS.muted, marginTop: 2 }}>{item.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default __ID__;
'''

# =============================================================================
# OUTRO — big CTA + animated gradient + wordmark
# =============================================================================

OUTRO_TEMPLATE = r'''import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';

__BG_COMPONENT__
__RISE_UTIL__

export const compositionConfig = {
  id: '__ID__',
  durationInSeconds: __DURATION__,
  fps: 30,
  width: 1920,
  height: 1080,
};

const __ID__: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const totalFrames = __DURATION__ * 30;

  const mainOp = interpolate(frame, [10, 26], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const ctaOp = interpolate(frame, [50, 70], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const ctaScale = interpolate(frame, [50, 70], [0.92, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const exitOp = interpolate(frame, [totalFrames - 15, totalFrames], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, opacity: exitOp }}>
      <BrandBg glow={COLORS.accent} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 120px' }}>
        <h1 style={{
          opacity: mainOp,
          fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 76, color: COLORS.ink,
          margin: 0, marginBottom: 32, textAlign: 'center', lineHeight: 1.25,
        }}>
          __MAIN_TEXT__
        </h1>
        <div style={{
          opacity: ctaOp, transform: `scale(${ctaScale})`,
          background: COLORS.accent, borderRadius: RADIUS.pill, padding: '20px 48px',
          boxShadow: '0 8px 32px ' + COLORS.accent + '44',
        }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: COLORS.paper }}>
            __CTA_TEXT__
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default __ID__;
'''

# =============================================================================
# ZOOM — screenshot with Ken Burns effect + highlight box
# =============================================================================

ZOOM_TEMPLATE = r'''import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill, Img, staticFile } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';

__BG_COMPONENT__

export const compositionConfig = {
  id: '__ID__',
  durationInSeconds: __DURATION__,
  fps: 30,
  width: 1920,
  height: 1080,
};

const __ID__: React.FC = () => {
  const frame = useCurrentFrame();
  const totalFrames = __DURATION__ * 30;

  const enterOp = interpolate(frame, [0, 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const zoom = interpolate(frame, [20, totalFrames - 30], [1.0, __ZOOM_LEVEL__], { ...CLAMP, easing: EASINGS.easeInOut });
  const panX = interpolate(frame, [20, totalFrames - 30], [0, __PAN_X__], { ...CLAMP, easing: EASINGS.easeInOut });
  const panY = interpolate(frame, [20, totalFrames - 30], [0, __PAN_Y__], { ...CLAMP, easing: EASINGS.easeInOut });
  const hlOp = interpolate(frame, [50, 66], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const hlScale = interpolate(frame, [50, 66], [0.9, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const exitOp = interpolate(frame, [totalFrames - 15, totalFrames], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });

  const W = 1600, H = 900;
  const x = (1920 - W) / 2, top = (1080 - H) / 2;

  return (
    <AbsoluteFill style={{ fontFamily: 'system-ui', opacity: exitOp }}>
      <BrandBg glow={COLORS.accent} />
      <div style={{
        position: 'absolute', left: x, top, width: W, height: H,
        borderRadius: RADIUS.card, overflow: 'hidden',
        border: `2px solid ${COLORS.d600}`, boxShadow: SHADOW.card,
        opacity: enterOp,
      }}>
        <div style={{
          transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
          transformOrigin: '__FOCUS_X__% __FOCUS_Y__%',
          width: '100%', height: '100%',
        }}>
          <Img src={staticFile('__IMAGE__')} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        {__HIGHLIGHT_BOX__}
      </div>
      <div style={{
        position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center',
        fontFamily: FONT_MONO, fontSize: 20, color: COLORS.d400,
        opacity: interpolate(frame, [30, 50], [0, 1], CLAMP),
      }}>
        __SOURCE__
      </div>
    </AbsoluteFill>
  );
};

export default __ID__;
'''

# =============================================================================
# CALLOUT — text annotation with arrow pointing to a region
# =============================================================================

CALLOUT_TEMPLATE = r'''import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';
import { CLAMP } from '../../lib/kit';

__BG_COMPONENT__
__RISE_UTIL__

export const compositionConfig = {
  id: '__ID__',
  durationInSeconds: __DURATION__,
  fps: 30,
  width: 1920,
  height: 1080,
};

const __ID__: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const totalFrames = __DURATION__ * 30;
  const exitOp = interpolate(frame, [totalFrames - 15, totalFrames], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, opacity: exitOp }}>
      <BrandBg glow={__GLOW__} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 120px' }}>
        <h1 style={{ ...rise(8, 20), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: COLORS.ink, margin: 0, marginBottom: 40, textAlign: 'center' }}>
          __TITLE__
        </h1>
        <Card start={24}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 36, color: COLORS.ink, marginBottom: 8 }}>
            __CALLOUT_TEXT__
          </div>
          <div style={{ fontSize: 24, color: COLORS.muted }}>__SUB_TEXT__</div>
        </Card>
        <div style={{ ...rise(50, 20), marginTop: 28, fontFamily: FONT_BODY, fontSize: 28, color: COLORS.muted, textAlign: 'center' }}>
          __NOTE__
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default __ID__;
'''

# =============================================================================
# COMPARISON — side-by-side with animated elements + VS
# =============================================================================

COMPARISON_TEMPLATE = r'''import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';

__BG_COMPONENT__
__RISE_UTIL__

export const compositionConfig = {
  id: '__ID__',
  durationInSeconds: __DURATION__,
  fps: 30,
  width: 1920,
  height: 1080,
};

const __ID__: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const totalFrames = __DURATION__ * 30;
  const exitOp = interpolate(frame, [totalFrames - 15, totalFrames], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });

  const leftOp = interpolate(frame, [20, 36], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const leftX = interpolate(frame, [20, 36], [-40, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const rightOp = interpolate(frame, [40, 56], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const rightX = interpolate(frame, [40, 56], [40, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const vsOp = interpolate(frame, [30, 50], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const vsScale = interpolate(frame, [30, 50], [0.5, 1], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, opacity: exitOp }}>
      <BrandBg glow={COLORS.accent} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 80px' }}>
        <h1 style={{ ...rise(4, 18), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 52, color: COLORS.ink, margin: 0, marginBottom: 44, textAlign: 'center' }}>
          __TITLE__
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <div style={{
            opacity: leftOp, transform: `translateX(${leftX}px)`,
            background: COLORS.paper, border: `2px solid __LEFT_COLOR__`,
            borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '32px 40px', width: 460,
          }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 20, color: COLORS.muted, marginBottom: 10 }}>__LEFT_LABEL__</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 38, color: COLORS.ink, marginBottom: 14 }}>__LEFT_TITLE__</div>
            <div style={{ fontSize: 22, color: COLORS.muted }}>__LEFT_DESC__</div>
          </div>
          <div style={{ opacity: vsOp, transform: `scale(${vsScale})`, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 48, color: COLORS.accent }}>VS</div>
          <div style={{
            opacity: rightOp, transform: `translateX(${rightX}px)`,
            background: COLORS.paper, border: `2px solid __RIGHT_COLOR__`,
            borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '32px 40px', width: 460,
          }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 20, color: COLORS.muted, marginBottom: 10 }}>__RIGHT_LABEL__</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 38, color: COLORS.ink, marginBottom: 14 }}>__RIGHT_TITLE__</div>
            <div style={{ fontSize: 22, color: COLORS.muted }}>__RIGHT_DESC__</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default __ID__;
'''

# =============================================================================
# TRANSITION — gradient wipe between sections
# =============================================================================

TRANSITION_TEMPLATE = r'''import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { COLORS, EASINGS } from '../../brand';
import { FONT_DISPLAY } from '../../fonts';
import { CLAMP } from '../../lib/kit';

export const compositionConfig = {
  id: '__ID__',
  durationInSeconds: __DURATION__,
  fps: 30,
  width: 1920,
  height: 1080,
};

const __ID__: React.FC = () => {
  const frame = useCurrentFrame();
  const totalFrames = __DURATION__ * 30;
  const wipeIn = interpolate(frame, [0, 14], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  const wipeOut = interpolate(frame, [totalFrames - 14, totalFrames], [1, 0], { ...CLAMP, easing: EASINGS.easeInOut });
  const textOp = interpolate(frame, [8, 20], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }) * interpolate(frame, [totalFrames - 16, totalFrames - 4], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });

  return (
    <AbsoluteFill style={{ background: COLORS.ink, opacity: wipeIn * wipeOut }}>
      <AbsoluteFill style={{
        background: `linear-gradient(120deg, __COLOR_1__, __COLOR_2__)`,
        clipPath: `polygon(${wipeIn * 100}% 0, 100% 0, ${100 - wipeOut * 100}% 100%, 0 100%)`,
      }} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 84, color: COLORS.paper, opacity: textOp, margin: 0, textAlign: 'center' }}>
          __TEXT__
        </h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default __ID__;
'''

# =============================================================================
# CAPTION — word-level subtitle overlay
# =============================================================================

CAPTION_TEMPLATE = r'''import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { COLORS, RADIUS } from '../../brand';
import { FONT_DISPLAY } from '../../fonts';
import { CLAMP } from '../../lib/kit';

export const compositionConfig = {
  id: '__ID__',
  durationInSeconds: __DURATION__,
  fps: 30,
  width: 1920,
  height: 1080,
  transparent: true,
};

// [{ t: word, s: startMs, e: endMs }] — REAL word times from edited-transcript.json
const WORDS = __WORDS_JSON__;

const __ID__: React.FC = () => {
  const frame = useCurrentFrame();
  const tMs = (frame / 30) * 1000;

  // current word = the last word whose start time has passed (words are in order)
  let cur = -1;
  for (let i = 0; i < WORDS.length; i++) {
    if (WORDS[i].s <= tMs) cur = i;
    else break;
  }

  // nothing before the first word, and clear shortly after the last one ends
  const lastEnd = WORDS.length ? WORDS[WORDS.length - 1].e : 0;
  if (cur < 0 || tMs > lastEnd + 500) return null;

  const visibleStart = Math.max(0, cur - 2);
  const visibleEnd = Math.min(WORDS.length, cur + 5);
  const visible = WORDS.slice(visibleStart, visibleEnd);

  return (
    <AbsoluteFill style={{
      // AbsoluteFill is flexDirection:'column', so justifyContent is the VERTICAL axis and
      // alignItems is the HORIZONTAL one. flex-end + center == bottom-centre.
      // (Getting this backwards renders the caption bar middle-RIGHT and clipped off-frame.)
      justifyContent: 'flex-end', alignItems: 'center',
      paddingBottom: 70,
      pointerEvents: 'none',
    }}>
      <div style={{
        background: 'rgba(13, 17, 23, 0.88)', borderRadius: RADIUS.pill,
        padding: '14px 32px', backdropFilter: 'blur(10px)',
        display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1400,
      }}>
        {visible.map((w, i) => {
          const isCurrent = visibleStart + i === cur;
          const op = isCurrent ? 1 : 0.35;
          const color = isCurrent ? COLORS.accent : COLORS.d300;
          return (
            <span key={visibleStart + i} style={{
              fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 40,
              color, opacity: op,
            }}>
              {w.t}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default __ID__;
'''

# =============================================================================
# Template fill helper
# =============================================================================

def _fill(template: str, replacements: dict) -> str:
    result = template
    for key, value in replacements.items():
        result = result.replace(f"__{key}__", str(value))
    # Inject shared components
    result = result.replace("__BG_COMPONENT__", BG_COMPONENT)
    result = result.replace("__RISE_UTIL__", RISE_UTIL)
    return result


def _escape_jsx_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace("{", "&lbrace;").replace("}", "&rbrace;")
    text = text.replace("<", "&lt;").replace(">", "&gt;")
    text = text.replace("'", "\u2019")
    return text


def generate_shots(plan: list, project: str) -> list:
    """Generate TSX shot files from a plan. Returns list of {id, file, template}."""
    shots_dir = ROOT / "remotion" / "src" / "shots" / project
    shots_dir.mkdir(parents=True, exist_ok=True)

    generated = []
    for i, beat in enumerate(plan):
        template_name = beat.get("template", "statement")
        shot_id = beat.get("id", f"Shot{i:02d}")
        duration = beat.get("duration_s", 6)
        props = beat.get("props", {})
        glow = GLOW_MAP.get(props.get("glow", "accent"), "COLORS.accent")

        if template_name == "hook":
            tsx = _fill(HOOK_TEMPLATE, {
                "ID": shot_id, "DURATION": duration,
                "LABEL": _escape_jsx_text(props.get("label", "")),
                "HEADLINE": _escape_jsx_text(props.get("headline", "")),
                "SUBHEADLINE": _escape_jsx_text(props.get("subheadline", "")),
                "STAT_1_LABEL": _escape_jsx_text(props.get("stat_1_label", "")),
                "STAT_1_VALUE": _escape_jsx_text(props.get("stat_1_value", "")),
                "STAT_2_LABEL": _escape_jsx_text(props.get("stat_2_label", "")),
                "STAT_2_VALUE": _escape_jsx_text(props.get("stat_2_value", "")),
                "STAT_3_LABEL": _escape_jsx_text(props.get("stat_3_label", "")),
                "STAT_3_VALUE": _escape_jsx_text(props.get("stat_3_value", "")),
            })
        elif template_name == "statement":
            tsx = _fill(STATEMENT_TEMPLATE, {
                "ID": shot_id, "DURATION": duration, "GLOW": glow,
                "LABEL": _escape_jsx_text(props.get("label", "")),
                "TEXT": _escape_jsx_text(props.get("text", "")),
                "CHIP_1_LABEL": _escape_jsx_text(props.get("chip_1_label", "")),
                "CHIP_1_VALUE": _escape_jsx_text(props.get("chip_1_value", "")),
                "CHIP_2_LABEL": _escape_jsx_text(props.get("chip_2_label", "")),
                "CHIP_2_VALUE": _escape_jsx_text(props.get("chip_2_value", "")),
            })
        elif template_name == "evidence":
            total_frames = int(duration * 30)
            exit_start = total_frames - 15
            tsx = _fill(EVIDENCE_TEMPLATE, {
                "ID": shot_id, "DURATION": duration,
                "IMAGE": props.get("image", ""),
                "URL": props.get("url", ""),
                "SOURCE": props.get("source", ""),
                "LABEL": props.get("label", ""),
                "ZOOM_LEVEL": props.get("zoom_level", 1.4),
                "EXIT_START": exit_start, "EXIT_END": exit_start + 15,
            })
        elif template_name == "list":
            items = props.get("items", [])
            tsx = _fill(LIST_TEMPLATE, {
                "ID": shot_id, "DURATION": duration, "GLOW": glow,
                "TITLE": _escape_jsx_text(props.get("title", "")),
                "ITEMS": json.dumps(items),
            })
        elif template_name == "outro":
            tsx = _fill(OUTRO_TEMPLATE, {
                "ID": shot_id, "DURATION": duration,
                "MAIN_TEXT": _escape_jsx_text(props.get("main_text", "")),
                "CTA_TEXT": _escape_jsx_text(props.get("cta_text", "")),
            })
        elif template_name == "zoom":
            total_frames = int(duration * 30)
            hl_box = ""
            if props.get("highlight"):
                hl = props["highlight"]
                hl_box = f'''<div style={{{{ position: 'absolute', left: '{hl["x"]}%', top: '{hl["y"]}%', width: '{hl["w"]}%', height: '{hl["h"]}%', border: '4px solid {COLORS.warn}', borderRadius: 8, opacity: hlOp, transform: `scale(${{hlScale}})`, boxShadow: '0 0 40px {COLORS.warn}66', pointerEvents: 'none' }}}} />'''
            tsx = _fill(ZOOM_TEMPLATE, {
                "ID": shot_id, "DURATION": duration,
                "IMAGE": props.get("image", ""),
                "ZOOM_LEVEL": props.get("zoom_level", 1.8),
                "PAN_X": props.get("pan_x", 0), "PAN_Y": props.get("pan_y", 0),
                "FOCUS_X": props.get("focus_x", 50), "FOCUS_Y": props.get("focus_y", 50),
                "SOURCE": _escape_jsx_text(props.get("source", "")),
                "HIGHLIGHT_BOX": hl_box,
            })
        elif template_name == "callout":
            exit_start = int(duration * 30) - 15
            callout_color = GLOW_MAP.get(props.get("callout_color", "warn"), "COLORS.warn")
            tsx = _fill(CALLOUT_TEMPLATE, {
                "ID": shot_id, "DURATION": duration, "GLOW": glow,
                "TITLE": _escape_jsx_text(props.get("title", "")),
                "CALLOUT_TEXT": _escape_jsx_text(props.get("callout_text", "")),
                "SUB_TEXT": _escape_jsx_text(props.get("sub_text", "")),
                "NOTE": _escape_jsx_text(props.get("note", "")),
                "CALLOUT_COLOR": callout_color,
                "EXIT_START": exit_start, "EXIT_END": exit_start + 15,
            })
        elif template_name == "comparison":
            exit_start = int(duration * 30) - 15
            tsx = _fill(COMPARISON_TEMPLATE, {
                "ID": shot_id, "DURATION": duration,
                "TITLE": _escape_jsx_text(props.get("title", "")),
                "LEFT_LABEL": _escape_jsx_text(props.get("left_label", "")),
                "LEFT_TITLE": _escape_jsx_text(props.get("left_title", "")),
                "LEFT_DESC": _escape_jsx_text(props.get("left_desc", "")),
                "LEFT_COLOR": GLOW_MAP.get(props.get("left_color", "accent"), "COLORS.accent"),
                "RIGHT_LABEL": _escape_jsx_text(props.get("right_label", "")),
                "RIGHT_TITLE": _escape_jsx_text(props.get("right_title", "")),
                "RIGHT_DESC": _escape_jsx_text(props.get("right_desc", "")),
                "RIGHT_COLOR": GLOW_MAP.get(props.get("right_color", "danger"), "COLORS.danger"),
                "EXIT_START": exit_start, "EXIT_END": exit_start + 15,
            })
        elif template_name == "transition":
            tsx = _fill(TRANSITION_TEMPLATE, {
                "ID": shot_id, "DURATION": duration,
                "TEXT": _escape_jsx_text(props.get("text", "")),
                "COLOR_1": props.get("color_1", "COLORS.accent"),
                "COLOR_2": props.get("color_2", "COLORS.accent2"),
            })
        elif template_name == "caption":
            # words are [{t,s,e}] with REAL ms timings from edited-transcript.json
            words = props.get("words", [])
            tsx = _fill(CAPTION_TEMPLATE, {
                "ID": shot_id, "DURATION": duration,
                "WORDS_JSON": json.dumps(words),
            })
        else:
            tsx = _fill(STATEMENT_TEMPLATE, {
                "ID": shot_id, "DURATION": duration, "GLOW": glow,
                "LABEL": _escape_jsx_text(props.get("label", "")),
                "TEXT": _escape_jsx_text(props.get("text", "")),
                "CHIP_1_LABEL": _escape_jsx_text(props.get("chip_1_label", "")),
                "CHIP_1_VALUE": _escape_jsx_text(props.get("chip_1_value", "")),
                "CHIP_2_LABEL": _escape_jsx_text(props.get("chip_2_label", "")),
                "CHIP_2_VALUE": _escape_jsx_text(props.get("chip_2_value", "")),
            })

        shot_file = shots_dir / f"{shot_id}.tsx"
        shot_file.write_text(tsx, encoding="utf-8")
        generated.append({"id": shot_id, "file": str(shot_file), "template": template_name})

    return generated
