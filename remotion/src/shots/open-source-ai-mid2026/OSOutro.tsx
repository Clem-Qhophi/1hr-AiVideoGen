import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { RMBg, useRise } from '../../lib/reviewkit';

// master 141.0-148.68 · verdict + subscribe (subscribe@144.2 -> f96)
export const compositionConfig = { id: 'OSOutro', durationInSeconds: 7.68, fps: 30, width: 1920, height: 1080 };

const OSOutro: React.FC = () => {
  const rise = useRise();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={COLORS.accent} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40, textAlign: 'center' }}>
        <h1 style={{ ...rise(10, 24), fontWeight: 700, fontSize: 72, lineHeight: 1.14, color: COLORS.paper, margin: 0 }}>
          The state of <span style={{ color: COLORS.accent }}>open source AI</span>,<br />mid 2026.
        </h1>
        <div style={{ ...rise(90, 24), display: 'inline-flex', alignItems: 'center', gap: 14, background: COLORS.accent, color: COLORS.paper, fontWeight: 700, fontSize: 36, borderRadius: 14, padding: '18px 38px' }}>
          Subscribe for the weekly deep dives
        </div>
        <div style={{ ...rise(110, 20), fontFamily: FONT_MONO, fontSize: 26, color: COLORS.d400 }}>this map redraws itself every single week</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default OSOutro;
