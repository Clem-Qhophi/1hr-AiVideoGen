import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 87.4-111.1 · verdict pt3. Cursor vs speech vs vision - why the third problem is harder.
export const compositionConfig = { id: 'NBSWhyHarder', durationInSeconds: 23.7, fps: 30, width: 1920, height: 1080 };

const Tier: React.FC<{ n: string; label: string; need: string; style: React.CSSProperties; accent?: string }> = ({ n, label, need, style, accent = RM.cyan }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 26, width: 1150 }}>
    <div style={{ fontFamily: FONT_MONO, fontSize: 28, color: accent, width: 40 }}>{n}</div>
    <div style={{ fontSize: 24, fontWeight: 600, color: RM.text, width: 260 }}>{label}</div>
    <div style={{ fontSize: 22, color: RM.muted }}>{need}</div>
  </div>
);

const NBSWhyHarder: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(711);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <div style={rise(10, 16)}><Eyebrow color={RM.cyan}>why the gap matters</Eyebrow></div>
        <Tier n="→" label="A cursor" need="needs one signal: move here." style={pop(215)} />
        <Tier n="→" label="Speech" need="needs a stream of words." style={pop(295)} />
        <Tier n="→" label="Vision" need="needs millions of data points." style={pop(365)} accent={RM.amber} />
        <div style={{ ...rise(660, 18), fontSize: 24, color: RM.red, fontWeight: 600, marginTop: 10, maxWidth: 1050, textAlign: 'center' }}>
          Even Musk's own claim admits it: low-resolution first — "like old Atari graphics."
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default NBSWhyHarder;
