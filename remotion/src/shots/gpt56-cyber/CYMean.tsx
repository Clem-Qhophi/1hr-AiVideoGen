import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 139.9-160.9 · what it means + the access wall.
// "for you?" f30, "force multiplier" f70, "it's a wall" f190, "on a whim" f225, keys f422,
// "most locked down" f540.
export const compositionConfig = { id: 'CYMean', durationInSeconds: 21.0, fps: 30, width: 1920, height: 1080 };

const CYMean: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const slam = useSlam();
  const drift = useDrift(630);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '0 130px', textAlign: 'center' }}>
        <div style={rise(3, 12)}><Eyebrow color={RM.cyan}>What does this mean for you?</Eyebrow></div>
        <div style={{ display: 'flex', gap: 30, marginTop: 12 }}>
          <div style={{ ...pop(60, 12), width: 540, background: RM.panel, border: `1px solid ${RM.line}`, borderRadius: 18, padding: '28px 36px' }}>
            <div style={{ fontFamily: FONT_HOOK, fontSize: 48, color: RM.green }}>DEFENDERS</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: RM.text, marginTop: 8 }}>a force multiplier</div>
            <div style={{ fontSize: 22, color: RM.muted, marginTop: 4 }}>that&rsquo;s the pitch</div>
          </div>
          <div style={{ ...pop(190, 12), width: 540, background: RM.panel, border: `1px solid ${RM.line}`, borderRadius: 18, padding: '28px 36px' }}>
            <div style={{ fontFamily: FONT_HOOK, fontSize: 48, color: RM.red }}>EVERYONE ELSE</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: RM.text, marginTop: 8 }}>a wall</div>
          </div>
        </div>
        <div style={{ ...rise(240, 16), marginTop: 16, fontSize: 30, fontWeight: 600, color: RM.text }}>
          You can&rsquo;t buy access to this model on a whim.
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { t: 'DAYBREAK APPROVAL', f: 290 },
            { t: 'LEGAL ATTESTATIONS', f: 360 },
            { t: 'HARDWARE SECURITY KEYS &middot; SEPT 1', f: 430, hot: true },
          ].map((c) => (
            <div key={c.t} style={{ ...pop(c.f, 12), fontFamily: 'monospace', fontSize: 22, letterSpacing: 1.5, color: c.hot ? RM.amber : RM.text, border: `1px solid ${c.hot ? `${RM.amber}66` : RM.line}`, borderRadius: 999, padding: '12px 24px', background: RM.panel }}>
              {c.t}
            </div>
          ))}
        </div>
        <div style={{ ...rise(520, 16), marginTop: 12, fontFamily: FONT_HOOK, fontSize: 38, color: RM.cyan, maxWidth: 1150 }}>
          The most powerful offensive model OpenAI has shipped &mdash; is also the most locked down.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default CYMean;
