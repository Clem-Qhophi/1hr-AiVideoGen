// pricekit — before/after price badges + tier cards, built on reviewkit's dark/cyan tokens.
// Shared by gpt56-price-cut's shots (and any future pricing-news beat) so the "$X -> $Y" motif
// stays one component instead of five copies.
import React from 'react';
import { RM } from './reviewkit';
import { FONT_DISPLAY } from '../fonts';

export const BeforeAfter: React.FC<{ before: string; after: string; label?: string; style?: React.CSSProperties; big?: boolean }> = ({ before, after, label, style, big }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 22 }}>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: big ? 56 : 38, color: RM.muted, textDecoration: 'line-through', opacity: 0.7 }}>{before}</div>
    <div style={{ fontSize: big ? 40 : 28, color: RM.muted }}>&#8594;</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: big ? 64 : 46, color: RM.green }}>{after}</div>
    {label ? <div style={{ fontFamily: 'monospace', fontSize: 18, color: RM.muted, marginLeft: 8, textTransform: 'uppercase', letterSpacing: 2 }}>{label}</div> : null}
  </div>
);

export const TierCard: React.FC<{ name: string; role: string; style?: React.CSSProperties; accent?: string }> = ({ name, role, style, accent = RM.cyan }) => (
  <div style={{ ...style, background: RM.panel, border: `1px solid ${accent}55`, borderRadius: 16, padding: '18px 30px', textAlign: 'center', minWidth: 210 }}>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 32, color: accent }}>{name}</div>
    <div style={{ fontFamily: 'monospace', fontSize: 15, color: RM.muted, marginTop: 6, textTransform: 'uppercase', letterSpacing: 1.5 }}>{role}</div>
  </div>
);

export const StatRow: React.FC<{ name: string; value: string; source: string; style?: React.CSSProperties; accent?: string }> = ({ name, value, source, style, accent = RM.text }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', width: 980, borderBottom: `1px solid ${RM.line}`, padding: '10px 4px' }}>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 30, color: accent }}>{name}</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 32, color: RM.text }}>{value}</div>
    <div style={{ fontFamily: 'monospace', fontSize: 17, color: RM.muted, width: 150, textAlign: 'right' }}>{source}</div>
  </div>
);

export const SourceTag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: 'absolute', bottom: 34, width: '100%', textAlign: 'center', fontFamily: 'monospace', fontSize: 22, color: RM.muted }}>{children}</div>
);
