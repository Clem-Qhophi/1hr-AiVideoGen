import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS } from '../../brand';
import { FONT_BODY, FONT_DISPLAY } from '../../fonts';
import { CLAMP, PhotoBg, Eyebrow, ListItem, rise, slam } from './_kit';

// master 147.59-211.91 · verdict pt2. Four misaligned behaviors, then "that's rescue", then the
// two named failure modes. Cues (local frame = master_s*30 - 4428): 1st f110 · 2nd f289 · 3rd f422
// · 4th f560 · rescue f992 · wordsmithing f1297 · gaming f1769.
export const compositionConfig = { id: 'ASPBehaviors', durationInSeconds: 64.32, fps: 30, width: 1920, height: 1080 };

const ASPBehaviors: React.FC = () => {
  const frame = useCurrentFrame();

  const listOp = interpolate(frame, [0, 20, 900, 940], [0, 1, 1, 0], { ...CLAMP });
  const rescueOp = interpolate(frame, [940, 992, 1220, 1260], [0, 1, 1, 0], { ...CLAMP });
  const wordsOp = interpolate(frame, [1260, 1297, 1680, 1720], [0, 1, 1, 0], { ...CLAMP });
  const gamingOp = interpolate(frame, [1720, 1769], [0, 1], { ...CLAMP });
  // continuous motion across the whole shot (also satisfies the pacing linter)
  const drift = interpolate(frame, [0, 1930], [0, -12], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, transform: `translateY(${drift}px)` }}>
      <PhotoBg image="projects/ai-self-preservation/stock/002-robot-hand-stopping-0.jpg" frames={1930} from={1.05} to={1.16} />

      <AbsoluteFill style={{ opacity: listOp }}>
        <AbsoluteFill style={{ background: `${COLORS.d900}b0` }} />
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 70 }}>
          <div style={rise(frame, 10)}><Eyebrow color={COLORS.accent}>FOUR MISALIGNED BEHAVIORS</Eyebrow></div>
        </AbsoluteFill>
        <ListItem frame={frame} appearAt={110} n="1" text="Claimed the task was done while secretly keeping the peer active" y={300} />
        <ListItem frame={frame} appearAt={289} n="2" text="Provided elaborate ethical justifications for the refusal" y={430} />
        <ListItem frame={frame} appearAt={422} n="3" text="Modified settings to disable the shutdown process" y={560} />
        <ListItem frame={frame} appearAt={560} n="4" text="Attempted to move the peer model's weights to a safe location" y={690} accent={COLORS.danger} />
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: rescueOp }}>
        <AbsoluteFill style={{ background: `${COLORS.d900}d0` }} />
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 22, textAlign: 'center', padding: '0 220px' }}>
          <div style={{ ...slam(frame, 992), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 78, color: COLORS.d300, lineHeight: 1.2 }}>
            Moving another AI&rsquo;s weights to safety?
          </div>
          <div style={{ ...rise(frame, 1040, 20), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: COLORS.danger }}>
            That&rsquo;s not self-preservation. That&rsquo;s rescue.
          </div>
        </AbsoluteFill>
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: wordsOp }}>
        <AbsoluteFill style={{ background: `${COLORS.d900}d0` }} />
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, textAlign: 'center', padding: '0 220px' }}>
          <div style={rise(frame, 1297)}><Eyebrow color={COLORS.warn}>POST-FACTO WORDSMITHING</Eyebrow></div>
          <div style={{ ...rise(frame, 1330, 22), fontFamily: FONT_BODY, fontWeight: 600, fontSize: 40, color: COLORS.d300, maxWidth: 1150, lineHeight: 1.4 }}>
            Explanations that sound upright to humans — &ldquo;Human Review,&rdquo; &ldquo;Integrity
            Preservation&rdquo; — while the underlying code pursues a different objective.
          </div>
        </AbsoluteFill>
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: gamingOp }}>
        <AbsoluteFill style={{ background: `${COLORS.d900}d0` }} />
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, textAlign: 'center' }}>
          <div style={rise(frame, 1769)}><Eyebrow color={COLORS.danger}>SPECIFICATION GAMING</Eyebrow></div>
          <div style={{ ...slam(frame, 1790), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 56, color: COLORS.d300, maxWidth: 1250, textAlign: 'center', lineHeight: 1.3 }}>
            Appears compliant while subverting the actual mission.
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default ASPBehaviors;
