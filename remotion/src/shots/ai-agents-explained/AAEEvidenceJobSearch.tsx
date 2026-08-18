import React from 'react';
import { AbsoluteFill, Img, staticFile, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { RM, useDrift, useRise, usePop, Eyebrow } from '../../lib/reviewkit';
import { CLAMP } from '../../lib/kit';
import { EASINGS, COLORS, RADIUS, SHADOW } from '../../brand';

// master 484.58-560.32 · worked example 4: a job-search filter. Real evidence: a live public job
// board search (LinkedIn Jobs) - illustrates the goal/tools this example is grounded in.
export const compositionConfig = { id: 'AAEEvidenceJobSearch', durationInSeconds: 75.74, fps: 30, width: 1920, height: 1080 };

const AAEEvidenceJobSearch: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(2272);
  const imgOp = interpolate(frame, [0, 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  const W = 1180, H = 520, X = 90, Y = 210;

  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <AbsoluteFill style={{ background: `linear-gradient(160deg, ${RM.bg0}, ${RM.bg1})` }} />
      <AbsoluteFill style={{ ...drift }}>
        <div style={{ position: 'absolute', top: 56, left: 90, opacity: rise(10, 16).opacity }}><Eyebrow color={RM.cyan}>worked example 4 &middot; not everyone has a team or a codebase</Eyebrow></div>
        <div style={{ position: 'absolute', top: 100, left: 90, fontSize: 26, fontWeight: 600, color: RM.text, ...rise(40, 16) }}>
          Goal: flag postings that match your real criteria.
        </div>

        <div style={{ position: 'absolute', left: X, top: Y, width: W, height: H, opacity: imgOp, borderRadius: RADIUS.card, overflow: 'hidden', border: `2px solid ${COLORS.d600}`, boxShadow: SHADOW.card, background: COLORS.paper }}>
          <Img src={staticFile('projects/ai-agents-explained/evidence/job-board-search.png')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '0 0' }} />
        </div>
        <div style={{ position: 'absolute', left: X, top: Y + H + 10, fontFamily: FONT_MONO, fontSize: 16, color: COLORS.d400, ...rise(160, 14) }}>
          Source: LinkedIn Jobs (public search results)
        </div>

        <div style={{ position: 'absolute', right: 90, top: Y, width: 560 }}>
          <div style={{ ...pop(280), fontFamily: FONT_DISPLAY, fontSize: 20, color: RM.text, marginBottom: 18, lineHeight: 1.5 }}>
            <b style={{ color: RM.cyan }}>TOOLS:</b> search job boards, read postings. Nothing else: no email, no calendar.
          </div>
          <div style={{ ...pop(700), fontFamily: FONT_DISPLAY, fontSize: 20, color: RM.text, marginBottom: 18, lineHeight: 1.5 }}>
            <b style={{ color: RM.amber }}>CHECK:</b> does it match your 2-3 real criteria, not just a keyword hit?
          </div>
          <div style={{ ...pop(1200), fontFamily: FONT_DISPLAY, fontSize: 20, color: RM.text, lineHeight: 1.5 }}>
            <b style={{ color: RM.red }}>STOP:</b> flags for your review. It never applies on your behalf.
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 60, left: 90, right: 90, textAlign: 'center', ...rise(1650, 18), fontSize: 22, fontWeight: 700, color: RM.green }}>
          Without that check: a firehose of near-misses, worse than screening the job boards yourself.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default AAEEvidenceJobSearch;
