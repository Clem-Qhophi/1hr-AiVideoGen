import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 360.35-399.50 · close. emergency op f303, free f409, research->operational f565,
// verdict f481, subscribe f856, comment f976.
export const compositionConfig = { id: 'WNClose', durationInSeconds: 39.2, fps: 30, width: 1920, height: 1080 };

const WNClose: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(1174);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.cyan}>Where this leaves you</Eyebrow></div>
        <div style={{ ...rise(303, 18), fontSize: 36, fontWeight: 600, color: RM.text, textAlign: 'center' }}>
          The first AI weather model proven inside a <span style={{ fontFamily: FONT_HOOK, color: RM.green }}>real emergency operation</span>
        </div>
        <div style={{ ...rise(409, 18), fontSize: 32, fontWeight: 500, color: RM.muted }}>
          not just historical data. And it's free to use, study, improve.
        </div>
        <div style={{ ...slam(565, 8), marginTop: 12, fontFamily: FONT_HOOK, fontSize: 82, color: RM.cyan, textShadow: `0 8px 36px ${RM.cyan}44` }}>
          AI WEATHER FORECASTING
        </div>
        <div style={{ ...rise(640, 18), fontSize: 38, fontWeight: 600, color: RM.text }}>
          stopped being a research story. It's operational now.
        </div>
        <div style={{ ...rise(856, 18), marginTop: 16, fontSize: 34, fontWeight: 700, color: RM.text, textAlign: 'center' }}>
          <span style={{ fontFamily: FONT_HOOK, color: RM.green }}>SUBSCRIBE</span> — releases covered the day they land
        </div>
        <div style={{ ...rise(976, 18), fontSize: 26, fontWeight: 500, color: RM.muted }}>
          Like if this earned the watch · Comment what AI forecasting gets wrong next
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default WNClose;
