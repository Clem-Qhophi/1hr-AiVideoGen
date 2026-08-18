import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';
import { EASINGS } from '../../brand';
import { CLAMP } from '../../lib/kit';

// master 91.42-105.23 · verdict-3: how Elo works. "Elo is just a rating, like chess" f12,
// "vote on two images, pick the better one" f72, "score moves" f150, "no money changes hands" f178,
// "popularity contest by the people who use these tools" f325.
export const compositionConfig = { id: 'GIIEloExplain', durationInSeconds: 13.81, fps: 30, width: 1920, height: 1080 };

const GIIEloExplain: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const slam = useSlam();
  const drift = useDrift(414);
  const pop = (start: number) => ({
    opacity: interpolate(frame, [start, start + 7], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    transform: `scale(${interpolate(frame, [start, start + 12], [0.6, 1], { ...CLAMP, easing: EASINGS.overshoot })})`,
  });
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '0 150px', textAlign: 'center' }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.cyan}>How the Arena works</Eyebrow></div>
        <div style={{ ...rise(12, 16), fontSize: 30, fontWeight: 500, color: RM.muted }}>
          Elo is just a rating. Like chess.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginTop: 18 }}>
          <div style={{ ...pop(72), width: 300, height: 200, borderRadius: 20, border: `3px solid ${RM.cyan}88`, background: 'linear-gradient(145deg, #1c2733, #101722)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: FONT_HOOK, fontSize: 90, color: RM.cyan }}>A</div>
          </div>
          <div style={{ ...slam(120, 9), fontFamily: FONT_HOOK, fontSize: 54, color: RM.text }}>VS</div>
          <div style={{ ...pop(100), width: 300, height: 200, borderRadius: 20, border: `3px solid ${RM.green}88`, background: 'linear-gradient(145deg, #16271f, #101722)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: FONT_HOOK, fontSize: 90, color: RM.green }}>B</div>
          </div>
        </div>
        <div style={{ ...rise(130, 16), fontSize: 26, color: RM.muted }}>
          People vote on two images, pick the better one, the score moves
        </div>
        <div style={{ ...rise(178, 18), fontSize: 30, fontWeight: 700, color: RM.green }}>
          No money changes hands. The votes decide.
        </div>
        <div style={{ ...rise(325, 18), marginTop: 16, fontSize: 30, fontWeight: 600, color: RM.text, maxWidth: 1150 }}>
          That&rsquo;s why the board matters to you: a popularity contest run by the people who actually use these tools.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GIIEloExplain;
