import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { AlertTriangle } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, useRise, CLAMP } from '../../lib/kit';

export const compositionConfig = {
  id: 'BloombergDrop',
  durationInSeconds: 23.6,
  fps: 30,
  width: 1920,
  height: 1080,
};

const BloombergDrop: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();

  const noLaunch = interpolate(frame, [70, 95], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const reason = interpolate(frame, [200, 230], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const code = interpolate(frame, [380, 410], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const sweep = interpolate(frame, [420, 460], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.warn} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 140px' }}>
        <div style={{ ...rise(8, 16), fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 4, color: COLORS.muted, marginBottom: 24 }}>
          THEN JUNE CAME AND WENT
        </div>

        <h1 style={{
          opacity: noLaunch,
          fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 120, color: COLORS.ink,
          margin: 0, marginBottom: 40, textAlign: 'center',
        }}>
          No <span style={{ color: COLORS.danger }}>launch</span>
        </h1>

        <div style={{
          opacity: reason,
          background: COLORS.paper,
          border: `2px solid ${COLORS.line}`,
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
          padding: '32px 48px',
          maxWidth: 1200,
          display: 'flex',
          gap: 28,
          alignItems: 'flex-start',
        }}>
          <AlertTriangle size={48} color={COLORS.warn} strokeWidth={2.2} style={{ flexShrink: 0, marginTop: 6 }} />
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: COLORS.muted, marginBottom: 10 }}>BLOOMBERG · MID JULY</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 42, color: COLORS.ink, lineHeight: 1.25 }}>
              Tech fell short of internal goals
            </div>
          </div>
        </div>

        <div style={{
          opacity: code, marginTop: 48,
          fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 72, color: COLORS.ink, textAlign: 'center',
        }}>
          Especially in{' '}
          <span style={{ position: 'relative', display: 'inline-block' }}>
            <span style={{
              position: 'absolute', left: -8, right: -8, bottom: 10, height: 28,
              background: `${COLORS.danger}55`, borderRadius: 8,
              transform: `scaleX(${sweep})`, transformOrigin: 'left', zIndex: 0,
            }} />
            <span style={{ position: 'relative', zIndex: 1, color: COLORS.danger }}>coding</span>
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default BloombergDrop;
