import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 286.93-302.20 · MANDATORY CTA beat (niches/ai-news.json script.structure close):
// brand promise + subscribe (primary, f169) + like/comment (secondary, f232) + tease (f382).
// Never skip or water this down - see niches/ai-news.json `_channel` note.
export const compositionConfig = { id: 'Q38Outro', durationInSeconds: 15.54, fps: 30, width: 1920, height: 1080 };

const Q38Outro: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(458);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={rise(4, 16)}><Eyebrow color={RM.cyan}>AI UNDER3 MINUTES</Eyebrow></div>
        <div style={{ ...rise(20, 18), fontSize: 32, fontWeight: 500, color: RM.text, textAlign: 'center', maxWidth: 1100 }}>
          We get you the real breakdown the day a release is confirmed.
        </div>
        <div style={{
          ...pop(169), marginTop: 10, background: RM.cyan, color: '#04121a', fontWeight: 800,
          fontSize: 50, padding: '22px 58px', borderRadius: 999, boxShadow: `0 16px 46px ${RM.cyan}44`,
        }}>
          SUBSCRIBE
        </div>
        <div style={{ ...rise(200, 18), fontSize: 24, color: RM.muted }}>
          so you don&rsquo;t miss the next one
        </div>
        <div style={{ ...pop(232), display: 'flex', gap: 40, marginTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 26, color: RM.text }}>👍 Like</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 26, color: RM.text }}>💬 Comment your take</div>
        </div>
        <div style={{ ...rise(382, 18), marginTop: 14, fontSize: 24, color: RM.muted, textAlign: 'center', maxWidth: 1050 }}>
          Waiting on the open weights, or is API-only enough for what you're building?
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default Q38Outro;
