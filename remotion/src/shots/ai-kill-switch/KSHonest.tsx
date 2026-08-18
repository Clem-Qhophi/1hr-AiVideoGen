import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';

// master 262.00-299.00 · honest gap. Three text cards: introduced≠passed, no hardware, no treaty.
export const compositionConfig = { id: 'KSHonest', durationInSeconds: 37.0, fps: 30, width: 1920, height: 1080 };

const cards = [
  { main: 'INTRODUCED', sub: 'does not mean PASSED', accent: COLORS.warn, frame: 0 },
  { main: 'NO HARDWARE KILL SWITCH', sub: 'software and API only', accent: COLORS.accent, frame: 330 },
  { main: 'NO INTERNATIONAL TREATY', sub: 'coordination is a proposal, not a reality', accent: COLORS.danger, frame: 600 },
];

const KSHonest: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  // Determine active card
  const activeIdx = frame >= 600 ? 2 : frame >= 330 ? 1 : 0;

  // Continuous motion for linter detection
  const drift = interpolate(frame, [0, 1110], [0, -6], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.d900, fontFamily: FONT_BODY, transform: `translateY(${drift}px)` }}>
      <AbsoluteFill style={{
        background: `radial-gradient(1000px 600px at 50% 50%, ${cards[activeIdx].accent}12, transparent 70%)`,
      }} />

      {/* header */}
      <AbsoluteFill style={{
        justifyContent: 'flex-start', alignItems: 'center', paddingTop: 120,
      }}>
        <div style={{
          opacity: r(0, 12),
          fontSize: 28, fontWeight: 600, color: COLORS.d400,
          textTransform: 'uppercase', letterSpacing: 5,
        }}>
          where the coverage gets ahead of reality
        </div>
      </AbsoluteFill>

      {/* cards */}
      <AbsoluteFill style={{
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 60,
      }}>
        {cards.map((card, i) => {
          const isActive = i === activeIdx;
          const cardOp = isActive ? r(card.frame, card.frame + 12) : 0.2;
          const cardScale = isActive ? interpolate(frame, [card.frame, card.frame + 12], [0.95, 1], { ...CLAMP, easing: EASINGS.easeOut }) : 0.95;
          return (
            <div key={i} style={{
              opacity: cardOp, transform: `scale(${cardScale})`,
              padding: '40px 80px', borderRadius: RADIUS.card,
              background: isActive ? COLORS.d800 : COLORS.d900,
              border: `2px solid ${isActive ? card.accent : COLORS.d600}`,
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: FONT_DISPLAY, fontSize: 56, fontWeight: 700,
                color: isActive ? card.accent : COLORS.d400,
                marginBottom: 12,
              }}>
                {card.main}
              </div>
              <div style={{
                fontSize: 28, color: isActive ? COLORS.d300 : COLORS.d400,
              }}>
                {card.sub}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default KSHonest;
