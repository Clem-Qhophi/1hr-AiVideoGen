import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, usePop, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 69-80 · "thirty billion parameters" f38, "with vision" f86, "calls tools" f219, "retries instead of dying" f282.
export const compositionConfig = { id: 'GLVerdict', durationInSeconds: 11.0, fps: 30, width: 1920, height: 1080 };

const GLVerdict: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const pop = usePop();
  const drift = useDrift(330);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.green} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '0 140px', textAlign: 'center' }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.green}>Here&rsquo;s the read</Eyebrow></div>
        <div style={{ ...slam(20, 10), fontFamily: FONT_HOOK, fontSize: 84, lineHeight: 0.98, color: RM.text, marginTop: 6 }}>
          MUSE GLIMMER
        </div>
        <div style={{ ...slam(42, 10), fontFamily: FONT_HOOK, fontSize: 130, lineHeight: 0.95, color: RM.cyan, textShadow: `0 10px 44px ${RM.cyan}44` }}>
          30B
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
          {[
            { t: 'VISION', f: 84 }, { t: 'MULTI-STEP PLANNING', f: 120 }, { t: 'TOOL CALLS', f: 210 }, { t: 'FAILURES? RETRIES', f: 275 },
          ].map((c) => (
            <div key={c.t} style={{ ...pop(c.f), fontFamily: 'monospace', fontSize: 22, letterSpacing: 2, color: RM.text, border: `2px solid ${RM.line}`, borderRadius: 999, padding: '10px 22px', background: `${RM.green}14` }}>
              {c.t}
            </div>
          ))}
        </div>
        <div style={{ ...rise(300, 18), fontSize: 28, fontWeight: 600, color: RM.muted }}>
          That&rsquo;s the difference between a chatbot and an agent.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GLVerdict;
