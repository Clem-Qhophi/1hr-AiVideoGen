import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 250.43-264.41 · evidence-5: templates + consistent worlds. product photo f50,
// marketing f69, game assets f113, streaming emojis f142. "consistent worlds" f193,
// "stepping stone to video" f364.
export const compositionConfig = { id: 'GIIBeyond', durationInSeconds: 13.98, fps: 30, width: 1920, height: 1080 };

const TEMPLATES = [
  { t: 'Product photography', s: 50 },
  { t: 'Marketing materials', s: 69 },
  { t: 'Game assets', s: 113 },
  { t: 'Streaming emojis', s: 142 },
];

const GIIBeyond: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(419);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 170px', textAlign: 'center' }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.cyan}>Beyond the headline</Eyebrow></div>
        <div style={{ display: 'flex', gap: 22, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {TEMPLATES.map((t) => (
            <div key={t.t} style={{ ...rise(t.s, 14), fontFamily: FONT_HOOK, fontSize: 36, color: RM.text, border: `2px solid ${RM.line}`, borderRadius: 14, padding: '10px 26px', background: RM.panel }}>
              {t.t}
            </div>
          ))}
        </div>
        <div style={{ ...rise(193, 18), marginTop: 30, fontSize: 32, fontWeight: 700, color: RM.text, maxWidth: 1200 }}>
          &ldquo;Consistent worlds&rdquo;: characters, props and locations stay the same across images.
        </div>
        <div style={{ ...rise(280, 16), fontSize: 26, color: RM.muted }}>
          xAI calls that
        </div>
        <div style={{ ...slam(364, 10), fontFamily: FONT_HOOK, fontSize: 74, color: RM.green, textShadow: `0 12px 50px ${RM.green}44` }}>
          THE STEPPING STONE TO VIDEO
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GIIBeyond;
