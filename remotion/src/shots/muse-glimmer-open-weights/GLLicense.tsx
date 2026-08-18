import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 196-208 · "Apache 2.0" f0. The license reveal.
export const compositionConfig = { id: 'GLLicense', durationInSeconds: 12.0, fps: 30, width: 1920, height: 1080 };

const GLLicense: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(360);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.green} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 150px', textAlign: 'center' }}>
        <div style={rise(6, 14)}><Eyebrow color={RM.green}>The license</Eyebrow></div>
        <div style={{ ...slam(18, 10), fontFamily: FONT_HOOK, fontSize: 120, lineHeight: 0.95, color: RM.green, textShadow: `0 10px 44px ${RM.green}44` }}>
          APACHE 2.0
        </div>
        <div style={{ ...rise(90, 18), fontSize: 32, fontWeight: 600, color: RM.text, marginTop: 8 }}>
          Use it commercially. Modify it. Ship it.
        </div>
        <div style={{ ...rise(150, 18), fontSize: 26, color: RM.muted }}>
          Not Meta&rsquo;s usual restricted community license.
        </div>
        <div style={{ ...rise(220, 18), fontSize: 26, fontWeight: 700, color: RM.text }}>
          The most permissive license in the industry.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GLLicense;
