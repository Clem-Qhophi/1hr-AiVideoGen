import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 23.85-61.79 · context. "Grok Imagine is xAI's image generator" f84, "no pedestal" f287,
// "race got brutal" f373, "GPT-Image-2 rules the Arena" f428, rivals f638-751, "flipped a switch"
// f913, "default quality mode" f950, "rankings started moving" f1108.
export const compositionConfig = { id: 'GIIContext', durationInSeconds: 37.94, fps: 30, width: 1920, height: 1080 };

const RIVALS = [
  { name: 'GPT-Image-2', start: 428, color: RM.text },
  { name: 'Gemini', start: 638, color: RM.muted },
  { name: 'Muse', start: 666, color: RM.muted },
  { name: 'Qwen', start: 700, color: RM.muted },
];

const GIIContext: React.FC = () => {
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(1138);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '0 140px', textAlign: 'center' }}>
        <div style={rise(4, 16)}><Eyebrow color={RM.cyan}>What existed before</Eyebrow></div>
        <div style={{ ...rise(60, 18), fontSize: 36, fontWeight: 700, color: RM.text }}>
          Grok Imagine is xAI&rsquo;s image generator, built into Grok
        </div>
        <div style={{ ...rise(180, 18), fontSize: 28, color: RM.muted }}>
          It made decent images.
        </div>
        <div style={{ ...rise(287, 18), fontSize: 28, color: RM.muted }}>
          Nobody was putting it on a pedestal.
        </div>
        <div style={{ ...rise(373, 18), marginTop: 26, fontSize: 30, fontWeight: 600, color: RM.amber }}>
          Meanwhile, the image-model race got brutal.
        </div>
        <div style={{ ...rise(428, 16), fontSize: 26, color: RM.muted }}>
          OpenAI&rsquo;s
        </div>
        <div style={{ ...slam(470, 9), fontFamily: FONT_HOOK, fontSize: 66, color: RM.text }}>
          GPT-Image-2
        </div>
        <div style={{ ...rise(520, 16), fontSize: 26, color: RM.muted }}>
          rules the Arena leaderboard. Elo. People vote on two images, side by side.
        </div>
        <div style={{ display: 'flex', gap: 22, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1200 }}>
          {RIVALS.map((r) => (
            <div key={r.name} style={{ ...rise(r.start, 14), fontFamily: FONT_HOOK, fontSize: 40, color: r.color, border: `2px solid ${RM.line}`, borderRadius: 14, padding: '10px 26px', background: RM.panel }}>
              {r.name}
            </div>
          ))}
          <div style={{ ...rise(751, 14), fontSize: 26, color: RM.muted, alignSelf: 'center' }}>
            all fighting for the same seat
          </div>
        </div>
        <div style={{ ...rise(871, 18), marginTop: 30, fontSize: 30, fontWeight: 600, color: RM.text }}>
          Then yesterday, xAI flipped a switch.
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
          <div style={{ ...slam(950, 10), fontFamily: FONT_HOOK, fontSize: 74, color: RM.green, textShadow: `0 10px 44px ${RM.green}44` }}>
            IMAGINE 2.0
          </div>
          <div style={{ ...rise(1018, 16), fontSize: 30, color: RM.muted }}>
            became the default quality mode in Grok
          </div>
        </div>
        <div style={{ ...rise(1108, 18), fontSize: 32, fontWeight: 700, color: RM.cyan }}>
          And the rankings started moving.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GIIContext;
