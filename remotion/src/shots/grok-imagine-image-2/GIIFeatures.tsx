import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 121.19-144.51 · verdict-5: built-in editing. "Editing is built into the model" f163,
// Magic Wand f213, Segmentation f349, Background removal f439, multi-reference f579.
export const compositionConfig = { id: 'GIIFeatures', durationInSeconds: 23.32, fps: 30, width: 1920, height: 1080 };

const FEATURES = [
  { title: 'Magic Wand', sub: 'point at one region. change that spot. nothing else moves.', start: 213, color: RM.cyan },
  { title: 'Segmentation', sub: 'picks the exact area you mean', start: 349, color: RM.green },
  { title: 'Background removal', sub: 'exports a transparent cutout, ready for any design', start: 439, color: RM.amber },
  { title: 'Multi-reference editing', sub: 'up to five images in a single generation', start: 579, color: RM.cyan },
];

const GIIFeatures: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(700);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 200px', textAlign: 'center' }}>
        <div style={rise(6, 16)}><Eyebrow color={RM.cyan}>Not a one-shot generator anymore</Eyebrow></div>
        <div style={{ ...rise(60, 16), fontSize: 32, fontWeight: 700, color: RM.text }}>
          Editing is built into the model
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 14, width: 1150 }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{
              ...pop(f.start), display: 'flex', alignItems: 'center', gap: 28,
              background: RM.panel, border: `2px solid ${RM.line}`, borderLeft: `6px solid ${f.color}`,
              borderRadius: 16, padding: '22px 36px', textAlign: 'left',
            }}>
              <div style={{ fontSize: 34, fontWeight: 700, color: f.color, width: 400, flexShrink: 0 }}>{f.title}</div>
              <div style={{ fontSize: 26, color: RM.muted }}>{f.sub}</div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default GIIFeatures;
