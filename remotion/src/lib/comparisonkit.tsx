// THE COMPARISON ARENA — High-Impact Motion Graphics Kit for Universal Comparisons & Showdowns.
// Frame-based only: monotonic interpolate ranges + clamp for Remotion 30fps/60fps.
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, Easing, OffthreadVideo } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../fonts';

export const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

export const fmtNumber = (n: number, prefix: string = '', suffix: string = ''): string => {
  let valStr = '';
  if (n >= 1_000_000_000_000) valStr = `${(n / 1_000_000_000_000).toFixed(1)}T`;
  else if (n >= 1_000_000_000) valStr = `${(n / 1_000_000_000).toFixed(1)}B`;
  else if (n >= 1_000_000) valStr = `${(n / 1_000_000).toFixed(1)}M`;
  else if (n >= 1_000) valStr = `${(n / 1_000).toFixed(1)}K`;
  else if (n < 10 && n % 1 !== 0) valStr = n.toFixed(n >= 1 ? 1 : 2);
  else valStr = `${Math.round(n)}`;
  return `${prefix}${valStr}${suffix}`;
};

export type ComparisonItem = {
  id: string;
  name: string;
  value: number;
  label?: string;
  color: string;
  subtext?: string;
  icon?: string;
};

// =============================================================================
// 1. Arena 3D Backdrop — Volumetric Studio, Perspective Grid & Ambient Lighting
// =============================================================================
export const Arena3DBackdrop: React.FC<{
  primaryGlow?: string;
  secondaryGlow?: string;
  accentTitle?: string;
  videoSrc?: string;
  videoOpacity?: number;
}> = ({
  primaryGlow = COLORS.accent,
  secondaryGlow = COLORS.accent2,
  accentTitle,
  videoSrc,
  videoOpacity = 0.45,
}) => {
  const frame = useCurrentFrame();
  const pulse = interpolate(frame, [0, 60, 120], [0.35, 0.55, 0.35], { extrapolateRight: 'wrap', easing: EASINGS.easeInOut });

  return (
    <>
      <AbsoluteFill style={{ backgroundColor: COLORS.paper }} />
      {videoSrc && (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
          <OffthreadVideo
            src={videoSrc}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: videoOpacity,
              filter: 'brightness(0.65) contrast(1.25) saturate(1.1)',
            }}
          />
        </AbsoluteFill>
      )}
      {/* Dynamic 3D Volumetric Glows */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(1200px 750px at 20% -10%, ${primaryGlow}${Math.floor(pulse * 255).toString(16).padStart(2, '0')}, transparent 65%),
                       radial-gradient(1200px 750px at 80% 110%, ${secondaryGlow}33, transparent 65%)`,
        }}
      />
      {/* 3D Isometric / Floor Perspective Grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${COLORS.line}22 1px, transparent 1px), linear-gradient(90deg, ${COLORS.line}22 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          opacity: 0.65,
        }}
      />
      {/* Vignette Depth */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(7, 12, 22, 0.85) 100%)',
        }}
      />
      {accentTitle && (
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: 40,
            fontFamily: FONT_DISPLAY,
            fontSize: 22,
            letterSpacing: 3,
            color: COLORS.muted,
            textTransform: 'uppercase',
            opacity: 0.7,
          }}
        >
          {accentTitle}
        </div>
      )}
    </>
  );
};

// =============================================================================
// 2. Scale Ladder / Tier List (Level 1 to Level 10 Climb)
// =============================================================================
export const ScaleLadder: React.FC<{
  tiers: { level: number; title: string; value: number; unit?: string; note?: string; color: string }[];
  activeLevel: number;
  startFrame?: number;
}> = ({ tiers, activeLevel, startFrame = 0 }) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {tiers.map((tier, idx) => {
          const itemStart = startFrame + idx * 4;
          const enter = interpolate(frame, [itemStart, itemStart + 10], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
          const slideX = interpolate(frame, [itemStart, itemStart + 10], [-40, 0], { ...CLAMP, easing: EASINGS.easeOut });
          const isActive = tier.level === activeLevel;
          const isPassed = tier.level < activeLevel;

          const glow = isActive ? `0 0 35px ${tier.color}66` : 'none';
          const scale = isActive ? 1.03 : 1.0;
          const opacity = isActive ? 1.0 : isPassed ? 0.6 : 0.25;

          return (
            <div
              key={tier.level}
              style={{
                opacity: enter * opacity,
                transform: `translateX(${slideX}px) scale(${scale})`,
                transition: 'transform 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: isActive ? `${COLORS.d900}f5` : `${COLORS.d800}aa`,
                border: `2px solid ${isActive ? tier.color : isPassed ? COLORS.line : `${COLORS.line}44`}`,
                borderRadius: RADIUS.card,
                padding: '12px 28px',
                boxShadow: glow,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 22,
                    fontWeight: 700,
                    color: tier.color,
                    background: `${tier.color}22`,
                    padding: '6px 14px',
                    borderRadius: RADIUS.panel,
                    border: `1px solid ${tier.color}66`,
                  }}
                >
                  LVL {tier.level}
                </div>
                <div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, color: COLORS.ink, lineHeight: 1.1 }}>
                    {tier.title}
                  </div>
                  {tier.note && (
                    <div style={{ fontFamily: FONT_BODY, fontSize: 16, color: COLORS.muted, marginTop: 4 }}>
                      {tier.note}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 34, color: tier.color, fontWeight: 700 }}>
                  {fmtNumber(tier.value, '', tier.unit || '')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// =============================================================================
// 3. Auction Gavel Ticker (Frantic Net Worth / Bidding War Ticker + Gavel Strike)
// =============================================================================
export const AuctionGavelTicker: React.FC<{
  currentBidder: string;
  bidderColor?: string;
  startValue: number;
  endValue: number;
  currencyPrefix?: string;
  statusText?: string;
  gavelStrikeFrame?: number;
  startFrame?: number;
  duration?: number;
}> = ({
  currentBidder,
  bidderColor = COLORS.accent,
  startValue,
  endValue,
  currencyPrefix = '$',
  statusText = 'CURRENT HIGH BID',
  gavelStrikeFrame = 75,
  startFrame = 0,
  duration = 90,
}) => {
  const frame = useCurrentFrame();

  const countProgress = interpolate(frame, [startFrame, startFrame + duration], [startValue, endValue], {
    ...CLAMP,
    easing: EASINGS.easeOut,
  });

  // Gavel Strike Animation (Impact shake + shockwave)
  const isStruck = frame >= gavelStrikeFrame;
  const gavelImpact = interpolate(frame, [gavelStrikeFrame - 6, gavelStrikeFrame, gavelStrikeFrame + 4], [0, 1, 0], {
    ...CLAMP,
  });
  const shockwave = interpolate(frame, [gavelStrikeFrame, gavelStrikeFrame + 20], [0, 1], {
    ...CLAMP,
    easing: EASINGS.easeOut,
  });

  const screenShake = gavelImpact > 0 ? (frame % 2 === 0 ? 8 : -8) : 0;

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `translateX(${screenShake}px)` }}>
      {/* Shockwave circle on gavel strike */}
      {isStruck && shockwave < 1 && (
        <div
          style={{
            position: 'absolute',
            width: 800 * shockwave,
            height: 800 * shockwave,
            borderRadius: '50%',
            border: `4px solid ${COLORS.danger}`,
            opacity: 1 - shockwave,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Main Auction Board Card */}
      <div
        style={{
          width: 1200,
          background: `${COLORS.d900}ee`,
          border: `2px solid ${isStruck ? COLORS.danger : bidderColor}`,
          borderRadius: RADIUS.card,
          padding: '40px 60px',
          boxShadow: isStruck ? `0 0 80px ${COLORS.danger}77` : `0 0 50px ${bidderColor}44`,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top Header Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 20,
              color: COLORS.warn,
              letterSpacing: 4,
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS.danger, display: 'inline-block' }} />
            {statusText}
          </div>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 28,
              color: bidderColor,
              background: `${bidderColor}22`,
              padding: '6px 20px',
              borderRadius: RADIUS.pill,
              border: `1px solid ${bidderColor}66`,
            }}
          >
            BIDDER: {currentBidder.toUpperCase()}
          </div>
        </div>

        {/* Live Rolling Numbers */}
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 130,
            fontWeight: 700,
            color: isStruck ? COLORS.danger : COLORS.ink,
            lineHeight: 1.0,
            textShadow: `0 0 40px ${isStruck ? COLORS.danger : bidderColor}88`,
            margin: '20px 0',
          }}
        >
          {fmtNumber(Math.round(countProgress), currencyPrefix)}
        </div>

        {/* Callout Tagline */}
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: isStruck ? 48 : 34,
            color: isStruck ? COLORS.danger : COLORS.muted,
            letterSpacing: 3,
            marginTop: 14,
            textTransform: 'uppercase',
          }}
        >
          {isStruck ? '🔨 SOLD! HAMMER DOWN!' : 'GOING ONCE... GOING TWICE...'}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// 4. Speedometer Gauge (High-Velocity / Mach / RPM Dial)
// =============================================================================
export const SpeedometerGauge: React.FC<{
  title: string;
  speedValue: number;
  maxSpeed?: number;
  unit?: string;
  color?: string;
  startFrame?: number;
  duration?: number;
}> = ({
  title,
  speedValue,
  maxSpeed = 1000,
  unit = 'KM/H',
  color = COLORS.accent,
  startFrame = 0,
  duration = 60,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [startFrame, startFrame + duration], [0, speedValue / maxSpeed], {
    ...CLAMP,
    easing: EASINGS.easeOut,
  });
  const currentVal = interpolate(frame, [startFrame, startFrame + duration], [0, speedValue], {
    ...CLAMP,
    easing: EASINGS.easeOut,
  });

  const angle = -120 + progress * 240; // -120 deg to +120 deg sweep

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: 500,
          height: 500,
          borderRadius: '50%',
          border: `8px solid ${COLORS.line}`,
          background: `radial-gradient(circle, ${COLORS.d900} 60%, ${color}22 100%)`,
          boxShadow: `0 0 60px ${color}44`,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Needle Gauge */}
        <div
          style={{
            position: 'absolute',
            width: 6,
            height: 180,
            background: color,
            bottom: '50%',
            transformOrigin: 'bottom center',
            transform: `rotate(${angle}deg)`,
            borderRadius: 3,
            boxShadow: `0 0 16px ${color}`,
          }}
        />
        {/* Center Hub */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: COLORS.ink,
            border: `4px solid ${color}`,
            zIndex: 2,
          }}
        />

        {/* Digital Readout */}
        <div style={{ position: 'absolute', bottom: 70, textAlign: 'center' }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: 18, color: COLORS.muted, letterSpacing: 2 }}>{title}</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 64, fontWeight: 700, color: COLORS.ink, lineHeight: 1 }}>
            {Math.round(currentVal)}
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color, letterSpacing: 3, marginTop: 4 }}>{unit}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// 5. Multi-Leaderboard Race (5–10 Entities Dynamic Live Bar Ranking)
// =============================================================================
export const MultiLeaderboardRace: React.FC<{
  title: string;
  items: ComparisonItem[];
  metricLabel: string;
  startFrame?: number;
  duration?: number;
}> = ({ title, items, metricLabel, startFrame = 0, duration = 80 }) => {
  const frame = useCurrentFrame();
  const maxVal = Math.max(...items.map((it) => it.value), 1);
  const animProgress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    ...CLAMP,
    easing: EASINGS.easeInOut,
  });

  return (
    <div style={{ position: 'absolute', inset: 0, padding: '50px 100px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 44, color: COLORS.ink, letterSpacing: 2 }}>{title}</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 20, color: COLORS.muted, letterSpacing: 2 }}>{metricLabel}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.map((item, idx) => {
          const itemRatio = (item.value / maxVal) * animProgress;
          const isLeader = idx === 0;

          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                background: isLeader ? `${COLORS.d900}ee` : `${COLORS.d800}88`,
                padding: '10px 20px',
                borderRadius: RADIUS.panel,
                border: `1px solid ${isLeader ? item.color : COLORS.line}`,
                boxShadow: isLeader ? `0 0 24px ${item.color}44` : 'none',
              }}
            >
              {/* Rank Badge */}
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 22,
                  fontWeight: 700,
                  color: isLeader ? item.color : COLORS.muted,
                  width: 40,
                }}
              >
                #{idx + 1}
              </div>

              {/* Name */}
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: COLORS.ink, width: 260 }}>{item.name}</div>

              {/* Bar Fill */}
              <div
                style={{
                  flex: 1,
                  height: 24,
                  background: `${COLORS.line}55`,
                  borderRadius: RADIUS.pill,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${Math.max(itemRatio * 100, 2)}%`,
                    background: item.color,
                    borderRadius: RADIUS.pill,
                    boxShadow: `0 0 16px ${item.color}88`,
                  }}
                />
              </div>

              {/* Value Readout */}
              <div style={{ fontFamily: FONT_MONO, fontSize: 26, color: item.color, width: 140, textAlign: 'right', fontWeight: 700 }}>
                {fmtNumber(Math.round(item.value * animProgress))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// =============================================================================
// 6. 3D Battle Card Showdown (Isometric Card Clash)
// =============================================================================
export const BattleCard3D: React.FC<{
  entityA: ComparisonItem;
  entityB: ComparisonItem;
  winner?: 'A' | 'B' | null;
  startFrame?: number;
}> = ({ entityA, entityB, winner, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const enterA = interpolate(frame, [startFrame, startFrame + 12], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });
  const enterB = interpolate(frame, [startFrame + 4, startFrame + 16], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });

  const renderCard = (entity: ComparisonItem, isWin: boolean, enter: number, side: 'left' | 'right') => {
    const tilt = side === 'left' ? 6 : -6;
    return (
      <div
        style={{
          opacity: enter,
          transform: `perspective(1000px) rotateY(${tilt}deg) scale(${isWin ? 1.05 : 1.0})`,
          width: 480,
          background: `${COLORS.d900}f0`,
          border: `2px solid ${isWin ? entity.color : COLORS.line}`,
          borderRadius: RADIUS.card,
          padding: '40px 36px',
          boxShadow: isWin ? `0 0 60px ${entity.color}66` : SHADOW.card,
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: FONT_BODY, fontSize: 16, color: COLORS.muted, letterSpacing: 3, textTransform: 'uppercase' }}>
          COMBATANT
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 52, color: entity.color, marginTop: 8, lineHeight: 1.1 }}>
          {entity.name}
        </div>
        <div style={{ width: '100%', height: 2, background: `${entity.color}44`, margin: '24px 0' }} />
        <div style={{ fontFamily: FONT_MONO, fontSize: 58, fontWeight: 700, color: COLORS.ink }}>
          {fmtNumber(entity.value)}
        </div>
        {entity.subtext && (
          <div style={{ fontFamily: FONT_BODY, fontSize: 20, color: COLORS.muted, marginTop: 10 }}>{entity.subtext}</div>
        )}
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 60 }}>
      {renderCard(entityA, winner === 'A', enterA, 'left')}
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 60, color: COLORS.muted, letterSpacing: 4 }}>VS</div>
      {renderCard(entityB, winner === 'B', enterB, 'right')}
    </AbsoluteFill>
  );
};
