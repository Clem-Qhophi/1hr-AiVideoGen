import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { EASINGS } from '../../brand';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { RM, RMBg, CLAMP, useRise } from '../../lib/reviewkit';

// master 21.8-41.0 · step1 f37 (+chips f120) · step2 f216 (+sub f379) · step3 f456 (+score f490)
export const compositionConfig = { id: 'RMHow', durationInSeconds: 19.4, fps: 30, width: 1920, height: 1080 };

const CHIPS = ['Daily loss limit', 'Sessions', 'Lot caps', 'Cooldowns'];

const Step: React.FC<{ n: string; at: number; title: string; children?: React.ReactNode }> = ({ n, at, title, children }) => {
  const rise = useRise();
  return (
    <div style={{ ...rise(at, 28), display: 'flex', gap: 34, alignItems: 'flex-start', width: 1260 }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 60, color: RM.cyan, lineHeight: 1, width: 84 }}>{n}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 50, color: RM.text, lineHeight: 1.12 }}>{title}</div>
        {children && <div style={{ marginTop: 16 }}>{children}</div>}
      </div>
    </div>
  );
};

const RMHow: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const chip = (i: number) => interpolate(frame, [120 + i * 8, 136 + i * 8], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <AbsoluteFill style={{ fontFamily: FONT_DISPLAY }}>
      <RMBg glow={RM.cyan} />
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 50 }}>
        <div style={{ ...rise(5, 18), fontFamily: FONT_MONO, fontSize: 28, letterSpacing: 6, color: RM.muted }}>HOW IT WORKS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 44 }}>
          <Step n="01" at={37} title="Set your rules while you're calm">
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {CHIPS.map((c, i) => (
                <span key={c} style={{ opacity: chip(i), fontFamily: FONT_MONO, fontSize: 27, color: RM.muted, border: `1px solid ${RM.line}`, background: RM.panel, borderRadius: 10, padding: '10px 20px' }}>{c}</span>
              ))}
            </div>
          </Step>
          <Step n="02" at={216} title="Enforced live, in milliseconds">
            <div style={{ ...rise(379, 18), fontSize: 34, color: RM.muted }}>Rule-breakers are blocked or resized <span style={{ color: RM.text }}>before they cost you</span>.</div>
          </Step>
          <Step n="03" at={456} title="Your discipline becomes a score">
            <div style={{ ...rise(490, 16), display: 'inline-flex', alignItems: 'center', gap: 14, background: RM.panel, border: `1px solid ${RM.cyan}55`, borderRadius: 12, padding: '10px 24px' }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: RM.cyan }}>87</span>
              <span style={{ fontSize: 30, color: RM.muted }}>Disciplined</span>
            </div>
          </Step>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default RMHow;
