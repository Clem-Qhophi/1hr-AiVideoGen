// mvkit — Maviga Real Estate brand tokens for the maviga-real-estate ad shots.
// Art direction: premium Ghanaian land agency. Palette sampled from the client's
// own master flyer (PIL quantize, 2026-08-11): cream bg, deep navy ink rgb(23,43,60),
// muted olive accent rgb(158,156,129). Flyer components (logo, payment options,
// location block, scarcity line) are REAL crops of the client flyer, framed as
// design objects — never the whole flyer pasted.
// Frame-based only; monotonic interpolate + clamp. 9:16 canvas: 1080x1920.
import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { GlowWash, Bokeh, Vignette, Grain } from '../../lib/atmosphere';
import { FONT_HOOK, useSlam, usePop, useDrift, Eyebrow } from '../../lib/reviewkit';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';

export const VW = 1080;
export const VH = 1920;

export const MV = {
  bg0: '#FDFBF5',
  bg1: '#F3EFE3',
  glow: '#E4DFC9',
  ink: '#172B3C',
  olive: '#9E9C81',
  oliveSoft: '#C9C7AC',
  text: '#172B3C',
  muted: '#6E6A58',
  panel: '#FFFFFF',
  line: '#DAD5C2',
  white: '#FFFFFF',
} as const;

export const FLYER_DIR = 'projects/maviga-real-estate/flyer';

export const MVBg: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <>
    <AbsoluteFill style={{ background: `linear-gradient(165deg, ${MV.bg0}, ${MV.bg1})` }} />
    <GlowWash color="#CFCBB0" opacity={0.22} y={6} size={1500} />
    <Bokeh count={6} colors={['#FFFFFF', '#E4DFC9']} opacity={0.35} speed={0.4} size={[140, 360]} seed={21} />
    <Vignette strength={0.14} color="#8A8468" />
    <Grain opacity={0.03} />
    {children}
  </>
);

export const MVDelay = { CLAMP: { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const } };

// slow continuous push on the content layer — keeps long VO chunks alive
export const MVDrift: React.FC<{ children: React.ReactNode; frames?: number; to?: number }> = ({ children, frames = 220, to = 1.04 }) => {
  const d = useDrift(frames, 1.0, to);
  return <AbsoluteFill style={{ ...d, alignItems: 'center', justifyContent: 'center' }}>{children}</AbsoluteFill>;
};

// the real logo wordmark cropped from the client's master flyer
export const MVLogo: React.FC<{ width?: number; style?: React.CSSProperties }> = ({ width = 460, style }) => (
  <div style={{ background: MV.white, borderRadius: 18, padding: '14px 26px', border: `2px solid ${MV.line}`, boxShadow: '0 8px 30px rgba(23,43,60,0.08)', ...style }}>
    <Img src={staticFile('projects/maviga-real-estate/logo.png')} style={{ width, display: 'block' }} />
  </div>
);

export const MVEyebrow: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <Eyebrow color={MV.olive} style={{ fontSize: 26, letterSpacing: 8, ...style }}>{children}</Eyebrow>
);

// big display line that slams in on its cue word
export const MVLine: React.FC<{
  text: string;
  start: number;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ text, start, size = 108, color = MV.ink, style }) => {
  const slam = useSlam();
  return (
    <div style={{ fontFamily: FONT_HOOK, fontSize: size, lineHeight: 1.02, color, textAlign: 'center', ...slam(start), ...style }}>
      {text}
    </div>
  );
};

// framed real flyer component — the client flyer's own crop, presented as a design object
export const FlyerCrop: React.FC<{
  name: string;
  label: string;
  start: number;
  width?: number;
  style?: React.CSSProperties;
}> = ({ name, label, start, width = 480, style }) => {
  const pop = usePop();
  return (
    <div style={{ ...pop(start), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, ...style }}>
      <div style={{ background: MV.white, borderRadius: 22, border: `2px solid ${MV.line}`, padding: 12, boxShadow: '0 12px 40px rgba(23,43,60,0.10)' }}>
        <Img src={staticFile(`${FLYER_DIR}/${name}`)} style={{ width, display: 'block', borderRadius: 12 }} />
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 22, letterSpacing: 4, color: MV.muted, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
};

// pop-in chip
export const MVChip: React.FC<{
  children: React.ReactNode;
  start: number;
  accent?: string;
  style?: React.CSSProperties;
}> = ({ children, start, accent = MV.olive, style }) => {
  const pop = usePop();
  return (
    <div
      style={{
        fontFamily: FONT_HOOK, fontSize: 52, lineHeight: 1.05, color: MV.ink, textAlign: 'center',
        background: MV.panel, border: `3px solid ${accent}`, borderRadius: 20,
        padding: '22px 30px', ...pop(start), ...style,
      }}
    >
      {children}
    </div>
  );
};

// honest schematic: the plot itself drawn to its real dimensions (80x80 ft)
export const PlotSquare: React.FC<{ start: number; size?: number; style?: React.CSSProperties }> = ({ start, size = 380, style }) => {
  const pop = usePop();
  const slam = useSlam();
  return (
    <div style={{ ...pop(start), position: 'relative', width: size, height: size, ...style }}>
      <div style={{ position: 'absolute', inset: 0, background: MV.white, border: `6px solid ${MV.ink}`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: FONT_HOOK, fontSize: 64, color: MV.ink, ...slam(start + 18) }}>80×80</div>
        <div style={{ position: 'absolute', bottom: 26, fontFamily: FONT_MONO, fontSize: 22, letterSpacing: 5, color: MV.olive }}>FULL PLOT · FT</div>
      </div>
      <div style={{ position: 'absolute', top: -22, right: -30, fontFamily: FONT_MONO, fontSize: 20, letterSpacing: 3, color: MV.olive, background: MV.bg0, padding: '4px 10px' }}>80 FT</div>
      <div style={{ position: 'absolute', bottom: -8, left: -46, fontFamily: FONT_MONO, fontSize: 20, letterSpacing: 3, color: MV.olive, background: MV.bg0, padding: '4px 10px', transform: 'rotate(-90deg)' }}>80 FT</div>
    </div>
  );
};

// route schematic from the flyer's own directions — labels are the client's words
export const MVRoute: React.FC<{ start: number; style?: React.CSSProperties }> = ({ start, style }) => {
  const pop = usePop();
  const steps = ['CENTRAL UNIVERSITY', '4 MIN DRIVE', 'TURN LEFT', 'REACH THE SITE'];
  return (
    <div style={{ ...pop(start), display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 14, width: '100%', padding: '0 90px', ...style }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 46, height: 46, borderRadius: 23, background: MV.ink, color: MV.white, fontFamily: FONT_HOOK, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
          <div style={{ flex: 1, background: MV.panel, border: `2px solid ${MV.line}`, borderRadius: 16, padding: '16px 22px', fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 700, color: MV.ink, letterSpacing: 1 }}>{s}</div>
        </div>
      ))}
    </div>
  );
};

export { FONT_DISPLAY, FONT_HOOK, FONT_MONO, AbsoluteFill };
