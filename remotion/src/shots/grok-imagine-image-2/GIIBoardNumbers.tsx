import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, useSlam, useDrift, Eyebrow, RM, FONT_HOOK } from '../../lib/reviewkit';

// master 69.10-91.42 · verdict-2: the numbers. "full picture, every number sourced" f5,
// "GPT-Image-2 1380" f283, "Grok Imagine 2.0 lands at 1320" f321, "second on text-to-image" f410,
// "image editing 1439 against 1463" f543, "Also second" f648.
export const compositionConfig = { id: 'GIIBoardNumbers', durationInSeconds: 22.32, fps: 30, width: 1920, height: 1080 };

const Panel: React.FC<{ title: string; titleColor: string; rows: { name: string; elo: string; tag?: string; tagColor?: string; start: number }[] }> = ({ title, titleColor, rows }) => {
  const rise = useRise();
  const slam = useSlam();
  return (
    <div style={{ background: RM.panel, border: `2px solid ${RM.line}`, borderRadius: 24, padding: '36px 44px', width: 520, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ ...rise(0, 16), fontFamily: 'monospace', fontSize: 24, letterSpacing: 5, color: titleColor, textTransform: 'uppercase' }}>{title}</div>
      {rows.map((r) => (
        <div key={r.name + r.elo} style={{ display: 'flex', alignItems: 'baseline', gap: 18, justifyContent: 'space-between' }}>
          <div style={{ ...rise(r.start, 14), fontSize: 28, fontWeight: 600, color: r.tagColor || RM.muted }}>{r.name}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            {r.tag && <div style={{ ...rise(r.start + 10, 12), fontFamily: 'monospace', fontSize: 22, color: r.tagColor }}>{r.tag}</div>}
            <div style={{ ...slam(r.start + 14, 9), fontFamily: FONT_HOOK, fontSize: 56, color: r.tagColor || RM.text }}>{r.elo}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const GIIBoardNumbers: React.FC = () => {
  const rise = useRise();
  const drift = useDrift(670);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, padding: '0 120px', textAlign: 'center' }}>
        <div style={rise(5, 16)}><Eyebrow color={RM.cyan}>LMArena &middot; as of Aug 7, 2026</Eyebrow></div>
        <div style={{ ...rise(40, 16), fontSize: 30, fontWeight: 500, color: RM.muted }}>
          The full picture, every number sourced
        </div>
        <div style={{ display: 'flex', gap: 46, marginTop: 10 }}>
          <Panel title="Text-to-Image" titleColor={RM.cyan}
            rows={[
              { name: 'GPT-Image-2', elo: '1380', start: 171 },
              { name: 'Grok Imagine 2.0', elo: '1320', tag: '#2', tagColor: RM.cyan, start: 321 },
            ]} />
          <Panel title="Image Editing" titleColor={RM.amber}
            rows={[
              { name: 'GPT-Image-2', elo: '1463', start: 496 },
              { name: 'Grok Imagine 2.0', elo: '1439', tag: '#2', tagColor: RM.amber, start: 543 },
            ]} />
        </div>
        <div style={{ ...rise(410, 18), fontSize: 30, fontWeight: 700, color: RM.text }}>
          Second in the world, on both boards.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GIIBoardNumbers;
