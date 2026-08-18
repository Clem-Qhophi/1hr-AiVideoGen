import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 105.23-121.19 · verdict-4: the field below. Reve 1302 f115, Muse 1283 f161, Gemini 1263
// f223, Qwen 1258 f298. "A year ago xAI sat mid-pack" f372, "running with the top two" f428.
export const compositionConfig = { id: 'GIIBelow', durationInSeconds: 15.96, fps: 30, width: 1920, height: 1080 };

const ROWS = [
  { rank: '1', name: 'GPT-Image-2', elo: '1380', start: 30, hl: false },
  { rank: '2', name: 'Grok Imagine 2.0', elo: '1320', tag: 'PRELIMINARY', start: 60, hl: true },
  { rank: '3', name: 'Reve', elo: '1302', start: 115, hl: false },
  { rank: '4', name: "Meta's Muse Image", elo: '1283', start: 161, hl: false },
  { rank: '5', name: "Google's Gemini", elo: '1263', start: 223, hl: false },
  { rank: '6', name: "Alibaba's Qwen", elo: '1258', start: 298, hl: false },
];

const GIIBelow: React.FC = () => {
  const rise = useRise();
  const drift = useDrift(479);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '0 240px' }}>
        <div style={rise(4, 16)}><Eyebrow color={RM.cyan}>LMArena Text-to-Image &middot; Aug 7</Eyebrow></div>
        <div style={{ background: RM.panel, border: `2px solid ${RM.line}`, borderRadius: 24, width: 980, padding: '18px 44px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ROWS.map((r) => (
            <div key={r.name} style={{
              ...rise(r.start, 14), display: 'flex', alignItems: 'center', gap: 26,
              background: r.hl ? `${RM.cyan}18` : 'transparent',
              border: r.hl ? `2px solid ${RM.cyan}55` : `1px solid ${RM.line}`,
              borderRadius: 12, padding: '14px 26px',
            }}>
              <div style={{ fontFamily: 'monospace', fontSize: 24, color: r.hl ? RM.cyan : RM.muted, width: 40 }}>{r.rank}</div>
              <div style={{ fontSize: 30, fontWeight: 600, color: r.hl ? RM.text : RM.muted, flex: 1, fontFamily: FONT_HOOK }}>
                {r.name}
              </div>
              {r.tag && <div style={{ fontFamily: 'monospace', fontSize: 20, letterSpacing: 2, color: RM.amber }}>{r.tag}</div>}
              <div style={{ fontFamily: FONT_HOOK, fontSize: 40, color: r.hl ? RM.cyan : RM.text }}>{r.elo}</div>
            </div>
          ))}
        </div>
        <div style={{ ...rise(372, 18), fontSize: 28, color: RM.muted }}>
          A year ago, xAI sat mid-pack on this board.
        </div>
        <div style={{ ...rise(428, 18), fontSize: 32, fontWeight: 700, color: RM.green }}>
          Today it&rsquo;s running with the top two.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GIIBelow;
