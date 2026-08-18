import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 44.3-61.6 · GPT-5.6-Cyber comes from Sol. "cyber-specific version" f74, "tuned for
// authorized offense" f325, "policy post" f353, "Here's the read." f499.
export const compositionConfig = { id: 'CYRed', durationInSeconds: 17.3, fps: 30, width: 1920, height: 1080 };

const CYRed: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(519);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 140px', textAlign: 'center' }}>
        <div style={rise(4, 12)}><Eyebrow color={RM.cyan}>Red&rsquo;s newest tool</Eyebrow></div>
        <div style={{ ...slam(60, 9), fontFamily: FONT_HOOK, fontSize: 108, lineHeight: 0.95, color: RM.cyan, textShadow: `0 12px 46px ${RM.cyan}33`, marginTop: 8 }}>
          GPT-5.6-CYBER
        </div>
        <div style={{ ...rise(104, 16), fontSize: 32, fontWeight: 500, color: RM.text, marginTop: 6 }}>
          a cyber-specific version of <span style={{ fontFamily: FONT_HOOK, color: RM.text }}>GPT-5.6 Sol</span> &mdash; OpenAI&rsquo;s strongest reasoning model
        </div>
        <div style={{ display: 'flex', gap: 18, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { t: 'TRAINED ON TOP OF IT', f: 200, c: RM.text },
            { t: 'TUNED FOR AUTHORIZED OFFENSE', f: 325, c: RM.red },
          ].map((c) => (
            <div key={c.t} style={{ ...pop(c.f, 12), fontFamily: 'monospace', fontSize: 24, letterSpacing: 2, color: c.c, border: `1px solid ${RM.line}`, borderRadius: 999, padding: '12px 26px' }}>
              {c.t}
            </div>
          ))}
        </div>
        <div style={{ ...rise(353, 16), marginTop: 22, fontSize: 30, fontWeight: 500, color: RM.muted, maxWidth: 1150 }}>
          Released alongside a policy post that upgrades &ldquo;cyber&rdquo; in OpenAI&rsquo;s own preparedness framework.
        </div>
        <div style={{ ...rise(499, 16), marginTop: 12, fontFamily: FONT_HOOK, fontSize: 44, color: RM.amber }}>
          HERE&rsquo;S THE READ.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default CYRed;
