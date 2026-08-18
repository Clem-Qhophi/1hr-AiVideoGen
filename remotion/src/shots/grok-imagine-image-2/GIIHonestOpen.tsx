import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';
import { EASINGS } from '../../brand';
import { CLAMP } from '../../lib/kit';

// master 310.00-328.78 · honest-gap open. "#2 is real, and provisional" f51-115,
// "tagged preliminary on both boards" f161, "2,500 votes against 69,000" f330,
// "score can move 20 points in a week" f452, "first snapshot, not verdict" f508.
export const compositionConfig = { id: 'GIIHonestOpen', durationInSeconds: 18.78, fps: 30, width: 1920, height: 1080 };

const GIIHonestOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(563);
  const bar = interpolate(frame, [330, 380], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.red} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 190px', textAlign: 'center' }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.amber}>Here&rsquo;s where I have to be straight with you</Eyebrow></div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
          <div style={{ ...slam(51, 9), fontFamily: FONT_HOOK, fontSize: 96, color: RM.green, textShadow: `0 12px 50px ${RM.green}44` }}>
            #2 IS REAL
          </div>
          <div style={{ ...slam(115, 9), fontFamily: FONT_HOOK, fontSize: 96, color: RM.amber }}>
            AND PROVISIONAL
          </div>
        </div>
        <div style={{ ...rise(161, 16), fontSize: 30, fontWeight: 600, color: RM.text }}>
          Tagged &ldquo;preliminary&rdquo; on both boards.
        </div>
        <div style={{ ...rise(250, 16), fontSize: 26, color: RM.muted }}>
          Backed by a fraction of the votes the leader has
        </div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 26, fontFamily: FONT_HOOK, fontSize: 34 }}>
          <div style={{ opacity: bar, color: RM.cyan, textAlign: 'right', width: 300 }}>
            Grok: 2,500 votes
          </div>
          <div style={{ opacity: bar, width: 420, height: 34, borderRadius: 10, background: RM.panel, overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${0.036 * bar * 100}%`, background: RM.cyan }} />
            <div style={{ width: `${0.964 * bar * 100}%`, background: RM.muted }} />
          </div>
          <div style={{ opacity: bar, color: RM.muted, width: 300, textAlign: 'left' }}>
            leader: 69,000
          </div>
        </div>
        <div style={{ ...rise(452, 18), marginTop: 12, fontSize: 30, fontWeight: 700, color: RM.red }}>
          A score can move 20 points in a week.
        </div>
        <div style={{ ...rise(508, 18), fontSize: 30, fontWeight: 700, color: RM.amber }}>
          First snapshot. Not verdict.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GIIHonestOpen;
