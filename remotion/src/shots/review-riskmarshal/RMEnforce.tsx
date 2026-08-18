import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { RM, RMBg, useRise } from '../../lib/reviewkit';

// master 41.0-52.0 · resize f8 · revenge-cooldown f113 · loss-halt f235
export const compositionConfig = { id: 'RMEnforce', durationInSeconds: 11.2, fps: 30, width: 1920, height: 1080 };

const ROWS = [
  { at: 8, tag: 'RESIZED', tone: RM.green, main: 'Oversized lot  2.00 → 0.47', sub: 'cut to fit your risk limit' },
  { at: 113, tag: 'BLOCKED', tone: RM.amber, main: 'Revenge-trade attempt', sub: 'cooldown engaged · 30:00' },
  { at: 235, tag: 'HALTED', tone: RM.red, main: 'Daily loss limit reached', sub: 'new trades stopped, no override' },
];

const LogRow: React.FC<{ at: number; tag: string; tone: string; main: string; sub: string }> = ({ at, tag, tone, main, sub }) => {
  const rise = useRise();
  return (
    <div style={{ ...rise(at, 22), display: 'flex', alignItems: 'center', gap: 26, padding: '22px 30px', borderTop: `1px solid ${RM.line}` }}>
      <span style={{ fontFamily: FONT_MONO, fontSize: 24, fontWeight: 700, color: tone, background: `${tone}1f`, border: `1px solid ${tone}66`, borderRadius: 8, padding: '8px 16px', minWidth: 130, textAlign: 'center' }}>{tag}</span>
      <span style={{ fontFamily: FONT_MONO, fontSize: 36, color: RM.text, flex: 1 }}>{main}</span>
      <span style={{ fontFamily: FONT_MONO, fontSize: 26, color: RM.muted }}>{sub}</span>
    </div>
  );
};

const RMEnforce: React.FC = () => {
  const rise = useRise();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.red} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 1500 }}>
          <div style={{ ...rise(4, 16), display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: RM.red }} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 4, color: RM.muted }}>LIVE ENFORCEMENT  ·  risk_marshal_enforcement.log</span>
          </div>
          <div style={{ background: RM.panel, border: `1px solid ${RM.line}`, borderRadius: 18, overflow: 'hidden' }}>
            {ROWS.map((r) => <LogRow key={r.tag} {...r} />)}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default RMEnforce;
