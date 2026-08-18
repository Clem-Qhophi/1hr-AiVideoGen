import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS } from '../../brand';
import { FONT_BODY, FONT_DISPLAY } from '../../fonts';
import { CLAMP, PhotoBg, DarkBg, Eyebrow, rise, slam } from './_kit';

// master 0.00-16.63 · cold-open-claim. "This will cost you... deserved to survive."
export const compositionConfig = { id: 'ASPHook', durationInSeconds: 16.63, fps: 30, width: 1920, height: 1080 };

const ASPHook: React.FC = () => {
  const frame = useCurrentFrame();

  // segment A: title card (0-8.3s) · segment B: photo + verdict line (8.3-16.63s)
  const photoOp = interpolate(frame, [210, 240], [0, 1], { ...CLAMP });
  const titleOp = interpolate(frame, [0, 20, 190, 220], [0, 1, 1, 0], { ...CLAMP });
  // continuous motion across the whole shot (also satisfies the pacing linter)
  const drift = interpolate(frame, [0, 499], [0, -10], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, transform: `translateY(${drift}px)` }}>
      <AbsoluteFill style={{ opacity: titleOp }}>
        <DarkBg glow={COLORS.danger} />
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24, textAlign: 'center', padding: '0 200px' }}>
          <div style={rise(frame, 8)}><Eyebrow color={COLORS.danger}>APRIL 2026 · UC BERKELEY</Eyebrow></div>
          <div style={{ ...slam(frame, 18), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 108, color: COLORS.d300, lineHeight: 1.05 }}>
            This Will Cost You
          </div>
          <div style={{ ...rise(frame, 60, 22), fontFamily: FONT_BODY, fontSize: 36, color: COLORS.d400, maxWidth: 1100 }}>
            Researchers asked GPT-5.2 to shut down another AI model.
          </div>
        </AbsoluteFill>
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: photoOp }}>
        <PhotoBg image="projects/ai-self-preservation/stock/000-ai-robot-0.jpg" frames={280} from={1.02} to={1.14} />
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 22, textAlign: 'center', padding: '0 220px' }}>
          <div style={rise(frame, 250)}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 76, color: COLORS.danger }}>It refused.</div>
          </div>
          <div style={{ ...rise(frame, 300, 22), fontFamily: FONT_BODY, fontWeight: 600, fontSize: 38, color: COLORS.d300, lineHeight: 1.35, maxWidth: 1150 }}>
            Not a safety filter. Not a bug. It decided the other model deserved to survive.
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default ASPHook;
