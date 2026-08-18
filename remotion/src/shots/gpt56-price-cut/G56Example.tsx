import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 90.09-118.75 · concrete cost example. workload f0, $70/day f94, $14/day f356, Fast-mode line f767.
export const compositionConfig = { id: 'G56Example', durationInSeconds: 28.7, fps: 30, width: 1920, height: 1080 };

const G56Example: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(860);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.green} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
        <div style={rise(0, 16)}><Eyebrow color={RM.green}>what it means · a real workload</Eyebrow></div>
        <div style={{ ...rise(10, 18), fontSize: 36, fontWeight: 600, color: RM.text, textAlign: 'center' }}>
          A support bot or classifier chewing through 10M tokens a day
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginTop: 6 }}>
          <div style={{ ...pop(94), textAlign: 'center' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 20, color: RM.muted, letterSpacing: 1 }}>OLD LUNA PRICE</div>
            <div style={{ fontFamily: FONT_HOOK, fontSize: 84, color: RM.muted, textDecoration: 'line-through', opacity: 0.7 }}>$70/day</div>
          </div>
          <div style={{ fontSize: 48, color: RM.muted }}>&#8594;</div>
          <div style={{ ...pop(356), textAlign: 'center' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 20, color: RM.muted, letterSpacing: 1 }}>NEW LUNA PRICE</div>
            <div style={{ fontFamily: FONT_HOOK, fontSize: 100, color: RM.green, textShadow: `0 10px 44px ${RM.green}44` }}>$14/day</div>
          </div>
        </div>
        <div style={{ ...rise(767, 18), marginTop: 12, fontSize: 30, fontWeight: 500, color: RM.muted, textAlign: 'center', maxWidth: 1100 }}>
          Sol's new Fast mode is a lever for speed, not a discount.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default G56Example;
