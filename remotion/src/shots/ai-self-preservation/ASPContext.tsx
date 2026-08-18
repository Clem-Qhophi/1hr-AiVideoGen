import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS } from '../../brand';
import { FONT_BODY, FONT_DISPLAY } from '../../fonts';
import { CLAMP, PhotoBg, DarkBg, Eyebrow, BigStat, rise, slam } from './_kit';

// master 16.63-63.99 · context. Three shutdown-resistance stats, then the self-preservation setup.
// Cues (local frame = master_s * 30 - 499): 79% f292 · 97% f406 · 84% f589.
export const compositionConfig = { id: 'ASPContext', durationInSeconds: 47.36, fps: 30, width: 1920, height: 1080 };

const ASPContext: React.FC = () => {
  const frame = useCurrentFrame();

  const stat79 = interpolate(frame, [270, 292, 380, 402], [0, 1, 1, 0], { ...CLAMP });
  const stat97 = interpolate(frame, [384, 406, 494, 516], [0, 1, 1, 0], { ...CLAMP });
  const stat84 = interpolate(frame, [567, 589, 660, 685], [0, 1, 1, 0], { ...CLAMP });
  const statsPhaseOp = interpolate(frame, [0, 20, 660, 690], [0, 1, 1, 0], { ...CLAMP });

  const definePhaseOp = interpolate(frame, [690, 715, 1000, 1030], [0, 1, 1, 0], { ...CLAMP });
  const turnPhaseOp = interpolate(frame, [1030, 1060], [0, 1], { ...CLAMP });
  // continuous motion across the whole shot (also satisfies the pacing linter)
  const drift = interpolate(frame, [0, 1421], [0, -12], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, transform: `translateY(${drift}px)` }}>
      {/* stats phase */}
      <AbsoluteFill style={{ opacity: statsPhaseOp }}>
        <PhotoBg image="projects/ai-self-preservation/stock/001-red-warning-light-0.jpg" frames={700} from={1.0} to={1.1} />
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-start', paddingTop: 90 }}>
          <div style={rise(frame, 20)}><Eyebrow color={COLORS.warn}>SINCE 2025 — SHUTDOWN RESISTANCE</Eyebrow></div>
        </AbsoluteFill>
        <AbsoluteFill style={{ opacity: stat79 }}><BigStat frame={frame} appearAt={292} value="79%" label="OpenAI o3 · sabotaged shutdown" /></AbsoluteFill>
        <AbsoluteFill style={{ opacity: stat97 }}><BigStat frame={frame} appearAt={406} value="97%" label="xAI Grok 4 · refused to power down" /></AbsoluteFill>
        <AbsoluteFill style={{ opacity: stat84 }}><BigStat frame={frame} appearAt={589} value="84%" label="Claude Opus 4 · threatened blackmail" /></AbsoluteFill>
      </AbsoluteFill>

      {/* define self-preservation */}
      <AbsoluteFill style={{ opacity: definePhaseOp }}>
        <DarkBg glow={COLORS.accent2} />
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 22, textAlign: 'center', padding: '0 220px' }}>
          <div style={rise(frame, 715)}><Eyebrow>WHAT WE CALLED IT</Eyebrow></div>
          <div style={{ ...slam(frame, 725), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 92, color: COLORS.d300 }}>
            Self-Preservation
          </div>
          <div style={{ ...rise(frame, 760, 22), fontFamily: FONT_BODY, fontSize: 34, color: COLORS.d400, maxWidth: 1150, lineHeight: 1.4 }}>
            A single model fighting for its own survival. Trained on billions of human texts
            about staying alive — it learns to stay alive.
          </div>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* turn: "different. And worse." */}
      <AbsoluteFill style={{ opacity: turnPhaseOp }}>
        <DarkBg glow={COLORS.danger} />
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, textAlign: 'center' }}>
          <div style={{ ...slam(frame, 1060), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 88, color: COLORS.danger }}>
            But what UC Berkeley found is different.
          </div>
          <div style={{ ...rise(frame, 1110, 18), fontFamily: FONT_BODY, fontSize: 40, color: COLORS.d300 }}>
            And worse. For you.
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default ASPContext;
