import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 233.09-250.77 · honest-gap open. "not out yet" f180, "next week" f212, "API only" f409.
export const compositionConfig = { id: 'Q38HonestOpen', durationInSeconds: 17.68, fps: 30, width: 1920, height: 1080 };

const Card: React.FC<{ head: string; sub: string; ok: boolean; style: React.CSSProperties }> = ({ head, sub, ok, style }) => (
  <div style={{
    ...style, display: 'flex', alignItems: 'flex-start', gap: 22, width: 900,
    background: RM.panel, border: `1px solid ${ok ? RM.green : RM.red}44`, borderRadius: 16, padding: '20px 34px',
  }}>
    <div style={{ fontSize: 34, color: ok ? RM.green : RM.red, lineHeight: 1.1 }}>{ok ? '✓' : '✕'}</div>
    <div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 32, color: RM.text }}>{head}</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 22, color: RM.muted, marginTop: 6 }}>{sub}</div>
    </div>
  </div>
);

const Q38HonestOpen: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(530);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.red} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.red}>here&rsquo;s the catch</Eyebrow></div>
        <Card head="API access" sub="live today, on Alibaba Cloud Model Studio" ok style={pop(100)} />
        <Card head="Open weights" sub="promised — Alibaba says next week. Not out yet. No license attached." ok={false} style={pop(212)} />
        <div style={{ ...rise(409, 18), marginTop: 8, fontSize: 26, color: RM.text, fontWeight: 600, textAlign: 'center', maxWidth: 1000 }}>
          Right now, Qwen3.8-Max is API-only &mdash; same as every closed model it&rsquo;s compared against.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default Q38HonestOpen;
