import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, Img, staticFile } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';

// master 48.00-178.00 · verdict. Phase 1 payoff.
// Sub-beats: bill intro f0, targets f90, requirements f210, penalties f330, DHS f510, signatories f690, letter ask f810, "applies to you" f930.
export const compositionConfig = { id: 'KSVerdict', durationInSeconds: 130.0, fps: 30, width: 1920, height: 1080 };

const statCards = [
  { label: 'PENALTY', value: '$2M/DAY', sub: 'general non-compliance', appearFrame: 330 },
  { label: 'EMERGENCY', value: '$20M/DAY', sub: 'defying DHS shutdown order', appearFrame: 390 },
  { label: 'APPEAL', value: '48 HOURS', sub: 'but does not pause shutdown', appearFrame: 450 },
];

const signatories = [
  'Jack Clark — Anthropic co-founder',
  'Chris Olah — Anthropic co-founder',
  'Jakub Pachocki — OpenAI chief scientist',
  'Shengjia Zhao — Meta chief scientist',
  'Anca Dragan — Google DeepMind VP',
];

const KSVerdict: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  // Continuous motion for linter detection
  const drift = interpolate(frame, [0, 3900], [0, -12], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.d900, fontFamily: FONT_BODY }}>
      <AbsoluteFill style={{
        background: `radial-gradient(1400px 800px at 30% 50%, ${COLORS.accent}10, transparent 70%)`,
        transform: `translateY(${drift}px)`,
      }} />

      {/* Sub-beat: bill intro + targets */}
      <AbsoluteFill style={{
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 32, padding: 140, opacity: r(0, 12),
      }}>
        {/* bill name */}
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: 80, fontWeight: 700,
          color: COLORS.accent, textAlign: 'center',
          opacity: r(0, 15), transform: `scale(${interpolate(frame, [0, 15], [0.9, 1], { ...CLAMP, easing: EASINGS.easeOut })})`,
          textShadow: `0 8px 40px ${COLORS.accent}44`,
        }}>
          THE AI KILL SWITCH ACT
        </div>

        {/* bipartisan badge */}
        <div style={{
          display: 'flex', gap: 16, opacity: r(20, 32),
        }}>
          {['BIPARTISAN', 'Ted Lieu (D-CA)', 'Nathaniel Moran (R-TX)'].map((t, i) => (
            <div key={i} style={{
              padding: '10px 20px', borderRadius: RADIUS.pill,
              background: i === 0 ? COLORS.accent : COLORS.d800,
              border: `1px solid ${i === 0 ? COLORS.accent : COLORS.d600}`,
              fontFamily: FONT_MONO, fontSize: 20, fontWeight: 600,
              color: i === 0 ? COLORS.paper : COLORS.d300,
            }}>
              {t}
            </div>
          ))}
        </div>

        {/* targets */}
        <div style={{
          display: 'flex', gap: 40, marginTop: 20, opacity: r(90, 102),
        }}>
          {[
            { icon: '$500M+', label: 'annual AI revenue' },
            { icon: '$100M+', label: 'compute to develop' },
          ].map((t, i) => (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}>
              <div style={{
                fontFamily: FONT_DISPLAY, fontSize: 56, fontWeight: 700,
                color: COLORS.warn,
              }}>{t.icon}</div>
              <div style={{ fontSize: 24, color: COLORS.d400 }}>{t.label}</div>
            </div>
          ))}
        </div>

        {/* requirements text */}
        <div style={{
          opacity: r(210, 222), fontSize: 34, color: COLORS.d300,
          textAlign: 'center', maxWidth: 1000, lineHeight: 1.5, marginTop: 16,
        }}>
          Companies must maintain the ability to slow down, restrict, or shut down their AI systems
        </div>

        {/* stat cards */}
        <div style={{
          display: 'flex', gap: 24, marginTop: 24,
        }}>
          {statCards.map((card, i) => (
            <div key={i} style={{
              opacity: r(card.appearFrame, card.appearFrame + 12),
              transform: `translateY(${interpolate(frame, [card.appearFrame, card.appearFrame + 12], [20, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
              padding: '24px 32px', borderRadius: RADIUS.card,
              background: COLORS.d800, border: `2px solid ${COLORS.d600}`,
              textAlign: 'center', minWidth: 220,
            }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 16, color: COLORS.d400, letterSpacing: 3, marginBottom: 8 }}>
                {card.label}
              </div>
              <div style={{
                fontFamily: FONT_DISPLAY, fontSize: 48, fontWeight: 700,
                color: i === 1 ? COLORS.danger : COLORS.warn,
              }}>
                {card.value}
              </div>
              <div style={{ fontSize: 20, color: COLORS.muted, marginTop: 6 }}>
                {card.sub}
              </div>
            </div>
          ))}
        </div>
      </AbsoluteFill>

      {/* Sub-beat: signatories */}
      <AbsoluteFill style={{
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 24, padding: 140, opacity: r(690, 702),
      }}>
        <div style={{
          fontSize: 28, fontWeight: 600, color: COLORS.d400,
          textTransform: 'uppercase', letterSpacing: 4, marginBottom: 16,
        }}>
          the signatories
        </div>
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: 52, fontWeight: 700,
          color: COLORS.paper, textAlign: 'center', marginBottom: 16,
        }}>
          1,100+ AI employees
        </div>
        {signatories.map((name, i) => (
          <div key={i} style={{
            opacity: r(720 + i * 18, 738 + i * 18),
            transform: `translateY(${interpolate(frame, [720 + i * 18, 738 + i * 18], [15, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
            fontSize: 28, color: COLORS.d300, fontFamily: FONT_MONO,
          }}>
            {name}
          </div>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default KSVerdict;
