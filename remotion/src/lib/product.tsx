// product — cinematic treatment for a REAL product photo.
//
// This is the ad primitive the atmosphere layers exist to serve: take a client's still photo (a can,
// a bottle, a car, a jar) and make it feel filmed rather than pasted. It composites, in depth order:
//
//     vibe backdrop  ->  atmosphere BEHIND  ->  floor glow  ->  PRODUCT (push-in + optional sway)
//                    ->  light sweep across it  ->  atmosphere IN FRONT  ->  vignette/grain
//
// Foreground atmosphere is what sells the depth — bubbles/embers/dust passing IN FRONT of the
// product is the difference between "a photo on a background" and "an object in a space".
//
// HONEST LIMIT: this animates a still. It cannot make a parked car drift or liquid actually pour —
// that needs real footage (client-supplied or stock) or a video-generation provider. What it CAN do
// is push in, light it, and surround it with the right physics so a still reads as a hero shot.
// A product PNG with a transparent background looks dramatically better than a rectangular JPG.
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { EASINGS } from '../brand';
import { CLAMP } from './kit';
import { LightSweep, Vignette, Grain } from './atmosphere';
import { VibeBg, VIBES, type VibeName } from './vibes';

/**
 * Hero product beat.
 *
 * @param image        media/-relative path (same convention as EvidenceFrame), ideally a transparent PNG
 * @param vibe         art direction — drives palette AND the physics around the product
 * @param frames       shot length, so the push-in spans the whole beat
 * @param foreground   optional layer rendered ABOVE the product (pass atmosphere for real depth)
 * @param sweepAt      frame for the specular shine; null disables it
 */
export const ProductHero: React.FC<{
  image: string;
  vibe: VibeName;
  frames: number;
  /** 1.0 = fill height; lower to sit the product smaller in frame */
  scale?: number;
  /** how far the push-in travels over the beat */
  push?: number;
  /** gentle float, as if handheld/suspended */
  sway?: boolean;
  sweepAt?: number | null;
  foreground?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ image, vibe, frames, scale = 0.82, push = 0.09, sway = true, sweepAt = 18, foreground, children }) => {
  const frame = useCurrentFrame();
  const v = VIBES[vibe];

  // slow cinematic push-in across the whole beat (also what keeps a long hold alive)
  const z = interpolate(frame, [0, frames], [1, 1 + push], { ...CLAMP, easing: EASINGS.easeInOut });
  const rise = interpolate(frame, [0, Math.min(26, frames)], [26, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const fade = interpolate(frame, [0, Math.min(16, frames)], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const floatY = sway ? Math.sin(frame * 0.028) * 7 : 0;
  const floatR = sway ? Math.sin(frame * 0.021) * 0.5 : 0;

  return (
    <AbsoluteFill>
      <VibeBg vibe={vibe} />

      {/* floor/pedestal glow — grounds the product instead of letting it float on a flat wash */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(46% 20% at 50% 82%, ${v.glow}55 0%, transparent 70%)`,
          opacity: fade,
        }}
      />

      {/* the product */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Img
          src={staticFile(image)}
          style={{
            height: `${scale * 100}%`,
            objectFit: 'contain',
            opacity: fade,
            transform: `translateY(${rise + floatY}px) scale(${z}) rotate(${floatR}deg)`,
            filter: `drop-shadow(0 34px 70px rgba(0,0,0,.62)) drop-shadow(0 0 46px ${v.glow}2e)`,
          }}
        />
      </AbsoluteFill>

      {sweepAt !== null && <LightSweep startFrame={sweepAt} color="#ffffff" opacity={0.26} />}

      {/* atmosphere IN FRONT of the product — this is what creates depth */}
      {foreground}

      <Vignette strength={v.light ? 0.24 : 0.6} color={v.light ? '#b99a94' : '#000000'} />
      <Grain opacity={v.light ? 0.05 : 0.07} />

      {children}
    </AbsoluteFill>
  );
};

/**
 * Split hero: product on one side, copy on the other. The workhorse layout for an ad's offer beat,
 * where the product must stay visible WHILE claims land next to it.
 */
export const ProductSplit: React.FC<{
  image: string;
  vibe: VibeName;
  frames: number;
  side?: 'left' | 'right';
  scale?: number;
  foreground?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ image, vibe, frames, side = 'left', scale = 0.78, foreground, children }) => {
  const frame = useCurrentFrame();
  const v = VIBES[vibe];
  const z = interpolate(frame, [0, frames], [1, 1.06], { ...CLAMP, easing: EASINGS.easeInOut });
  const fade = interpolate(frame, [0, 16], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const slideFrom = side === 'left' ? -44 : 44;
  const dx = interpolate(frame, [0, 22], [slideFrom, 0], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill>
      <VibeBg vibe={vibe} />
      <AbsoluteFill style={{ flexDirection: side === 'left' ? 'row' : 'row-reverse', alignItems: 'center' }}>
        <div style={{ width: '46%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div
            style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(52% 34% at 50% 62%, ${v.glow}44 0%, transparent 72%)`,
              opacity: fade,
            }}
          />
          <Img
            src={staticFile(image)}
            style={{
              height: `${scale * 100}%`,
              objectFit: 'contain',
              opacity: fade,
              transform: `translateX(${dx}px) scale(${z})`,
              filter: `drop-shadow(0 28px 60px rgba(0,0,0,.6)) drop-shadow(0 0 38px ${v.glow}2a)`,
            }}
          />
        </div>
        <div style={{ width: '54%', padding: '0 90px' }}>{children}</div>
      </AbsoluteFill>
      {foreground}
      <Vignette strength={v.light ? 0.22 : 0.56} color={v.light ? '#b99a94' : '#000000'} />
      <Grain opacity={v.light ? 0.05 : 0.07} />
    </AbsoluteFill>
  );
};
