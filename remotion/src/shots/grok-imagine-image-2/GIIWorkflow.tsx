import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 144.51-163.43 · verdict-6: the workflow. "shop owner, marketer, creator" f60,
// "used to mean Photoshop or a designer" f156, "one sentence in Grok" f246, "text rendering,
// small text sharp" f346-467, "the tell of a toy image model. It's gone" f496-548.
export const compositionConfig = { id: 'GIIWorkflow', durationInSeconds: 18.92, fps: 30, width: 1920, height: 1080 };

const GIIWorkflow: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(568);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '0 170px', textAlign: 'center' }}>
        <div style={rise(4, 16)}><Eyebrow color={RM.cyan}>What that does to a workflow</Eyebrow></div>
        <div style={{ display: 'flex', gap: 24, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { t: 'Shop owner', s: 60 },
            { t: 'Marketer', s: 92 },
            { t: 'Creator', s: 118 },
          ].map((p) => (
            <div key={p.t} style={{ ...rise(p.s, 14), fontFamily: FONT_HOOK, fontSize: 44, color: RM.text, border: `2px solid ${RM.line}`, borderRadius: 14, padding: '10px 28px', background: RM.panel }}>
              {p.t}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 30, marginTop: 22 }}>
          <div style={{ ...rise(156, 16), fontSize: 30, fontWeight: 600, color: RM.muted, textDecoration: 'line-through', textDecorationColor: RM.red }}>
            Photoshop or a designer
          </div>
          <div style={{ ...slam(246, 9), fontFamily: FONT_HOOK, fontSize: 58, color: RM.green }}>
            one sentence in Grok
          </div>
        </div>
        <div style={{ ...rise(313, 18), marginTop: 24, fontSize: 28, color: RM.muted }}>
          Text rendering? Ask for a poster with specific typography.
        </div>
        <div style={{ ...rise(421, 18), fontSize: 30, fontWeight: 600, color: RM.text }}>
          The model plans the layout. Small text sharp.
        </div>
        <div style={{ ...rise(496, 18), fontSize: 30, fontWeight: 700, color: RM.amber }}>
          That was the tell of a toy image model.
        </div>
        <div style={{ ...slam(548, 9), fontFamily: FONT_HOOK, fontSize: 74, color: RM.green }}>
          It&rsquo;s gone.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GIIWorkflow;
