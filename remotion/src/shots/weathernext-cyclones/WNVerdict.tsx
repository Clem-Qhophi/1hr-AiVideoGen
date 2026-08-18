import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 64.64-87.64 · verdict. Nature claim f31, 3day f91, full day f219, 24h f373, decade f550, trends f649.
export const compositionConfig = { id: 'WNVerdict', durationInSeconds: 23.0, fps: 30, width: 1920, height: 1080 };

const WNVerdict: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(690);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.cyan}>The claim, straight from the Nature paper</Eyebrow></div>
        <div style={{ ...rise(91, 20), fontSize: 46, fontWeight: 500, color: RM.text, textAlign: 'center' }}>
          WeatherNext's 3-day forecasts are as accurate as
        </div>
        <div style={{ ...slam(219, 8), fontFamily: FONT_HOOK, fontSize: 92, color: RM.green, textShadow: `0 8px 36px ${RM.green}44` }}>
          THE BEST 2-DAY FORECASTS
        </div>
        <div style={{ ...rise(373, 18), fontSize: 40, fontWeight: 600, color: RM.text }}>
          ≈ <span style={{ fontFamily: FONT_HOOK, color: RM.cyan }}>+24 hours</span> of lead time, on average
        </div>
        <div style={{ ...rise(550, 18), marginTop: 8, fontSize: 34, fontWeight: 500, color: RM.muted }}>
          About a <span style={{ fontFamily: FONT_HOOK, color: RM.cyan }}>decade of progress</span> in one model
        </div>
        <div style={{ ...rise(649, 18), fontSize: 26, fontWeight: 500, color: RM.muted, opacity: 0.85 }}>
          The paper has the trend lines to prove it.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default WNVerdict;
