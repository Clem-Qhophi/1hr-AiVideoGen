import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 317-340 · "wait ended" f403. The verdict.
export const compositionConfig = { id: 'GLVerdict2', durationInSeconds: 23.0, fps: 30, width: 1920, height: 1080 };

const GLVerdict2: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(690);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.green} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 150px', textAlign: 'center' }}>
        <div style={rise(6, 14)}><Eyebrow color={RM.green}>The verdict</Eyebrow></div>
        <div style={{ ...slam(30, 10), fontFamily: FONT_HOOK, fontSize: 96, lineHeight: 0.98, color: RM.green, textShadow: `0 10px 44px ${RM.green}44` }}>
          THE WAIT ENDED
        </div>
        <div style={{ ...rise(150, 18), fontSize: 30, fontWeight: 500, color: RM.text, maxWidth: 1050 }}>
          After the April betrayal, Meta is back on the open side &mdash; under Apache 2.0.
        </div>
        <div style={{ ...rise(280, 18), fontSize: 28, color: RM.muted, maxWidth: 1000 }}>
          If you&rsquo;ve been waiting for a local agent model that&rsquo;s actually good: today is the day.
        </div>
        <div style={{ ...rise(430, 18), fontSize: 24, color: RM.amber }}>
          Just don&rsquo;t expect it to win every table.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GLVerdict2;
