import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { Swords } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, useRise, CLAMP } from '../../lib/kit';

export const compositionConfig = {
  id: 'Battlefield',
  durationInSeconds: 12,
  fps: 30,
  width: 1920,
  height: 1080,
};

const Battlefield: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();

  const leadOp = interpolate(frame, [200, 230], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const chaseOp = interpolate(frame, [260, 295], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const chaseY = interpolate(frame, [260, 295], [24, 0], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 140px' }}>
        <div style={{ ...rise(6, 16), display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28 }}>
          <Swords size={40} color={COLORS.accent} strokeWidth={2.2} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 28, letterSpacing: 4, color: COLORS.muted }}>NOT A SMALL MISS</span>
        </div>

        <h1 style={{
          ...rise(20, 24),
          fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 96, color: COLORS.ink,
          margin: 0, marginBottom: 48, textAlign: 'center',
        }}>
          Coding is the <span style={{ color: COLORS.accent }}>battlefield</span>
        </h1>

        <div style={{ display: 'flex', gap: 32, alignItems: 'stretch' }}>
          <div style={{
            opacity: leadOp,
            background: COLORS.paper, border: `2px solid ${COLORS.line}`,
            borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '32px 44px', width: 420,
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: COLORS.muted, marginBottom: 12 }}>IF YOU CAN&rsquo;T</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: COLORS.ink }}>Write &amp; fix code at the top tier</div>
          </div>

          <div style={{
            opacity: chaseOp, transform: `translateY(${chaseY}px)`,
            background: COLORS.ink, borderRadius: RADIUS.card, boxShadow: SHADOW.card,
            padding: '32px 44px', width: 420, textAlign: 'center',
          }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: COLORS.d400, marginBottom: 12 }}>THEN YOU ARE</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 48, color: COLORS.paper }}>
              Not leading.<br /><span style={{ color: COLORS.warn }}>Chasing it.</span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default Battlefield;
