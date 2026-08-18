import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { RM, RMBg, useRise } from '../../lib/reviewkit';

// master 15.1-21.8 · "doesn't trade / doesn't sell signals" then "calm you wins" ~f114
export const compositionConfig = { id: 'RMNotBot', durationInSeconds: 6.9, fps: 30, width: 1920, height: 1080 };

const CHIPS = ['Not a signal bot.', 'Not an auto-trader.'];

const RMNotBot: React.FC = () => {
  const rise = useRise();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 44, padding: '0 150px', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 22 }}>
          {CHIPS.map((t, i) => (
            <div key={t} style={{ ...rise(10 + i * 12, 22), fontFamily: FONT_MONO, fontSize: 34, color: RM.muted, border: `1px solid ${RM.line}`, background: RM.panel, borderRadius: 999, padding: '16px 34px' }}>{t}</div>
          ))}
        </div>
        <h1 style={{ ...rise(114, 30), fontWeight: 700, fontSize: 100, lineHeight: 1.1, color: RM.text, margin: 0 }}>
          It makes the <span style={{ color: RM.cyan }}>calm you</span> win.
        </h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default RMNotBot;
