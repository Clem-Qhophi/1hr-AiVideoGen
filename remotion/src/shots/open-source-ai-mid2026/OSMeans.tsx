import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { RMBg, useRise } from '../../lib/reviewkit';

// master 101.5-119.5 · "canyon" f102 · "single digits" f155 · "stops being a moat" f380
export const compositionConfig = { id: 'OSMeans', durationInSeconds: 18.0, fps: 30, width: 1920, height: 1080 };

const OSMeans: React.FC = () => {
  const rise = useRise();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={COLORS.accent} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: '0 200px', textAlign: 'center' }}>
        <div style={{ ...rise(95, 22), fontSize: 60, fontWeight: 500, color: COLORS.d300, lineHeight: 1.2 }}>
          The gap used to be a <span style={{ color: COLORS.danger, textDecoration: 'line-through', textDecorationColor: COLORS.danger }}>canyon</span>.
        </div>
        <div style={{ ...rise(150, 26), fontSize: 96, fontWeight: 700, color: COLORS.paper, lineHeight: 1.08 }}>
          Now it is <span style={{ color: COLORS.signal }}>single digits</span>.
        </div>
        <div style={{ ...rise(378, 22), marginTop: 18, fontFamily: FONT_MONO, fontSize: 34, color: COLORS.d300, lineHeight: 1.35, maxWidth: 1200 }}>
          So the frontier stops being a <span style={{ color: COLORS.paper }}>moat</span> for most products.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default OSMeans;
