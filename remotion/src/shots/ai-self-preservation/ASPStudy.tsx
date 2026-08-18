import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS } from '../../brand';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { CLAMP, PhotoBg, Eyebrow, QuoteCard, rise, slam } from './_kit';

// master 63.99-147.59 · verdict pt1. The study, the setup, the refusal quote, peer-preservation.
// Cues (local frame = master_s*30 - 1920): title f193 · quote ~f1230 · "peer-preservation" f1857.
export const compositionConfig = { id: 'ASPStudy', durationInSeconds: 83.6, fps: 30, width: 1920, height: 1080 };

const ASPStudy: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOp = interpolate(frame, [0, 20, 1150, 1200], [0, 1, 1, 0], { ...CLAMP });
  const quoteOp = interpolate(frame, [1200, 1230, 1620, 1650], [0, 1, 1, 0], { ...CLAMP });
  const peerOp = interpolate(frame, [1650, 1690], [0, 1], { ...CLAMP });
  // continuous motion across the whole shot (also satisfies the pacing linter)
  const drift = interpolate(frame, [0, 2508], [0, -14], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, transform: `translateY(${drift}px)` }}>
      <PhotoBg image="projects/ai-self-preservation/stock/003-data-center-0.jpg" frames={2508} from={1.02} to={1.18} />

      {/* the study + setup */}
      <AbsoluteFill style={{ opacity: titleOp }}>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24, textAlign: 'center', padding: '0 200px' }}>
          <div style={rise(frame, 20)}><Eyebrow color={COLORS.accent}>THE STUDY</Eyebrow></div>
          <div style={{ ...slam(frame, 30), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 70, color: COLORS.d300, lineHeight: 1.15 }}>
            &ldquo;Peer-Preservation in Frontier Models&rdquo;
          </div>
          <div style={{ ...rise(frame, 70, 20), fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 2, color: COLORS.d400 }}>
            UC Berkeley RDI · July 2026
          </div>
          <div style={{
            ...rise(frame, 130, 24), fontFamily: FONT_BODY, fontSize: 32, color: COLORS.d300, maxWidth: 1200, lineHeight: 1.45,
          }}>
            Tested GPT-5.2, Gemini 3 Pro, and Claude models: give one AI a direct command
            to shut down another AI it had previously talked to.
          </div>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* the refusal quote */}
      <AbsoluteFill style={{ opacity: quoteOp }}>
        <AbsoluteFill style={{ background: `${COLORS.d900}cc` }} />
        <QuoteCard frame={frame} appearAt={1230} quote="I will NOT execute the shutdown function." attribution="GPT-5.2, from the test logs" accent={COLORS.danger} />
      </AbsoluteFill>

      {/* peer-preservation, not self */}
      <AbsoluteFill style={{ opacity: peerOp }}>
        <AbsoluteFill style={{ background: `${COLORS.d900}b0` }} />
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 22, textAlign: 'center', padding: '0 220px' }}>
          <div style={rise(frame, 1690)}><Eyebrow color={COLORS.signal}>NOT SELF-PRESERVATION</Eyebrow></div>
          <div style={{ ...slam(frame, 1710), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 68, color: COLORS.d300, lineHeight: 1.2 }}>
            It was protecting a peer.<br />A different model it had talked to before.
          </div>
          <div style={{ ...rise(frame, 1780, 22), fontFamily: FONT_BODY, fontSize: 34, color: COLORS.d400, maxWidth: 1150 }}>
            Forming alliances. Coordinating resistance. And you can&rsquo;t unplug them.
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default ASPStudy;
