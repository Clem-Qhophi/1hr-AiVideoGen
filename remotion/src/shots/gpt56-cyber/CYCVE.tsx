import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 107.5-129.0 · real findings: two V8 bugs + CVE card. "not a lab toy" f26,
// "heap sandbox" f288, "CVE-2026-15903" f364, "the JIT compiler" f551, "coordinated disclosure" f625.
export const compositionConfig = { id: 'CYCVE', durationInSeconds: 21.5, fps: 30, width: 1920, height: 1080 };

const CYCVE: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(645);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.red} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 140px', textAlign: 'center' }}>
        <div style={rise(4, 12)}><Eyebrow color={RM.red}>Not a lab toy</Eyebrow></div>
        <div style={{ ...slam(40, 9), fontFamily: FONT_HOOK, fontSize: 104, lineHeight: 0.95, color: RM.red, textShadow: `0 12px 46px ${RM.red}33`, marginTop: 8 }}>
          2 REAL V8 BUGS
        </div>
        <div style={{ ...rise(88, 16), fontSize: 30, fontWeight: 500, color: RM.text, marginTop: 6 }}>
          found by OpenAI&rsquo;s team, before anyone else &mdash; in <span style={{ fontFamily: FONT_HOOK }}>Chrome&rsquo;s V8 engine</span>
        </div>
        <div style={{ ...rise(150, 16), marginTop: 8, fontSize: 28, fontWeight: 500, color: RM.muted }}>
          chainable &rarr; escape Google&rsquo;s heap sandbox
        </div>
        <div style={{ ...pop(360, 12), marginTop: 24, width: 1220, background: RM.panel, border: `1px solid ${RM.line}`, borderRadius: 18, padding: '26px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: FONT_HOOK, fontSize: 40, color: RM.green }}>CVE-2026-15903</div>
              <div style={{ fontSize: 24, color: RM.text, marginTop: 6 }}>bounds-check skip in the JIT compiler</div>
              <div style={{ fontSize: 22, color: RM.muted, marginTop: 4 }}>rated high severity &middot; reported by OpenAI &middot; fixed by Google</div>
            </div>
            <div style={{ fontFamily: FONT_HOOK, fontSize: 40, color: RM.green }}>FIXED</div>
          </div>
        </div>
        <div style={{ ...rise(596, 16), marginTop: 16, fontSize: 28, fontWeight: 600, color: RM.amber }}>
          The second one &mdash; still under coordinated disclosure.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default CYCVE;
