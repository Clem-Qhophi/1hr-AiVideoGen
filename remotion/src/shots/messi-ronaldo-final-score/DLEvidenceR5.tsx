// DLEvidenceR5 — overlay evidence card for the money round: Forbes estimated wealth.
// Transparent alpha composition composited over the master (bake.py overlay).
import React from 'react';
import { AbsoluteFill, Img, staticFile, interpolate, useCurrentFrame, Easing } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';

export const compositionConfig = {
  id: 'DLEvidenceR5',
  durationInSeconds: 2.2,
  fps: 30,
  width: 1920,
  height: 1080,
  transparent: true,
};

const EvidenceFrame: React.FC<{ title: string; source: string; img: string }> = ({ title, source, img }) => {
  const frame = useCurrentFrame();
  const DUR = Math.round(compositionConfig.durationInSeconds * 30);
  const opacity = interpolate(frame, [0, 4, DUR - 5, DUR], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const scale = interpolate(frame, [0, 8], [0.965, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const W = 1480, H = 832;
  const left = (1920 - W) / 2, top = (1080 - H) / 2;

  return (
    <AbsoluteFill style={{ opacity }}>
      <div style={{
        position: 'absolute', left, top, width: W, height: H,
        backgroundColor: 'rgba(10,15,30,0.88)',
        borderRadius: 18, border: `3px solid ${COLORS.accent}`,
        boxShadow: `0 30px 80px rgba(0,0,0,0.55), 0 0 40px ${COLORS.accent}33`,
        transform: `scale(${scale})`, transformOrigin: 'center center',
        overflow: 'hidden',
      }}>
        <Img src={img} style={{ position: 'absolute', left: 18, top: 18, width: W - 36, height: H - 96, objectFit: 'cover', borderRadius: 10 }} />
        <div style={{
          position: 'absolute', left: 18, bottom: 14, right: 18, height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 800, color: '#FFFFFF', letterSpacing: 1 }}>
            {title}
          </div>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 22, fontWeight: 700, color: COLORS.paper,
            backgroundColor: COLORS.accent, padding: '6px 14px', borderRadius: 999,
          }}>
            {source}
          </div>
        </div>
      </div>
      <div style={{
        position: 'absolute', left: left - 14, top: top - 14, width: 46, height: 46,
        borderLeft: `5px solid ${COLORS.accent}`, borderTop: `5px solid ${COLORS.accent}`,
      }} />
      <div style={{
        position: 'absolute', left: left + W - 32, top: top - 14, width: 46, height: 46,
        borderRight: `5px solid ${COLORS.accent}`, borderTop: `5px solid ${COLORS.accent}`,
      }} />
    </AbsoluteFill>
  );
};

export const DLEvidenceR5: React.FC = () => (
  <EvidenceFrame title="ROUND 5 · MONEY" source="Forbes, estimated" img={staticFile('projects/messi-ronaldo-final-score/evidence/evidence-r5-money.png')} />
);

export default DLEvidenceR5;