// THE COMPARISON ARENA — 9:16 Vertical Motion Graphics Kit for YouTube Shorts (1080x1920).
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../fonts';
import { CLAMP, fmtNumber, ComparisonItem } from './comparisonkit';

// =============================================================================
// 1. Vertical Arena 9:16 Backdrop
// =============================================================================
export const VerticalArenaBackdrop: React.FC<{
  primaryGlow?: string;
  secondaryGlow?: string;
  topicTitle?: string;
}> = ({
  primaryGlow = COLORS.accent,
  secondaryGlow = COLORS.accent2,
  topicTitle,
}) => {
  const frame = useCurrentFrame();
  const pulse = interpolate(frame, [0, 45, 90], [0.3, 0.5, 0.3], { extrapolateRight: 'wrap', easing: EASINGS.easeInOut });

  return (
    <>
      <AbsoluteFill style={{ backgroundColor: COLORS.paper }} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(800px 800px at 50% 10%, ${primaryGlow}${Math.floor(pulse * 255).toString(16).padStart(2, '0')}, transparent 70%),
                       radial-gradient(800px 800px at 50% 90%, ${secondaryGlow}33, transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${COLORS.line}22 1px, transparent 1px), linear-gradient(90deg, ${COLORS.line}22 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          opacity: 0.6,
        }}
      />
      {topicTitle && (
        <div
          style={{
            position: 'absolute',
            top: 80,
            left: 40,
            right: 40,
            textAlign: 'center',
            fontFamily: FONT_DISPLAY,
            fontSize: 48,
            letterSpacing: 2,
            color: COLORS.ink,
            lineHeight: 1.1,
            textShadow: `0 0 30px ${COLORS.d900}`,
          }}
        >
          {topicTitle}
        </div>
      )}
    </>
  );
};

// =============================================================================
// 2. Vertical 1v1 Battle Clash (Top Entity vs Bottom Entity)
// =============================================================================
export const VerticalBattleClash: React.FC<{
  entityA: ComparisonItem;
  entityB: ComparisonItem;
  winner?: 'A' | 'B' | null;
  startFrame?: number;
}> = ({ entityA, entityB, winner, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const enterA = interpolate(frame, [startFrame, startFrame + 10], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });
  const enterB = interpolate(frame, [startFrame + 4, startFrame + 14], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40, padding: '0 40px' }}>
      <div
        style={{
          opacity: enterA,
          transform: `scale(${winner === 'A' ? 1.05 : 1.0})`,
          width: '100%',
          background: `${COLORS.d900}f0`,
          border: `3px solid ${winner === 'A' ? entityA.color : COLORS.line}`,
          borderRadius: RADIUS.card,
          padding: '36px 30px',
          boxShadow: winner === 'A' ? `0 0 60px ${entityA.color}66` : SHADOW.card,
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 58, color: entityA.color, lineHeight: 1.0 }}>{entityA.name}</div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 68, fontWeight: 700, color: COLORS.ink, marginTop: 14 }}>
          {fmtNumber(entityA.value)}
        </div>
        {entityA.subtext && <div style={{ fontFamily: FONT_BODY, fontSize: 24, color: COLORS.muted, marginTop: 8 }}>{entityA.subtext}</div>}
      </div>

      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 56,
          color: COLORS.warn,
          background: `${COLORS.d900}ff`,
          border: `2px solid ${COLORS.line}`,
          padding: '10px 36px',
          borderRadius: RADIUS.pill,
          letterSpacing: 4,
          boxShadow: `0 0 30px ${COLORS.warn}44`,
        }}
      >
        VS
      </div>

      <div
        style={{
          opacity: enterB,
          transform: `scale(${winner === 'B' ? 1.05 : 1.0})`,
          width: '100%',
          background: `${COLORS.d900}f0`,
          border: `3px solid ${winner === 'B' ? entityB.color : COLORS.line}`,
          borderRadius: RADIUS.card,
          padding: '36px 30px',
          boxShadow: winner === 'B' ? `0 0 60px ${entityB.color}66` : SHADOW.card,
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 58, color: entityB.color, lineHeight: 1.0 }}>{entityB.name}</div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 68, fontWeight: 700, color: COLORS.ink, marginTop: 14 }}>
          {fmtNumber(entityB.value)}
        </div>
        {entityB.subtext && <div style={{ fontFamily: FONT_BODY, fontSize: 24, color: COLORS.muted, marginTop: 8 }}>{entityB.subtext}</div>}
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// 3. Vertical Scale Ladder (Level 1 to Level 5 Vertical Shorts Ladder)
// =============================================================================
export const VerticalScaleLadder: React.FC<{
  tiers: { level: number; title: string; value: number; unit?: string; color: string }[];
  activeLevel: number;
  startFrame?: number;
}> = ({ tiers, activeLevel, startFrame = 0 }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '180px 40px 100px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {tiers.map((tier, idx) => {
          const itemStart = startFrame + idx * 3;
          const enter = interpolate(frame, [itemStart, itemStart + 8], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
          const isActive = tier.level === activeLevel;
          const isPassed = tier.level < activeLevel;

          return (
            <div
              key={tier.level}
              style={{
                opacity: enter * (isActive ? 1.0 : isPassed ? 0.6 : 0.25),
                transform: `scale(${isActive ? 1.04 : 1.0})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: isActive ? `${COLORS.d900}fa` : `${COLORS.d800}99`,
                border: `3px solid ${isActive ? tier.color : isPassed ? COLORS.line : `${COLORS.line}33`}`,
                borderRadius: RADIUS.card,
                padding: '20px 28px',
                boxShadow: isActive ? `0 0 45px ${tier.color}77` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 26,
                    fontWeight: 700,
                    color: tier.color,
                    background: `${tier.color}22`,
                    padding: '8px 16px',
                    borderRadius: RADIUS.panel,
                  }}
                >
                  L{tier.level}
                </div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 38, color: COLORS.ink }}>{tier.title}</div>
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 38, color: tier.color, fontWeight: 700 }}>
                {fmtNumber(tier.value, '', tier.unit || '')}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
