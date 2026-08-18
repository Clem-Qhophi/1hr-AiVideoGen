import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { EASINGS } from '../../brand';
import { CLAMP } from '../../lib/kit';
import { VibeBg } from '../../lib/vibes';
import { useRise } from '../../lib/reviewkit';

// Beat 2: The Problem — 15s-35s (450f-1050f)
// "The problem isn't your strategy" + "15 minutes of madness -> weeks of progress gone"
export const compositionConfig = { id: 'RMProblem', durationInSeconds: 20, fps: 30, width: 1920, height: 1080 };

const RMProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const r = (a: number, b: number, from = 0, to = 1) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing: EASINGS.easeOut });

  // "They fail because of behavior" ~16802ms. In shot: (16802 - 15000) * 0.03 = ~54f
  const revealOp = r(48, 64);
  const revealY = interpolate(frame, [48, 64], [20, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // "The plan exists... rules exist... but in the heat of the moment those rules feel negotiable"
  // ~22144ms. In shot: (22144 - 15000) * 0.03 = ~214f
  const subOp = r(208, 228);
  const subY = interpolate(frame, [208, 228], [20, 0], { ...CLAMP, easing: EASINGS.easeOut });

  // "The problem isn't your strategy" ~27065ms. In shot: (27065 - 15000) * 0.03 = ~362f
  const slamOp = r(356, 372);
  const slamScale = interpolate(frame, [356, 374], [0.85, 1], { ...CLAMP, easing: EASINGS.overshoot });

  // "15 minutes of madness that wipes out weeks of disciplined progress" ~29352ms
  // In shot: (29352 - 15000) * 0.03 = ~431f
  const statsOp = r(425, 445);
  const statsY = interpolate(frame, [425, 445], [20, 0], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <VibeBg vibe="fintech" />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 140px', textAlign: 'center' }}>
        <div style={{ ...rise(0, 16) }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 6, color: '#8ba396', display: 'block', marginBottom: 32 }}>
            THE REAL PROBLEM
          </span>
          <h1 style={{ fontWeight: 600, fontSize: 64, lineHeight: 1.2, color: '#eaf5ef', margin: 0 }}>
            Most traders don&rsquo;t fail because of bad entries.
          </h1>
        </div>

        <div style={{ opacity: revealOp, transform: `translateY(${revealY}px)`, marginTop: 40 }}>
          <h1 style={{ fontWeight: 700, fontSize: 72, lineHeight: 1.15, color: '#22c55e', margin: 0 }}>
            They fail because of behavior.
          </h1>
        </div>

        <div style={{ opacity: subOp, transform: `translateY(${subY}px)`, marginTop: 44 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 30, color: '#8ba396', lineHeight: 1.6, display: 'block' }}>
            The plan exists. The rules exist.
          </span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 30, color: '#8ba396', lineHeight: 1.6, display: 'block', marginTop: 8 }}>
            But in the heat of the moment, those rules feel{' '}
            <span style={{ color: '#22c55e', fontWeight: 600 }}>negotiable</span>.
          </span>
        </div>

        <div style={{ opacity: slamOp, transform: `scale(${slamScale})`, marginTop: 50 }}>
          <h1 style={{ fontWeight: 700, fontSize: 80, lineHeight: 1.1, color: '#eaf5ef', margin: 0 }}>
            The problem isn&rsquo;t your strategy.
          </h1>
        </div>

        <div style={{ opacity: statsOp, transform: `translateY(${statsY}px)`, marginTop: 36 }}>
          <span style={{
            fontFamily: FONT_DISPLAY, fontSize: 44, color: '#eaf5ef',
            border: '1px solid #232b36', borderRadius: 12, padding: '16px 36px', background: '#0b1720cc',
          }}>
            <span style={{ color: '#22c55e', fontWeight: 700 }}>15 minutes</span> of madness
            <span style={{ color: '#8ba396' }}> &rarr; </span>
            weeks of progress gone
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default RMProblem;
