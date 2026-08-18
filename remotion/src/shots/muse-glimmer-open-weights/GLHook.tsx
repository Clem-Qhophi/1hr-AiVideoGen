import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 0-17.0 · cold open. "August tenth" f474, "undercuts your bill" f906.
export const compositionConfig = { id: 'GLHook', durationInSeconds: 17.0, fps: 30, width: 1920, height: 1080 };

const GLHook: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(510);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '0 140px', textAlign: 'center' }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.cyan}>Meta &middot; Aug 10, 2026</Eyebrow></div>
        <div style={{ ...rise(20, 18), fontSize: 34, fontWeight: 500, color: RM.muted, marginTop: 6 }}>
          Meta just open-sourced their agentic model
        </div>
        <div style={{ ...slam(36, 10), fontFamily: FONT_HOOK, fontSize: 96, lineHeight: 0.95, color: RM.cyan, textShadow: `0 10px 44px ${RM.cyan}44`, marginTop: 10 }}>
          MUSE GLIMMER
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
          {[
            { t: '30B', f: 110 }, { t: 'VISION', f: 140 }, { t: 'TOOL CALLS', f: 170 },
          ].map((c) => (
            <div key={c.t} style={{ ...rise(c.f, 12), fontFamily: 'monospace', fontSize: 24, letterSpacing: 3, color: RM.text, border: `2px solid ${RM.line}`, borderRadius: 999, padding: '10px 26px' }}>
              {c.t}
            </div>
          ))}
        </div>
        <div style={{ ...rise(230, 18), fontSize: 30, fontWeight: 600, color: RM.text, maxWidth: 1050, marginTop: 12 }}>
          And it undercuts your bill &mdash; if you&rsquo;re paying per token right now.
        </div>
        <div style={{ ...rise(430, 20), fontSize: 32, fontWeight: 700, color: RM.amber, maxWidth: 1080, marginTop: 8 }}>
          But there&rsquo;s one table where Qwen still wins. Coming up.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GLHook;
