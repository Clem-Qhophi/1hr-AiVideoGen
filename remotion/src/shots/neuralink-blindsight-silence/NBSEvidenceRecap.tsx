import React from 'react';
import { AbsoluteFill, Img, staticFile, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM, CLAMP } from '../../lib/reviewkit';
import { EASINGS, COLORS, RADIUS, SHADOW } from '../../brand';

// master 183.06-204.1 · evidence pt1. Re-affirm: this is Neuralink's own site, checked today.
export const compositionConfig = { id: 'NBSEvidenceRecap', durationInSeconds: 21.04, fps: 30, width: 1920, height: 1080 };

const NBSEvidenceRecap: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(631);
  const frame = useCurrentFrame();
  const imgOp = interpolate(frame, [20, 34], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  const X = 110, Y = 260, W = 640, H = 420;

  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift }}>
        <div style={{ position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center', ...rise(0, 14) }}>
          <Eyebrow color={RM.cyan}>every number, checkable</Eyebrow>
        </div>

        <div style={{
          position: 'absolute', left: X, top: Y, width: W, height: H, opacity: imgOp,
          borderRadius: RADIUS.card, overflow: 'hidden', border: `2px solid ${COLORS.d600}`,
          boxShadow: SHADOW.card, background: COLORS.paper,
        }}>
          <Img src={staticFile('projects/neuralink-blindsight-silence/evidence/neuralink-trials-status.png')}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '0 0' }} />
        </div>

        <div style={{ position: 'absolute', left: X + W + 90, top: Y + 20, width: 720, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ ...pop(160), display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 28, color: RM.red }}>✕</span>
            <span style={{ fontSize: 26, color: RM.text }}>Not a leak.</span>
          </div>
          <div style={{ ...pop(210), display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 28, color: RM.red }}>✕</span>
            <span style={{ fontSize: 26, color: RM.text }}>Not a rumor.</span>
          </div>
          <div style={{ ...pop(280), fontSize: 34, fontWeight: 800, color: RM.cyan, marginTop: 6 }}>
            Their own site. Today.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default NBSEvidenceRecap;
