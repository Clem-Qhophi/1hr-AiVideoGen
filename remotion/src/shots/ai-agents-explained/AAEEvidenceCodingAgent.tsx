import React from 'react';
import { AbsoluteFill, Img, staticFile, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { RM, useDrift, useRise, usePop, Eyebrow } from '../../lib/reviewkit';
import { CLAMP } from '../../lib/kit';
import { EASINGS, COLORS, RADIUS, SHADOW } from '../../brand';

// master 376.36-432.61 · worked example 2: a coding agent fixing a bug. Real evidence: a live public
// CI dashboard (react/react, is:success) showing the test suite deciding pass/fail - no room to argue.
export const compositionConfig = { id: 'AAEEvidenceCodingAgent', durationInSeconds: 56.25, fps: 30, width: 1920, height: 1080 };

const AAEEvidenceCodingAgent: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(1688);
  const imgOp = interpolate(frame, [0, 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  const W = 1180, H = 520, X = 90, Y = 210;

  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <AbsoluteFill style={{ background: `linear-gradient(160deg, ${RM.bg0}, ${RM.bg1})` }} />
      <AbsoluteFill style={{ ...drift }}>
        <div style={{ position: 'absolute', top: 56, left: 90, opacity: rise(10, 16).opacity }}><Eyebrow color={RM.cyan}>worked example 2 &middot; bigger tools, stricter check</Eyebrow></div>
        <div style={{ position: 'absolute', top: 100, left: 90, fontSize: 26, fontWeight: 600, color: RM.text, ...rise(40, 16) }}>
          Goal: "make the failing test pass."
        </div>

        <div style={{ position: 'absolute', left: X, top: Y, width: W, height: H, opacity: imgOp, borderRadius: RADIUS.card, overflow: 'hidden', border: `2px solid ${COLORS.d600}`, boxShadow: SHADOW.card, background: COLORS.paper }}>
          <Img src={staticFile('projects/ai-agents-explained/evidence/ci-test-runs.png')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '0 0' }} />
        </div>
        <div style={{ position: 'absolute', left: X, top: Y + H + 10, fontFamily: FONT_MONO, fontSize: 16, color: COLORS.d400, ...rise(160, 14) }}>
          Source: GitHub Actions, react/react (public repo)
        </div>

        <div style={{ position: 'absolute', right: 90, top: Y, width: 560 }}>
          <div style={{ ...pop(220), fontFamily: FONT_DISPLAY, fontSize: 20, color: RM.text, marginBottom: 18, lineHeight: 1.5 }}>
            <b style={{ color: RM.cyan }}>TOOLS:</b> read the whole repo, edit files, run the suite itself.
          </div>
          <div style={{ ...pop(500), fontFamily: FONT_DISPLAY, fontSize: 20, color: RM.text, marginBottom: 18, lineHeight: 1.5 }}>
            <b style={{ color: RM.amber }}>CHECK:</b> the test suite decides. Pass or fail. No room to argue.
          </div>
          <div style={{ ...pop(900), fontFamily: FONT_DISPLAY, fontSize: 20, color: RM.text, lineHeight: 1.5 }}>
            <b style={{ color: RM.red }}>STOP:</b> never push to main, never touch production alone.
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 60, left: 90, right: 90, textAlign: 'center', ...rise(1200, 18), fontSize: 22, fontWeight: 700, color: RM.green }}>
          Bigger tools always demand a stricter check and a harder stop condition. Not a looser one.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default AAEEvidenceCodingAgent;
