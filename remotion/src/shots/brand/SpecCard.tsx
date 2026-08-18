import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { VibeBg, VIBES, type VibeName } from '../../lib/vibes';
import { RM, CLAMP } from '../../lib/reviewkit';
import { loadFont } from '@remotion/google-fonts/Anton';

export type CardKind = 'stat' | 'compare' | 'quote';

export type CardProps = {
  kind: CardKind;
  kicker?: string;
  stat?: string;
  unit?: string;
  label?: string;
  foot?: string;
  left?: { value: string; label?: string; accent?: string };
  right?: { value: string; label?: string; accent?: string };
  accent?: string;
  vibe?: VibeName;
};

export const compositionConfig = {
  id: 'SpecCard',
  durationInSeconds: 5,
  fps: 30,
  width: 1920,
  height: 1080,
  transparent: false,
};

const { fontFamily: HOOK_FONT } = loadFont('normal', { weights: ['400'], subsets: ['latin'] });
const SAFE_FONT = `${HOOK_FONT}, 'Arial Black', Impact, sans-serif`;

const ACCENT_COLORS: Record<string, string> = {
  accent: '#22d3ee', warn: '#f5c451', signal: '#34d399', danger: '#f0687a',
  green: '#34d399', red: '#f0687a', cyan: '#22d3ee', amber: '#f5c451',
};

function easeOut(frame: number, start: number, dur: number) {
  return interpolate(frame, [start, start + dur], [0, 1], { ...CLAMP });
}

const SpecCard: React.FC<CardProps> = (props) => {
  const frame = useCurrentFrame();
  const kind = props.kind || 'stat';
  const vibeName = props.vibe || 'techAI';
  const v = VIBES[vibeName] || VIBES.techAI;
  const accent = ACCENT_COLORS[props.accent || ''] || props.accent || v.accent;
  const kicker = props.kicker || '';
  const stat = String(props.stat || '');
  const unit = props.unit || '';
  const label = props.label || '';
  const foot = props.foot || '';

  const fadeIn = easeOut(frame, 0, 12);
  const slamScale = interpolate(frame, [4, 12], [1.6, 1], { ...CLAMP });

  const kickerOpacity = easeOut(frame, 0, 10);
  const statOpacity = easeOut(frame, 4, 8);
  const unitOpacity = easeOut(frame, 10, 8);
  const labelOpacity = easeOut(frame, 14, 8);
  const footOpacity = easeOut(frame, 18, 8);

  return (
    <AbsoluteFill>
      <VibeBg vibe={vibeName} />
      <AbsoluteFill>
        {/* kicker */}
        {kicker && (
          <div style={{ position: 'absolute', top: 150, left: 140, opacity: kickerOpacity }}>
            <span style={{ fontFamily: 'monospace', fontSize: 30, letterSpacing: 6, color: accent, textTransform: 'uppercase' as const }}>
              {kicker}
            </span>
          </div>
        )}

        {kind === 'stat' && (
          <>
            <div style={{ position: 'absolute', top: 230, left: 140, right: 140, opacity: statOpacity, transform: `scale(${slamScale})` }}>
              <div style={{ fontFamily: SAFE_FONT, fontSize: 260, color: accent, lineHeight: 1 }}>{stat}</div>
            </div>
            {unit && (
              <div style={{ position: 'absolute', top: 530, left: 140, opacity: unitOpacity }}>
                <span style={{ fontFamily: SAFE_FONT, fontSize: 56, color: RM.text }}>{unit}</span>
              </div>
            )}
            {label && (
              <div style={{ position: 'absolute', top: unit ? 610 : 510, left: 140, right: 140, opacity: labelOpacity }}>
                <span style={{ fontFamily: 'sans-serif', fontSize: 46, color: RM.muted, lineHeight: 1.3 }}>{label}</span>
              </div>
            )}
          </>
        )}

        {kind === 'compare' && (
          <>
            <div style={{ position: 'absolute', top: 250, bottom: 220, left: 960, width: 3, background: RM.line }} />
            <div style={{ position: 'absolute', top: 300, left: 140, width: 720, opacity: statOpacity, transform: `scale(${slamScale})` }}>
              <div style={{ fontFamily: SAFE_FONT, fontSize: 180, color: ACCENT_COLORS[props.left?.accent || ''] || '#34d399', lineHeight: 1 }}>{props.left?.value}</div>
              {props.left?.label && <div style={{ marginTop: 40, fontFamily: 'sans-serif', fontSize: 40, color: RM.muted }}>{props.left.label}</div>}
            </div>
            <div style={{ position: 'absolute', top: 300, left: 1040, right: 140, opacity: unitOpacity }}>
              <div style={{ fontFamily: SAFE_FONT, fontSize: 180, color: ACCENT_COLORS[props.right?.accent || ''] || '#f0687a', lineHeight: 1 }}>{props.right?.value}</div>
              {props.right?.label && <div style={{ marginTop: 40, fontFamily: 'sans-serif', fontSize: 40, color: RM.muted }}>{props.right.label}</div>}
            </div>
          </>
        )}

        {kind === 'quote' && (
          <>
            <div style={{ position: 'absolute', top: 160, left: 100, opacity: statOpacity, transform: `scale(${slamScale})` }}>
              <span style={{ fontFamily: SAFE_FONT, fontSize: 200, color: accent, opacity: 0.6 }}>{'\u201c'}</span>
            </div>
            <div style={{ position: 'absolute', top: 300, left: 150, right: 150, opacity: labelOpacity }}>
              <span style={{ fontFamily: SAFE_FONT, fontSize: 76, color: RM.text, lineHeight: 1.25 }}>{stat}</span>
            </div>
            {label && (
              <div style={{ position: 'absolute', top: 620, left: 150, opacity: labelOpacity }}>
                <span style={{ fontFamily: 'sans-serif', fontSize: 42, color: accent }}>{'\u2014 '}{label}</span>
              </div>
            )}
          </>
        )}

        {/* footnote */}
        {foot && (
          <div style={{ position: 'absolute', bottom: 120, left: 140, right: 140, opacity: footOpacity }}>
            <div style={{ borderTop: `2px solid ${RM.line}`, paddingTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: accent, flexShrink: 0 }} />
              <span style={{ fontFamily: 'sans-serif', fontSize: 28, color: RM.muted }}>{foot}</span>
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default SpecCard;
