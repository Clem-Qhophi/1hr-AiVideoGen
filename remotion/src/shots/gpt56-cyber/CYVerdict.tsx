import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 354.4-369.9 · verdict. "most consequential" f30, "real zero-day work" f200,
// "the honest test" f360, "the wall around the door" f480.
export const compositionConfig = { id: 'CYVerdict', durationInSeconds: 15.5, fps: 30, width: 1920, height: 1080 };

const CYVerdict: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(465);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.green} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '0 140px', textAlign: 'center' }}>
        <div style={rise(3, 12)}><Eyebrow color={RM.green}>Verdict</Eyebrow></div>
        <div style={{ ...slam(34, 9), fontFamily: FONT_HOOK, fontSize: 92, lineHeight: 0.95, color: RM.green, textShadow: `0 12px 46px ${RM.green}33`, marginTop: 10 }}>
          MOST CONSEQUENTIAL
        </div>
        <div style={{ ...rise(90, 16), fontSize: 34, fontWeight: 600, color: RM.text, marginTop: 6 }}>
          security-model release so far
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
          {[
            { t: 'REAL ZERO-DAY WORK', f: 200 },
            { t: 'REAL NUMBERS', f: 250 },
            { t: 'REAL RESTRICTIONS', f: 300 },
          ].map((c) => (
            <div key={c.t} style={{ ...pop(c.f, 12), fontFamily: 'monospace', fontSize: 22, letterSpacing: 1.5, color: RM.text, border: `1px solid ${RM.line}`, borderRadius: 999, padding: '12px 26px', background: RM.panel }}>
              {c.t}
            </div>
          ))}
        </div>
        <div style={{ ...rise(370, 16), marginTop: 18, fontSize: 30, fontWeight: 700, color: RM.amber, maxWidth: 1250 }}>
          The honest test isn&rsquo;t the 95 &mdash; it&rsquo;s the report-writing score, and the wall around the door.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default CYVerdict;
