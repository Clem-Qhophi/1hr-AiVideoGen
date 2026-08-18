import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, useRise, CLAMP } from '../../lib/kit';

export const compositionConfig = {
  id: 'HookDelay',
  durationInSeconds: 15.2,
  fps: 30,
  width: 1920,
  height: 1080,
};

const HookDelay: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();

  const juneOp = interpolate(frame, [14, 28], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const cross = interpolate(frame, [90, 110], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  const julyOp = interpolate(frame, [100, 120], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const stillOp = interpolate(frame, [160, 180], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const stillY = interpolate(frame, [160, 180], [28, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const punch = interpolate(frame, [220, 250], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.danger} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 120px' }}>
        <div style={{ ...rise(4, 18), fontFamily: FONT_MONO, fontSize: 28, letterSpacing: 5, color: COLORS.muted, marginBottom: 28 }}>
          GEMINI 3.5 PRO
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 48, marginBottom: 48 }}>
          <div style={{
            opacity: juneOp,
            background: COLORS.paper,
            border: `2px solid ${COLORS.line}`,
            borderRadius: RADIUS.card,
            padding: '28px 48px',
            boxShadow: SHADOW.card,
            position: 'relative',
          }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: COLORS.muted, marginBottom: 8 }}>PROMISED</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: COLORS.ink }}>June</div>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: cross, pointerEvents: 'none',
            }}>
              <div style={{ width: '90%', height: 6, background: COLORS.danger, transform: 'rotate(-12deg)', borderRadius: 4 }} />
            </div>
          </div>

          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 48, color: COLORS.muted, opacity: julyOp }}>→</div>

          <div style={{
            opacity: julyOp,
            background: COLORS.paper,
            border: `2px solid ${COLORS.danger}`,
            borderRadius: RADIUS.card,
            padding: '28px 48px',
            boxShadow: SHADOW.card,
          }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: COLORS.danger, marginBottom: 8 }}>REALITY</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: COLORS.ink }}>Late July</div>
          </div>
        </div>

        <h1 style={{
          opacity: stillOp, transform: `translateY(${stillY}px)`,
          fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 92, color: COLORS.ink, margin: 0, textAlign: 'center',
        }}>
          Still <span style={{ color: COLORS.danger }}>not out</span>
        </h1>

        <div style={{
          opacity: punch, marginTop: 36,
          fontFamily: FONT_BODY, fontSize: 34, color: COLORS.muted, textAlign: 'center', maxWidth: 1100,
        }}>
          That delay says more about Google&rsquo;s AI race than any keynote.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default HookDelay;
