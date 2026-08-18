import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 387.23-406.30 · close-3/4: EndCard. "within 24 hours of the drop" f26,
// "verdicts land here first" f185, "subscribe" f258, "like if you learned something" f370,
// "comment: fast variant's #2 real or preliminary noise?" f424, "see you on the next one" f539.
export const compositionConfig = { id: 'GIIOutro', durationInSeconds: 19.07, fps: 30, width: 1920, height: 1080 };

const GIIOutro: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(572);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 180px', textAlign: 'center' }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.cyan}>Within 24 hours of the drop</Eyebrow></div>
        <div style={{ ...rise(111, 16), fontSize: 30, fontWeight: 500, color: RM.muted }}>
          That&rsquo;s what this channel does: releases land,
        </div>
        <div style={{ ...rise(185, 18), fontSize: 34, fontWeight: 700, color: RM.text }}>
          and the verdict lands here first.
        </div>
        <div style={{ ...slam(258, 10), fontFamily: FONT_HOOK, fontSize: 100, color: '#04121a', background: RM.red, borderRadius: 999, padding: '18px 80px', boxShadow: `0 18px 60px ${RM.red}55` }}>
          SUBSCRIBE
        </div>
        <div style={{ ...rise(370, 18), fontSize: 26, color: RM.muted }}>
          Like the video if you learned something.
        </div>
        <div style={{ ...rise(424, 18), fontSize: 28, fontWeight: 600, color: RM.amber, maxWidth: 1200 }}>
          Comment: is the fast variant&rsquo;s number two real, or preliminary noise?
        </div>
        <div style={{ ...rise(539, 16), fontSize: 28, fontWeight: 700, color: RM.cyan }}>
          We&rsquo;ll see you on the next one.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GIIOutro;
