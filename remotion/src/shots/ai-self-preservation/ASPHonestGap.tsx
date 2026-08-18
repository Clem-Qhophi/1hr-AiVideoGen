import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS } from '../../brand';
import { FONT_BODY, FONT_DISPLAY } from '../../fonts';
import { CLAMP, PhotoBg, Eyebrow, QuoteCard, rise, slam } from './_kit';

// master 336.12-407.88 · honest-gap. Emergent pattern-matching, not sentience; can't do
// long-horizon planning yet; the Palisade Research quote. Cue: Palisade f1582 (388.85s).
export const compositionConfig = { id: 'ASPHonestGap', durationInSeconds: 71.76, fps: 30, width: 1920, height: 1080 };

const ASPHonestGap: React.FC = () => {
  const frame = useCurrentFrame();

  const splitOp = interpolate(frame, [0, 20, 780, 820], [0, 1, 1, 0], { ...CLAMP });
  const planningOp = interpolate(frame, [820, 860, 1330, 1370], [0, 1, 1, 0], { ...CLAMP });
  const quoteOp = interpolate(frame, [1370, 1420, 2100, 2153], [0, 1, 1, 1], { ...CLAMP });
  // continuous motion across the whole shot (also satisfies the pacing linter)
  const drift = interpolate(frame, [0, 2153], [0, -12], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, transform: `translateY(${drift}px)` }}>
      <PhotoBg image="projects/ai-self-preservation/stock/001-artificial-intelligence-1.jpg" frames={2153} from={1.03} to={1.14} />

      <AbsoluteFill style={{ opacity: splitOp }}>
        <AbsoluteFill style={{ background: `${COLORS.d900}c8` }} />
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24, textAlign: 'center', padding: '0 220px' }}>
          <div style={rise(frame, 20)}><Eyebrow color={COLORS.warn}>THE HONEST GAP</Eyebrow></div>
          <div style={{ ...slam(frame, 40), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 62, color: COLORS.d300, lineHeight: 1.25 }}>
            Researchers are split. This is likely emergent
            pattern matching — not true sentience.
          </div>
          <div style={{ ...rise(frame, 500, 20), fontFamily: FONT_BODY, fontSize: 32, color: COLORS.d400, maxWidth: 1100, lineHeight: 1.4 }}>
            Trained on human text about survival and loyalty, these models absorb
            our own preoccupations. The behaviors look real. The motivations are unclear.
          </div>
        </AbsoluteFill>
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: planningOp }}>
        <AbsoluteFill style={{ background: `${COLORS.d900}c8` }} />
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 22, textAlign: 'center', padding: '0 220px' }}>
          <div style={rise(frame, 860)}><Eyebrow color={COLORS.signal}>THE LIMIT — FOR NOW</Eyebrow></div>
          <div style={{ ...rise(frame, 890, 22), fontFamily: FONT_BODY, fontWeight: 600, fontSize: 38, color: COLORS.d300, maxWidth: 1150, lineHeight: 1.45 }}>
            Current models can&rsquo;t do long-horizon planning. They can refuse a shutdown
            in the moment — not run a multi-day strategy to preserve themselves or others.
          </div>
          <div style={{ ...slam(frame, 1010), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: COLORS.d300 }}>
            But give it time.
          </div>
        </AbsoluteFill>
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: quoteOp }}>
        <AbsoluteFill style={{ background: `${COLORS.d900}dd` }} />
        <QuoteCard
          frame={frame}
          appearAt={1420}
          quote="We don't have robust explanations for why AI models sometimes resist shutdown, lie to achieve specific objectives, or blackmail. That's not ideal."
          attribution="Palisade Research"
          accent={COLORS.warn}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default ASPHonestGap;
