import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { EASINGS } from '../../brand';
import { CLAMP } from '../../lib/kit';
import { VibeBg } from '../../lib/vibes';
import { useRise } from '../../lib/reviewkit';

// Beat 1: Hook — 0s-15s (0f-450f)
// "You just blew a funded challenge"
export const compositionConfig = { id: 'RMHook', durationInSeconds: 15, fps: 30, width: 1920, height: 1080 };

const RMHook: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const r = (a: number, b: number, from = 0, to = 1) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing: EASINGS.easeOut });

  // "revenge traded" emphasis — ~5578ms = ~167f
  const emphOp = r(160, 176);
  const emphScale = interpolate(frame, [160, 178], [0.9, 1], { ...CLAMP, easing: EASINGS.overshoot });

  // "after a loss" — ~6894ms = ~207f
  const subOp = r(200, 216);
  const subY = interpolate(frame, [200, 216], [20, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // "and watched the account disappear in fifteen minutes" — ~10381ms = ~311f
  const line2Op = r(305, 325);
  const line2Y = interpolate(frame, [305, 325], [24, 0], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 170px', textAlign: 'center' }}>
        <div style={{ ...rise(2, 16) }}>
          <h1 style={{
            fontWeight: 700, fontSize: 96, lineHeight: 1.15, color: '#eaf5ef', margin: 0,
          }}>
            You just blew a
          </h1>
          <h1 style={{
            fontWeight: 700, fontSize: 108, lineHeight: 1.1, color: '#22c55e', margin: '8px 0 0',
          }}>
            funded challenge.
          </h1>
        </div>

        <div style={{ opacity: emphOp, transform: `scale(${emphScale})`, marginTop: 50 }}>
          <span style={{
            fontFamily: FONT_MONO, fontSize: 38, color: '#8ba396',
            border: '1px solid #232b36', borderRadius: 10, padding: '12px 28px',
            background: '#0b1720cc',
          }}>
            Because you <span style={{ color: '#22c55e', fontWeight: 600 }}>revenge traded</span> after a loss.
          </span>
        </div>

        <div style={{ opacity: subOp, transform: `translateY(${subY}px)`, marginTop: 20 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 30, color: '#8ba396' }}>
            and watched the account disappear
          </span>
        </div>

        <div style={{ opacity: line2Op, transform: `translateY(${line2Y}px)`, marginTop: 24 }}>
          <span style={{
            fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 56, color: '#eaf5ef',
          }}>
            in <span style={{ color: '#22c55e' }}>fifteen minutes</span>.
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default RMHook;
