import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 280.3-294.4 · the HF clarification + cross-link.
// "not involved" f105, "the rogue-agent breach" f278, "cleared their own model by name" f365.
export const compositionConfig = { id: 'CYHF', durationInSeconds: 14.1, fps: 30, width: 1920, height: 1080 };

const CYHF: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(423);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.green} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '0 150px', textAlign: 'center' }}>
        <div style={rise(3, 12)}><Eyebrow color={RM.green}>One clarification they bothered to make</Eyebrow></div>
        <div style={{ ...slam(60, 9), fontFamily: FONT_HOOK, fontSize: 84, lineHeight: 0.95, color: RM.green, textShadow: `0 12px 44px ${RM.green}33`, marginTop: 10 }}>
          NOT INVOLVED
        </div>
        <div style={{ ...rise(130, 16), fontSize: 32, fontWeight: 600, color: RM.text, marginTop: 6 }}>
          in the Hugging Face incident
        </div>
        <div style={{ ...rise(210, 16), marginTop: 8, fontSize: 26, fontWeight: 500, color: RM.muted }}>
          &mdash; the rogue-agent breach we broke down in detail
        </div>
        <div style={{ ...pop(365, 12), marginTop: 18, fontSize: 28, fontWeight: 700, color: RM.amber, background: RM.panel, border: `1px solid ${RM.amber}55`, borderRadius: 999, padding: '16px 34px' }}>
          They cleared their own model &mdash; by name &mdash; before anyone asked.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default CYHF;
