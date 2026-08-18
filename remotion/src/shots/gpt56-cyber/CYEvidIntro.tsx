import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 174.8-186.5 · evidence intro + honest disclosure about the blocked captures.
// "bot-blocked" f70, "verified the numbers by reading it directly" f220, "captured clean" f280.
export const compositionConfig = { id: 'CYEvidIntro', durationInSeconds: 11.7, fps: 30, width: 1920, height: 1080 };

const CYEvidIntro: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(351);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 150px', textAlign: 'center' }}>
        <div style={rise(3, 12)}><Eyebrow color={RM.cyan}>The evidence</Eyebrow></div>
        <div style={{ ...slam(30, 9), fontFamily: FONT_HOOK, fontSize: 64, color: RM.amber, textShadow: `0 10px 42px ${RM.amber}33`, marginTop: 8 }}>
          OPENAI&rsquo;S PAGE WAS BOT-BLOCKED
        </div>
        <div style={{ ...rise(80, 16), fontSize: 30, fontWeight: 500, color: RM.text, maxWidth: 1250 }}>
          It would not load for a screenshot &mdash; so we read the announcement start to finish and verified every number directly.
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 26 }}>
          <div style={{ ...pop(260, 12), display: 'flex', alignItems: 'center', gap: 14, background: RM.panel, border: `1px solid ${RM.line}`, borderRadius: 999, padding: '14px 28px' }}>
            <span style={{ color: RM.green, fontSize: 26 }}>&#10003;</span>
            <span style={{ fontFamily: 'monospace', fontSize: 22, color: RM.text }}>PRICING PAGE &middot; captured</span>
          </div>
          <div style={{ ...pop(300, 12), display: 'flex', alignItems: 'center', gap: 14, background: RM.panel, border: `1px solid ${RM.line}`, borderRadius: 999, padding: '14px 28px' }}>
            <span style={{ color: RM.green, fontSize: 26 }}>&#10003;</span>
            <span style={{ fontFamily: 'monospace', fontSize: 22, color: RM.text }}>CVE ENTRY (NVD) &middot; captured</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default CYEvidIntro;
