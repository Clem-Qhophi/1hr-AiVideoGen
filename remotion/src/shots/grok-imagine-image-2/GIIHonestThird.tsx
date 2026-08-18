import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 338.07-357.25 · honest-gap 3: the fast variant. "model on top is the fast variant" f22,
// "quality tier not ranked yet" f104-144, "older model named Quality still #14" f197-270,
// "when the flagship tier hits the board, the story could flip" f322-369,
// "that's the honest gap" f402, "day-old scoreboard, fast sibling" f456-530.
export const compositionConfig = { id: 'GIIHonestThird', durationInSeconds: 19.18, fps: 30, width: 1920, height: 1080 };

const GIIHonestThird: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(575);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.amber} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 200px', textAlign: 'center' }}>
        <div style={rise(4, 16)}><Eyebrow color={RM.amber}>Third</Eyebrow></div>
        <div style={{ ...rise(22, 16), fontSize: 32, fontWeight: 700, color: RM.text }}>
          The model on top is the fast variant.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 1050, marginTop: 8 }}>
          <div style={{ ...pop(104), display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: RM.panel, border: `2px solid ${RM.line}`, borderRadius: 14, padding: '18px 30px' }}>
            <div style={{ fontSize: 28, fontWeight: 600, color: RM.text }}>The new model&rsquo;s own quality tier</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: RM.amber }}>not ranked yet</div>
          </div>
          <div style={{ ...pop(197), display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: RM.panel, border: `2px solid ${RM.line}`, borderRadius: 14, padding: '18px 30px' }}>
            <div style={{ fontSize: 28, fontWeight: 600, color: RM.text }}>The older model literally named &ldquo;Quality&rdquo;</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: RM.red }}>still #14</div>
          </div>
        </div>
        <div style={{ ...rise(322, 18), marginTop: 16, fontSize: 30, fontWeight: 700, color: RM.amber, maxWidth: 1200 }}>
          When the flagship tier hits the board, the story could flip.
        </div>
        <div style={{ ...rise(402, 18), fontSize: 30, fontWeight: 700, color: RM.text }}>
          That&rsquo;s the honest gap.
        </div>
        <div style={{ ...rise(456, 18), fontSize: 26, color: RM.muted, maxWidth: 1150 }}>
          We&rsquo;re judging a release on a day-old scoreboard. Its best score so far comes from its fast sibling.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GIIHonestThird;
