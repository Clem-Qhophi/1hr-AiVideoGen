import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ArenaBg, CommentaryBar, WordmarkShot, Combatant, CLAMP } from '../../lib/dataleague';
import { COLORS, EASINGS } from '../../brand';
import { FONT_MONO, FONT_DISPLAY } from '../../fonts';

// DLColdOpen — the hook: final score 5-4 slams in BEFORE anything is explained,
// then the rewind into the brand card. Render: npx remotion still src/index.ts DLColdOpen out/dl-coldopen.png --frame=140
export const compositionConfig = { id: 'DLColdOpen', durationInSeconds: 15.8, fps: 30, width: 1920, height: 1080 };

const MESSI: Combatant = { id: 'messi', name: 'Lionel Messi', short: 'MESSI', color: '#5BB8F0' };
const RONALDO: Combatant = { id: 'ronaldo', name: 'Cristiano Ronaldo', short: 'RONALDO', color: '#E8475F' };

const BigScore: React.FC<{ start?: number; exit?: number }> = ({ start = 0, exit = 1e9 }) => {
  const frame = useCurrentFrame();
  const slam = interpolate(frame, [start, start + 14], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });
  const scale = interpolate(frame, [start, start + 14], [1.35, 1], { ...CLAMP, easing: EASINGS.overshoot });
  const out = interpolate(frame, [exit, exit + 10], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: slam * out }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 40, color: COLORS.muted, letterSpacing: 12, marginBottom: 26 }}>THE FINAL SCORE</div>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, transform: `scale(${scale})` }}>
        <div style={{ background: `${RONALDO.color}18`, border: `2px solid ${RONALDO.color}`, borderRight: 'none', borderRadius: 16, padding: '26px 60px', textAlign: 'center' }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 200, fontWeight: 700, color: RONALDO.color, lineHeight: 1, textShadow: `0 0 60px ${RONALDO.color}88` }}>5</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 34, color: COLORS.ink, letterSpacing: 3, marginTop: 10 }}>RONALDO</div>
        </div>
        <div style={{ width: 6, background: COLORS.accent, alignSelf: 'stretch' }} />
        <div style={{ background: `${MESSI.color}18`, border: `2px solid ${MESSI.color}`, borderLeft: 'none', borderRadius: 16, padding: '26px 60px', textAlign: 'center' }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 200, fontWeight: 700, color: MESSI.color, lineHeight: 1, textShadow: `0 0 60px ${MESSI.color}88` }}>4</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 34, color: COLORS.ink, letterSpacing: 3, marginTop: 10 }}>MESSI</div>
        </div>
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 26, color: COLORS.warn, letterSpacing: 2, marginTop: 30 }}>RONALDO TAKES THE BELT · 5 - 4</div>
    </AbsoluteFill>
  );
};

const DLColdOpen: React.FC = () => (
  <AbsoluteFill>
    <ArenaBg glowA={MESSI.color} glowB={RONALDO.color} />
    <BigScore start={0} exit={351} />
    <CommentaryBar text="After twenty years of arguments, the numbers have voted." start={168} exit={229} />
    <CommentaryBar text="And the winner is not who most people would have guessed." start={273} exit={317} />
    <WordmarkShot subtitle="MESSI VS RONALDO — THE FINAL SCORE" start={351} />
  </AbsoluteFill>
);
export default DLColdOpen;
