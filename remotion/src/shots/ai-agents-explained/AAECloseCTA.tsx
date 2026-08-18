import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 799.71-855.24 · MANDATORY CTA beat (formats.explainer.script.structure close):
// "not implementation, four questions" close line + subscribe (primary) + like/comment (secondary).
// Never skip or water this down.
export const compositionConfig = { id: 'AAECloseCTA', durationInSeconds: 55.53, fps: 30, width: 1920, height: 1080 };

const AAECloseCTA: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(1666);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <div style={rise(4, 16)}><Eyebrow color={RM.cyan}>AI UNDER3 MINUTES</Eyebrow></div>
        <div style={{ ...rise(20, 18), fontSize: 28, fontWeight: 500, color: RM.text, textAlign: 'center', maxWidth: 1050 }}>
          Get the four questions right first. The framework, the platform, the course, is all detail on top.
        </div>
        <div style={{
          ...pop(220), marginTop: 8, background: RM.cyan, color: '#04121a', fontWeight: 800,
          fontSize: 46, padding: '20px 54px', borderRadius: 999, boxShadow: `0 16px 46px ${RM.cyan}44`,
        }}>
          SUBSCRIBE
        </div>
        <div style={{ ...rise(260, 18), fontSize: 22, color: RM.muted }}>
          so you don&rsquo;t miss the next one
        </div>
        <div style={{ ...pop(300), display: 'flex', gap: 40, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 24, color: RM.text }}>👍 Like</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 24, color: RM.text }}>💬 Comment your take</div>
        </div>
        <div style={{ ...rise(440, 18), marginTop: 10, fontSize: 22, color: RM.muted, textAlign: 'center', maxWidth: 1050 }}>
          What's the first real task you'd hand to an agent, if you trusted the check enough to let it run?
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default AAECloseCTA;
