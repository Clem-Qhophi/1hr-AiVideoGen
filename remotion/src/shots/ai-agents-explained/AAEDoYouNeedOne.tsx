import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 255.58-295.16 · decision: does this need to run without you, or would a prompt just do it.
export const compositionConfig = { id: 'AAEDoYouNeedOne', durationInSeconds: 39.58, fps: 30, width: 1920, height: 1080 };

const Col: React.FC<{ title: string; sub: string; accent: string; style: React.CSSProperties }> = ({ title, sub, accent, style }) => (
  <div style={{ ...style, background: RM.panel, border: `1px solid ${accent}55`, borderRadius: 20, padding: '30px 36px', width: 520, textAlign: 'center' }}>
    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 26, color: accent }}>{title}</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: RM.muted, marginTop: 10 }}>{sub}</div>
  </div>
);

const AAEDoYouNeedOne: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(1187);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <div style={rise(10, 16)}><Eyebrow color={RM.cyan}>before you build anything, ask this first</Eyebrow></div>
        <div style={{ ...rise(60, 20), fontSize: 28, fontWeight: 600, color: RM.text, textAlign: 'center', maxWidth: 1100 }}>
          Does this actually need to run without you?
        </div>
        <div style={{ display: 'flex', gap: 30, marginTop: 10 }}>
          <Col title="ONE-OFF" sub="A good prompt is faster to set up, faster to fix." accent={RM.muted} style={pop(280)} />
          <Col title="SAME SHAPE, WEEK AFTER WEEK" sub="Setup pays for itself. This is where an agent earns its keep." accent={RM.green} style={pop(460)} />
        </div>
        <div style={{ ...rise(750, 18), marginTop: 12, fontSize: 22, color: RM.text, fontWeight: 600, textAlign: 'center' }}>
          Build for the repetitive thing eating your Tuesday. Not the one-off report due Friday.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default AAEDoYouNeedOne;
