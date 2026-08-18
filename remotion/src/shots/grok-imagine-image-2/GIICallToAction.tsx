import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, usePop, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 370.18-387.23 · close-2: what you can do today. "Open grok.com/imagine" f46,
// "dense poster, small sharp text" f200-241, "change one region with the wand" f268,
// "real design tool, not a toy" f391, "five minutes, before the coffee's cold" f429-490.
export const compositionConfig = { id: 'GIICallToAction', durationInSeconds: 17.05, fps: 30, width: 1920, height: 1080 };

const STEPS = [
  { n: '1', t: 'Ask for a dense poster, small sharp text', s: 200, c: RM.cyan },
  { n: '2', t: 'Change one region with the wand', s: 268, c: RM.green },
];

const GIICallToAction: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const pop = usePop();
  const drift = useDrift(512);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 200px', textAlign: 'center' }}>
        <div style={rise(4, 16)}><Eyebrow color={RM.cyan}>Here&rsquo;s what you can do today</Eyebrow></div>
        <div style={{ ...rise(46, 16), fontFamily: 'monospace', fontSize: 40, color: RM.text, border: `2px solid ${RM.cyan}66`, borderRadius: 14, padding: '14px 34px', background: RM.panel }}>
          grok.com/imagine
        </div>
        <div style={{ ...rise(120, 16), fontSize: 26, color: RM.muted }}>
          or the Grok app. Give it the test that matters
        </div>
        {STEPS.map((st) => (
          <div key={st.n} style={{ ...pop(st.s), display: 'flex', alignItems: 'center', gap: 22, background: RM.panel, border: `2px solid ${RM.line}`, borderRadius: 16, padding: '18px 34px', minWidth: 640 }}>
            <div style={{ fontFamily: FONT_HOOK, fontSize: 42, color: st.c }}>{st.n}.</div>
            <div style={{ fontSize: 30, fontWeight: 600, color: RM.text }}>{st.t}</div>
          </div>
        ))}
        <div style={{ ...rise(357, 18), fontSize: 30, fontWeight: 700, color: RM.amber }}>
          Survives that? You&rsquo;re looking at a real design tool, not a toy.
        </div>
        <div style={{ ...slam(429, 10), fontFamily: FONT_HOOK, fontSize: 52, color: RM.green }}>
          FIVE MINUTES. BEFORE THE COFFEE&rsquo;S COLD.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GIICallToAction;
