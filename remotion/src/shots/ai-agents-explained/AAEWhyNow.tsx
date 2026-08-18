import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FONT_DISPLAY } from '../../fonts';
import { RMBg, useRise, usePop, useDrift, Eyebrow, RM } from '../../lib/reviewkit';

// master 65.61-126.67 · already working today (narrow lanes) + why old "agents" failed (no check).
export const compositionConfig = { id: 'AAEWhyNow', durationInSeconds: 61.06, fps: 30, width: 1920, height: 1080 };

const Lane: React.FC<{ text: string; style: React.CSSProperties }> = ({ text, style }) => (
  <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 16, background: RM.panel, border: `1px solid ${RM.line}`, borderRadius: 14, padding: '16px 28px', width: 900 }}>
    <div style={{ fontSize: 24, color: RM.green }}>&#10003;</div>
    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: RM.text }}>{text}</div>
  </div>
);

const AAEWhyNow: React.FC = () => {
  const rise = useRise();
  const pop = usePop();
  const drift = useDrift(1832);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ ...drift, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <div style={rise(10, 16)}><Eyebrow color={RM.cyan}>not a future promise, already working today</Eyebrow></div>
        <Lane text="Coding tools that read an error, fix the line, rerun the test, repeat until it passes." style={pop(90)} />
        <Lane text="Research tools that open ten sources and only write the summary after deciding which three matter." style={pop(280)} />
        <div style={{ ...rise(500, 20), marginTop: 10, fontSize: 24, color: RM.text, fontWeight: 600, textAlign: 'center', maxWidth: 1100 }}>
          The common thread: the loop is narrow, and something checks the result before it's called done.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginTop: 26 }}>
          <div style={{ ...pop(920), textAlign: 'center' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 18, color: RM.muted, letterSpacing: 2 }}>A FEW YEARS AGO</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 26, color: RM.red, marginTop: 6 }}>Goal + Tools</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: RM.muted, marginTop: 4 }}>no check, wandered off</div>
          </div>
          <div style={{ fontSize: 30, color: RM.muted }}>&#8594;</div>
          <div style={{ ...pop(1080), textAlign: 'center' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 18, color: RM.muted, letterSpacing: 2 }}>TODAY</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 26, color: RM.green, marginTop: 6 }}>Goal + Tools + Check</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: RM.muted, marginTop: 4 }}>a much more honest build</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default AAEWhyNow;
